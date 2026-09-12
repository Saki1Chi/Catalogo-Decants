import { Perfume } from "@/types";
import { BottleDisplay } from "@/components/BottleDisplay";

// Las fotos vienen de los sitios oficiales de cada marca y llegan en formatos
// mezclados: recortes PNG transparentes, packshots sobre blanco y alguna sobre
// gris. Todas se aplanaron contra el mismo plano claro al convertirlas a WebP,
// y acá se muestran sobre ese mismo plano en los dos temas. Es la regla de
// consistencia que hace que un grid de catálogo se lea como boutique.
export function PerfumeFoto({
  perfume,
  prioridad = false,
  className = "",
}: {
  perfume: Perfume;
  prioridad?: boolean;
  className?: string;
}) {
  if (!perfume.imagen) {
    return (
      <div className={`h-full w-full ${className}`}>
        <BottleDisplay />
      </div>
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-[#f7f5f2] ${className}`}
    >
      {/* Se usa <img> a propósito y no next/image: las fotos ya se convierten
          a WebP y se redimensionan al integrarlas desde el inventario, y el
          sitio es un export estático, donde el optimizador de Next no corre. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={perfume.imagen}
        alt={`${perfume.nombre} de ${perfume.marca}`}
        loading={prioridad ? "eager" : "lazy"}
        decoding="async"
        // Margen mínimo: varias marcas entregan la foto con su propio fondo
        // claro, y con mucho padding se ve un recuadro dentro de otro.
        className="h-full w-full object-contain p-[3%]"
      />
    </div>
  );
}
