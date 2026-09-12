import { siteConfig } from "@/data/site-config";
import { consultaWhatsAppGeneral } from "@/lib/contacto";

export function ContactSection() {
  const { telefono, email, direccion, horario, whatsapp } = siteConfig.contacto;

  const datos = [
    telefono && {
      etiqueta: "Teléfono",
      valor: telefono,
      href: `tel:${telefono.replace(/\s+/g, "")}`,
    },
    email && { etiqueta: "Correo", valor: email, href: `mailto:${email}` },
    direccion && { etiqueta: "Showroom", valor: direccion },
    horario && { etiqueta: "Horario", valor: horario },
  ].filter(Boolean) as Array<{
    etiqueta: string;
    valor: string;
    href?: string;
  }>;

  return (
    <section id="contacto" className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-20 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:col-span-5">
          <p className="eyebrow text-accent">Contacto</p>
          <h2 className="rule mt-6 font-serif text-[clamp(2rem,4vw,3rem)] font-light leading-tight text-ink">
            ¿Buscás una fragancia puntual?
          </h2>
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-muted">
            Este catálogo es informativo: no procesa pagos ni toma pedidos en
            línea. Escribinos y te confirmamos disponibilidad, precio final y
            tiempo de entrega.
          </p>

          {whatsapp && (
            <a
              href={consultaWhatsAppGeneral()}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow mt-10 inline-flex items-center gap-3 border border-ink bg-ink px-8 py-4 text-background transition-colors hover:bg-transparent hover:text-ink"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.02a8.1 8.1 0 0 1-4.14-1.13l-.3-.18-3.14.82.84-3.06-.19-.31a8.06 8.06 0 0 1-1.23-4.25c0-4.47 3.64-8.11 8.12-8.11 2.17 0 4.2.85 5.74 2.38a8.05 8.05 0 0 1 2.38 5.74c0 4.47-3.64 8.1-8.08 8.1Zm4.44-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.03-.38-1.96-1.22-.72-.65-1.21-1.44-1.35-1.68-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42-.14 0-.31-.02-.47-.02s-.43.06-.66.31c-.22.24-.86.85-.86 2.06s.89 2.39 1.01 2.56c.12.16 1.75 2.68 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.44-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
              </svg>
              Escribir por WhatsApp
            </a>
          )}
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <dl className="divide-y divide-border border-y border-border">
            {datos.map((dato) => (
              <div
                key={dato.etiqueta}
                className="grid grid-cols-3 items-baseline gap-4 py-6"
              >
                <dt className="eyebrow text-muted">{dato.etiqueta}</dt>
                <dd className="col-span-2 text-[15px] text-ink">
                  {dato.href ? (
                    <a href={dato.href} className="link-underline">
                      {dato.valor}
                    </a>
                  ) : (
                    dato.valor
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
