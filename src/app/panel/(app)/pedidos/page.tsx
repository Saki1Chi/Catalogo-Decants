"use client";

import { useMemo, useState } from "react";
import { usePanel } from "@/panel/store";
import { EstadoPedido } from "@/panel/types";
import { formatearPrecio } from "@/lib/format";
import { fechaHora, tiempoRelativo } from "@/panel/format";
import { RegisterOrderModal } from "@/components/panel/RegisterOrderModal";
import { ListaVacia } from "@/components/panel/EstadosLista";

const ETIQUETA: Record<EstadoPedido, string> = {
  consulta: "Consulta",
  confirmado: "Confirmado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const FILTROS: Array<{ v: EstadoPedido | "todos"; l: string }> = [
  { v: "todos", l: "Todos" },
  { v: "consulta", l: "Consulta" },
  { v: "confirmado", l: "Confirmado" },
  { v: "entregado", l: "Entregado" },
  { v: "cancelado", l: "Cancelado" },
];

export default function PanelPedidosPage() {
  const { perfumes, estado, actualizarEstadoPedido } = usePanel();
  const [filtro, setFiltro] = useState<EstadoPedido | "todos">("todos");
  const [modalAbierto, setModalAbierto] = useState(false);

  const pedidos = useMemo(() => {
    const lista = filtro === "todos" ? estado.pedidos : estado.pedidos.filter((p) => p.estado === filtro);
    return [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [estado.pedidos, filtro]);

  const nombrePerfume = (id: string) => perfumes.find((p) => p.id === id)?.nombre ?? id;

  const totalPedido = (items: { precioUnitario: number; cantidad: number }[], descuento: number) =>
    Math.max(0, items.reduce((acc, it) => acc + it.precioUnitario * it.cantidad, 0) - descuento);

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-12 pt-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">{estado.pedidos.length} pedidos registrados</p>
          <h1 className="mt-2.5 font-serif text-[34px] font-light leading-none text-ink">Pedidos</h1>
        </div>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="eyebrow border border-ink bg-ink px-4 py-2.5 text-background transition-colors hover:bg-transparent hover:text-ink"
        >
          Registrar pedido
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.v}
            type="button"
            onClick={() => setFiltro(f.v)}
            className={`eyebrow border px-3.5 py-2 ${
              filtro === f.v ? "border-ink bg-ink text-background" : "border-border text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {pedidos.length === 0 ? (
        <div className="mt-6">
          <ListaVacia titulo="Sin pedidos" texto="Todavía no hay pedidos en este estado." />
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-border border border-border bg-surface">
          {pedidos.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <p className="text-[14px] font-medium text-ink">{p.cliente}</p>
                  <span
                    className={`eyebrow border px-1.5 py-0.5 text-[10px] ${
                      p.estado === "cancelado"
                        ? "border-danger text-danger"
                        : p.estado === "entregado"
                          ? "border-success text-success"
                          : "border-ink text-ink"
                    }`}
                  >
                    {ETIQUETA[p.estado]}
                  </span>
                  <span className="eyebrow text-[10px] text-muted">{p.pago === "pagado" ? "Pagado" : "Pago pendiente"}</span>
                </div>
                <p className="mt-1.5 text-[12px] text-muted">
                  {p.items.map((it) => `${nombrePerfume(it.perfumeId)} (${it.ml}ml×${it.cantidad})`).join(" · ")}
                </p>
                <p className="mt-1 text-[12px] text-muted">
                  {fechaHora(p.fecha)} · {tiempoRelativo(p.fecha)} · {p.autor}
                  {p.whatsapp && ` · ${p.whatsapp}`}
                </p>
              </div>

              <div className="flex flex-none items-center gap-3">
                <span className="font-serif text-xl text-ink">{formatearPrecio(totalPedido(p.items, p.descuento))}</span>
                <div className="flex gap-1.5">
                  {p.estado === "consulta" && (
                    <button
                      type="button"
                      onClick={() => actualizarEstadoPedido(p.id, "confirmado")}
                      className="eyebrow border border-ink px-3 py-1.5 text-ink transition-colors hover:bg-ink hover:text-background"
                    >
                      Confirmar
                    </button>
                  )}
                  {p.estado === "confirmado" && (
                    <button
                      type="button"
                      onClick={() => actualizarEstadoPedido(p.id, "entregado", "pagado")}
                      className="eyebrow border border-ink px-3 py-1.5 text-ink transition-colors hover:bg-ink hover:text-background"
                    >
                      Entregar
                    </button>
                  )}
                  {(p.estado === "consulta" || p.estado === "confirmado") && (
                    <button
                      type="button"
                      onClick={() => actualizarEstadoPedido(p.id, "cancelado")}
                      className="eyebrow border border-border px-3 py-1.5 text-muted transition-colors hover:border-danger hover:text-danger"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalAbierto && <RegisterOrderModal onClose={() => setModalAbierto(false)} />}
    </div>
  );
}
