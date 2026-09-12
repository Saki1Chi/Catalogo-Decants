// Aviso interno para la revisión del cliente. TODO: borrar este componente (y
// su uso en page.tsx) cuando estén los datos de contacto reales y las fotos
// propias del stock.
export function PlaceholderNotice() {
  return (
    <div className="border-b border-accent/25 bg-accent/[0.06]">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-8">
        <p className="text-[12px] leading-relaxed text-ink/70">
          <span className="eyebrow mr-2 text-accent">Vista previa</span>
          El catálogo y los precios son los reales. Faltan los datos de contacto
          del negocio y las fotos propias de producto — las actuales son de las
          marcas y se usan solo para maquetar.
        </p>
      </div>
    </div>
  );
}
