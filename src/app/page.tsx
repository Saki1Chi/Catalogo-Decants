import { perfumes } from "@/data/perfumes";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { PlaceholderNotice } from "@/components/PlaceholderNotice";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { CatalogClient } from "@/components/CatalogClient";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <PlaceholderNotice />

      <main>
        <Hero />
        <TrustBar />

        <section id="catalogo" className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
          <Reveal>
            <div className="flex flex-col gap-6 pb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-accent">El catálogo</p>
                <h2 className="rule mt-6 font-serif text-[clamp(2rem,4vw,3rem)] font-light leading-tight text-ink">
                  Fragancias disponibles
                </h2>
              </div>
              <p className="max-w-sm text-[13px] leading-relaxed text-muted">
                Cada fragancia se fracciona en 3, 5 y 10 ml. Elegí la
                presentación y te confirmamos disponibilidad por WhatsApp.
              </p>
            </div>
          </Reveal>

          <CatalogClient perfumes={perfumes} />
        </section>
      </main>

      <ContactSection />
      <Footer />
    </>
  );
}
