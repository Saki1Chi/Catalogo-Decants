"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePanel } from "@/panel/store";
import { PerfumePanel } from "@/panel/merge";
import { Categoria, Familia } from "@/types";
import { estadoStock, formatearPrecio, precioDesde } from "@/lib/format";
import { tiempoRelativo } from "@/panel/format";
import { PerfumeFoto } from "@/components/PerfumeFoto";
import { EsqueletoFilas, SinResultados } from "./EstadosLista";
import { Modal } from "./Modal";
import { IconoAlerta, IconoBuscar, IconoCheck, IconoChevronAbajo, IconoX } from "./iconos";

type Orden = "marca" | "nombre" | "precio-asc" | "precio-desc" | "modificado";
type FiltroEstado = "todos" | "agotado" | "ultimas" | "disponible";

const ORDENES: Array<{ v: Orden; l: string }> = [
  { v: "marca", l: "Marca (A–Z)" },
  { v: "nombre", l: "Nombre (A–Z)" },
  { v: "precio-asc", l: "Precio: menor a mayor" },
  { v: "precio-desc", l: "Precio: mayor a menor" },
  { v: "modificado", l: "Modificado recién" },
];

const ML_COLUMNAS = [3, 5, 10];

function tallaDe(p: PerfumePanel, ml: number) {
  return p.tamanos.find((t) => t.ml === ml);
}

function estadoGeneral(p: PerfumePanel): "agotado" | "ultimas" | "disponible" | "sin-dato" {
  const conDato = p.tamanos.filter((t) => typeof t.stock === "number");
  if (conDato.length === 0) return "sin-dato";
  if (conDato.every((t) => (t.stock ?? 0) <= 0)) return "agotado";
  if (conDato.some((t) => (t.stock ?? 0) > 0 && (t.stock ?? 0) <= 3)) return "ultimas";
  return "disponible";
}

