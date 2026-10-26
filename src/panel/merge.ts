import { PerfumeFirestore } from "./types";

// Antes este archivo combinaba perfumes.ts (solo lectura) + overrides de
// localStorage + perfumes nuevos en un único objeto. Con Firestore como
// fuente real, cada documento de `perfumes/{id}` YA es la ficha completa —
// no hay nada que combinar. `PerfumePanel` se mantiene como alias (en vez de
// cambiar el tipo en cada componente que lo importa) porque toda la UI del
// panel ya está escrita contra este nombre.
export type PerfumePanel = PerfumeFirestore;

// Lo que ve el catálogo público: solo lo visible, sin los campos de gestión
// (visible, fichaPorConfirmar, version, modificadoPor...).
export function paraCatalogoPublico(perfumes: PerfumePanel[]): PerfumePanel[] {
  return perfumes.filter((p) => p.visible && !p.eliminado);
}
