"use client";

// Init del SDK cliente de Firebase — reemplaza a localStorage como
// persistencia real del panel (ver src/panel/store.tsx). Todo acá corre en
// el navegador, sin API routes de Next.js, así que el sitio sigue siendo
// 100% exportable estático (ver next.config.ts).
//
// Las claves de NEXT_PUBLIC_FIREBASE_* NO son secretas — Firebase las diseñó
// para vivir en el bundle del cliente; lo que las protege de verdad son
// firestore.rules y storage.rules (ver esos archivos en la raíz del repo).
// Aun así no se hardcodean acá: van en .env.local (gitignoreado, ver
// .env.local.example) para poder tener un proyecto de Firebase distinto en
// desarrollo/producción sin tocar código.

import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  type Auth,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import {
  type Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { type FirebaseStorage, getStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Si falta configuración (typical: todavía no existe el proyecto de Firebase,
// o .env.local no se cargó) preferimos avisar claro en vez de que
// initializeApp tire un error críptico más abajo — y sobre todo, sin romper
// `next build` (export estático) cuando corre en CI sin envs reales.
export const firebaseConfigurado = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

function iniciar() {
  if (app) return;

  if (!firebaseConfigurado) {
    // No lanzamos acá: el build estático (`next build`) importa este módulo
    // sin envs reales disponibles. El error visible aparece recién si algo
    // intenta usar `auth`/`db`/`storage` sin configurar — ver los getters.
    return;
  }

  app = getApps()[0] ?? initializeApp(config);

  // Persistencia offline con soporte multi-pestaña: dos pestañas del panel
  // abiertas comparten el mismo cache local en vez de pisarse. Es lo que
  // hace real el "funciona sin conexión y sincroniza al volver" del brief —
  // src/panel/store.tsx ya no necesita simularlo con setTimeout.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });

  auth = getAuth(app);
  // Sesión persistida entre visitas (no solo la pestaña) — Alfredo/empleado
  // no deberían tener que loguearse cada vez que abren el panel.
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // Modo privado / storage bloqueado: la sesión sigue funcionando en
    // memoria durante la visita, solo no persiste entre recargas.
  });

  storage = getStorage(app);
}

iniciar();

function requerido<T>(valor: T | null, nombre: string): T {
  if (!valor) {
    throw new Error(
      `Firebase no está configurado (falta ${nombre}). Completá .env.local ` +
        "con las claves del proyecto — ver .env.local.example.",
    );
  }
  return valor;
}

export function getFirebaseAuth(): Auth {
  return requerido(auth, "NEXT_PUBLIC_FIREBASE_API_KEY / AUTH_DOMAIN");
}

export function getFirebaseDb(): Firestore {
  return requerido(db, "NEXT_PUBLIC_FIREBASE_PROJECT_ID");
}

export function getFirebaseStorage(): FirebaseStorage {
  return requerido(storage, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
}
