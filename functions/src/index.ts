/**
 * Cloud Functions del panel de gestión. Todo acá corre con Admin SDK
 * (bypassa firestore.rules/storage.rules) — son las únicas piezas server-side
 * de un sitio que, por lo demás, sigue siendo 100% estático (ver
 * next.config.ts). Deploy: `npm run deploy` desde esta carpeta, o
 * `firebase deploy --only functions` desde la raíz del repo.
 *
 * IMPORTANTE (paso manual en la consola): `alCrearUsuario` es una "blocking
 * function" de Auth — para que dispare hace falta tener el proveedor de
 * Identity Platform habilitado (Authentication > Configuración > Cloud
 * Identity Platform en la consola de Firebase). Es un toggle, no cambia de
 * plan ni tiene costo aparte en este volumen.
 */
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { HttpsError } from "firebase-functions/v2/https";
import { beforeUserCreated } from "firebase-functions/v2/identity";
import {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentWritten,
} from "firebase-functions/v2/firestore";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import sharp from "sharp";

initializeApp();

// URL pública de descarga directa — storage.rules permite `read: if true` en
// perfumes/**, así que no hace falta el token que agrega la consola de
// Firebase. Esto es lo que va en `imagen`/`imagenAmbiente`, no el path
// interno del bucket, para que un <img src> normal funcione sin pasar por
// el SDK cliente.
function urlPublicaStorage(bucketName: string, path: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media`;
}

// ---------------------------------------------------------------------------
// Auth: quién puede crear cuenta y con qué rol.
//
// El panel no usa contraseña (magic link) ni custom claims: el rol vive en
// Firestore (usuarios/{uid}.rol), que es lo que leen firestore.rules. Esta
// función corre ANTES de que la cuenta de Auth se termine de crear y decide
// si se permite: solo si el email tiene una invitación pendiente
// (invitaciones/{email}, creada desde el panel por un Dueño — ver
// src/panel/store.tsx::invitarUsuario) o si es el dueño inicial configurado
// a mano en config/bootstrap. Cualquier otro email queda rechazado — así no
// hace falta "usuario inactivo, avisar al dueño", directamente no se puede
// crear la cuenta.
// ---------------------------------------------------------------------------
export const alCrearUsuario = beforeUserCreated(async (event) => {
  const email = event.data?.email?.toLowerCase();
  if (!email) {
    throw new HttpsError("invalid-argument", "Hace falta un email para entrar al panel.");
  }

  const db = getFirestore();
  const inviteRef = db.collection("invitaciones").doc(email);
  const invite = await inviteRef.get();

  if (invite.exists) {
    const datos = invite.data()!;
    await db
      .collection("usuarios")
      .doc(event.data!.uid)
      .set({
        nombre: datos.nombre,
        email,
        rol: datos.rol,
        activo: true,
        invitadoEn: datos.invitadoEn ?? new Date().toISOString(),
        pendienteDePrimerLogin: false,
      });
    await inviteRef.delete();
    return;
  }

  // Bootstrap del primer Dueño: se configura una sola vez a mano —
  // `firebase firestore:set config/bootstrap` o desde la consola — con
  // {emailDueñoInicial, nombreDueñoInicial}. Ver README de este proyecto.
  const bootstrap = await db.collection("config").doc("bootstrap").get();
  const emailDueño = bootstrap.exists
    ? String(bootstrap.data()?.emailDueñoInicial ?? "").toLowerCase()
    : "";

  if (emailDueño && email === emailDueño) {
    await db
      .collection("usuarios")
      .doc(event.data!.uid)
      .set({
        nombre: bootstrap.data()?.nombreDueñoInicial ?? "Dueño",
        email,
        rol: "dueño",
        activo: true,
        invitadoEn: new Date().toISOString(),
        pendienteDePrimerLogin: false,
      });
    return;
  }

  throw new HttpsError(
    "permission-denied",
    "Tu email no tiene invitación al panel de gestión — pedile a Alfredo que te invite desde Usuarios.",
  );
});

// ---------------------------------------------------------------------------
// Stock: recalcula el agregado `tamanos[].stock` de un perfume cada vez que
// se registra un movimiento nuevo (ver src/panel/store.tsx::
// registrarMovimientoStock). El cliente NUNCA escribe `stock` directo — eso
// es lo que evita que dos dispositivos offline se pisen un +1/-1 entre sí
// (firestore.rules ya lo bloquea; esto es lo que sí lo actualiza).
//
// Recorre TODOS los movimientos de esa presentación (no solo el nuevo) para
// que el agregado se autocorrija ante cualquier orden de llegada — con el
// volumen de este negocio (unas pocas decenas de movimientos por mes) el
// costo de esa relectura es insignificante; si algún día crece mucho,
// conviene pasar a un contador incremental con FieldValue.increment().
// ---------------------------------------------------------------------------
export const recalcularStock = onDocumentCreated("movimientosStock/{movId}", async (event) => {
  const mov = event.data?.data();
  if (!mov) return;
  const db = getFirestore();
  const perfumeRef = db.collection("perfumes").doc(mov.perfumeId);

  await db.runTransaction(async (tx) => {
    const perfumeSnap = await tx.get(perfumeRef);
    if (!perfumeSnap.exists) return;
    const perfume = perfumeSnap.data()!;
    const tamanos = (perfume.tamanos ?? []) as { ml: number; precio: number; stock?: number }[];
    if (!tamanos.some((t) => t.ml === mov.ml)) return;

    const movsSnap = await tx.get(
      db
        .collection("movimientosStock")
        .where("perfumeId", "==", mov.perfumeId)
        .where("ml", "==", mov.ml),
    );
    let total = 0;
    movsSnap.forEach((d) => {
      total += Number(d.data().delta) || 0;
    });
    total = Math.max(0, total);

    const nuevosTamanos = tamanos.map((t) => (t.ml === mov.ml ? { ...t, stock: total } : t));
    tx.update(perfumeRef, { tamanos: nuevosTamanos });
  });
});

// ---------------------------------------------------------------------------
// Conflictos: cuando dos ediciones offline parten del mismo `version` y
// llegan las dos, la segunda en aplicarse gana a nivel documento (Firestore
// no fusiona campo a campo) — pero acá queda registrado qué campos
// cambiaron y con qué valor tenía cada una, para que el Dueño elija (ver
// src/panel/store.tsx::resolverConflicto). No es una fusión automática
// perfecta; es la red de seguridad de "nunca perder un cambio en silencio"
// que pide el brief.
// ---------------------------------------------------------------------------
const CAMPOS_IGNORADOS_EN_CONFLICTO = new Set(["version", "modificadoEn", "modificadoPor"]);

export const detectarConflictos = onDocumentUpdated("perfumes/{perfumeId}", async (event) => {
  const antes = event.data?.before.data();
  const despues = event.data?.after.data();
  if (!antes || !despues) return;

  // version avanzó de a 1: la edición partió del último estado conocido, no
  // hay nada en juego.
  if ((despues.version ?? 0) === (antes.version ?? 0) + 1) return;

  const db = getFirestore();
  const campos = new Set([...Object.keys(antes), ...Object.keys(despues)]);

  for (const campo of campos) {
    if (CAMPOS_IGNORADOS_EN_CONFLICTO.has(campo)) continue;
    const valorAntes = antes[campo];
    const valorDespues = despues[campo];
    if (JSON.stringify(valorAntes ?? null) === JSON.stringify(valorDespues ?? null)) continue;

    await db.collection("conflictos").add({
      perfumeId: event.params.perfumeId,
      campo,
      valorA: valorAntes ?? null,
      autorA: antes.modificadoPor ?? "desconocido",
      fechaA: antes.modificadoEn ?? "",
      valorB: valorDespues ?? null,
      autorB: despues.modificadoPor ?? "desconocido",
      fechaB: despues.modificadoEn ?? "",
      resuelto: false,
    });
  }
});

// ---------------------------------------------------------------------------
// Meta: "Actualizado hace 2 min" en el panel (ver estado.catalogoActualizadoEn).
// ---------------------------------------------------------------------------
export const actualizarMetaCatalogo = onDocumentWritten("perfumes/{perfumeId}", async () => {
  const db = getFirestore();
  await db
    .collection("meta")
    .doc("catalogo")
    .set({ actualizadoEn: FieldValue.serverTimestamp() }, { merge: true });
});

// ---------------------------------------------------------------------------
// Fotos: automatiza el paso de "subir foto → optimizar a WebP" que hoy hace
// Saki a mano (ver inventario/README.md). El panel sube el original sin
// procesar a `perfumes-raw/{perfumeId}/{principal|ambiente}.*`; esto genera
// la versión liviana en `perfumes/{perfumeId}/{principal|ambiente}.webp`
// (mismos anchos que ya usa public/perfumes/: 700px cards, 1200px ambiente),
// actualiza el doc del perfume y borra el original ya procesado.
// ---------------------------------------------------------------------------
export const procesarFotoPerfume = onObjectFinalized({ cpu: 1 }, async (event) => {
  const filePath = event.data.name;
  if (!filePath?.startsWith("perfumes-raw/")) return;

  const [, perfumeId, fileName] = filePath.split("/");
  if (!perfumeId || !fileName) return;

  const bucket = getStorage().bucket(event.data.bucket);
  const [buffer] = await bucket.file(filePath).download();

  const esAmbiente = fileName.toLowerCase().includes("ambiente");
  const anchoDestino = esAmbiente ? 1200 : 700;

  const optimizada = await sharp(buffer)
    .resize({ width: anchoDestino, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const destino = `perfumes/${perfumeId}/${esAmbiente ? "ambiente" : "principal"}.webp`;
  await bucket.file(destino).save(optimizada, { contentType: "image/webp" });

  const db = getFirestore();
  await db
    .collection("perfumes")
    .doc(perfumeId)
    .update({
      [esAmbiente ? "imagenAmbiente" : "imagen"]: urlPublicaStorage(bucket.name, destino),
      // Solo la foto principal saca el aviso de "temporal" — la ambiente es
      // un extra, no reemplaza la necesidad de la principal propia.
      ...(esAmbiente ? {} : { imagenEsPlaceholder: false }),
    });

  // El original sin procesar ya cumplió su función.
  await bucket
    .file(filePath)
    .delete()
    .catch(() => {});
});
