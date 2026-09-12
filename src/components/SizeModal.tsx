"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Perfume } from "@/types";
import { PerfumeFoto } from "@/components/PerfumeFoto";
import { consultaWhatsApp } from "@/lib/contacto";
import { estadoStock, etiquetaStock, formatearPrecio } from "@/lib/format";

// Modal de selección de tamaño, el patrón que usan los dos sitios Shopify
// analizados (quick-add-modal / scent-size-trigger). Reemplaza a una ruta de
// detalle para la compra rápida: el catálogo es un export estático y toda la
// info necesaria para decidir entra acá sin cambiar de página.
export function SizeModal({
  perfume,
  onClose,
}: {
  perfume: Perfume | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!perfume) return;

    const cerrarConEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", cerrarConEsc);

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", cerrarConEsc);
      document.body.style.overflow = overflowPrevio;
    };
  }, [perfume, onClose]);

  if (!perfume) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-scrim p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${perfume.nombre} — elegir tamaño`}
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in-up max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-border bg-surface"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="relative hidden min-h-full border-r border-border sm:block">
            <PerfumeFoto perfume={perfume} prioridad />
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-muted">{perfume.marca}</p>
                <h2 className="mt-3 font-serif text-3xl font-light leading-tight text-ink">
                  {perfume.nombre}
                </h2>
                {perfume.concentracion && (
                  <p className="eyebrow mt-3 text-accent">
                    {perfume.concentracion}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="-mr-2 -mt-2 p-2 text-muted transition-colors hover:text-ink"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <p className="mt-5 text-[14px] leading-relaxed text-muted">
              {perfume.descripcion}
            </p>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {perfume.notas.map((nota) => (
                <span
                  key={nota}
                  className="border border-border px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted"
                >
                  {nota}
                </span>
              ))}
            </div>

            <p className="eyebrow mt-8 text-ink">Elegí tu presentación</p>

            <ul className="mt-4 divide-y divide-border border-y border-border">
              {perfume.tamanos.map((t) => {
                const estado =
                  typeof t.stock === "number" ? estadoStock(t.stock) : null;
                const agotado = estado === "agotado";

                return (
                  <li
                    key={t.ml}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="text-[15px] text-ink">{t.ml} ml</p>
                      {estado && (
                        <p className="eyebrow mt-1.5 text-muted">
                          {etiquetaStock[estado]}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-5">
                      <span className="font-serif text-xl text-ink">
                        {formatearPrecio(t.precio)}
                      </span>
                      {agotado ? (
                        <span className="eyebrow border border-border px-4 py-2.5 text-muted">
                          Sin stock
                        </span>
                      ) : (
                        <a
                          href={consultaWhatsApp(perfume, t.ml)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="eyebrow border border-ink bg-ink px-4 py-2.5 text-background transition-colors hover:bg-transparent hover:text-ink"
                        >
                          Consultar
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5">
              <Link
                href={`/perfumes/${perfume.id}`}
                className="eyebrow link-underline w-fit text-ink"
              >
                Ver ficha completa
              </Link>
              <p className="text-[12px] leading-relaxed text-muted">
                Confirmamos disponibilidad y cerramos el pedido por WhatsApp —
                este catálogo no procesa pagos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
