"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePanel } from "@/panel/store";
import { PerfumeForm } from "@/components/panel/PerfumeForm";
import { EsqueletoFilas } from "@/components/panel/EstadosLista";

// El id se resuelve por query string (no por segmento dinámico de ruta): así
// funciona tanto para los 132 perfumes reales como para uno creado recién en
// el navegador, que no existe en el build estático.
function Contenido() {
  const params = useSearchParams();
  const id = params.get("id");
  const { perfumes, listo } = usePanel();

  if (!listo) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-7 lg:px-8">
        <EsqueletoFilas filas={4} />
      </div>
    );
  }

  const perfume = id ? perfumes.find((p) => p.id === id) ?? null : null;
  return <PerfumeForm perfumeExistente={perfume} />;
}

export default function PanelFichaPerfumePage() {
  return (
    <Suspense fallback={null}>
      <Contenido />
    </Suspense>
  );
}
