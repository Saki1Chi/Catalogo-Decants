"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/data/site-config";

// Los 3 sitios de referencia abren con una barra de mensajes rotativos. Acá se
// resuelve con un intervalo y un remount por key en vez de un carrusel: es un
// texto corto, no justifica cargar Swiper.
export function AnnouncementBar() {
  const { anuncios } = siteConfig;
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (anuncios.length < 2) return;
    const id = setInterval(
      () => setIndice((i) => (i + 1) % anuncios.length),
      4500,
    );
    return () => clearInterval(id);
  }, [anuncios.length]);

  if (anuncios.length === 0) return null;

  return (
    <div className="bg-panel text-panel-foreground">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center px-4 sm:px-8">
        <p
          key={indice}
          className="eyebrow animate-fade-in-up text-panel-foreground/75"
        >
          {anuncios[indice]}
        </p>
      </div>
    </div>
  );
}
