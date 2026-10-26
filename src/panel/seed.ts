import { Perfume } from "@/types";
import { HistorialEntry, MovimientoStock, Pedido, Usuario } from "./types";

// Ya no lo usa src/panel/store.tsx (que ahora lee Firestore real) — queda
// como referencia si alguna vez hace falta poblar el emulador de Firebase
// con datos de muestra para desarrollar sin pegarle al proyecto real.

// Hash chico y determinístico — el mismo id siempre da el mismo "azar", así el
// stock de muestra no cambia en cada build ni difiere entre servidor/cliente.
function hash(texto: string): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) {
    h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return h;
}

function stockDeMuestra(perfumeId: string, ml: number): number {
  const n = hash(`${perfumeId}:${ml}`);
  // ~12% agotado, ~18% últimas unidades, resto disponible — a propósito
  // parecido a los números que el brief pide mostrar en Inicio (7 agotados,
  // 14 en últimas unidades sobre 132 × ~2.7 presentaciones).
  const balde = n % 100;
  if (balde < 10) return 0;
  if (balde < 26) return 1 + (n % 3); // 1-3
  return 4 + (n % 13); // 4-16
}

// Genera el stock inicial de todas las presentaciones de todos los perfumes.
// No se escribe en perfumes.ts (es generado, no se edita a mano): esto vive
// como overrides en el store del panel.
export function sembrarStockInicial(perfumes: Perfume[]) {
  const overrides: Record<string, { tamanos: { ml: number; precio: number; stock: number }[] }> = {};
  perfumes.forEach((p) => {
    overrides[p.id] = {
      tamanos: p.tamanos.map((t) => ({
        ml: t.ml,
        precio: t.precio,
        stock: stockDeMuestra(p.id, t.ml),
      })),
    };
  });
  return overrides;
}

const NOMBRES_MUESTRA = [
  "María Fernanda Rojas",
  "José Luis Bautista",
  "Karla Méndez Ortiz",
  "Diego Hernández Cruz",
  "Ana Paula Gómez",
  "Ricardo Salazar Núñez",
  "Fernanda Torres Vidal",
];

export function sembrarPedidos(perfumes: Perfume[]): Pedido[] {
  const estados: Pedido["estado"][] = [
    "consulta",
    "confirmado",
    "confirmado",
    "consulta",
    "entregado",
    "cancelado",
  ];
  const ahora = Date.now();

  return NOMBRES_MUESTRA.slice(0, 6).map((cliente, i) => {
    const perfume = perfumes[(hash(cliente) + i) % perfumes.length];
    const talla = perfume.tamanos[i % perfume.tamanos.length];
    const cantidad = 1 + (hash(cliente) % 2);
    const estado = estados[i];

    return {
      id: `pedido-muestra-${i}`,
      cliente,
      whatsapp: i % 2 === 0 ? "5215500000" + (10 + i) : undefined,
      items: [
        {
          perfumeId: perfume.id,
          ml: talla.ml,
          cantidad,
          precioUnitario: talla.precio,
        },
      ],
      descuento: 0,
      estado,
      pago: estado === "entregado" ? "pagado" : "pendiente",
      autor: "Alfredo Márquez",
      fecha: new Date(ahora - i * 1000 * 60 * 60 * (6 + i)).toISOString(),
    } satisfies Pedido;
  });
}

export function sembrarUsuarios(): Usuario[] {
  return [
    {
      id: "usuario-alfredo",
      nombre: "Alfredo Márquez",
      email: "alfredo@ejemplo.com",
      rol: "dueño",
      activo: true,
      invitadoEn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
      pendienteDePrimerLogin: false,
    },
    {
      id: "usuario-empleado-1",
      nombre: "Empleado de mostrador",
      email: "empleado@ejemplo.com",
      rol: "empleado",
      activo: true,
      invitadoEn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      pendienteDePrimerLogin: false,
    },
  ];
}

export function sembrarMovimientos(): MovimientoStock[] {
  return [];
}

export function sembrarHistorial(): HistorialEntry[] {
  return [];
}
