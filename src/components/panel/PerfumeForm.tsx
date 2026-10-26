"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePanel } from "@/panel/store";
import { PerfumePanel } from "@/panel/merge";
import { Categoria, Familia, Perfume, TamanoDisponible } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { IconoAlerta } from "./iconos";
import { SubirFoto } from "./SubirFoto";

const CATEGORIAS: Categoria[] = ["Hombre", "Mujer", "Unisex"];
const FAMILIAS: Familia[] = ["Amaderados", "Florales", "Frescos", "Orientales", "Frutales", "Dulces"];
const CONCENTRACIONES = [
  "Eau de Toilette",
  "Eau de Parfum",
  "Eau de Parfum Intense",
  "Parfum",
  "Extrait de Parfum",
  "Elixir",
];

function vacio(): Omit<Perfume, "id" | "filaExcel"> {
  return {
    marca: "",
    nombre: "",
    concentracion: "Eau de Parfum",
    categoria: "Hombre",
    familia: "Amaderados",
    familiaDetallada: null,
    anio: null,
    perfumista: null,
    descripcion: "",
    notas: ["", "", ""],
    piramide: { salida: [], corazon: [], fondo: [] },
    imagen: null,
    tamanos: [
      { ml: 3, precio: 0 },
      { ml: 5, precio: 0 },
      { ml: 10, precio: 0 },
    ],
    completitud: "alta",
    destacado: false,
  };
}

