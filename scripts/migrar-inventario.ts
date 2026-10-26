/**
 * Migración inicial (una sola vez): inventario/ (132 carpetas datos.json +
 * INVENTARIO_ESENCIAS_POR_ML_final.xlsx) + public/perfumes/*.webp (ya
 * optimizados) → Firestore + Storage.
 *
 * Después de correr esto, las carpetas de inventario/ quedan congeladas como
 * respaldo histórico — el panel (Firestore) pasa a ser la única fuente viva.
 * Ver plan completo en design/panel-admin/05-backend.md.
 *
 * Uso:
 *   npm run migrar-inventario -- --dry-run
 *   npm run migrar-inventario
 *   npm run migrar-inventario -- --force   (sobrescribe perfumes ya migrados)
 *
 * Requiere en .env.local:
 *   FIREBASE_SERVICE_ACCOUNT_PATH=ruta/a/service-account.json
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID=... (o pasar --project=xxx)
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import ExcelJS from "exceljs";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import type { Bucket } from "@google-cloud/storage";

// ---------------------------------------------------------------------------
// Config / CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const argInventario = args.find((a) => a.startsWith("--inventario="))?.split("=")[1];

const RUTA_INVENTARIO =
  argInventario ??
  "C:/Users/Saki/Documents/Recursos_pagina_alfredo/inventario";
const RUTA_XLSX = path.join(
  RUTA_INVENTARIO,
  "INVENTARIO_ESENCIAS_POR_ML_final.xlsx",
);
const RUTA_WEBP = path.resolve(__dirname, "../public/perfumes");

const CARPETAS_CATEGORIA = ["perfumes-hombre", "perfumes-mujer", "perfumes-unisex"];

// Ids ya señalados como ambiguos en inventario/README.md — quedan marcados
// `fichaPorConfirmar: true` con más énfasis aunque su `completitud` no sea
// "baja", para que Alfredo los revise antes de darlos por buenos.
const FILAS_A_CONFIRMAR = new Set([13, 41, 100, 113, 118]);

// ---------------------------------------------------------------------------
// Tipos del inventario en disco (snake_case, distinto al `Perfume` de la app)
// ---------------------------------------------------------------------------

interface ImagenInventario {
  archivo: string;
  tipo: string;
  fondo: string;
  ancho: number;
  alto: number;
}

interface DatosJson {
  fila_excel: number;
  id: string;
  nombre_inventario: string;
  nombre: string;
  marca: string;
  concentracion: string | null;
  categoria: "Hombre" | "Mujer" | "Unisex";
  familia: string;
  familia_detallada: string | null;
  anio: number | null;
  perfumista: string | null;
  notas: string[];
  piramide: { salida: string[]; corazon: string[]; fondo: string[] };
  descripcion: string;
  imagenes: ImagenInventario[];
  completitud: "alta" | "media" | "baja";
  verificado?: string;
  fuentes?: string[];
}

interface Precios {
  10?: number;
  5?: number;
  3?: number;
}

// ---------------------------------------------------------------------------
// Firebase Admin init
// ---------------------------------------------------------------------------

function iniciarAdmin(): { db: Firestore; bucket: Bucket } {
  const rutaCuenta = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!rutaCuenta) {
    throw new Error(
      "Falta FIREBASE_SERVICE_ACCOUNT_PATH en .env.local — descargala desde " +
        "Configuración del proyecto > Cuentas de servicio, en la consola de Firebase.",
    );
  }
  const serviceAccount = JSON.parse(fs.readFileSync(rutaCuenta, "utf-8"));
  const bucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    `${serviceAccount.project_id}.appspot.com`;

  initializeApp({ credential: cert(serviceAccount), storageBucket: bucket });
  return { db: getFirestore(), bucket: getStorage().bucket() };
}

// URL pública de descarga directa (storage.rules permite `read: if true` en
// perfumes/**, así que no hace falta el token que agrega la consola de
// Firebase) — esto es lo que va en el campo `imagen`/`imagenAmbiente` del
// doc, no el path interno del bucket, para que un <img src> normal funcione.
function urlPublicaStorage(bucketName: string, path: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media`;
}

// ---------------------------------------------------------------------------
// Excel: precios por fila
// ---------------------------------------------------------------------------

async function leerPrecios(): Promise<Map<number, Precios>> {
  const libro = new ExcelJS.Workbook();
  await libro.xlsx.readFile(RUTA_XLSX);
  const hoja = libro.worksheets[0];
  if (!hoja) throw new Error(`No se encontró ninguna hoja en ${RUTA_XLSX}`);

  // Header tolerante: "10 ML", "10ML", "10 Ml" todos matchean.
  const headerRow = hoja.getRow(1);
  const columnas: Record<"10" | "5" | "3", number> = { "10": -1, "5": -1, "3": -1 };
  headerRow.eachCell((cell, colNumber) => {
    const texto = String(cell.value ?? "").replace(/\s+/g, "").toUpperCase();
    if (/^10ML$/.test(texto)) columnas["10"] = colNumber;
    else if (/^5ML$/.test(texto)) columnas["5"] = colNumber;
    else if (/^3ML$/.test(texto)) columnas["3"] = colNumber;
  });
  if (columnas["10"] === -1 || columnas["5"] === -1 || columnas["3"] === -1) {
    throw new Error(
      `No se pudieron ubicar las columnas 10ML/5ML/3ML en ${RUTA_XLSX} — ` +
        "revisar encabezados a mano (fila 1) y ajustar el matching en este script.",
    );
  }

  const precios = new Map<number, Precios>();
  hoja.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const leer = (col: number) => {
      const v = row.getCell(col).value;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    };
    precios.set(rowNumber, {
      10: leer(columnas["10"]),
      5: leer(columnas["5"]),
      3: leer(columnas["3"]),
    });
  });
  return precios;
}

// ---------------------------------------------------------------------------
// Inventario: recorrer carpetas
// ---------------------------------------------------------------------------

function listarCarpetasPerfume(): string[] {
  const carpetas: string[] = [];
  for (const categoria of CARPETAS_CATEGORIA) {
    const dirCategoria = path.join(RUTA_INVENTARIO, categoria);
    if (!fs.existsSync(dirCategoria)) continue;
    for (const entrada of fs.readdirSync(dirCategoria, { withFileTypes: true })) {
      if (entrada.isDirectory()) carpetas.push(path.join(dirCategoria, entrada.name));
    }
  }
  return carpetas;
}

function mapearFamilia(familia: string): string {
  // El tipo Familia de la app es un enum cerrado (ver src/types.ts); el
  // inventario ya usa los mismos 6 nombres, esto es solo una red de
  // seguridad por si algún datos.json trae una variante.
  const validas = ["Amaderados", "Florales", "Frescos", "Orientales", "Frutales", "Dulces"];
  return validas.includes(familia) ? familia : familia;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Inventario: ${RUTA_INVENTARIO}`);
  console.log(`Excel:      ${RUTA_XLSX}`);
  console.log(`WebP:       ${RUTA_WEBP}`);
  console.log(DRY_RUN ? "Modo: DRY RUN (no escribe nada)\n" : "Modo: ESCRITURA REAL\n");

  const carpetas = listarCarpetasPerfume();
  console.log(`Encontradas ${carpetas.length} carpetas de perfume.\n`);

  const precios = await leerPrecios();
  const admin = DRY_RUN ? null : iniciarAdmin();
  const db = admin?.db ?? null;
  const bucket = admin?.bucket ?? null;

  let migrados = 0;
  let saltados = 0;
  const avisos: string[] = [];
  let batch = db?.batch() ?? null;
  let enBatch = 0;

  for (const carpeta of carpetas) {
    const rutaDatos = path.join(carpeta, "datos.json");
    if (!fs.existsSync(rutaDatos)) {
      avisos.push(`${carpeta}: sin datos.json, se saltea.`);
      continue;
    }
    const datos: DatosJson = JSON.parse(fs.readFileSync(rutaDatos, "utf-8"));

    if (!DRY_RUN) {
      const existente = await db!.collection("perfumes").doc(datos.id).get();
      if (existente.exists && !FORCE) {
        saltados++;
        continue;
      }
    }

    const p = precios.get(datos.fila_excel) ?? {};
    const tamanos = ([10, 5, 3] as const)
      .filter((ml) => p[ml] !== undefined)
      .map((ml) => ({ ml, precio: p[ml] as number }));

    if (tamanos.length === 0) {
      avisos.push(
        `${datos.id} (fila ${datos.fila_excel}): sin ningún precio en el Excel — se migra igual, sin tamaños. Revisar a mano.`,
      );
    }

    const rutaWebpPrincipal = path.join(RUTA_WEBP, `${datos.id}.webp`);
    const rutaWebpAmbiente = path.join(RUTA_WEBP, `${datos.id}-amb.webp`);
    const tieneWebpPrincipal = fs.existsSync(rutaWebpPrincipal);
    const tieneWebpAmbiente = fs.existsSync(rutaWebpAmbiente);
    if (!tieneWebpPrincipal) {
      avisos.push(`${datos.id}: no se encontró ${datos.id}.webp en public/perfumes/.`);
    }

    const necesitaConfirmacion =
      datos.completitud === "baja" || FILAS_A_CONFIRMAR.has(datos.fila_excel);

    const doc = {
      id: datos.id,
      filaExcel: datos.fila_excel,
      marca: datos.marca,
      nombre: datos.nombre,
      concentracion: datos.concentracion,
      categoria: datos.categoria,
      familia: mapearFamilia(datos.familia),
      familiaDetallada: datos.familia_detallada,
      anio: datos.anio,
      perfumista: datos.perfumista,
      descripcion: datos.descripcion,
      notas: datos.notas,
      piramide: datos.piramide,
      // El .webp ya optimizado que hoy sirve public/perfumes/ se sube tal
      // cual (sin pasar por la Cloud Function de resize, que es solo para
      // fotos nuevas que suba Alfredo — Fase 4) a la misma ruta que usaría
      // esa función, para que ambos caminos terminen en el mismo lugar.
      imagen:
        tieneWebpPrincipal && bucket
          ? urlPublicaStorage(bucket.name, `perfumes/${datos.id}/principal.webp`)
          : null,
      imagenAmbiente:
        tieneWebpAmbiente && bucket
          ? urlPublicaStorage(bucket.name, `perfumes/${datos.id}/ambiente.webp`)
          : undefined,
      tamanos,
      completitud: datos.completitud,
      destacado: false,
      // --- campos de gestión (antes vivían en OverridePerfume) ---
      visible: true,
      fichaPorConfirmar: necesitaConfirmacion,
      eliminado: false,
      // Fotos actuales = propiedad de cada marca (ver inventario/README.md),
      // no son de uso libre para publicar — se avisa en la ficha hasta que
      // Alfredo suba una foto propia (ver Fase 4 / functions resize).
      imagenEsPlaceholder: true,
      origen: "inventario-inicial",
      version: 1,
      modificadoEn: DRY_RUN ? new Date().toISOString() : FieldValue.serverTimestamp(),
      modificadoPor: "migracion-inicial",
    };

    if (DRY_RUN) {
      migrados++;
      continue;
    }

    if (tieneWebpPrincipal) {
      await bucket!.upload(rutaWebpPrincipal, {
        destination: `perfumes/${datos.id}/principal.webp`,
        metadata: { contentType: "image/webp" },
      });
    }
    if (tieneWebpAmbiente) {
      await bucket!.upload(rutaWebpAmbiente, {
        destination: `perfumes/${datos.id}/ambiente.webp`,
        metadata: { contentType: "image/webp" },
      });
    }

    batch!.set(db!.collection("perfumes").doc(datos.id), doc);
    enBatch++;
    migrados++;

    // Límite de Firestore: 500 escrituras por batch.
    if (enBatch >= 450) {
      await batch!.commit();
      batch = db!.batch();
      enBatch = 0;
    }
  }

  if (!DRY_RUN && enBatch > 0) {
    await batch!.commit();
  }

  if (!DRY_RUN) {
    await db!
      .collection("meta")
      .doc("catalogo")
      .set({ actualizadoEn: FieldValue.serverTimestamp() }, { merge: true });
  }

  console.log(`\nMigrados:  ${migrados}`);
  console.log(`Saltados:  ${saltados} (ya existían — usar --force para sobrescribir)`);
  if (avisos.length) {
    console.log(`\nAvisos (${avisos.length}):`);
    avisos.forEach((a) => console.log(`  - ${a}`));
  }
  console.log(
    DRY_RUN
      ? "\nDry run: no se escribió nada. Correr sin --dry-run para migrar de verdad."
      : "\nListo. Revisar en la consola de Firebase (Firestore > perfumes) antes de anunciar el panel a Alfredo.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