export function CatalogoPanel() {
  const { perfumes, listo, sesion, actualizarTamano, accionMasiva, cambiarPreciosMasivo, eliminarPerfume } =
    usePanel();
  const esDueno = sesion?.rol === "dueño";

  const [busqueda, setBusqueda] = useState("");
  const [genero, setGenero] = useState<Categoria | "Todos">("Todos");
  const [familia, setFamilia] = useState<Familia | "Todas">("Todas");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [soloVisibles, setSoloVisibles] = useState(false);
  const [soloOcultos, setSoloOcultos] = useState(false);
  const [soloDestacados, setSoloDestacados] = useState(false);
  const [soloPorConfirmar, setSoloPorConfirmar] = useState(false);
  const [orden, setOrden] = useState<Orden>("marca");
  const [compacto, setCompacto] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [edicion, setEdicion] = useState<{ id: string; ml: number; campo: "precio" | "stock"; valor: string } | null>(
    null,
  );
  const [modalPrecios, setModalPrecios] = useState(false);
  const [avisoEliminar, setAvisoEliminar] = useState<string | null>(null);

  const familias = useMemo(() => {
    const unicas = new Set(perfumes.map((p) => p.familia));
    return Array.from(unicas).sort() as Familia[];
  }, [perfumes]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const lista = perfumes.filter((p) => {
      if (texto) {
        const coincide =
          p.nombre.toLowerCase().includes(texto) ||
          p.marca.toLowerCase().includes(texto) ||
          p.notas.some((n) => n.toLowerCase().includes(texto));
        if (!coincide) return false;
      }
      if (genero !== "Todos" && p.categoria !== genero) return false;
      if (familia !== "Todas" && p.familia !== familia) return false;
      if (filtroEstado !== "todos" && estadoGeneral(p) !== filtroEstado) return false;
      if (soloVisibles && !p.visible) return false;
      if (soloOcultos && p.visible) return false;
      if (soloDestacados && !p.destacado) return false;
      if (soloPorConfirmar && !p.fichaPorConfirmar) return false;
      return true;
    });

    return [...lista].sort((a, b) => {
      switch (orden) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre, "es");
        case "precio-asc":
          return precioDesde(a.tamanos) - precioDesde(b.tamanos);
        case "precio-desc":
          return precioDesde(b.tamanos) - precioDesde(a.tamanos);
        case "modificado":
          return (b.modificadoEn ?? "").localeCompare(a.modificadoEn ?? "");
        default:
          return a.marca.localeCompare(b.marca, "es") || a.nombre.localeCompare(b.nombre, "es");
      }
    });
  }, [perfumes, busqueda, genero, familia, filtroEstado, soloVisibles, soloOcultos, soloDestacados, soloPorConfirmar, orden]);

  const hayFiltrosActivos =
    genero !== "Todos" ||
    familia !== "Todas" ||
    filtroEstado !== "todos" ||
    soloVisibles ||
    soloOcultos ||
    soloDestacados ||
    soloPorConfirmar ||
    busqueda.trim() !== "";

  const limpiarFiltros = () => {
    setBusqueda("");
    setGenero("Todos");
    setFamilia("Todas");
    setFiltroEstado("todos");
    setSoloVisibles(false);
    setSoloOcultos(false);
    setSoloDestacados(false);
    setSoloPorConfirmar(false);
  };

  const alternarSeleccion = (id: string) => {
    setSeleccion((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  };

  const abrirEdicion = (p: PerfumePanel, ml: number, campo: "precio" | "stock") => {
    if (!esDueno && campo === "precio") return;
    const talla = tallaDe(p, ml);
    setEdicion({ id: p.id, ml, campo, valor: String((campo === "precio" ? talla?.precio : talla?.stock) ?? 0) });
  };

  const guardarEdicion = () => {
    if (!edicion) return;
    const numero = Number(edicion.valor);
    const invalido = edicion.campo === "precio" ? !(numero > 0) : !(numero >= 0);
    if (invalido || Number.isNaN(numero)) return;
    actualizarTamano(edicion.id, edicion.ml, { [edicion.campo]: Math.round(numero) });
    setEdicion(null);
  };

  const numeroEdicionInvalido =
    edicion !== null &&
    (Number.isNaN(Number(edicion.valor)) ||
      (edicion.campo === "precio" ? !(Number(edicion.valor) > 0) : !(Number(edicion.valor) >= 0)));

  const eliminarSeleccion = async () => {
    const bloqueados: string[] = [];
    for (const id of seleccion) {
      const r = await eliminarPerfume(id);
      if (!r.ok) bloqueados.push(r.motivo ?? id);
    }
    if (bloqueados.length > 0) {
      setAvisoEliminar(
        `${bloqueados.length} no se pudieron eliminar porque tienen pedidos abiertos. Podés ocultarlos en vez de eliminarlos.`,
      );
    }
    setSeleccion(new Set());
  };

  if (!listo) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-7 lg:px-8">
        <EsqueletoFilas filas={7} />
      </div>
    );
  }

  const filaAlto = compacto ? "h-10" : "h-12";
  const colGrid = "grid-cols-[36px_minmax(0,1fr)_78px_108px_76px_92px_92px_92px_66px_104px]";

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-12 pt-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">
            {perfumes.length} perfumes · {new Set(perfumes.map((p) => p.marca)).size} marcas
          </p>
          <h1 className="mt-2.5 font-serif text-[34px] font-light leading-none text-ink">Catálogo</h1>
        </div>
        <div className="flex gap-2.5">
          {esDueno && (
            <button
              type="button"
              className="eyebrow border border-ink px-4 py-2.5 text-ink transition-colors hover:bg-ink hover:text-background"
              title="Importar precios desde el Excel de inventario"
            >
              Importar Excel
            </button>
          )}
          <Link
            href="/panel/catalogo/ficha"
            className="eyebrow border border-ink bg-ink px-4 py-2.5 text-background transition-colors hover:bg-transparent hover:text-ink"
          >
            Nuevo perfume
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex max-w-[420px] flex-1 items-center gap-2.5 border border-border bg-surface px-3.5 py-2.5">
          <IconoBuscar className="h-3.5 w-3.5 flex-none text-muted" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar perfume, marca o nota"
            className="w-full bg-transparent text-[13px] text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setMostrarFiltros(true)}
          className="eyebrow inline-flex items-center gap-2.5 border border-border bg-surface px-3.5 py-2.5 text-ink transition-colors hover:border-ink"
        >
          Filtros
          <IconoChevronAbajo className="h-1.5 w-2.5 text-muted" />
        </button>
        <div className="flex w-full flex-wrap items-center gap-2.5 sm:ml-auto sm:w-auto">
          <span className="eyebrow hidden text-muted sm:inline">Orden</span>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            className="border border-border bg-surface px-3.5 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          >
            {ORDENES.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setCompacto((v) => !v)}
            className={`eyebrow border px-3 py-2.5 transition-colors ${
              compacto ? "border-ink text-ink" : "border-border text-muted hover:border-ink hover:text-ink"
            }`}
          >
            Compacto
          </button>
        </div>
      </div>

      {hayFiltrosActivos && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1 text-muted">Filtros activos</span>
          {[
            genero !== "Todos" && { l: genero, limpiar: () => setGenero("Todos") },
            familia !== "Todas" && { l: familia, limpiar: () => setFamilia("Todas") },
            filtroEstado !== "todos" && {
              l: filtroEstado === "agotado" ? "Agotado" : filtroEstado === "ultimas" ? "Últimas unidades" : "Disponible",
              limpiar: () => setFiltroEstado("todos"),
            },
            soloVisibles && { l: "Visibles", limpiar: () => setSoloVisibles(false) },
            soloOcultos && { l: "Ocultos", limpiar: () => setSoloOcultos(false) },
            soloDestacados && { l: "Destacados", limpiar: () => setSoloDestacados(false) },
            soloPorConfirmar && { l: "Ficha por confirmar", limpiar: () => setSoloPorConfirmar(false) },
          ]
            .filter(Boolean)
            .map((f, i) => {
              const chip = f as { l: string; limpiar: () => void };
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 border border-ink bg-surface px-2.5 py-1.5 text-[12px] text-ink"
                >
                  {chip.l}
                  <button type="button" onClick={chip.limpiar} aria-label={`Quitar filtro ${chip.l}`}>
                    <IconoX className="h-2 w-2" />
                  </button>
                </span>
              );
            })}
          <button type="button" onClick={limpiarFiltros} className="link-underline ml-1 text-[12px] text-ink">
            Limpiar filtros
          </button>
          <span className="ml-auto text-[12px] text-muted">
            Mostrando {filtrados.length} de {perfumes.length}
          </span>
        </div>
      )}

      {avisoEliminar && (
        <div className="mt-3.5 flex items-center gap-3 border border-accent/30 bg-accent/[0.06] px-4 py-3">
          <IconoAlerta className="h-3.5 w-3.5 flex-none text-accent" />
          <p className="text-[13px] text-ink">{avisoEliminar}</p>
          <button type="button" onClick={() => setAvisoEliminar(null)} className="ml-auto text-muted hover:text-ink">
            <IconoX className="h-2.5 w-2.5" />
          </button>
        </div>
      )}

      {filtrados.length === 0 ? (
        <div className="mt-6">
          <SinResultados onLimpiar={limpiarFiltros} />
        </div>
      ) : (
        <>
          {/* Barra de selección múltiple */}
          {seleccion.size > 0 && (
            <div className="mt-4 flex items-center gap-5 bg-ink px-5 py-3.5 text-background">
              <span className="font-serif text-lg">{seleccion.size} seleccionados</span>
              <button
                type="button"
                onClick={() => setSeleccion(new Set(filtrados.map((p) => p.id)))}
                className="text-[13px] text-[#c9a66b] hover:text-background"
              >
                Seleccionar los {filtrados.length}
              </button>
              <div className="ml-auto flex items-center gap-2.5">
                {esDueno && (
                  <button
                    type="button"
                    onClick={() => setModalPrecios(true)}
                    className="eyebrow border border-background px-3.5 py-2 transition-colors hover:bg-background hover:text-ink"
                  >
                    Cambiar precios
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => accionMasiva(Array.from(seleccion), "ocultar")}
                  className="eyebrow border border-background px-3.5 py-2 transition-colors hover:bg-background hover:text-ink"
                >
                  Ocultar del catálogo
                </button>
                <button
                  type="button"
                  onClick={() => accionMasiva(Array.from(seleccion), "mostrar")}
                  className="eyebrow border border-background px-3.5 py-2 transition-colors hover:bg-background hover:text-ink"
                >
                  Mostrar
                </button>
                <button
                  type="button"
                  onClick={() => accionMasiva(Array.from(seleccion), "destacar")}
                  className="eyebrow border border-background px-3.5 py-2 transition-colors hover:bg-background hover:text-ink"
                >
                  Marcar destacado
                </button>
                {esDueno && (
                  <button
                    type="button"
                    onClick={eliminarSeleccion}
                    className="eyebrow border border-danger px-3.5 py-2 text-[#d1705f] transition-colors hover:bg-danger hover:text-background"
                  >
                    Eliminar
                  </button>
                )}
                <button type="button" onClick={() => setSeleccion(new Set())} className="text-[13px] text-muted hover:text-background">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Tabla — escritorio */}
          <div className="mt-4 hidden border border-border bg-surface lg:block">
            <div
              className={`grid ${colGrid} items-center gap-0 border-b border-line-strong px-4 py-0 text-muted`}
              style={{ height: 40 }}
            >
              <button
                type="button"
                onClick={() =>
                  setSeleccion(seleccion.size === filtrados.length ? new Set() : new Set(filtrados.map((p) => p.id)))
                }
                className={`flex h-3.5 w-3.5 items-center justify-center border ${
                  seleccion.size > 0 ? "border-ink bg-ink" : "border-line-strong"
                }`}
                aria-label="Seleccionar todos"
              >
                {seleccion.size > 0 && <IconoCheck className="h-1.5 w-2 text-background" />}
              </button>
              <div className="eyebrow">Perfume</div>
              <div className="eyebrow">Género</div>
              <div className="eyebrow">Familia</div>
              <div className="eyebrow text-right">Desde</div>
              {ML_COLUMNAS.map((ml) => (
                <div key={ml} className="eyebrow text-right">
                  {ml} ml
                </div>
              ))}
              <div className="eyebrow text-center">Visible</div>
              <div className="eyebrow text-right">Modificado</div>
            </div>

            {filtrados.map((p) => {
              const seleccionado = seleccion.has(p.id);
              const enEdicion = edicion && edicion.id === p.id;

              return (
                <div
                  key={p.id}
                  className={`grid ${colGrid} items-center gap-0 border-b border-border px-4 text-[13px] last:border-b-0 ${filaAlto} ${
                    seleccionado ? "bg-surface-alt" : ""
                  } ${enEdicion ? "border-ink" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => alternarSeleccion(p.id)}
                    className={`flex h-3.5 w-3.5 items-center justify-center border ${
                      seleccionado ? "border-ink bg-ink" : "border-line-strong"
                    }`}
                    aria-label={`Seleccionar ${p.nombre}`}
                  >
                    {seleccionado && <IconoCheck className="h-1.5 w-2 text-background" />}
                  </button>

                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-10 w-10 flex-none bg-[#f7f5f2]">
                      <PerfumeFoto perfume={p} />
                    </div>
                    <div className="min-w-0">
                      <p className="eyebrow truncate text-muted">{p.marca}</p>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-ink">
                        <Link href={`/panel/catalogo/ficha?id=${p.id}`} className="truncate hover:underline">
                          {p.nombre}
                        </Link>
                        {p.fichaPorConfirmar && (
                          <span className="flex-none border border-accent/50 bg-accent/[0.08] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted">
                            Por confirmar
                          </span>
                        )}
                        {p.destacado && estadoGeneral(p) !== "agotado" && (
                          <span className="flex-none border border-ink px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink">
                            Destacado
                          </span>
                        )}
                        {estadoGeneral(p) === "agotado" && (
                          <span className="flex-none border border-danger px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-danger">
                            Agotado
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-muted">{p.categoria}</div>
                  <div className="text-muted">{p.familia}</div>
                  <div className="text-right tabular-nums text-ink">{formatearPrecio(precioDesde(p.tamanos))}</div>

                  {ML_COLUMNAS.map((ml) => {
                    const talla = tallaDe(p, ml);
                    const enEdicionCelda = enEdicion && edicion?.ml === ml;

                    if (!talla) {
                      return (
                        <div key={ml} className="text-right text-line-strong">
                          —
                        </div>
                      );
                    }

                    if (enEdicionCelda) {
                      return (
                        <div key={ml} className="flex flex-col items-end gap-1">
                          <input
                            autoFocus
                            value={edicion.valor}
                            onChange={(e) => setEdicion({ ...edicion, valor: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") guardarEdicion();
                              if (e.key === "Escape") setEdicion(null);
                            }}
                            className={`w-20 border bg-surface px-2 py-1.5 text-right tabular-nums text-ink focus:outline-none ${
                              numeroEdicionInvalido ? "border-danger" : "border-ink outline outline-2 outline-ink outline-offset-2"
                            }`}
                          />
                          {numeroEdicionInvalido && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-danger">
                              <IconoAlerta className="h-2.5 w-2.5" />
                              {edicion.campo === "precio" ? "Mayor que 0" : "0 o más"}
                            </span>
                          )}
                        </div>
                      );
                    }

                    const estado = typeof talla.stock === "number" ? estadoStock(talla.stock) : null;

                    return (
                      <div key={ml} className="text-right">
                        <button
                          type="button"
                          onDoubleClick={() => abrirEdicion(p, ml, "precio")}
                          disabled={!esDueno}
                          className="tabular-nums text-ink disabled:cursor-default"
                          title={esDueno ? "Doble clic para editar el precio" : undefined}
                        >
                          {formatearPrecio(talla.precio)}
                        </button>
                        <button
                          type="button"
                          onDoubleClick={() => abrirEdicion(p, ml, "stock")}
                          className="block text-[11px] text-muted hover:text-ink"
                          title="Doble clic para editar el stock"
                        >
                          {estado === "agotado" ? (
                            <span className="text-danger">Agotado</span>
                          ) : typeof talla.stock === "number" ? (
                            `${talla.stock} u.`
                          ) : (
                            "Sin registrar"
                          )}
                        </button>
                      </div>
                    );
                  })}

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => accionMasiva([p.id], p.visible ? "ocultar" : "mostrar")}
                      title={p.visible ? "Visible — clic para ocultar" : "Oculto — clic para mostrar"}
                    >
                      {p.visible ? (
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                      ) : (
                        <span className="eyebrow text-muted">Oculto</span>
                      )}
                    </button>
                  </div>

                  {enEdicion ? (
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={guardarEdicion}
                        disabled={numeroEdicionInvalido}
                        className="eyebrow border border-ink bg-ink px-2.5 py-1.5 text-background disabled:opacity-40"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEdicion(null)}
                        className="eyebrow border border-border px-2.5 py-1.5 text-muted"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-[12px] text-muted">{tiempoRelativo(p.modificadoEn)}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lista — celular */}
          <ul className="mt-4 divide-y divide-border border border-border bg-surface lg:hidden">
            {filtrados.map((p) => (
              <li key={p.id}>
                <Link href={`/panel/catalogo/ficha?id=${p.id}`} className="flex items-center gap-3.5 px-4 py-3.5">
                  <div className="h-11 w-11 flex-none bg-[#f7f5f2]">
                    <PerfumeFoto perfume={p} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow text-muted">{p.marca}</p>
                    <p className="mt-1 truncate text-[14px] text-ink">{p.nombre}</p>
                    <p className="mt-1 text-[12px] text-muted">
                      Desde {formatearPrecio(precioDesde(p.tamanos))} · {p.categoria}
                    </p>
                  </div>
                  {!p.visible && <span className="eyebrow flex-none text-muted">Oculto</span>}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {modalPrecios && (
        <ModalPreciosMasivos
          cantidad={seleccion.size}
          onClose={() => setModalPrecios(false)}
          onAplicar={(opts) => {
            cambiarPreciosMasivo(Array.from(seleccion), opts);
            setModalPrecios(false);
            setSeleccion(new Set());
          }}
        />
      )}

      {mostrarFiltros && (
        <ModalFiltros
          onClose={() => setMostrarFiltros(false)}
          genero={genero}
          setGenero={setGenero}
          familia={familia}
          setFamilia={setFamilia}
          familias={familias}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
          soloVisibles={soloVisibles}
          setSoloVisibles={setSoloVisibles}
          soloOcultos={soloOcultos}
          setSoloOcultos={setSoloOcultos}
          soloDestacados={soloDestacados}
          setSoloDestacados={setSoloDestacados}
          soloPorConfirmar={soloPorConfirmar}
          setSoloPorConfirmar={setSoloPorConfirmar}
        />
      )}
    </div>
  );
}

function ModalPreciosMasivos({
  cantidad,
  onClose,
  onAplicar,
}: {
  cantidad: number;
  onClose: () => void;
  onAplicar: (opts: { modo: "porcentaje" | "monto"; valor: number; redondeo: number }) => void;
}) {
  const [modo, setModo] = useState<"porcentaje" | "monto">("porcentaje");
  const [valor, setValor] = useState(10);

  return (
    <Modal titulo="Cambiar precios" onClose={onClose} ancho="max-w-sm">
      <p className="text-[13px] text-muted">
        Se aplica a los {cantidad} perfumes seleccionados, en todas sus presentaciones. Los precios se redondean a
        múltiplos de 10.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setModo("porcentaje")}
          className={`eyebrow flex-1 border px-3 py-2.5 ${modo === "porcentaje" ? "border-ink bg-ink text-background" : "border-border text-muted"}`}
        >
          Porcentaje
        </button>
        <button
          type="button"
          onClick={() => setModo("monto")}
          className={`eyebrow flex-1 border px-3 py-2.5 ${modo === "monto" ? "border-ink bg-ink text-background" : "border-border text-muted"}`}
        >
          Monto fijo
        </button>
      </div>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-[12px] text-muted">
          {modo === "porcentaje" ? "% de aumento (negativo = descuento)" : "Monto en MXN (negativo = descuento)"}
        </span>
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(Number(e.target.value) || 0)}
          className="w-full border border-border bg-background px-3 py-2.5 text-[13px] tabular-nums text-ink focus:border-ink focus:outline-none"
        />
      </label>
      <button
        type="button"
        onClick={() => onAplicar({ modo, valor, redondeo: 10 })}
        className="eyebrow mt-5 w-full border border-ink bg-ink px-4 py-3.5 text-background transition-colors hover:bg-transparent hover:text-ink"
      >
        Aplicar a {cantidad} perfumes
      </button>
    </Modal>
  );
}

function ModalFiltros(props: {
  onClose: () => void;
  genero: Categoria | "Todos";
  setGenero: (v: Categoria | "Todos") => void;
  familia: Familia | "Todas";
  setFamilia: (v: Familia | "Todas") => void;
  familias: Familia[];
  filtroEstado: FiltroEstado;
  setFiltroEstado: (v: FiltroEstado) => void;
  soloVisibles: boolean;
  setSoloVisibles: (v: boolean) => void;
  soloOcultos: boolean;
  setSoloOcultos: (v: boolean) => void;
  soloDestacados: boolean;
  setSoloDestacados: (v: boolean) => void;
  soloPorConfirmar: boolean;
  setSoloPorConfirmar: (v: boolean) => void;
}) {
  const generos: Array<Categoria | "Todos"> = ["Todos", "Hombre", "Mujer", "Unisex"];
  const estados: Array<{ v: FiltroEstado; l: string }> = [
    { v: "todos", l: "Todos" },
    { v: "disponible", l: "Disponible" },
    { v: "ultimas", l: "Últimas unidades" },
    { v: "agotado", l: "Agotado" },
  ];

  return (
    <Modal titulo="Filtros" onClose={props.onClose} ancho="max-w-sm">
      <div className="space-y-5">
        <div>
          <p className="eyebrow mb-2 text-muted">Género</p>
          <div className="flex flex-wrap gap-2">
            {generos.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => props.setGenero(g)}
                className={`eyebrow border px-3 py-1.5 ${props.genero === g ? "border-ink bg-ink text-background" : "border-border text-muted"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-2 text-muted">Familia</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => props.setFamilia("Todas")}
              className={`eyebrow border px-3 py-1.5 ${props.familia === "Todas" ? "border-ink bg-ink text-background" : "border-border text-muted"}`}
            >
              Todas
            </button>
            {props.familias.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => props.setFamilia(f)}
                className={`eyebrow border px-3 py-1.5 ${props.familia === f ? "border-ink bg-ink text-background" : "border-border text-muted"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-2 text-muted">Estado de stock</p>
          <div className="flex flex-wrap gap-2">
            {estados.map((e) => (
              <button
                key={e.v}
                type="button"
                onClick={() => props.setFiltroEstado(e.v)}
                className={`eyebrow border px-3 py-1.5 ${props.filtroEstado === e.v ? "border-ink bg-ink text-background" : "border-border text-muted"}`}
              >
                {e.l}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={props.soloVisibles}
              onChange={(e) => props.setSoloVisibles(e.target.checked)}
            />
            Solo visibles
          </label>
          <label className="flex items-center gap-2.5 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={props.soloOcultos}
              onChange={(e) => props.setSoloOcultos(e.target.checked)}
            />
            Solo ocultos
          </label>
          <label className="flex items-center gap-2.5 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={props.soloDestacados}
              onChange={(e) => props.setSoloDestacados(e.target.checked)}
            />
            Solo destacados
          </label>
          <label className="flex items-center gap-2.5 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={props.soloPorConfirmar}
              onChange={(e) => props.setSoloPorConfirmar(e.target.checked)}
            />
            Ficha por confirmar
          </label>
        </div>

        <button
          type="button"
          onClick={props.onClose}
          className="eyebrow w-full border border-ink bg-ink px-4 py-3 text-background transition-colors hover:bg-transparent hover:text-ink"
        >
          Ver resultados
        </button>
      </div>
    </Modal>
  );
}
