import Link from "next/link";
import { Perfume } from "@/types";
import { PerfumeFoto } from "@/components/PerfumeFoto";
import { NotesDisplay } from "@/components/NotesDisplay";
import { StockBadge } from "@/components/StockBadge";
import { formatearPrecio, precioDesde, stockTotal } from "@/lib/format";

export function ProductCard({
  perfume,
  onElegir,
  prioridad = false,
}: {
  perfume: Perfume;
  onElegir: (perfume: Perfume) => void;
  prioridad?: boolean;
}) {
  const desde = precioDesde(perfume.tamanos);
  const stock = stockTotal(perfume.tamanos);
  const agotado = stock !== null && stock <= 0;
  // Alta creada desde /panel: no tiene página de detalle propia (el sitio es
  // export estático, esa ruta solo existe para los perfumes que ya estaban
  // en el build). Se muestra en la grilla pero sin link roto al detalle.
  const tieneFicha = !perfume.id.startsWith("panel-nuevo");

  return (
    <article className="product-card group flex h-full flex-col bg-surface transition-colors duration-300 hover:bg-surface-alt/35">
      <div className="card-media relative aspect-square overflow-hidden">
        <div className="media-front absolute inset-0">
          <PerfumeFoto perfume={perfume} prioridad={prioridad} />
        </div>
        <div className="media-back absolute inset-0">
          <NotesDisplay notas={perfume.notas} familia={perfume.familia} />
        </div>

        {perfume.destacado && !agotado && (
          <span className="eyebrow absolute left-0 top-0 z-10 bg-ink px-3 py-2 text-background">
            Destacado
          </span>
        )}
        {agotado && (
          <span className="eyebrow absolute left-0 top-0 z-10 bg-danger px-3 py-2 text-background">
            Agotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t border-border p-5">
        <p className="eyebrow text-muted">{perfume.marca}</p>
        <h3 className="mt-3 text-[15px] font-medium leading-snug text-ink">
          {tieneFicha ? (
            <Link href={`/perfumes/${perfume.id}`} className="link-underline">
              {perfume.nombre}
            </Link>
          ) : (
            perfume.nombre
          )}
        </h3>

        {/* Chips de notas bajo el nombre: comunica la composición sin obligar
            a abrir el detalle (patrón de Fragancias Fiord). El min-h reserva
            dos líneas para que el precio y el CTA queden alineados en la fila. */}
        <ul className="mt-3 flex min-h-[56px] flex-wrap content-start gap-1.5">
          {perfume.notas.slice(0, 3).map((nota) => (
            <li
              key={nota}
              className="h-fit border border-border px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted"
            >
              {nota}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-5">
          <div className="flex flex-col items-start gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="text-[13px] text-muted">
              Desde{" "}
              <span className="font-serif text-xl text-ink">
                {formatearPrecio(desde)}
              </span>
            </p>
            {/* Sin dato de stock se muestra la familia olfativa, que para
                elegir sirve más que un badge de disponibilidad inventado. */}
            {stock === null ? (
              <span className="eyebrow text-accent">{perfume.familia}</span>
            ) : (
              <StockBadge stock={stock} />
            )}
          </div>

          <button
            type="button"
            onClick={() => onElegir(perfume)}
            className="eyebrow mt-5 w-full border border-ink bg-ink px-4 py-3.5 text-background transition-colors hover:bg-transparent hover:text-ink"
          >
            Elegir decant
          </button>
        </div>
      </div>
    </article>
  );
}
