// Dorso de la card. Scent Perfumes usa como segunda imagen del crossfade una
// infografía de notas en vez de otra foto del frasco; acá se compone en HTML,
// así el dato sale del catálogo y no de un asset por producto.
export function NotesDisplay({
  notas,
  familia,
}: {
  notas: string[];
  familia: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-panel px-6 text-center">
      <p className="eyebrow text-accent">Pirámide olfativa</p>
      <ul className="mt-5 w-full max-w-[180px]">
        {notas.map((nota, i) => (
          <li
            key={nota}
            className={`py-2.5 font-serif text-[17px] leading-tight text-panel-foreground ${
              i > 0 ? "border-t border-panel-foreground/15" : ""
            }`}
          >
            {nota}
          </li>
        ))}
      </ul>
      <p className="eyebrow mt-5 text-panel-foreground/45">{familia}</p>
    </div>
  );
}