export function PerfumeForm({ perfumeExistente }: { perfumeExistente: PerfumePanel | null }) {
  const router = useRouter();
  const { perfumes, sesion, crearPerfume, editarPerfume, eliminarPerfume } = usePanel();
  const esDueno = sesion?.rol === "dueño";

  const [datos, setDatos] = useState(() =>
    perfumeExistente
      ? {
          marca: perfumeExistente.marca,
          nombre: perfumeExistente.nombre,
          concentracion: perfumeExistente.concentracion,
          categoria: perfumeExistente.categoria,
          familia: perfumeExistente.familia,
          familiaDetallada: perfumeExistente.familiaDetallada,
          anio: perfumeExistente.anio,
          perfumista: perfumeExistente.perfumista,
          descripcion: perfumeExistente.descripcion,
          notas: [...perfumeExistente.notas, "", "", ""].slice(0, 3),
          piramide: perfumeExistente.piramide,
          imagen: perfumeExistente.imagen,
          tamanos: perfumeExistente.tamanos,
          completitud: perfumeExistente.completitud,
          destacado: perfumeExistente.destacado ?? false,
        }
      : vacio(),
  );
  const [pSalida, setPSalida] = useState(perfumeExistente?.piramide.salida.join(", ") ?? "");
  const [pCorazon, setPCorazon] = useState(perfumeExistente?.piramide.corazon.join(", ") ?? "");
  const [pFondo, setPFondo] = useState(perfumeExistente?.piramide.fondo.join(", ") ?? "");
  const [visible, setVisible] = useState(perfumeExistente?.visible ?? true);
  const [porConfirmar, setPorConfirmar] = useState(perfumeExistente?.fichaPorConfirmar ?? false);
  const [error, setError] = useState<string | null>(null);
  const [avisoEliminar, setAvisoEliminar] = useState<string | null>(null);

  const marcas = useMemo(() => Array.from(new Set(perfumes.map((p) => p.marca))).sort(), [perfumes]);

  const previa: Perfume = {
    id: perfumeExistente?.id ?? "vista-previa",
    filaExcel: 0,
    ...datos,
    notas: datos.notas.filter(Boolean),
    piramide: {
      salida: pSalida.split(",").map((s) => s.trim()).filter(Boolean),
      corazon: pCorazon.split(",").map((s) => s.trim()).filter(Boolean),
      fondo: pFondo.split(",").map((s) => s.trim()).filter(Boolean),
    },
  };

  const actualizarTalla = (i: number, patch: Partial<TamanoDisponible>) => {
    setDatos((prev) => ({
      ...prev,
      tamanos: prev.tamanos.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    }));
  };

  const agregarTalla = () => {
    setDatos((prev) => {
      const usados = new Set(prev.tamanos.map((t) => t.ml));
      const siguiente = [3, 5, 10, 15, 30].find((ml) => !usados.has(ml)) ?? 50;
      return { ...prev, tamanos: [...prev.tamanos, { ml: siguiente, precio: 0 }] };
    });
  };

  const quitarTalla = (i: number) => {
    setDatos((prev) => ({ ...prev, tamanos: prev.tamanos.filter((_, idx) => idx !== i) }));
  };

  const guardar = async () => {
    const notasLimpias = datos.notas.map((n) => n.trim()).filter(Boolean);
    if (!datos.marca.trim() || !datos.nombre.trim()) {
      setError("La marca y el nombre son obligatorios.");
      return;
    }
    if (notasLimpias.length !== 3) {
      setError("Las notas destacadas tienen que ser exactamente 3.");
      return;
    }
    if (datos.tamanos.length === 0 || datos.tamanos.every((t) => !(t.precio > 0))) {
      setError("Agrega al menos una presentación con precio mayor a 0.");
      return;
    }

    const patch = {
      ...datos,
      notas: notasLimpias,
      piramide: previa.piramide,
      completitud: porConfirmar ? ("baja" as const) : datos.completitud,
      fichaPorConfirmar: porConfirmar,
      visible,
    };

    if (perfumeExistente) {
      await editarPerfume(perfumeExistente.id, patch);
    } else {
      const id = await crearPerfume(patch);
      router.replace(`/panel/catalogo/ficha?id=${id}`);
      return;
    }
    router.push("/panel/catalogo");
  };

  const eliminar = async () => {
    if (!perfumeExistente) return;
    const r = await eliminarPerfume(perfumeExistente.id);
    if (!r.ok) {
      setAvisoEliminar(r.motivo ?? "No se pudo eliminar.");
      return;
    }
    router.push("/panel/catalogo");
  };

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-16 pt-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">{perfumeExistente ? "Editar" : "Nuevo"}</p>
          <h1 className="mt-2.5 font-serif text-[34px] font-light leading-none text-ink">
            {perfumeExistente ? `${perfumeExistente.marca} ${perfumeExistente.nombre}` : "Nuevo perfume"}
          </h1>
        </div>
        {perfumeExistente && esDueno && (
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="eyebrow border border-ink px-4 py-2.5 text-ink transition-colors hover:bg-ink hover:text-background"
            >
              {visible ? "Ocultar del catálogo" : "Mostrar en el catálogo"}
            </button>
            <button
              type="button"
              onClick={eliminar}
              className="eyebrow border border-danger px-4 py-2.5 text-[#8f3b2f] transition-colors hover:bg-danger hover:text-background"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      {avisoEliminar && (
        <div className="mt-4 flex items-center gap-3 border border-accent/30 bg-accent/[0.06] px-4 py-3">
          <IconoAlerta className="h-3.5 w-3.5 flex-none text-accent" />
          <p className="text-[13px] text-ink">{avisoEliminar}</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <Seccion titulo="Identidad">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Campo etiqueta="Marca">
                <input
                  list="marcas-existentes"
                  value={datos.marca}
                  onChange={(e) => setDatos((p) => ({ ...p, marca: e.target.value }))}
                  className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
                />
                <datalist id="marcas-existentes">
                  {marcas.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </Campo>
              <Campo etiqueta="Nombre">
                <input
                  value={datos.nombre}
                  onChange={(e) => setDatos((p) => ({ ...p, nombre: e.target.value }))}
                  className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
                />
              </Campo>
              <Campo etiqueta="Concentración">
                <input
                  list="concentraciones"
                  value={datos.concentracion ?? ""}
                  onChange={(e) => setDatos((p) => ({ ...p, concentracion: e.target.value }))}
                  className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
                />
                <datalist id="concentraciones">
                  {CONCENTRACIONES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Campo>
              <Campo etiqueta="Género">
                <select
                  value={datos.categoria}
                  onChange={(e) => setDatos((p) => ({ ...p, categoria: e.target.value as Categoria }))}
                  className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo etiqueta="Familia">
                <select
                  value={datos.familia}
                  onChange={(e) => setDatos((p) => ({ ...p, familia: e.target.value as Familia }))}
                  className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
                >
                  {FAMILIAS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo etiqueta="Año (opcional)">
                <input
                  type="number"
                  value={datos.anio ?? ""}
                  onChange={(e) => setDatos((p) => ({ ...p, anio: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] tabular-nums text-ink focus:border-ink focus:outline-none"
                />
              </Campo>
            </div>
          </Seccion>

          <Seccion titulo="Descripción y notas">
            <Campo etiqueta={`Descripción (${datos.descripcion.length}/230)`}>
              <textarea
                value={datos.descripcion}
                onChange={(e) => setDatos((p) => ({ ...p, descripcion: e.target.value.slice(0, 230) }))}
                rows={3}
                className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
              />
            </Campo>
            <div className="mt-3.5 grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <Campo key={i} etiqueta={`Nota destacada ${i + 1}`}>
                  <input
                    value={datos.notas[i] ?? ""}
                    onChange={(e) =>
                      setDatos((p) => {
                        const notas = [...p.notas];
                        notas[i] = e.target.value;
                        return { ...p, notas };
                      })
                    }
                    className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
                  />
                </Campo>
              ))}
            </div>
          </Seccion>

          <Seccion titulo="Pirámide olfativa">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <Campo etiqueta="Salida (separadas por coma)">
                <input
                  value={pSalida}
                  onChange={(e) => setPSalida(e.target.value)}
                  className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
                />
              </Campo>
              <Campo etiqueta="Corazón">
                <input
                  value={pCorazon}
                  onChange={(e) => setPCorazon(e.target.value)}
                  className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
                />
              </Campo>
              <Campo etiqueta="Fondo">
                <input
                  value={pFondo}
                  onChange={(e) => setPFondo(e.target.value)}
                  className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
                />
              </Campo>
            </div>
          </Seccion>

          <Seccion titulo="Presentaciones y precios">
            <div className="space-y-2.5">
              {datos.tamanos.map((t, i) => (
                <div key={i} className="flex items-end gap-3">
                  <Campo etiqueta="ml">
                    <input
                      type="number"
                      value={t.ml}
                      onChange={(e) => actualizarTalla(i, { ml: Number(e.target.value) || 0 })}
                      className="w-20 border border-border bg-surface px-3 py-2.5 text-[13px] tabular-nums text-ink focus:border-ink focus:outline-none"
                    />
                  </Campo>
                  <Campo etiqueta="Precio MXN">
                    <input
                      type="number"
                      value={t.precio}
                      onChange={(e) => actualizarTalla(i, { precio: Number(e.target.value) || 0 })}
                      className="w-28 border border-border bg-surface px-3 py-2.5 text-[13px] tabular-nums text-ink focus:border-ink focus:outline-none"
                    />
                  </Campo>
                  <Campo etiqueta="Stock">
                    <input
                      type="number"
                      value={t.stock ?? ""}
                      onChange={(e) =>
                        actualizarTalla(i, { stock: e.target.value ? Number(e.target.value) : undefined })
                      }
                      className="w-24 border border-border bg-surface px-3 py-2.5 text-[13px] tabular-nums text-ink focus:border-ink focus:outline-none"
                    />
                  </Campo>
                  <button
                    type="button"
                    onClick={() => quitarTalla(i)}
                    className="mb-0.5 border border-border px-3 py-2.5 text-[12px] text-muted hover:border-danger hover:text-danger"
                  >
                    Quitar
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={agregarTalla}
                className="eyebrow border border-border px-3.5 py-2 text-muted transition-colors hover:border-ink hover:text-ink"
              >
                + Agregar presentación
              </button>
            </div>
          </Seccion>

          <Seccion titulo="Visibilidad">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2.5 text-[13px] text-ink">
                <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
                Visible en el catálogo público
              </label>
              <label className="flex items-center gap-2.5 text-[13px] text-ink">
                <input
                  type="checkbox"
                  checked={datos.destacado ?? false}
                  onChange={(e) => setDatos((p) => ({ ...p, destacado: e.target.checked }))}
                />
                Destacado
              </label>
              <label className="flex items-center gap-2.5 text-[13px] text-ink">
                <input type="checkbox" checked={porConfirmar} onChange={(e) => setPorConfirmar(e.target.checked)} />
                Ficha por confirmar
              </label>
            </div>
          </Seccion>

          {error && <p className="text-[13px] text-danger">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={guardar}
              className="eyebrow border border-ink bg-ink px-6 py-3.5 text-background transition-colors hover:bg-transparent hover:text-ink"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={() => router.push("/panel/catalogo")}
              className="eyebrow border border-border px-6 py-3.5 text-muted transition-colors hover:border-ink hover:text-ink"
            >
              Descartar
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {perfumeExistente && esDueno && (
            <div>
              <p className="eyebrow mb-3 text-muted">Fotos</p>
              <div className="space-y-3 border border-border bg-surface p-4">
                <SubirFoto
                  perfumeId={perfumeExistente.id}
                  tipo="principal"
                  imagenActual={perfumeExistente.imagen}
                  esPlaceholder={perfumeExistente.imagenEsPlaceholder}
                />
                <SubirFoto
                  perfumeId={perfumeExistente.id}
                  tipo="ambiente"
                  imagenActual={perfumeExistente.imagenAmbiente ?? null}
                  esPlaceholder={false}
                />
              </div>
            </div>
          )}

          <div>
            <p className="eyebrow mb-3 text-muted">Vista previa — así se ve en el catálogo público</p>
            <div className="max-w-[300px] border border-border">
              <ProductCard perfume={previa} onElegir={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="eyebrow text-accent">{titulo}</p>
      <div className="rule mt-2 mb-4" />
      {children}
    </section>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] text-muted">{etiqueta}</span>
      {children}
    </label>
  );
}
