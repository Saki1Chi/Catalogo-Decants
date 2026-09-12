import Link from "next/link";
import { notFound } from "next/navigation";
import { perfumes } from "@/data/perfumes";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PerfumeFoto } from "@/components/PerfumeFoto";
import { StockBadge } from "@/components/StockBadge";
import { consultaWhatsApp } from "@/lib/contacto";
import { estadoStock, formatearPrecio, precioDesde, stockTotal } from "@/lib/format";

export function generateStaticParams() {
  return perfumes.map((p) => ({ id: p.id }));
}

export default async function PerfumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const perfume = perfumes.find((p) => p.id === id);

  if (!perfume) {
    notFound();
  }

  const stock = stockTotal(perfume.tamanos);

  // Se priorizan los de la misma familia olfativa y se completa con el resto:
  // hay familias con pocos perfumes y la sección no puede quedar vacía, porque
  // es la única salida de la ficha además del breadcrumb.
  const otros = perfumes.filter((p) => p.id !== perfume.id);
  const mismaFamilia = otros.filter((p) => p.familia === perfume.familia);
  const relacionados = [
    ...mismaFamilia,
    ...otros.filter((p) => p.familia !== perfume.familia),
  ].slice(0, 4);

  const ficha = [
    perfume.concentracion && { k: "Concentración", v: perfume.concentracion },
    { k: "Familia", v: perfume.familiaDetallada ?? perfume.familia },
    { k: "Género", v: perfume.categoria },
    perfume.anio && { k: "Año", v: String(perfume.anio) },
    perfume.perfumista && { k: "Perfumista", v: perfume.perfumista },
  ].filter(Boolean) as Array<{ k: string; v: string }>;

  const niveles = [
    { titulo: "Salida", notas: perfume.piramide.salida },
    { titulo: "Corazón", notas: perfume.piramide.corazon },
    { titulo: "Fondo", notas: perfume.piramide.fondo },
  ].filter((n) => n.notas.length > 0);

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:py-16">
        <nav className="eyebrow flex items-center gap-2 text-muted">
          <Link href="/#catalogo" className="link-underline hover:text-ink">
            Catálogo
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{perfume.nombre}</span>
        </nav>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <div className="aspect-square border border-border">
              <PerfumeFoto perfume={perfume} prioridad />
            </div>
            {perfume.imagenAmbiente && (
              <div className="mt-px aspect-[4/3] overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={perfume.imagenAmbiente}
                  alt={`${perfume.nombre} — imagen de campaña`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-6">
            <p className="eyebrow text-muted">{perfume.marca}</p>
            <h1 className="mt-5 font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-light leading-[1.02] tracking-[-0.02em] text-ink">
              {perfume.nombre}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="eyebrow text-accent">{perfume.familia}</span>
              <span className="eyebrow text-muted">{perfume.categoria}</span>
              {stock !== null && <StockBadge stock={stock} />}
            </div>

            <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-muted">
              {perfume.descripcion}
            </p>

            {/* Pirámide completa: es el dato que más se busca al elegir un decant */}
            <div className="mt-10">
              <p className="eyebrow text-ink">Pirámide olfativa</p>
              <dl className="mt-5 divide-y divide-border border-y border-border">
                {niveles.map((n) => (
                  <div
                    key={n.titulo}
                    className="grid grid-cols-3 items-baseline gap-4 py-4"
                  >
                    <dt className="eyebrow text-muted">{n.titulo}</dt>
                    <dd className="col-span-2 text-[14px] leading-relaxed text-ink">
                      {n.notas.join(" · ")}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {ficha.length > 0 && (
              <>
              <p className="eyebrow mt-10 text-ink">Ficha técnica</p>
              <dl className="mt-5 divide-y divide-border border-y border-border">
                {ficha.map((d) => (
                  <div
                    key={d.k}
                    className="grid grid-cols-3 items-baseline gap-4 py-4"
                  >
                    <dt className="eyebrow text-muted">{d.k}</dt>
                    <dd className="col-span-2 text-[14px] text-ink">{d.v}</dd>
                  </div>
                ))}
              </dl>
              </>
            )}

            <div className="mt-12">
              <div className="flex items-baseline justify-between gap-4">
                <p className="eyebrow text-ink">Presentaciones</p>
                <p className="text-[13px] text-muted">
                  Desde{" "}
                  <span className="font-serif text-xl text-ink">
                    {formatearPrecio(precioDesde(perfume.tamanos))}
                  </span>
                </p>
              </div>

              <ul className="mt-5 divide-y divide-border border-y border-border">
                {perfume.tamanos.map((t) => {
                  const estado =
                    typeof t.stock === "number" ? estadoStock(t.stock) : null;
                  const agotado = estado === "agotado";

                  return (
                    <li
                      key={t.ml}
                      className="flex items-center justify-between gap-4 py-5"
                    >
                      <div>
                        <p className="text-[16px] text-ink">{t.ml} ml</p>
                        {typeof t.stock === "number" && (
                          <div className="mt-2">
                            <StockBadge stock={t.stock} />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="font-serif text-2xl text-ink">
                          {formatearPrecio(t.precio)}
                        </span>
                        {agotado ? (
                          <span className="eyebrow border border-border px-5 py-3 text-muted">
                            Sin stock
                          </span>
                        ) : (
                          <a
                            href={consultaWhatsApp(perfume, t.ml)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="eyebrow border border-ink bg-ink px-5 py-3 text-background transition-colors hover:bg-transparent hover:text-ink"
                          >
                            Consultar
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-5 text-[12px] leading-relaxed text-muted">
                Confirmamos disponibilidad y cerramos el pedido por WhatsApp —
                este catálogo no procesa pagos.
              </p>

              {/* Honestidad sobre el dato: en unos pocos perfumes el nombre del
                  inventario era ambiguo y la identificación quedó probable. */}
              {perfume.completitud === "baja" && (
                <p className="mt-6 border border-accent/30 bg-accent/[0.06] px-4 py-3 text-[12px] leading-relaxed text-ink/80">
                  <span className="eyebrow mr-2 text-accent">Por confirmar</span>
                  La ficha de esta fragancia está pendiente de verificación con
                  el proveedor. Escribinos antes de encargarla y te confirmamos
                  la versión exacta.
                </p>
              )}
            </div>
          </div>
        </div>

        {relacionados.length > 0 && (
          <section className="mt-24 border-t border-border pt-12">
            <p className="eyebrow text-accent">Del catálogo</p>
            <h2 className="rule mt-5 font-serif text-3xl font-light text-ink">
              {mismaFamilia.length >= 4
                ? `Otros ${perfume.familia.toLowerCase()}`
                : "Seguir viendo"}
            </h2>

            <ul className="mt-10 grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
              {relacionados.map((otro) => (
                <li key={otro.id} className="bg-surface">
                  <Link href={`/perfumes/${otro.id}`} className="group block">
                    <div className="aspect-square border-b border-border">
                      <PerfumeFoto perfume={otro} />
                    </div>
                    <div className="p-5">
                      <p className="eyebrow text-muted">{otro.marca}</p>
                      <p className="link-underline mt-2.5 text-[15px] font-medium text-ink">
                        {otro.nombre}
                      </p>
                      <p className="mt-3 text-[13px] text-muted">
                        Desde{" "}
                        <span className="font-serif text-lg text-ink">
                          {formatearPrecio(precioDesde(otro.tamanos))}
                        </span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
