"use client";

import { useMemo, useState } from "react";
import { usePanel } from "@/panel/store";
import { TipoHistorial } from "@/panel/types";
import { fechaHora, tiempoRelativo } from "@/panel/format";
import { ListaVacia } from "@/components/panel/EstadosLista";

const ETIQUETA_TIPO: Record<TipoHistorial, string> = {
  precio: "Precio",
  stock: "Stock",
  perfume: "Perfume",
  negocio: "Negocio",
  pedido: "Pedido",
};

export default function PanelHistorialPage() {
  const { sesion, estado, deshacerEntry } = usePanel();
  const [filtroTipo, setFiltroTipo] = useState<TipoHistorial | "todos">("todos");

  const entradas = useMemo(() => {
    // Empleado solo ve lo propio; Dueño ve todo (regla del brief §4).
    const base =
      sesion?.rol === "dueño" ? estado.historial : estado.historial.filter((h) => h.autor === sesion?.nombre);
    return filtroTipo === "todos" ? base : base.filter((h) => h.tipo === filtroTipo);
  }, [estado.historial, filtroTipo, sesion]);

  return (
    <div className="mx-auto max-w-[900px] px-6 pb-16 pt-6 lg:px-8">
      <p className="eyebrow text-accent">{sesion?.rol === "dueño" ? "Todos los cambios" : "Tus cambios"}</p>
      <h1 className="mt-2.5 font-serif text-[34px] font-light leading-none text-ink">Historial</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["todos", "precio", "stock", "perfume", "pedido", "negocio"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFiltroTipo(t)}
            className={`eyebrow border px-3.5 py-2 ${
              filtroTipo === t ? "border-ink bg-ink text-background" : "border-border text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {t === "todos" ? "Todos" : ETIQUETA_TIPO[t]}
          </button>
        ))}
      </div>

      {entradas.length === 0 ? (
        <div className="mt-6">
          <ListaVacia titulo="Sin cambios todavía" texto="Los cambios que hagas en el panel van a aparecer acá." />
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-border border border-border bg-surface">
          {entradas.map((h) => (
            <li key={h.id} className="flex items-center gap-4 px-5 py-3.5">
              <span className="eyebrow w-16 flex-none text-muted">{ETIQUETA_TIPO[h.tipo]}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] ${h.deshecho ? "text-muted line-through" : "text-ink"}`}>
                  {h.descripcion}
                </p>
                <p className="mt-1 text-[12px] text-muted">
                  {h.autor} · {fechaHora(h.fecha)} · {tiempoRelativo(h.fecha)}
                </p>
              </div>
              {h.inverso && !h.deshecho && (
                <button
                  type="button"
                  onClick={() => deshacerEntry(h.id)}
                  className="eyebrow flex-none text-ink underline decoration-line-strong hover:decoration-ink"
                >
                  Deshacer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
