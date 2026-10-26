import { Perfume } from "@/types";

// Modelo de datos del panel de gestión. Hasta la fase 2 esto vivía entero en
// localStorage (ver el historial de git de este archivo); ahora cada tipo
// acá corresponde 1:1 a una colección/subcolección de Firestore — ver
// src/panel/store.tsx y firestore.rules en la raíz del repo.

export type Rol = "dueño" | "empleado";

export interface Sesion {
  uid: string;
  nombre: string;
  email: string;
  rol: Rol;
}

// Perfume tal como vive en Firestore (`perfumes/{id}`): la ficha completa
// más los campos de gestión que antes eran un "override" separado — ya no
// hace falta esa capa porque Firestore es la fuente mutable real (perfumes.ts
// en el repo del sitio queda solo como el snapshot con el que se hizo el
// export estático la última vez, no se vuelve a leer en el panel).
export interface PerfumeFirestore extends Perfume {
  visible: boolean;
  fichaPorConfirmar: boolean;
  eliminado: boolean;
  // Fotos actuales = de la marca (ver inventario/README.md), sin derechos
  // para producción. Se limpia solo al subir una foto propia (Fase 4).
  imagenEsPlaceholder: boolean;
  origen: "inventario-inicial" | "creado-en-panel";
  version: number;
  modificadoEn: string; // ISO, seteado por serverTimestamp() al leer
  modificadoPor: string; // nombre de usuario o "migracion-inicial"
}

export interface MovimientoStock {
  id: string;
  perfumeId: string;
  ml: number;
  delta: number; // +2 entrada, -1 salida
  motivo: string;
  autor: string;
  autorUid: string;
  fecha: string; // ISO
}

export type EstadoPedido = "consulta" | "confirmado" | "entregado" | "cancelado";
export type EstadoPago = "pendiente" | "pagado";

export interface ItemPedido {
  perfumeId: string;
  ml: number;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  id: string;
  cliente: string;
  whatsapp?: string;
  items: ItemPedido[];
  descuento: number;
  nota?: string;
  estado: EstadoPedido;
  pago: EstadoPago;
  autor: string;
  fecha: string; // ISO
}

export interface Usuario {
  id: string; // = uid de Firebase Auth una vez que acepta la invitación
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  invitadoEn: string;
  // true hasta que la persona invitada hace el primer login por su link de
  // email — la fila en Usuarios lo muestra como "Invitación enviada".
  pendienteDePrimerLogin: boolean;
}

export type TipoHistorial = "precio" | "stock" | "perfume" | "negocio" | "pedido";

// Descriptor serializable de cómo revertir una acción — se guarda junto a la
// entrada de historial (Firestore, no una función) y el store lo interpreta
// en deshacerEntry().
export type AccionInversa =
  | { tipo: "tamano"; perfumeId: string; ml: number; precio: number; stock: number | undefined }
  | {
      tipo: "flag";
      perfumeId: string;
      campo: "visible" | "destacado" | "fichaPorConfirmar" | "eliminado";
      valor: boolean;
    }
  | { tipo: "pedidoEstado"; pedidoId: string; estado: EstadoPedido; pago: EstadoPago }
  | { tipo: "movimiento"; movimientoId: string };

export interface HistorialEntry {
  id: string;
  tipo: TipoHistorial;
  descripcion: string;
  autor: string;
  autorUid: string;
  fecha: string;
  deshecho?: boolean;
  inverso?: AccionInversa;
}

export interface NegocioOverride {
  nombreNegocio?: string;
  eslogan?: string;
  titularAcento?: string;
  titularResto?: string;
  introHero?: string;
  anuncios?: string[];
  contacto?: {
    telefono?: string;
    whatsapp?: string;
    email?: string;
    direccion?: string;
    horario?: string;
  };
  redes?: { instagram?: string; facebook?: string };
}

// Vista combinada que expone el contexto del panel — mismo shape que antes
// tenía PanelState, menos `overrides`/`perfumesNuevos` (ya no existen como
// concepto separado: cada perfume es un documento completo).
export interface EstadoPanel {
  sesion: Sesion | null;
  pedidos: Pedido[];
  movimientos: MovimientoStock[];
  usuarios: Usuario[];
  historial: HistorialEntry[];
  negocio: NegocioOverride;
  catalogoActualizadoEn: string;
  pendientes: number;
}

// Conflicto de sync: dos ediciones offline sobre el mismo campo. Ver
// firestore.rules (perfumes/{id}/conflictos) y store.tsx.
export interface ConflictoEdicion {
  id: string;
  perfumeId: string;
  campo: string;
  valorA: unknown;
  autorA: string;
  fechaA: string;
  valorB: unknown;
  autorB: string;
  fechaB: string;
  resuelto: boolean;
}
