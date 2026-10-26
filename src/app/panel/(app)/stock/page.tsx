"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePanel } from "@/panel/store";
import { tiempoRelativo } from "@/panel/format";
import { PerfumeFoto } from "@/components/PerfumeFoto";
import { IconoBuscar } from "@/components/panel/iconos";
import { ListaVacia } from "@/components/panel/EstadosLista";

function estadoDe(stock: number | undefined) {
  if (typeof stock !== "number") return "sin-dato" as const;
  if (stock <= 0) return "agotado" as const;
  if (stock <= 3) return "ultimas" as const;
  return "disponible" as const;
}

function Contenido() {
  const params = useSearchParams();
  const { perfumes, estado, registrarMovimientoStock } = usePanel();
  const [busqueda, setBusqueda] = useState(params.get("buscar") ?? "");

  const resultados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) {
      // Sin búsqueda: los más urgentes primero, para que la pantalla sirva de
      // un vistazo aunque no se busque nada puntual.
      return [...perfumes]
        .sort((a, b) => {
          const pesoA = a.tamanos.some((t) => estadoDe(t.stock) === "agotado") ? 0 : 1;
          const pesoB = b.tamanos.some((t) => estadoDe(t.stock) === "agotado") ? 0 : 1;
          return pesoA - pesoB || a.marca.localeCompare(b.marca, "es");
        })
        .slice(0, 30);
    }
    return perfumes.filter(
      (p) => p.nombre.toLowerCase().includes(texto) || p.marca.toLowerCase().includes(texto),
    );
  }, [perfumes, busqueda]);

  const movimientos = estado.movimientos.slice(0, 15);
  const nombrePerfume = (id: string) => {
    const p = perfumes.find((pp) => pp.id === id);
    return p ? `${p.marca} ${p.nombre}` : id;
  };

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-12 pt-6 lg:px-8">
      <p className="eyebrow text-accent">{perfumes.length} perfumes</p>
      <h1 className="mt-2.5 font-serif text-[34px] font-light leading-none text-ink">Stock</h1>

      <div className="mt-5 flex max-w-[420px] items-center gap-2.5 border border-border bg-surface px-3.5 py-2.5">
        <IconoBuscar className="h-3.5 w-3.5 flex-none text-muted" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar perfume o marca"
          className="w-full bg-transparent text-[13px] text-ink placeholder:text-muted focus:outline-none"
        />
      </div>
      {!busqueda && <p className="mt-2 text-[12px] text-muted">Mostrando los más urgentes primero.</p>}

      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {resultados.length === 0 ? (
          <ListaVacia titulo="Sin resultados" texto="Probá con otra marca o nombre." />
        ) : (
          <ul className="divide-y divide-border border border-border bg-surface">
            {resultados.map((p) => (
              <li key={p.id} className="flex items-center gap-3.5 px-4 py-3">
                <div className="h-10 w-10 flex-none bg-[#f7f5f2]">
                  <PerfumeFoto perfume={p} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow text-muted">{p.marca}</p>
                  <p className="mt-1 truncate text-[14px] text-ink">{p.nombre}</p>
                </div>
                <div className="flex flex-none flex-wrap justify-end gap-2">
                  {p.tamanos.map((t) => (
                    <div key={t.ml} className="flex items-center gap-1.5 border border-border px-2 py-1.5">
                      <span className="text-[11px] text-muted">{t.ml}ml</span>
                      <button
                        type="button"
                        onClick={() => registrarMovimientoStock(p.id, t.ml, -1, "Ajuste manual")}
                        disabled={!t.stock}
                        className="flex h-5 w-5 items-center justify-center border border-border text-ink disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`Restar ${p.nombre} ${t.ml}ml`}
                      >
                        −
                      </button>
                      <span
                        className={`w-5 text-center text-[12px] tabular-nums ${
                          estadoDe(t.stock) === "agotado" ? "text-danger" : "text-ink"
                        }`}
                      >
                        {t.stock ?? "—"}
                      </span>
                      <button
                        type="button"
                        onClick={() => registrarMovimientoStock(p.id, t.ml, 1, "Ajuste manual")}
                        className="flex h-5 w-5 items-center justify-center border border-border text-ink"
                        aria-label={`Sumar ${p.nombre} ${t.ml}ml`}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="border border-border bg-surface">
          <p className="eyebrow border-b border-border px-4 py-3.5 text-muted">Movimientos recientes</p>
          {movimientos.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-muted">Todavía no hay movimientos.</p>
          ) : (
            <ul className="divide-y divide-border">
              {movimientos.map((m) => (
                <li key={m.id} className="px-4 py-3 text-[13px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-ink">{nombrePerfume(m.perfumeId)}</span>
                    <span className={`tabular-nums ${m.delta > 0 ? "text-success" : "text-danger"}`}>
                      {m.delta > 0 ? "+" : ""}
                      {m.delta}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-muted">
                    {m.ml} ml · {m.motivo} · {m.autor} · {tiempoRelativo(m.fecha)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-muted">
        Cada ajuste se guarda como un movimiento (+2, −1), no como un valor final, para que dos personas puedan
        ajustar el mismo perfume sin pisarse.
      </p>
    </div>
  );
}

export default function PanelStockPage() {
  return (
    <Suspense fallback={null}>
      <Contenido />
    </Suspense>
  );
}
