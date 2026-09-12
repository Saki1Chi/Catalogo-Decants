"use client";

import { useMemo, useState } from "react";
import { Categoria, Familia, Perfume } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { SizeModal } from "@/components/SizeModal";
import { Reveal } from "@/components/Reveal";
import { precioDesde } from "@/lib/format";

const CATEGORIAS: Array<Categoria | "Todos"> = [
  "Todos",
  "Hombre",
  "Mujer",
  "Unisex",
];

type Orden = "destacados" | "precio-asc" | "precio-desc" | "nombre";

const ORDENES: Array<{ valor: Orden; etiqueta: string }> = [
  { valor: "destacados", etiqueta: "Destacados" },
  { valor: "precio-asc", etiqueta: "Precio: menor a mayor" },
  { valor: "precio-desc", etiqueta: "Precio: mayor a menor" },
  { valor: "nombre", etiqueta: "Nombre A–Z" },
];

// Con 132 perfumes no se pintan todos de una: se muestran de a tandas para que
// la primera carga sea liviana.
const POR_TANDA = 24;

export function CatalogClient({ perfumes }: { perfumes: Perfume[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<Categoria | "Todos">("Todos");
  const [familia, setFamilia] = useState<Familia | "Todas">("Todas");
  const [orden, setOrden] = useState<Orden>("destacados");
  const [visibles, setVisibles] = useState(POR_TANDA);
  const [elegido, setElegido] = useState<Perfume | null>(null);

  const familias = useMemo(() => {
    const unicas = new Set(perfumes.map((p) => p.familia));
    return ["Todas", ...Array.from(unicas).sort()] as Array<Familia | "Todas">;
  }, [perfumes]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    const lista = perfumes.filter((p) => {
      const coincideTexto =
        texto === "" ||
        p.nombre.toLowerCase().includes(texto) ||
        p.marca.toLowerCase().includes(texto) ||
        p.notas.some((n) => n.toLowerCase().includes(texto));
      const coincideCategoria =
        categoria === "Todos" || p.categoria === categoria;
      const coincideFamilia = familia === "Todas" || p.familia === familia;
      return coincideTexto && coincideCategoria && coincideFamilia;
    });

    return [...lista].sort((a, b) => {
      switch (orden) {
        case "precio-asc":
          return precioDesde(a.tamanos) - precioDesde(b.tamanos);
        case "precio-desc":
          return precioDesde(b.tamanos) - precioDesde(a.tamanos);
        case "nombre":
          return a.nombre.localeCompare(b.nombre, "es");
        default:
          return (
            Number(b.destacado ?? false) - Number(a.destacado ?? false) ||
            a.marca.localeCompare(b.marca, "es")
          );
      }
    });
  }, [perfumes, busqueda, categoria, familia, orden]);

  // Al cambiar cualquier filtro se vuelve a la primera tanda. Se ajusta durante
  // el render comparando contra la firma anterior, y no en un efecto: hacerlo
  // en un efecto provoca un render extra con la lista larga ya pintada.
  const firma = `${busqueda}|${categoria}|${familia}|${orden}`;
  const [firmaPrevia, setFirmaPrevia] = useState(firma);
  if (firma !== firmaPrevia) {
    setFirmaPrevia(firma);
    setVisibles(POR_TANDA);
  }

  const mostrados = filtrados.slice(0, visibles);
  const quedan = filtrados.length - mostrados.length;

  const limpiar = () => {
    setBusqueda("");
    setCategoria("Todos");
    setFamilia("Todas");
  };

  return (
    <div>
      {/* Fila 1: categorías + búsqueda visible (no escondida tras un ícono) */}
      <div className="flex flex-col gap-6 border-y border-border py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-7">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              className={`eyebrow border-b pb-1.5 transition-colors ${
                categoria === c
                  ? "border-ink text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar fragancia, marca o nota"
            className="w-full border border-border bg-surface px-4 py-3 text-[13px] text-ink placeholder:text-muted focus:border-ink focus:outline-none sm:w-72"
          />
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            aria-label="Ordenar catálogo"
            className="w-full border border-border bg-surface px-4 py-3 text-[13px] text-ink focus:border-ink focus:outline-none sm:w-auto"
          >
            {ORDENES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fila 2: familia olfativa — el eje por el que la gente realmente elige */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border py-5">
        <span className="eyebrow mr-3 text-muted">Familia</span>
        {familias.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFamilia(f)}
            className={`eyebrow border px-3.5 py-2 transition-colors ${
              familia === f
                ? "border-ink bg-ink text-background"
                : "border-border text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="eyebrow py-6 text-muted">
        {filtrados.length}{" "}
        {filtrados.length === 1 ? "fragancia" : "fragancias"}
        {quedan > 0 && ` · mostrando ${mostrados.length}`}
      </p>

      {filtrados.length === 0 ? (
        <div className="border border-border bg-surface px-6 py-20 text-center">
          <p className="font-serif text-2xl font-light text-ink">
            No encontramos esa fragancia
          </p>
          <p className="mt-3 text-[13px] text-muted">
            Probá con otra marca, nota o quitá algún filtro.
          </p>
          <button
            type="button"
            onClick={limpiar}
            className="eyebrow mt-7 border border-ink px-6 py-3 text-ink transition-colors hover:bg-ink hover:text-background"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-3 xl:grid-cols-4">
            {mostrados.map((p, i) => (
              <Reveal
                key={p.id}
                delay={Math.min(i % POR_TANDA, 7) * 60}
                className="h-full bg-surface"
              >
                <ProductCard perfume={p} onElegir={setElegido} prioridad={i < 4} />
              </Reveal>
            ))}
          </div>

          {quedan > 0 && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibles((v) => v + POR_TANDA)}
                className="eyebrow border border-ink px-10 py-4 text-ink transition-colors hover:bg-ink hover:text-background"
              >
                Ver {Math.min(quedan, POR_TANDA)} más
              </button>
            </div>
          )}
        </>
      )}

      <SizeModal perfume={elegido} onClose={() => setElegido(null)} />
    </div>
  );
}
