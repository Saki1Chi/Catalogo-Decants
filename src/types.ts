export type Categoria = "Hombre" | "Mujer" | "Unisex";

export type Familia =
  | "Amaderados"
  | "Florales"
  | "Frescos"
  | "Orientales"
  | "Frutales"
  | "Dulces";

// Qué tan confiable quedó la ficha al investigarla. `baja` significa que el
// nombre del inventario era ambiguo y la identificación es probable pero no
// confirmada — la web lo avisa en la ficha de detalle.
export type Completitud = "alta" | "media" | "baja";

export interface TamanoDisponible {
  ml: number;
  precio: number;
  // Opcional a propósito: el inventario todavía no trae existencias.
  stock?: number;
}

export interface Piramide {
  salida: string[];
  corazon: string[];
  fondo: string[];
}

export interface Perfume {
  id: string;
  // Fila del Excel de inventario. Es la clave para cruzar con los precios.
  filaExcel: number;
  marca: string;
  nombre: string;
  concentracion: string | null;
  categoria: Categoria;
  familia: Familia;
  familiaDetallada: string | null;
  anio: number | null;
  perfumista: string | null;
  descripcion: string;
  // Las 3 notas que se muestran como chips en la card.
  notas: string[];
  piramide: Piramide;
  imagen: string | null;
  // Foto de estudio con props, cuando la marca publica una. Se usa en la ficha
  // de detalle, donde tiene espacio para lucir.
  imagenAmbiente?: string;
  tamanos: TamanoDisponible[];
  completitud: Completitud;
  destacado?: boolean;
}
