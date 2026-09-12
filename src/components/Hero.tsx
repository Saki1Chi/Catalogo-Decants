import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { perfumes } from "@/data/perfumes";
import { PerfumeFoto } from "@/components/PerfumeFoto";
import { consultaWhatsAppGeneral } from "@/lib/contacto";
import { formatearPrecio, precioDesde } from "@/lib/format";

export function Hero() {
  const minimo = Math.min(...perfumes.map((p) => precioDesde(p.tamanos)));
  const marcas = new Set(perfumes.map((p) => p.marca)).size;
  // El destacado más caro hace de portada.
  const portada =
    [...perfumes]
      .filter((p) => p.destacado && p.imagen)
      .sort((a, b) => precioDesde(b.tamanos) - precioDesde(a.tamanos))[0] ??
    perfumes.find((p) => p.imagen);

  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-24">
        <div className="flex flex-col justify-center lg:col-span-7">
          <p className="eyebrow text-accent">Perfumería fraccionada</p>

          <h1 className="mt-7 font-serif text-[clamp(2rem,7vw,4.75rem)] font-light leading-[0.98] tracking-[-0.02em] text-ink">
            <span className="text-accent">{siteConfig.titularAcento}</span>
            <br />
            {siteConfig.titularResto}
          </h1>

          <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-muted">
            {siteConfig.introHero}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="#catalogo"
              className="eyebrow border border-ink bg-ink px-8 py-4 text-background transition-colors hover:bg-transparent hover:text-ink"
            >
              Ver catálogo
            </Link>
            <a
              href={consultaWhatsAppGeneral()}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow link-underline py-4 text-ink"
            >
              Consultar por WhatsApp
            </a>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-6 border-t border-border pt-8">
            {[
              { valor: `${perfumes.length}`, etiqueta: "Fragancias" },
              { valor: `${marcas}`, etiqueta: "Marcas" },
              { valor: "3 · 5 · 10 ml", etiqueta: "Presentaciones" },
              { valor: formatearPrecio(minimo), etiqueta: "Desde" },
            ].map((dato) => (
              <div key={dato.etiqueta}>
                <dt className="eyebrow text-muted">{dato.etiqueta}</dt>
                <dd className="mt-2 font-serif text-2xl text-ink">
                  {dato.valor}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5">
          <div className="aspect-square border border-border">
            {portada && <PerfumeFoto perfume={portada} prioridad />}
          </div>
          {portada && (
            <p className="eyebrow mt-4 text-muted">
              {portada.marca} · {portada.nombre}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
