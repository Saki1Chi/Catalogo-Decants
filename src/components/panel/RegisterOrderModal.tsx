"use client";

import { useMemo, useState } from "react";
import { usePanel } from "@/panel/store";
import { formatearPrecio } from "@/lib/format";
import { ItemPedido } from "@/panel/types";
import { Modal } from "./Modal";

export function RegisterOrderModal({ onClose }: { onClose: () => void }) {
  const { perfumes, registrarPedido } = usePanel();
  const [cliente, setCliente] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nota, setNota] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [items, setItems] = useState<ItemPedido[]>([]);
  const [busquedaPerfume, setBusquedaPerfume] = useState("");
  const [error, setError] = useState<string | null>(null);

  const coincidencias = useMemo(() => {
    const texto = busquedaPerfume.trim().toLowerCase();
    if (texto.length < 2) return [];
    return perfumes
      .filter((p) => p.nombre.toLowerCase().includes(texto) || p.marca.toLowerCase().includes(texto))
      .slice(0, 5);
  }, [perfumes, busquedaPerfume]);

  const total =
    items.reduce((acc, it) => acc + it.precioUnitario * it.cantidad, 0) - descuento;

  const agregarItem = (perfumeId: string, ml: number, precio: number) => {
    setItems((prev) => {
      const existe = prev.find((it) => it.perfumeId === perfumeId && it.ml === ml);
      if (existe) {
        return prev.map((it) =>
          it.perfumeId === perfumeId && it.ml === ml ? { ...it, cantidad: it.cantidad + 1 } : it,
        );
      }
      return [...prev, { perfumeId, ml, cantidad: 1, precioUnitario: precio }];
    });
    setBusquedaPerfume("");
  };

  const quitarItem = (perfumeId: string, ml: number) => {
    setItems((prev) => prev.filter((it) => !(it.perfumeId === perfumeId && it.ml === ml)));
  };

  const nombrePerfume = (id: string) => {
    const p = perfumes.find((pp) => pp.id === id);
    return p ? `${p.marca} ${p.nombre}` : id;
  };

  const guardar = () => {
    if (!cliente.trim()) {
      setError("Escribe el nombre del cliente.");
      return;
    }
    if (items.length === 0) {
      setError("Agrega al menos un perfume.");
      return;
    }
    registrarPedido({
      cliente: cliente.trim(),
      whatsapp: whatsapp.trim() || undefined,
      items,
      descuento,
      nota: nota.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal titulo="Registrar pedido" onClose={onClose} ancho="max-w-lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-muted">Cliente</span>
            <input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full border border-border bg-background px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
              placeholder="Nombre completo"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-muted">WhatsApp (opcional)</span>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border border-border bg-background px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
              placeholder="55 0000 0000"
            />
          </label>
        </div>

        <div className="relative">
          <span className="mb-1.5 block text-[12px] text-muted">Agregar perfume</span>
          <input
            value={busquedaPerfume}
            onChange={(e) => setBusquedaPerfume(e.target.value)}
            placeholder="Buscar por nombre o marca"
            className="w-full border border-border bg-background px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          />
          {coincidencias.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full border border-line-strong bg-surface">
              {coincidencias.map((p) => (
                <li key={p.id} className="border-b border-border last:border-b-0">
                  <p className="px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted">
                    {p.marca} — {p.nombre}
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                    {p.tamanos.map((t) => (
                      <button
                        key={t.ml}
                        type="button"
                        onClick={() => agregarItem(p.id, t.ml, t.precio)}
                        className="border border-border px-2 py-1 text-[12px] text-ink transition-colors hover:border-ink"
                      >
                        {t.ml} ml · {formatearPrecio(t.precio)}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <ul className="divide-y divide-border border-y border-border">
            {items.map((it) => (
              <li key={`${it.perfumeId}-${it.ml}`} className="flex items-center gap-3 py-2.5 text-[13px]">
                <span className="min-w-0 flex-1 truncate text-ink">
                  {nombrePerfume(it.perfumeId)} · {it.ml} ml
                </span>
                <span className="tabular-nums text-muted">×{it.cantidad}</span>
                <span className="tabular-nums text-ink">{formatearPrecio(it.precioUnitario * it.cantidad)}</span>
                <button
                  type="button"
                  onClick={() => quitarItem(it.perfumeId, it.ml)}
                  className="text-muted transition-colors hover:text-danger"
                  aria-label="Quitar"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-muted">Descuento (MXN)</span>
            <input
              type="number"
              min={0}
              value={descuento}
              onChange={(e) => setDescuento(Number(e.target.value) || 0)}
              className="w-full border border-border bg-background px-3 py-2.5 text-[13px] tabular-nums text-ink focus:border-ink focus:outline-none"
            />
          </label>
          <div className="flex flex-col items-end justify-end">
            <span className="text-[12px] text-muted">Total</span>
            <span className="font-serif text-2xl text-ink">{formatearPrecio(Math.max(0, total))}</span>
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[12px] text-muted">Nota (opcional)</span>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={2}
            className="w-full border border-border bg-background px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          />
        </label>

        {error && (
          <p className="text-[13px] text-danger">{error}</p>
        )}

        <button
          type="button"
          onClick={guardar}
          className="eyebrow w-full border border-ink bg-ink px-4 py-3.5 text-background transition-colors hover:bg-transparent hover:text-ink"
        >
          Registrar pedido
        </button>
      </div>
    </Modal>
  );
}
