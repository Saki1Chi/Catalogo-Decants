import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { consultaWhatsAppGeneral } from "@/lib/contacto";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5 sm:px-8">
        <Link
          href="/"
          className="font-serif text-2xl font-medium leading-none tracking-tight text-ink sm:text-[26px]"
        >
          {siteConfig.nombreNegocio}
        </Link>

        <nav className="flex items-center gap-6 sm:gap-9">
          <Link
            href="/#catalogo"
            className="eyebrow link-underline hidden text-ink/70 hover:text-ink sm:inline-block"
          >
            Catálogo
          </Link>
          <Link
            href="/#contacto"
            className="eyebrow link-underline hidden text-ink/70 hover:text-ink sm:inline-block"
          >
            Contacto
          </Link>
          <a
            href={consultaWhatsAppGeneral()}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow border border-ink bg-ink px-4 py-2.5 text-background transition-colors hover:bg-transparent hover:text-ink"
          >
            WhatsApp
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
