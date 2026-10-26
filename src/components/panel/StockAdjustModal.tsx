"use client";

import { useMemo, useState } from "react";
import { usePanel } from "@/panel/store";
import { PerfumeFoto } from "@/components/PerfumeFoto";
import { formatearPrecio } from "@/lib/format";
import { Modal } from "./Modal";

export function StockAdjustModal({ onClose }: { onClose: () => void }) {
  const { perfumes, registrarMovimientoStock } = usePanel();
  const [busqueda, setBusqueda] = useState("");

  const resultados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (texto.length < 2) return [];
    return perfumes
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(texto) || p.marca.toLowerCase().includes(texto),
      )
      .slice(0, 6);
  }, [perfumes, busqueda]);

  return (
    <Modal titulo="Ajustar stock" onClose={onClose} ancho="max-w-lg">
      <input
        autoFocus
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar perfume o marca"
        className="w-full border border-border bg-background px-4 py-3 text-[13px] text-ink placeholder:text-muted focus:border-ink focus:outline-none"
      />

      {busqueda.trim().length >= 2 && resultados.length === 0 && (
        <p className="mt-4 text-[13px] text-muted">No encontramos ese perfume.</p>
      )}

      <ul className="mt-4 divide-y divide-border">
        {resultados.map((p) => (
          <li key={p.id} className="py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-none bg-[#f7f5f2]">
                <PerfumeFoto perfume={p} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="eyebrow text-muted">{p.marca}</p>
                <p className="truncate text-[14px] text-ink">{p.nombre}</p>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {p.tamanos.map((t) => (
                <div
                  key={t.ml}
                  className="flex items-center gap-2 border border-border px-2.5 py-1.5"
                >
                  <span className="text-[12px] text-muted">{t.ml} ml</span>
                  <button
                    type="button"
                    onClick={() => registrarMovimientoStock(p.id, t.ml, -1, "Ajuste manual")}
                    disabled={!t.stock}
                    aria-label={`Restar una unidad de ${p.nombre} ${t.ml} ml`}
                    className="flex h-6 w-6 items-center justify-center border border-border text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-[13px] tabular-nums text-ink">
                    {t.stock ?? "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() => registrarMovimientoStock(p.id, t.ml, 1, "Ajuste manual")}
                    aria-label={`Sumar una unidad de ${p.nombre} ${t.ml} ml`}
                    className="flex h-6 w-6 items-center justify-center border border-border text-ink transition-colors hover:border-ink"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-muted">Desde {formatearPrecio(Math.min(...p.tamanos.map((t) => t.precio)))}</p>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
