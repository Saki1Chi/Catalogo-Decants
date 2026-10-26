"use client";

import { useRef, useState } from "react";
import { usePanel } from "@/panel/store";
import { TipoFoto } from "@/panel/colaFotos";

// Subida de fotos (Fase 4): sube el original a Storage; la Cloud Function
// `procesarFotoPerfume` genera la versión WebP optimizada y actualiza la
// ficha sola — acá no hay que esperar nada más que la confirmación de que
// quedó en la cola (ver src/panel/colaFotos.ts para el detalle offline).
export function SubirFoto({
  perfumeId,
  tipo,
  imagenActual,
  esPlaceholder,
}: {
  perfumeId: string;
  tipo: TipoFoto;
  imagenActual: string | null | undefined;
  esPlaceholder: boolean;
}) {
  const { subirFoto, online } = usePanel();
  const inputRef = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<"idle" | "subiendo" | "encolada">("idle");

  const elegirArchivo = () => inputRef.current?.click();

  const onArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo después
    if (!archivo) return;
    setEstado("subiendo");
    await subirFoto(perfumeId, archivo, tipo);
    setEstado(online ? "subiendo" : "encolada");
    // La foto procesada llega sola por el listener de `perfumes` (onSnapshot)
    // cuando la Cloud Function termina — no hay nada que "completar" acá.
    window.setTimeout(() => setEstado("idle"), 2500);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-16 flex-none overflow-hidden border border-border bg-surface-alt">
        {imagenActual ? (
          // Fotos ya son propias de Firebase Storage (path relativo) o de
          // public/perfumes/ (migración inicial) — ambas sirven como <img> normal.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagenActual} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">Sin foto</div>
        )}
        {esPlaceholder && imagenActual && (
          <span className="absolute inset-x-0 bottom-0 bg-accent px-1 py-0.5 text-center text-[9px] font-medium uppercase tracking-wide text-accent-foreground">
            Temporal
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={elegirArchivo}
          disabled={estado === "subiendo"}
          className="eyebrow border border-ink px-3 py-2 text-ink transition-colors hover:bg-ink hover:text-background disabled:opacity-50"
        >
          {estado === "subiendo" ? "Subiendo…" : `Cambiar foto ${tipo === "ambiente" ? "ambiente" : "principal"}`}
        </button>
        {estado === "encolada" && (
          <p className="mt-1.5 text-[11px] text-muted">Sin conexión — se sube sola al volver.</p>
        )}
        {esPlaceholder && tipo === "principal" && (
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
            La foto actual es de la marca (sin derechos para publicar) — subí una propia para sacar
            el aviso.
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onArchivo}
      />
    </div>
  );
}
