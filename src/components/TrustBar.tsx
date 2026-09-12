import { siteConfig } from "@/data/site-config";

// Trust bar de 3 puntos entre el hero y el grid: patrón de Stone Fragrances
// para bajar fricción antes de que el cliente empiece a mirar precios.
const iconos = [
  // sello
  "M12 2 4 5v6c0 4.5 3.2 8.6 8 10 4.8-1.4 8-5.5 8-10V5l-8-3Zm-1.2 12.2-2.6-2.6 1.3-1.3 1.3 1.3 3.9-3.9 1.3 1.3-5.2 5.2Z",
  // gota
  "M12 2.5C8.5 6.6 6 10 6 13.3A6 6 0 0 0 18 13.3c0-3.3-2.5-6.7-6-10.8Z",
  // chat
  "M12 3C6.9 3 3 6.4 3 10.6c0 2.3 1.2 4.4 3.1 5.8L5.4 21l4.3-2.3c.7.1 1.5.2 2.3.2 5.1 0 9-3.4 9-7.6S17.1 3 12 3Z",
];

export function TrustBar() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {siteConfig.confianza.map((item, i) => (
          <div
            key={item.titulo}
            className="flex items-start gap-4 px-4 py-8 sm:px-8"
          >
            <svg
              viewBox="0 0 24 24"
              className="mt-0.5 h-5 w-5 shrink-0 text-accent"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={iconos[i % iconos.length]} />
            </svg>
            <div>
              <p className="eyebrow text-ink">{item.titulo}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {item.texto}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
