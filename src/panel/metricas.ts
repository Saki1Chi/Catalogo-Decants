import { PerfumePanel } from "./merge";
import { Pedido } from "./types";

export interface Metricas {
  agotados: number;
  ultimasUnidades: number;
  consultas: number;
  confirmadosSinEntregar: number;
  pedidosPendientes: number;
}

// Mismas reglas que la web pública (ver lib/format.ts estadoStock): 0 →
// Agotado, 1-3 → Últimas unidades, 4+ → Disponible. Se cuenta por
// presentación (3/5/10 ml), no por perfume — así coincide con las cifras del
// mockup ("7 agotados" son 7 presentaciones, no 7 perfumes distintos).
export function calcularMetricas(perfumes: PerfumePanel[], pedidos: Pedido[]): Metricas {
  let agotados = 0;
  let ultimasUnidades = 0;

  perfumes.forEach((p) => {
    p.tamanos.forEach((t) => {
      if (typeof t.stock !== "number") return;
      if (t.stock <= 0) agotados++;
      else if (t.stock <= 3) ultimasUnidades++;
    });
  });

  const consultas = pedidos.filter((p) => p.estado === "consulta").length;
  const confirmadosSinEntregar = pedidos.filter((p) => p.estado === "confirmado").length;

  return {
    agotados,
    ultimasUnidades,
    consultas,
    confirmadosSinEntregar,
    pedidosPendientes: consultas + confirmadosSinEntregar,
  };
}

export interface FilaAtencion {
  perfumeId: string;
  marca: string;
  nombre: string;
  imagen: string | null;
  ml: number;
  stock: number;
}

// "Atención inmediata" del Inicio: las presentaciones más urgentes (agotadas
// primero, después últimas unidades), sin repetir perfume más de una vez para
// que la lista no quede monopolizada por un solo perfume con 3 tallas cortas.
export function filasAtencion(perfumes: PerfumePanel[], limite = 4): FilaAtencion[] {
  const filas: FilaAtencion[] = [];
  const yaIncluidos = new Set<string>();

  const ordenPrioridad = (stock: number) => (stock <= 0 ? 0 : 1);

  const candidatas = perfumes
    .flatMap((p) =>
      p.tamanos
        .filter((t) => typeof t.stock === "number" && t.stock <= 3)
        .map((t) => ({
          perfumeId: p.id,
          marca: p.marca,
          nombre: p.nombre,
          imagen: p.imagen,
          ml: t.ml,
          stock: t.stock as number,
        })),
    )
    .sort((a, b) => ordenPrioridad(a.stock) - ordenPrioridad(b.stock) || a.stock - b.stock);

  for (const c of candidatas) {
    if (yaIncluidos.has(c.perfumeId)) continue;
    filas.push(c);
    yaIncluidos.add(c.perfumeId);
    if (filas.length >= limite) break;
  }

  return filas;
}
