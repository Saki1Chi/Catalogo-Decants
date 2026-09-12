import { siteConfig } from "@/data/site-config";
import { TamanoDisponible } from "@/types";

export function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: siteConfig.moneda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

export function precioDesde(tamanos: TamanoDisponible[]): number {
  return Math.min(...tamanos.map((t) => t.precio));
}

// Devuelve null cuando ningún tamaño trae existencias cargadas, que es el caso
// hoy: el inventario de Alfredo solo tiene precios. La interfaz usa ese null
// para no mostrar disponibilidad inventada.
export function stockTotal(tamanos: TamanoDisponible[]): number | null {
  const conDato = tamanos.filter((t) => typeof t.stock === "number");
  if (conDato.length === 0) return null;
  return conDato.reduce((acc, t) => acc + (t.stock ?? 0), 0);
}

export type EstadoStock = "disponible" | "pocas" | "agotado";

export function estadoStock(stock: number): EstadoStock {
  if (stock <= 0) return "agotado";
  if (stock <= 3) return "pocas";
  return "disponible";
}

export const etiquetaStock: Record<EstadoStock, string> = {
  disponible: "Disponible",
  pocas: "Últimas unidades",
  agotado: "Agotado",
};

export function etiquetaTamanos(tamanos: TamanoDisponible[]): string {
  return tamanos.map((t) => `${t.ml} ml`).join(" · ");
}
