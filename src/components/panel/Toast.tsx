"use client";

import { useEffect, useRef, useState } from "react";
import { usePanel } from "@/panel/store";

// Aviso de "éxito con deshacer" (estado obligatorio del brief): aparece cada
// vez que se agrega una entrada de historial reversible y se cierra sola.
export function Toast() {
  const { estado, deshacerEntry } = usePanel();
  const [visible, setVisible] = useState(false);
  const ultimoIdRef = useRef<string | null>(null);
  const cierreRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entrada = estado.historial[0];

  useEffect(() => {
    if (!entrada || entrada.id === ultimoIdRef.current || !entrada.inverso) return;
    ultimoIdRef.current = entrada.id;
    setVisible(true);
    if (cierreRef.current) clearTimeout(cierreRef.current);
    cierreRef.current = setTimeout(() => setVisible(false), 6000);
    return () => {
      if (cierreRef.current) clearTimeout(cierreRef.current);
    };
  }, [entrada]);

  if (!visible || !entrada) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-4 border border-line-strong bg-ink px-5 py-3.5 text-background shadow-none">
        <span className="h-1.5 w-1.5 flex-none rounded-full bg-success" />
        <span className="text-[13px]">{entrada.descripcion}</span>
        <button
          type="button"
          onClick={() => {
            deshacerEntry(entrada.id);
            setVisible(false);
          }}
          className="eyebrow flex-none text-[#c9a66b] transition-colors hover:text-background"
        >
          Deshacer
        </button>
      </div>
    </div>
  );
}
