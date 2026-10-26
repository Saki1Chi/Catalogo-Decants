"use client";

import { usePanel } from "@/panel/store";

export function SyncIndicator() {
  const { online, estado } = usePanel();
  const pendientes = estado.pendientes;

  if (!online) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="h-1.5 w-1.5 flex-none rounded-full bg-accent" />
        <span className="hidden text-[13px] text-muted sm:inline">
          Sin conexión · {pendientes || 1} cambio{pendientes === 1 ? "" : "s"} guardado
          {pendientes === 1 ? "" : "s"} en este dispositivo
        </span>
      </span>
    );
  }

  if (pendientes > 0) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="h-1.5 w-1.5 flex-none animate-pulse rounded-full bg-success" />
        <span className="hidden text-[13px] text-muted sm:inline">Sincronizando…</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-1.5 flex-none rounded-full bg-success" />
      <span className="hidden text-[13px] text-muted sm:inline">En línea · Todo sincronizado</span>
    </span>
  );
}
