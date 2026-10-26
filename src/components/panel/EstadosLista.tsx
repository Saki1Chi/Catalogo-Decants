// Estados obligatorios reutilizables para listas del panel (brief §10):
// cargando (esqueleto, no spinner), vacío y sin resultados.

export function EsqueletoFilas({ filas = 6 }: { filas?: number }) {
  return (
    <div>
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 border-b border-border px-5 py-3 last:border-b-0">
          <div className="h-10 w-10 flex-none animate-pulse bg-border" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-24 animate-pulse bg-border" />
            <div className="h-3 w-48 animate-pulse bg-border" />
          </div>
          <div className="h-3 w-16 animate-pulse bg-border" />
        </div>
      ))}
    </div>
  );
}

export function SinResultados({ onLimpiar }: { onLimpiar: () => void }) {
  return (
    <div className="border border-border bg-surface px-6 py-16 text-center">
      <p className="font-serif text-xl font-light text-ink">Sin resultados</p>
      <p className="mt-2 text-[13px] text-muted">Probá con otra palabra o quitá algún filtro.</p>
      <button
        type="button"
        onClick={onLimpiar}
        className="eyebrow mt-6 border border-ink px-6 py-3 text-ink transition-colors hover:bg-ink hover:text-background"
      >
        Limpiar filtros
      </button>
    </div>
  );
}

export function ListaVacia({
  titulo,
  texto,
  accion,
}: {
  titulo: string;
  texto: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="border border-border bg-surface px-6 py-16 text-center">
      <p className="font-serif text-xl font-light text-ink">{titulo}</p>
      <p className="mt-2 text-[13px] text-muted">{texto}</p>
      {accion && <div className="mt-6 flex justify-center">{accion}</div>}
    </div>
  );
}
