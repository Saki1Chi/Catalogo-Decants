"use client";

import { usePanel } from "@/panel/store";
import { SyncIndicator } from "./SyncIndicator";
import { IconoMenu } from "./iconos";

export function Topbar({
  colapsado,
  onToggleSidebar,
  onAjustarStock,
  onRegistrarPedido,
}: {
  colapsado: boolean;
  onToggleSidebar: () => void;
  onAjustarStock: () => void;
  onRegistrarPedido: () => void;
}) {
  const { simulandoSinConexion, alternarSimulacionSinConexion } = usePanel();

  return (
    <header className="flex h-16 flex-none items-center gap-3 border-b border-border bg-surface px-4 sm:gap-5 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={colapsado ? "Mostrar menú" : "Ocultar menú"}
        title={colapsado ? "Mostrar menú" : "Ocultar menú"}
        className="flex-none border border-border p-2 text-ink transition-colors hover:border-ink"
      >
        <IconoMenu className="h-[15px] w-[15px]" />
      </button>

      <SyncIndicator />

      {/* Control de demo: simular sin conexión para mostrarle al cliente cómo
          se comporta el panel sin depender de cortar el wifi de verdad. */}
      <button
        type="button"
        onClick={alternarSimulacionSinConexion}
        className={`eyebrow hidden flex-none border px-3 py-2 transition-colors sm:inline-flex ${
          simulandoSinConexion
            ? "border-accent bg-accent/10 text-accent"
            : "border-border text-muted hover:border-ink hover:text-ink"
        }`}
        title="Solo para mostrar el modo sin conexión en una demo"
      >
        {simulandoSinConexion ? "Simulando sin conexión" : "Simular sin conexión"}
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onAjustarStock}
          className="eyebrow whitespace-nowrap border border-ink px-2.5 py-2 text-ink transition-colors hover:bg-ink hover:text-background sm:px-4 sm:py-2.5"
        >
          Ajustar stock
        </button>
        <button
          type="button"
          onClick={onRegistrarPedido}
          className="eyebrow whitespace-nowrap border border-ink bg-ink px-2.5 py-2 text-background transition-colors hover:bg-transparent hover:text-ink sm:px-4 sm:py-2.5"
        >
          Registrar pedido
        </button>
      </div>
    </header>
  );
}
