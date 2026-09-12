import Link from "next/link";
import { siteConfig } from "@/data/site-config";

export function Footer() {
  const anio = new Date().getFullYear();
  const { instagram, facebook } = siteConfig.redes;

  const redes = [
    instagram && {
      etiqueta: "Instagram",
      href: instagram.startsWith("http")
        ? instagram
        : `https://instagram.com/${instagram}`,
    },
    facebook && {
      etiqueta: "Facebook",
      href: facebook.startsWith("http")
        ? facebook
        : `https://facebook.com/${facebook}`,
    },
  ].filter(Boolean) as Array<{ etiqueta: string; href: string }>;

  return (
    <footer className="mt-auto bg-panel text-panel-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="flex flex-col gap-10 border-b border-panel-foreground/12 pb-12 sm:flex-row sm:items-end sm:justify-between">
          <p className="font-serif text-3xl font-light leading-none">
            {siteConfig.nombreNegocio}
          </p>

          <nav className="flex flex-wrap gap-8">
            <Link href="/#catalogo" className="eyebrow link-underline text-panel-foreground/70 hover:text-panel-foreground">
              Catálogo
            </Link>
            <Link href="/#contacto" className="eyebrow link-underline text-panel-foreground/70 hover:text-panel-foreground">
              Contacto
            </Link>
            {redes.map((red) => (
              <a
                key={red.etiqueta}
                href={red.href}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow link-underline text-panel-foreground/70 hover:text-panel-foreground"
              >
                {red.etiqueta}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-8 text-[12px] text-panel-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {anio} {siteConfig.nombreNegocio}
          </p>
          <p>
            Decants fraccionados. Las marcas mencionadas pertenecen a sus
            respectivos titulares.
          </p>
        </div>
      </div>
    </footer>
  );
}
