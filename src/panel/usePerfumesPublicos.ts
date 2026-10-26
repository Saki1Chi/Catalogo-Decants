"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firebaseConfigurado, getFirebaseDb } from "@/lib/firebase";
import { Perfume } from "@/types";
import { PerfumePanel } from "./merge";

// Puente entre Firestore y el catálogo público: a diferencia del panel
// (dentro de <PanelProvider>, con sesión), esta página no requiere login —
// firestore.rules ya permite leer `perfumes` con `visible == true` sin
// autenticar (ver la regla de /perfumes/{perfumeId}).
//
// El primer render devuelve `base` (el snapshot de src/data/perfumes.ts con
// el que se generó el export estático) sin tocar — necesario para que la
// hidratación de React coincida con el HTML ya exportado; la suscripción a
// Firestore se conecta recién en el efecto, ya en el cliente, y a partir de
// ahí el catálogo se actualiza solo (con o sin conexión) cada vez que
// Alfredo cambia algo desde el panel.
export function usePerfumesConPanel(base: Perfume[]): Perfume[] {
  const [perfumes, setPerfumes] = useState<Perfume[] | null>(null);

  useEffect(() => {
    if (!firebaseConfigurado) return;
    const db = getFirebaseDb();
    const q = query(collection(db, "perfumes"), where("visible", "==", true));
    const dejarDeEscuchar = onSnapshot(
      q,
      (snap) => {
        const vivos = snap.docs
          .map((d) => ({ ...(d.data() as Omit<PerfumePanel, "id">), id: d.id }))
          .filter((p) => !p.eliminado);
        setPerfumes(vivos);
      },
      () => {
        // Sin conexión y sin cache local todavía (primera visita offline):
        // seguimos mostrando `base` en vez de una pantalla vacía.
      },
    );
    return () => dejarDeEscuchar();
  }, []);

  return perfumes ?? base;
}
