"use client";

// Cola de subida de fotos, persistida en IndexedDB del navegador — así una
// foto sacada sin conexión (ver brief, sección 9: "las fotos nuevas quedan
// en cola") sobrevive un refresh o cerrar la pestaña, y no solo un estado en
// memoria que se pierde. Storage (a diferencia de Firestore) no trae cache
// offline propio, así que esto es lo que hace real esa promesa.
//
// El archivo se sube a `perfumes-raw/{perfumeId}/{tipo}.{ext}` — de ahí lo
// toma functions/src/index.ts::procesarFotoPerfume, que genera la versión
// WebP optimizada y actualiza el doc del perfume. El cliente nunca escribe
// el campo `imagen`/`imagenAmbiente` directo (ver storage.rules).

import { ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";

export type TipoFoto = "principal" | "ambiente";

interface FotoPendiente {
  id: string;
  perfumeId: string;
  tipo: TipoFoto;
  archivo: Blob;
  extension: string;
  creadoEn: string;
}

const NOMBRE_DB = "panel-cola-fotos";
const NOMBRE_STORE = "pendientes";

function abrirDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(NOMBRE_DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(NOMBRE_STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function conStore<T>(
  modo: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await abrirDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOMBRE_STORE, modo);
    const req = fn(tx.objectStore(NOMBRE_STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

function idAleatorio(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function extensionDe(archivo: File): string {
  const porTipo: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  return porTipo[archivo.type] ?? archivo.name.split(".").pop() ?? "jpg";
}

// Encola y, si hay conexión, intenta subir enseguida (no espera a un evento
// "online" si ya estamos online — mejor UX que forzar siempre la demora).
export async function encolarFoto(perfumeId: string, tipo: TipoFoto, archivo: File): Promise<void> {
  const pendiente: FotoPendiente = {
    id: idAleatorio(),
    perfumeId,
    tipo,
    archivo,
    extension: extensionDe(archivo),
    creadoEn: new Date().toISOString(),
  };
  await conStore("readwrite", (store) => store.add(pendiente));
  void procesarColaFotos();
}

export async function contarFotosPendientes(): Promise<number> {
  try {
    const todas = await conStore<FotoPendiente[]>("readonly", (store) => store.getAll());
    return todas.length;
  } catch {
    return 0;
  }
}

let procesando = false;

// Sube todo lo pendiente. Se llama al encolar, al reconectar, y al montar
// el panel (por si quedó algo de una sesión anterior offline).
export async function procesarColaFotos(): Promise<void> {
  if (procesando || typeof navigator === "undefined" || !navigator.onLine) return;
  procesando = true;
  try {
    const storage = getFirebaseStorage();
    const pendientes = await conStore<FotoPendiente[]>("readonly", (store) => store.getAll());
    for (const p of pendientes) {
      try {
        const destino = ref(storage, `perfumes-raw/${p.perfumeId}/${p.tipo}.${p.extension}`);
        await uploadBytes(destino, p.archivo, { contentType: p.archivo.type || "image/jpeg" });
        await conStore("readwrite", (store) => store.delete(p.id));
      } catch {
        // Sigue offline o falló por otra razón — se reintenta en la próxima
        // pasada (reconexión o próximo montaje), no se pierde.
      }
    }
  } finally {
    procesando = false;
  }
}
