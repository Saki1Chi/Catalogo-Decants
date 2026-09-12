import { estadoStock, etiquetaStock } from "@/lib/format";

// Punto de color + versalita en vez de pill relleno: el pill de color saturado
// era lo que más "abarataba" la card.
const colores = {
  disponible: "bg-success",
  pocas: "bg-accent",
  agotado: "bg-danger",
};

export function StockBadge({ stock }: { stock: number }) {
  const estado = estadoStock(stock);

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${colores[estado]}`} />
      <span className="eyebrow text-muted">{etiquetaStock[estado]}</span>
    </span>
  );
}
