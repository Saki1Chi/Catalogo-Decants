import { PerfumePanel } from "./merge";

// Fase 7: respaldo/exportación. Complementa (no reemplaza) la carga diaria
// por formulario — sirve como copia de seguridad fuera de Firebase y para
// compartir precios sin dar acceso al panel completo. 100% client-side: lee
// lo que ya está cargado en memoria (ver usePanel().perfumes), no hace una
// consulta nueva.

function descargar(contenido: string, nombreArchivo: string, tipoMime: string) {
  const blob = new Blob([contenido], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function fechaParaNombre(): string {
  return new Date().toISOString().slice(0, 10);
}

// Respaldo completo: todo lo que tiene cada perfume, incluidos los campos de
// gestión (visible, stock, etc.) — para tener una copia fuera de Firebase.
export function descargarRespaldoJSON(perfumes: PerfumePanel[]) {
  descargar(
    JSON.stringify(perfumes, null, 2),
    `respaldo-catalogo-${fechaParaNombre()}.json`,
    "application/json",
  );
}

// CSV liviano de precios — para mandarle a Alfredo una planilla sin abrir el
// panel, o como respaldo legible en Excel/Sheets.
export function descargarPreciosCSV(perfumes: PerfumePanel[]) {
  const filas = [["Marca", "Nombre", "ML", "Precio", "Stock", "Visible"]];
  for (const p of perfumes) {
    for (const t of p.tamanos) {
      filas.push([
        p.marca,
        p.nombre,
        String(t.ml),
        String(t.precio),
        t.stock !== undefined ? String(t.stock) : "sin registrar",
        p.visible ? "sí" : "no",
      ]);
    }
  }
  const csv = filas
    .map((fila) => fila.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  // BOM al inicio: Excel en Windows necesita esto para mostrar acentos bien.
  descargar("﻿" + csv, `precios-catalogo-${fechaParaNombre()}.csv`, "text/csv;charset=utf-8");
}
