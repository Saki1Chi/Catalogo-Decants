"use client";

import Link from "next/link";
import { usePanel } from "@/panel/store";
import { calcularMetricas, filasAtencion } from "@/panel/metricas";
import { tiempoRelativo } from "@/panel/format";
import { PerfumeFoto } from "@/components/PerfumeFoto";

function fechaHoy(): string {
  const texto = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const ETIQUETA_PEDIDO: Record<string, string> = {
  consulta: "Consulta",
  confirmado: "Confirmado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function PanelInicioPage() {
  const { perfumes, estado } = usePanel();
  const metricas = calcularMetricas(perfumes, estado.pedidos);
  const atencion = filasAtencion(perfumes, 4);
  const pedidosPendientes = estado.pedidos
    .filter((p) => p.estado === "consulta" || p.estado === "confirmado")
    .slice(0, 4);

  const perfumePorId = (id: string) => perfumes.find((p) => p.id === id);

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-12 pt-7 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">{fechaHoy()}</p>
          <h1 className="mt-2.5 font-serif text-[38px] font-light leading-none text-ink">Inicio</h1>
        </div>
        <div className="text-right">
          <p className="eyebrow text-muted">Catálogo público</p>
          <p className="mt-1.5 text-[13px] text-ink">
            Actualizado {tiempoRelativo(estado.catalogoActualizadoEn)} ·{" "}
            <Link href="/panel/compartir" className="link-underline">
              Compartir
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
        <div className="bg-surface p-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
            <span className="eyebrow text-muted">Agotados</span>
          </div>
          <p className="mt-3.5 font-serif text-[42px] font-light leading-none tabular-nums text-ink">
            {metricas.agotados}
          </p>
          <p className="mt-2 text-[12px] text-muted">presentaciones sin unidades</p>
        </div>
        <div className="bg-surface p-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="eyebrow text-muted">Últimas unidades</span>
          </div>
          <p className="mt-3.5 font-serif text-[42px] font-light leading-none tabular-nums text-ink">
            {metricas.ultimasUnidades}
          </p>
          <p className="mt-2 text-[12px] text-muted">de 1 a 3 unidades</p>
        </div>
        <div className="bg-surface p-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ink" />
            <span className="eyebrow text-muted">Pedidos pendientes</span>
          </div>
          <p className="mt-3.5 font-serif text-[42px] font-light leading-none tabular-nums text-ink">
            {metricas.pedidosPendientes}
          </p>
          <p className="mt-2 text-[12px] text-muted">
            {metricas.consultas} consultas · {metricas.confirmadosSinEntregar} por entregar
          </p>
        </div>
        <div className="bg-surface p-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="eyebrow text-muted">Sin sincronizar</span>
          </div>
          <p className="mt-3.5 font-serif text-[42px] font-light leading-none tabular-nums text-ink">
            {estado.pendientes}
          </p>
          <p className="mt-2 text-[12px] text-muted">
            {estado.pendientes === 0 ? "todo guardado en la nube" : "guardando…"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="eyebrow text-muted">Atención inmediata</span>
            <Link href="/panel/stock" className="link-underline text-[12px] text-ink">
              Ver stock
            </Link>
          </div>
          {atencion.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-muted">
              Todo el stock está en buen nivel.
            </p>
          ) : (
            atencion.map((fila) => {
              const p = perfumePorId(fila.perfumeId);
              return (
                <div
                  key={`${fila.perfumeId}-${fila.ml}`}
                  className="flex items-center gap-3.5 border-b border-border px-5 py-2.5 last:border-b-0"
                >
                  <div className="h-10 w-10 flex-none bg-[#f7f5f2]">
                    {p && <PerfumeFoto perfume={p} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow text-muted">{fila.marca}</p>
                    <p className="mt-1 truncate text-[14px] text-ink">{fila.nombre}</p>
                  </div>
                  <div className="flex w-[150px] flex-none items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${fila.stock <= 0 ? "bg-danger" : "bg-accent"}`}
                    />
                    <span className="text-[13px] text-ink">
                      {fila.stock <= 0 ? `Agotado en ${fila.ml} ml` : `${fila.stock} en ${fila.ml} ml`}
                    </span>
                  </div>
                  <Link
                    href={`/panel/stock?buscar=${encodeURIComponent(fila.nombre)}`}
                    className="eyebrow flex-none border border-ink px-3 py-1.5 text-ink transition-colors hover:bg-ink hover:text-background"
                  >
                    Ajustar
                  </Link>
                </div>
              );
            })
          )}
        </section>

        <section className="flex flex-col border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="eyebrow text-muted">Pedidos pendientes</span>
            <Link href="/panel/pedidos" className="link-underline text-[12px] text-ink">
              Ver todos
            </Link>
          </div>
          {pedidosPendientes.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-muted">No hay pedidos pendientes.</p>
          ) : (
            pedidosPendientes.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] text-ink">{p.cliente}</p>
                  <p className="mt-1 text-[12px] text-muted">
                    {p.items.length} {p.items.length === 1 ? "decant" : "decants"} · {tiempoRelativo(p.fecha)}
                  </p>
                </div>
                <span
                  className={`eyebrow ${p.estado === "confirmado" ? "text-ink" : "text-muted"}`}
                >
                  {ETIQUETA_PEDIDO[p.estado]}
                </span>
              </div>
            ))
          )}

          <div className="mt-auto flex gap-2.5 border-t border-border p-4">
            <Link
              href="/panel/catalogo/ficha"
              className="eyebrow flex-1 border border-ink px-3 py-2.5 text-center text-ink transition-colors hover:bg-ink hover:text-background"
            >
              Nuevo perfume
            </Link>
            <Link
              href="/panel/compartir"
              className="eyebrow flex-1 border border-ink px-3 py-2.5 text-center text-ink transition-colors hover:bg-ink hover:text-background"
            >
              Compartir
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
