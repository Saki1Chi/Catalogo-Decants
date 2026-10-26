"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  collection,
  doc,
  limit as qlimit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import {
  firebaseConfigurado,
  getFirebaseAuth,
  getFirebaseDb,
} from "@/lib/firebase";
import { contarFotosPendientes, encolarFoto, procesarColaFotos, type TipoFoto } from "./colaFotos";
import { Perfume, TamanoDisponible } from "@/types";
import { PerfumePanel } from "./merge";
import {
  ConflictoEdicion,
  EstadoPanel,
  EstadoPedido,
  EstadoPago,
  HistorialEntry,
  MovimientoStock,
  NegocioOverride,
  Pedido,
  Rol,
  Sesion,
  Usuario,
} from "./types";

// -----------------------------------------------------------------------
// Fase 2 (backend real): este archivo reemplaza localStorage por Firestore
// como persistencia, manteniendo la misma interfaz PanelContexto — ningún
// componente de src/app/panel/** ni src/components/panel/** necesita
// cambios por esto. Ver el plan completo en design/panel-admin/05-backend.md
// y las reglas reales en firestore.rules / storage.rules.
//
// Todo lo que hoy se simulaba acá (offline, sync, "pendientes") ahora es de
// verdad: initializeFirestore con persistentLocalCache (src/lib/firebase.ts)
// hace que las escrituras funcionen sin conexión y se reintenten solas al
// volver — no hace falta el setTimeout(1400ms) que había antes.
// -----------------------------------------------------------------------

const CLAVE_EMAIL_LINK = "panel:email-para-link";
const LIMITE_HISTORIAL = 200;
const LIMITE_MOVIMIENTOS = 50;

function idAleatorio(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type EstadoAuth = "cargando" | "sin-sesion" | "con-sesion" | "creando-cuenta";

interface PanelContexto {
  // --- estado general ---
  estado: EstadoPanel;
  listo: boolean;
  configurado: boolean; // false si falta .env.local (Firebase sin inicializar)
  online: boolean;
  simulandoSinConexion: boolean;
  alternarSimulacionSinConexion: () => void;
  perfumes: PerfumePanel[];
  conflictos: ConflictoEdicion[];

  // --- sesión / auth real (Fase 3) ---
  sesion: Sesion | null;
  estadoAuth: EstadoAuth;
  errorAuth: string | null;
  enviarLinkDeAcceso: (email: string) => Promise<void>;
  cerrarSesion: () => void;

  // --- ficha de perfume ---
  actualizarTamano: (
    perfumeId: string,
    ml: number,
    patch: Partial<Pick<TamanoDisponible, "precio" | "stock">>,
  ) => Promise<void>;
  registrarMovimientoStock: (perfumeId: string, ml: number, delta: number, motivo: string) => Promise<void>;
  alternarVisible: (perfumeId: string, valor: boolean) => Promise<void>;
  alternarDestacado: (perfumeId: string, valor: boolean) => Promise<void>;
  accionMasiva: (ids: string[], accion: "ocultar" | "mostrar" | "destacar" | "quitar-destacado") => Promise<void>;
  cambiarPreciosMasivo: (
    ids: string[],
    opciones: { modo: "porcentaje" | "monto"; valor: number; redondeo: number },
  ) => Promise<void>;
  crearPerfume: (datos: Omit<Perfume, "id" | "filaExcel">) => Promise<string>;
  editarPerfume: (id: string, patch: Partial<Perfume>) => Promise<void>;
  eliminarPerfume: (id: string) => Promise<{ ok: boolean; motivo?: string }>;
  resolverConflicto: (conflictoId: string, aplicarValorB: boolean) => Promise<void>;

  // --- pedidos ---
  registrarPedido: (
    datos: Omit<Pedido, "id" | "fecha" | "autor" | "estado" | "pago"> & { estado?: EstadoPedido },
  ) => Promise<void>;
  actualizarEstadoPedido: (id: string, estado: EstadoPedido, pago?: EstadoPago) => Promise<void>;

  // --- negocio ---
  actualizarNegocio: (patch: NegocioOverride) => Promise<void>;

  // --- usuarios (Dueño) ---
  invitarUsuario: (nombre: string, email: string, rol: Rol) => Promise<{ whatsappUrl: string }>;
  cambiarRolUsuario: (id: string, rol: Rol) => Promise<void>;
  desactivarUsuario: (id: string) => Promise<void>;

  // --- historial ---
  deshacerEntry: (id: string) => Promise<void>;

  // --- fotos (Fase 4) ---
  subirFoto: (perfumeId: string, archivo: File, tipo: "principal" | "ambiente") => Promise<void>;
  colaFotosPendientes: number;
}

const Contexto = createContext<PanelContexto | null>(null);

export function PanelProvider({ children }: { children: React.ReactNode }) {
  // Sin Firebase configurado no hay nada que esperar: arrancamos "listos"
  // (la pantalla de login lo explica) en vez de quedar colgados en carga.
  const [listo, setListo] = useState(() => !firebaseConfigurado);
  const [redOnline, setRedOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [simulandoSinConexion, setSimulandoSinConexion] = useState(false);
  const online = redOnline && !simulandoSinConexion;

  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [estadoAuth, setEstadoAuth] = useState<EstadoAuth>(() =>
    firebaseConfigurado ? "cargando" : "sin-sesion",
  );
  const [errorAuth, setErrorAuth] = useState<string | null>(null);

  const [perfumes, setPerfumes] = useState<PerfumePanel[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);
  const [negocio, setNegocio] = useState<NegocioOverride>({});
  const [catalogoActualizadoEn, setCatalogoActualizadoEn] = useState("");
  const [conflictos, setConflictos] = useState<ConflictoEdicion[]>([]);
  const [pendientes, setPendientes] = useState(0);
  const [colaFotosPendientes, setColaFotosPendientes] = useState(0);

  // Cuántos listeners todavía no dieron su primer snapshot — hasta que
  // llegan todos, `listo` se mantiene en false (evita parpadeos de "vacío").
  const listenersPendientes = useRef(0);

  // ---------------------------------------------------------------------
  // Conectividad
  // ---------------------------------------------------------------------
  useEffect(() => {
    const marcarOnline = () => setRedOnline(true);
    const marcarOffline = () => setRedOnline(false);
    window.addEventListener("online", marcarOnline);
    window.addEventListener("offline", marcarOffline);
    return () => {
      window.removeEventListener("online", marcarOnline);
      window.removeEventListener("offline", marcarOffline);
    };
  }, []);

  // ---------------------------------------------------------------------
  // Cola de fotos offline (ver src/panel/colaFotos.ts): retoma lo que haya
  // quedado pendiente de una sesión anterior y reintenta al reconectar.
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!firebaseConfigurado) return;
    const actualizarContador = () => {
      void contarFotosPendientes().then(setColaFotosPendientes);
    };
    const procesarYActualizar = () => {
      void procesarColaFotos().then(actualizarContador);
    };
    procesarYActualizar();
    window.addEventListener("online", procesarYActualizar);
    return () => window.removeEventListener("online", procesarYActualizar);
  }, []);

  // ---------------------------------------------------------------------
  // Auth: quién está logueado + su doc de usuarios/{uid} (nombre/rol/activo)
  // ---------------------------------------------------------------------
  useEffect(() => {
    // Sin Firebase configurado (.env.local vacío) el estado inicial de
    // estadoAuth/listo ya contempla este caso — ver los useState de arriba.
    if (!firebaseConfigurado) return;
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    let dejarDeEscucharUsuario: Unsubscribe | null = null;

    const dejarDeEscucharAuth = onAuthStateChanged(auth, (user) => {
      dejarDeEscucharUsuario?.();
      dejarDeEscucharUsuario = null;

      if (!user) {
        setSesion(null);
        setEstadoAuth("sin-sesion");
        return;
      }

      setEstadoAuth("creando-cuenta"); // hasta que el doc usuarios/{uid} aparezca
      dejarDeEscucharUsuario = onSnapshot(
        doc(db, "usuarios", user.uid),
        (snap) => {
          if (!snap.exists()) {
            // Recién creado: el trigger de Cloud Functions
            // (functions/src/index.ts::alCrearUsuario) todavía está
            // escribiendo el doc — reintenta solo con el próximo snapshot.
            return;
          }
          const d = snap.data();
          if (!d.activo) {
            setErrorAuth("Tu usuario está desactivado — pedile a Alfredo que te reactive.");
            setSesion(null);
            setEstadoAuth("sin-sesion");
            return;
          }
          setSesion({ uid: user.uid, nombre: d.nombre, email: d.email, rol: d.rol });
          setEstadoAuth("con-sesion");
        },
        () => {
          // Permission-denied u otro error de red: no tumbar la sesión, solo
          // dejar de mostrar "creando cuenta" para no colgar la pantalla.
          setEstadoAuth("sin-sesion");
        },
      );
    });

    return () => {
      dejarDeEscucharAuth();
      dejarDeEscucharUsuario?.();
    };
  }, []);

  // ---------------------------------------------------------------------
  // Datos: un listener por colección, todos arrancan apenas hay sesión
  // activa (o, para perfumes/negocio/meta, siempre — son legibles sin login
  // para que el catálogo público funcione; acá igual los mantenemos para
  // que el panel tenga todo disponible apenas entra).
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!firebaseConfigurado || estadoAuth !== "con-sesion" || !sesion) return;
    const db = getFirebaseDb();
    const unsubs: Unsubscribe[] = [];
    listenersPendientes.current = sesion.rol === "dueño" ? 7 : 6;

    const marcarListo = () => {
      listenersPendientes.current = Math.max(0, listenersPendientes.current - 1);
      if (listenersPendientes.current === 0) setListo(true);
    };

    unsubs.push(
      onSnapshot(collection(db, "perfumes"), (snap) => {
        setPerfumes(
          snap.docs.map((d) => ({ ...(d.data() as Omit<PerfumePanel, "id">), id: d.id })),
        );
        marcarListo();
      }),
    );

    unsubs.push(
      onSnapshot(query(collection(db, "pedidos"), orderBy("fecha", "desc")), (snap) => {
        setPedidos(snap.docs.map((d) => ({ ...(d.data() as Omit<Pedido, "id">), id: d.id })));
        marcarListo();
      }),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, "movimientosStock"), orderBy("fecha", "desc"), qlimit(LIMITE_MOVIMIENTOS)),
        (snap) => {
          setMovimientos(
            snap.docs.map((d) => ({ ...(d.data() as Omit<MovimientoStock, "id">), id: d.id })),
          );
          marcarListo();
        },
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, "historial"), orderBy("fecha", "desc"), qlimit(LIMITE_HISTORIAL)),
        (snap) => {
          setHistorial(
            snap.docs.map((d) => ({ ...(d.data() as Omit<HistorialEntry, "id">), id: d.id })),
          );
          marcarListo();
        },
      ),
    );

    unsubs.push(
      onSnapshot(doc(db, "negocio", "config"), (snap) => {
        setNegocio(snap.exists() ? (snap.data() as NegocioOverride) : {});
        marcarListo();
      }),
    );

    unsubs.push(
      onSnapshot(doc(db, "meta", "catalogo"), (snap) => {
        const actualizadoEn = snap.data()?.actualizadoEn;
        setCatalogoActualizadoEn(
          actualizadoEn?.toDate ? actualizadoEn.toDate().toISOString() : actualizadoEn ?? "",
        );
        marcarListo();
      }),
    );

    // Solo el Dueño puede listar todos los usuarios y ver conflictos (ver
    // firestore.rules) — el Empleado se queda con lista vacía, que es
    // correcto: la pantalla de Usuarios no es para su rol.
    if (sesion.rol === "dueño") {
      unsubs.push(
        onSnapshot(collection(db, "usuarios"), (snap) => {
          setUsuarios(snap.docs.map((d) => ({ ...(d.data() as Omit<Usuario, "id">), id: d.id })));
          marcarListo();
        }),
      );
      unsubs.push(
        onSnapshot(collection(db, "conflictos"), (snap) => {
          setConflictos(
            snap.docs
              .map((d) => ({ ...(d.data() as Omit<ConflictoEdicion, "id">), id: d.id }))
              .filter((c) => !c.resuelto),
          );
        }),
      );
    } else {
      // Reset al cambiar de rol (p.ej. si a alguien lo democionan mientras
      // tiene el panel abierto en otro dispositivo): no es un valor inicial,
      // es sincronizar con el nuevo `sesion.rol` — por eso vive en el efecto.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsuarios([]);
      setConflictos([]);
    }

    return () => unsubs.forEach((u) => u());
  }, [estadoAuth, sesion]);

  // Contador de "pendientes de sincronizar": cuántas escrituras locales
  // todavía no confirmó el servidor. Ya no es una simulación — Firestore
  // expone esto real vía metadata.hasPendingWrites en cada snapshot.
  const pendientesRef = useRef(new Set<string>());
  const marcarPendiente = useCallback((idOperacion: string) => {
    pendientesRef.current.add(idOperacion);
    setPendientes(pendientesRef.current.size);
  }, []);
  const marcarConfirmado = useCallback((idOperacion: string) => {
    pendientesRef.current.delete(idOperacion);
    setPendientes(pendientesRef.current.size);
  }, []);

  // ---------------------------------------------------------------------
  // Auth: enviar / completar link de acceso
  // ---------------------------------------------------------------------
  const enviarLinkDeAcceso = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    const emailNorm = email.trim().toLowerCase();
    await sendSignInLinkToEmail(auth, emailNorm, {
      url: `${window.location.origin}/panel/login`,
      handleCodeInApp: true,
    });
    window.localStorage.setItem(CLAVE_EMAIL_LINK, emailNorm);
  }, []);

  // Al montar: si la URL actual es un link de acceso (viene de tocar el
  // email), completar el login automáticamente.
  useEffect(() => {
    if (!firebaseConfigurado) return;
    const auth = getFirebaseAuth();
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    let email = window.localStorage.getItem(CLAVE_EMAIL_LINK);
    if (!email) {
      // Abrió el link en otro dispositivo/navegador del que lo pidió — se
      // le pide confirmar el email una sola vez (patrón estándar de
      // Firebase Auth para este caso).
      email = window.prompt("Confirmá tu email para entrar al panel:");
    }
    if (!email) return;

    signInWithEmailLink(auth, email, window.location.href)
      .then(() => {
        window.localStorage.removeItem(CLAVE_EMAIL_LINK);
        // Limpia el link de la URL para que no quede en el historial/no se
        // reintente al refrescar.
        window.history.replaceState({}, "", "/panel/login");
      })
      .catch((err) => {
        setErrorAuth(
          err?.code === "auth/invalid-action-code"
            ? "Este link ya se usó o venció — pedí que te inviten de nuevo."
            : "No se pudo completar el acceso. Probá de nuevo.",
        );
      });
  }, []);

  const cerrarSesion = useCallback(() => {
    if (!firebaseConfigurado) return;
    void signOut(getFirebaseAuth());
  }, []);

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------
  const buscarPerfume = useCallback(
    (id: string) => perfumes.find((p) => p.id === id) ?? null,
    [perfumes],
  );

  const registrarHistorial = useCallback(
    async (entrada: Omit<HistorialEntry, "id" | "fecha" | "autor" | "autorUid">) => {
      if (!sesion) return;
      const db = getFirebaseDb();
      const id = idAleatorio("hist");
      const opId = `hist:${id}`;
      marcarPendiente(opId);
      try {
        await setDoc(doc(db, "historial", id), {
          ...entrada,
          fecha: new Date().toISOString(),
          autor: sesion.nombre,
          autorUid: sesion.uid,
        });
      } finally {
        marcarConfirmado(opId);
      }
    },
    [sesion, marcarPendiente, marcarConfirmado],
  );

  // ---------------------------------------------------------------------
  // Ficha de perfume
  // ---------------------------------------------------------------------
  const actualizarPerfumeDoc = useCallback(
    async (perfumeId: string, patch: Record<string, unknown>) => {
      const db = getFirebaseDb();
      const perfumeActual = buscarPerfume(perfumeId);
      const opId = `perfume:${perfumeId}:${Date.now()}`;
      marcarPendiente(opId);
      try {
        await updateDoc(doc(db, "perfumes", perfumeId), {
          ...patch,
          version: (perfumeActual?.version ?? 0) + 1,
          modificadoEn: new Date().toISOString(),
          modificadoPor: sesion?.nombre ?? "desconocido",
        });
      } finally {
        marcarConfirmado(opId);
      }
    },
    [buscarPerfume, sesion, marcarPendiente, marcarConfirmado],
  );

  const actualizarTamano = useCallback(
    async (perfumeId: string, ml: number, patch: Partial<Pick<TamanoDisponible, "precio" | "stock">>) => {
      const perfume = buscarPerfume(perfumeId);
      if (!perfume) return;
      const anterior = perfume.tamanos.find((t) => t.ml === ml);
      const nuevosTamanos = perfume.tamanos.map((t) => (t.ml === ml ? { ...t, ...patch } : t));

      await actualizarPerfumeDoc(perfumeId, { tamanos: nuevosTamanos });
      await registrarHistorial({
        tipo: patch.precio !== undefined ? "precio" : "stock",
        descripcion:
          patch.precio !== undefined
            ? `${perfume.marca} ${perfume.nombre} (${ml} ml): precio a $${patch.precio}`
            : `${perfume.marca} ${perfume.nombre} (${ml} ml): stock a ${patch.stock}`,
        inverso: {
          tipo: "tamano",
          perfumeId,
          ml,
          precio: anterior?.precio ?? 0,
          stock: anterior?.stock,
        },
      });
    },
    [buscarPerfume, actualizarPerfumeDoc, registrarHistorial],
  );

  // Registra el movimiento (ledger). El campo `tamanos[].stock` agregado en
  // el propio doc lo recalcula la Cloud Function `recalcularStock` (ver
  // functions/src/index.ts) al ver un movimiento nuevo — no lo escribe el
  // cliente directo, así dos dispositivos offline nunca se pisan un +1/-1.
  const registrarMovimientoStock = useCallback(
    async (perfumeId: string, ml: number, delta: number, motivo: string) => {
      if (!sesion) return;
      const perfume = buscarPerfume(perfumeId);
      if (!perfume) return;
      const db = getFirebaseDb();
      const movimientoId = idAleatorio("mov");
      const opId = `mov:${movimientoId}`;
      marcarPendiente(opId);
      try {
        await setDoc(doc(db, "movimientosStock", movimientoId), {
          perfumeId,
          ml,
          delta,
          motivo,
          autor: sesion.nombre,
          autorUid: sesion.uid,
          fecha: new Date().toISOString(),
        });
      } finally {
        marcarConfirmado(opId);
      }
      await registrarHistorial({
        tipo: "stock",
        descripcion: `${perfume.marca} ${perfume.nombre} (${ml} ml): ${delta > 0 ? "+" : ""}${delta} · ${motivo}`,
        inverso: { tipo: "movimiento", movimientoId },
      });
    },
    [sesion, buscarPerfume, registrarHistorial, marcarPendiente, marcarConfirmado],
  );

  const alternarFlag = useCallback(
    async (
      perfumeId: string,
      campo: "visible" | "destacado" | "fichaPorConfirmar" | "eliminado",
      valor: boolean,
      etiqueta: string,
    ) => {
      const perfume = buscarPerfume(perfumeId);
      if (!perfume) return;
      const valorAnterior = perfume[campo] as boolean;
      await actualizarPerfumeDoc(perfumeId, { [campo]: valor });
      await registrarHistorial({
        tipo: "perfume",
        descripcion: `${perfume.marca} ${perfume.nombre}: ${etiqueta}`,
        inverso: { tipo: "flag", perfumeId, campo, valor: valorAnterior },
      });
    },
    [buscarPerfume, actualizarPerfumeDoc, registrarHistorial],
  );

  const alternarVisible = useCallback(
    (perfumeId: string, valor: boolean) =>
      alternarFlag(perfumeId, "visible", valor, valor ? "vuelve a estar visible" : "se ocultó del catálogo"),
    [alternarFlag],
  );

  const alternarDestacado = useCallback(
    (perfumeId: string, valor: boolean) =>
      alternarFlag(perfumeId, "destacado", valor, valor ? "marcado como destacado" : "ya no está destacado"),
    [alternarFlag],
  );

  const accionMasiva = useCallback(
    async (ids: string[], accion: "ocultar" | "mostrar" | "destacar" | "quitar-destacado") => {
      for (const id of ids) {
        if (accion === "ocultar") await alternarVisible(id, false);
        if (accion === "mostrar") await alternarVisible(id, true);
        if (accion === "destacar") await alternarDestacado(id, true);
        if (accion === "quitar-destacado") await alternarDestacado(id, false);
      }
    },
    [alternarVisible, alternarDestacado],
  );

  const cambiarPreciosMasivo = useCallback(
    async (ids: string[], opciones: { modo: "porcentaje" | "monto"; valor: number; redondeo: number }) => {
      for (const id of ids) {
        const perfume = buscarPerfume(id);
        if (!perfume) continue;
        for (const t of perfume.tamanos) {
          const base =
            opciones.modo === "porcentaje" ? t.precio * (1 + opciones.valor / 100) : t.precio + opciones.valor;
          const redondeo = opciones.redondeo || 1;
          const redondeado = Math.max(1, Math.round(base / redondeo) * redondeo);
          if (redondeado !== t.precio) {
            await actualizarTamano(id, t.ml, { precio: redondeado });
          }
        }
      }
    },
    [buscarPerfume, actualizarTamano],
  );

  const crearPerfume = useCallback(
    async (datos: Omit<Perfume, "id" | "filaExcel">) => {
      const db = getFirebaseDb();
      const id = idAleatorio("panel-nuevo");
      const opId = `crear:${id}`;
      marcarPendiente(opId);
      try {
        await setDoc(doc(db, "perfumes", id), {
          // Defaults primero: si quien llama (PerfumeForm) ya trae `visible`
          // o `fichaPorConfirmar` propios en `datos`, el spread de abajo los
          // pisa a ellos, no al revés.
          visible: true,
          fichaPorConfirmar: false,
          ...datos,
          id,
          filaExcel: -1,
          eliminado: false,
          imagenEsPlaceholder: !datos.imagen,
          origen: "creado-en-panel",
          version: 1,
          modificadoEn: new Date().toISOString(),
          modificadoPor: sesion?.nombre ?? "desconocido",
        });
      } finally {
        marcarConfirmado(opId);
      }
      await registrarHistorial({ tipo: "perfume", descripcion: `Nuevo perfume: ${datos.marca} ${datos.nombre}` });
      return id;
    },
    [sesion, registrarHistorial, marcarPendiente, marcarConfirmado],
  );

  const editarPerfume = useCallback(
    async (id: string, patch: Partial<Perfume>) => {
      const perfume = buscarPerfume(id);
      if (!perfume) return;
      await actualizarPerfumeDoc(id, patch);
      await registrarHistorial({ tipo: "perfume", descripcion: `${perfume.marca} ${perfume.nombre}: ficha actualizada` });
    },
    [buscarPerfume, actualizarPerfumeDoc, registrarHistorial],
  );

  const eliminarPerfume = useCallback(
    async (id: string): Promise<{ ok: boolean; motivo?: string }> => {
      const perfume = buscarPerfume(id);
      if (!perfume) return { ok: false, motivo: "No se encontró el perfume." };

      const pedidoAbierto = pedidos.find(
        (ped) =>
          ped.items.some((it) => it.perfumeId === id) &&
          (ped.estado === "consulta" || ped.estado === "confirmado"),
      );
      if (pedidoAbierto) {
        return {
          ok: false,
          motivo: `No se puede eliminar: tiene un pedido abierto (${pedidoAbierto.cliente}). Podés ocultarlo del catálogo en su lugar.`,
        };
      }

      await actualizarPerfumeDoc(id, { eliminado: true });
      await registrarHistorial({
        tipo: "perfume",
        descripcion: `${perfume.marca} ${perfume.nombre}: eliminado`,
        inverso: { tipo: "flag", perfumeId: id, campo: "eliminado", valor: false },
      });
      return { ok: true };
    },
    [buscarPerfume, pedidos, actualizarPerfumeDoc, registrarHistorial],
  );

  // Conflicto: dos ediciones offline que chocaron (ver functions/src/index.ts
  // ::detectarConflictos). El Dueño elige cuál valor se queda; el otro se
  // descarta explícitamente (nunca en silencio).
  const resolverConflicto = useCallback(
    async (conflictoId: string, aplicarValorB: boolean) => {
      const db = getFirebaseDb();
      const conflicto = conflictos.find((c) => c.id === conflictoId);
      if (!conflicto) return;
      if (aplicarValorB) {
        await actualizarPerfumeDoc(conflicto.perfumeId, { [conflicto.campo]: conflicto.valorB });
      }
      await updateDoc(doc(db, "conflictos", conflictoId), { resuelto: true });
      await registrarHistorial({
        tipo: "perfume",
        descripcion: `Conflicto en "${conflicto.campo}" resuelto: se mantuvo el valor de ${
          aplicarValorB ? conflicto.autorB : conflicto.autorA
        }`,
      });
    },
    [conflictos, actualizarPerfumeDoc, registrarHistorial],
  );

  // ---------------------------------------------------------------------
  // Pedidos
  // ---------------------------------------------------------------------
  const registrarPedido = useCallback(
    async (datos: Omit<Pedido, "id" | "fecha" | "autor" | "estado" | "pago"> & { estado?: EstadoPedido }) => {
      if (!sesion) return;
      const db = getFirebaseDb();
      const id = idAleatorio("pedido");
      const estadoPedido = datos.estado ?? "consulta";
      const opId = `pedido:${id}`;
      marcarPendiente(opId);
      try {
        await setDoc(doc(db, "pedidos", id), {
          ...datos,
          id,
          fecha: new Date().toISOString(),
          autor: sesion.nombre,
          estado: estadoPedido,
          pago: "pendiente",
        });
      } finally {
        marcarConfirmado(opId);
      }
      await registrarHistorial({
        tipo: "pedido",
        descripcion: `Nuevo pedido de ${datos.cliente} (${datos.items.length} ${
          datos.items.length === 1 ? "artículo" : "artículos"
        })`,
      });
      if (estadoPedido === "confirmado") {
        for (const it of datos.items) {
          await registrarMovimientoStock(it.perfumeId, it.ml, -it.cantidad, `Pedido de ${datos.cliente}`);
        }
      }
    },
    [sesion, registrarHistorial, registrarMovimientoStock, marcarPendiente, marcarConfirmado],
  );

  const actualizarEstadoPedido = useCallback(
    async (id: string, estadoNuevo: EstadoPedido, pago?: EstadoPago) => {
      const pedido = pedidos.find((p) => p.id === id);
      if (!pedido) return;
      const db = getFirebaseDb();
      const estadoAnterior = pedido.estado;
      const yaDescontado = estadoAnterior === "confirmado" || estadoAnterior === "entregado";
      const debeDescontar = estadoNuevo === "confirmado" || estadoNuevo === "entregado";

      if (!yaDescontado && debeDescontar) {
        for (const it of pedido.items) {
          await registrarMovimientoStock(it.perfumeId, it.ml, -it.cantidad, `Pedido de ${pedido.cliente}`);
        }
      } else if (yaDescontado && estadoNuevo === "cancelado") {
        for (const it of pedido.items) {
          await registrarMovimientoStock(it.perfumeId, it.ml, it.cantidad, `Cancelación de pedido de ${pedido.cliente}`);
        }
      }

      const opId = `pedido-estado:${id}:${Date.now()}`;
      marcarPendiente(opId);
      try {
        await updateDoc(doc(db, "pedidos", id), { estado: estadoNuevo, pago: pago ?? pedido.pago });
      } finally {
        marcarConfirmado(opId);
      }
      await registrarHistorial({
        tipo: "pedido",
        descripcion: `Pedido de ${pedido.cliente}: ${estadoAnterior} → ${estadoNuevo}`,
        inverso: { tipo: "pedidoEstado", pedidoId: id, estado: estadoAnterior, pago: pedido.pago },
      });
    },
    [pedidos, registrarMovimientoStock, registrarHistorial, marcarPendiente, marcarConfirmado],
  );

  // ---------------------------------------------------------------------
  // Negocio
  // ---------------------------------------------------------------------
  const actualizarNegocio = useCallback(
    async (patch: NegocioOverride) => {
      const db = getFirebaseDb();
      const opId = `negocio:${Date.now()}`;
      marcarPendiente(opId);
      try {
        await setDoc(doc(db, "negocio", "config"), patch, { merge: true });
      } finally {
        marcarConfirmado(opId);
      }
      await registrarHistorial({ tipo: "negocio", descripcion: "Datos del negocio actualizados" });
    },
    [registrarHistorial, marcarPendiente, marcarConfirmado],
  );

  // ---------------------------------------------------------------------
  // Usuarios (Dueño)
  // ---------------------------------------------------------------------
  const invitarUsuario = useCallback(
    async (nombre: string, email: string, rol: Rol) => {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      const emailNorm = email.trim().toLowerCase();

      // El doc real en usuarios/{uid} lo crea la Cloud Function al primer
      // login (functions/src/index.ts::alCrearUsuario, dispara antes de que
      // exista la cuenta de Auth) — acá solo dejamos la "reserva" con el
      // rol que le corresponde cuando entre.
      await setDoc(doc(db, "invitaciones", emailNorm), {
        nombre,
        rol,
        invitadoEn: new Date().toISOString(),
        creadoPor: sesion?.nombre ?? "",
      });
      await sendSignInLinkToEmail(auth, emailNorm, {
        url: `${window.location.origin}/panel/login`,
        handleCodeInApp: true,
      });

      const texto = encodeURIComponent(
        `Te invité al panel de ${negocio.nombreNegocio ?? "el negocio"}. Revisá tu email ` +
          `(${emailNorm}) y tocá el link para entrar — no hace falta contraseña.`,
      );
      return { whatsappUrl: `https://wa.me/?text=${texto}` };
    },
    [sesion, negocio.nombreNegocio],
  );

  const cambiarRolUsuario = useCallback(async (id: string, rol: Rol) => {
    const db = getFirebaseDb();
    await updateDoc(doc(db, "usuarios", id), { rol });
  }, []);

  const desactivarUsuario = useCallback(
    async (id: string) => {
      const db = getFirebaseDb();
      const usuario = usuarios.find((u) => u.id === id);
      if (!usuario) return;
      await updateDoc(doc(db, "usuarios", id), { activo: !usuario.activo });
    },
    [usuarios],
  );

  // ---------------------------------------------------------------------
  // Historial / deshacer
  // ---------------------------------------------------------------------
  const deshacerEntry = useCallback(
    async (id: string) => {
      const entrada = historial.find((h) => h.id === id);
      if (!entrada || !entrada.inverso || entrada.deshecho) return;
      const inv = entrada.inverso;
      const db = getFirebaseDb();

      if (inv.tipo === "tamano") {
        const perfume = buscarPerfume(inv.perfumeId);
        if (perfume) {
          const nuevosTamanos = perfume.tamanos.map((t) =>
            t.ml === inv.ml ? { ...t, precio: inv.precio, stock: inv.stock } : t,
          );
          await actualizarPerfumeDoc(inv.perfumeId, { tamanos: nuevosTamanos });
        }
      } else if (inv.tipo === "flag") {
        await actualizarPerfumeDoc(inv.perfumeId, { [inv.campo]: inv.valor });
      } else if (inv.tipo === "pedidoEstado") {
        await updateDoc(doc(db, "pedidos", inv.pedidoId), { estado: inv.estado, pago: inv.pago });
      } else if (inv.tipo === "movimiento") {
        // Compensa con un movimiento inverso — nunca se edita/borra el
        // original (ledger append-only, ver firestore.rules).
        const mov = movimientos.find((m) => m.id === inv.movimientoId);
        if (mov) await registrarMovimientoStock(mov.perfumeId, mov.ml, -mov.delta, "Deshacer");
      }

      await updateDoc(doc(db, "historial", id), { deshecho: true });
    },
    [historial, movimientos, buscarPerfume, actualizarPerfumeDoc, registrarMovimientoStock],
  );

  // ---------------------------------------------------------------------
  // Fotos (Fase 4) — ver src/panel/colaFotos.ts. La ficha se actualiza sola
  // cuando la Cloud Function termina de procesar (onSnapshot de `perfumes`
  // ya la trae), esto solo encola/sube el original.
  // ---------------------------------------------------------------------
  const subirFoto = useCallback(async (perfumeId: string, archivo: File, tipo: TipoFoto) => {
    await encolarFoto(perfumeId, tipo, archivo);
    setColaFotosPendientes(await contarFotosPendientes());
  }, []);

  // ---------------------------------------------------------------------
  const estado: EstadoPanel = useMemo(
    () => ({
      sesion,
      pedidos,
      movimientos,
      usuarios,
      historial,
      negocio,
      catalogoActualizadoEn,
      pendientes,
    }),
    [sesion, pedidos, movimientos, usuarios, historial, negocio, catalogoActualizadoEn, pendientes],
  );

  const valor: PanelContexto = {
    estado,
    listo: listo || !firebaseConfigurado,
    configurado: firebaseConfigurado,
    online,
    simulandoSinConexion,
    alternarSimulacionSinConexion: () => setSimulandoSinConexion((v) => !v),
    perfumes,
    conflictos,
    sesion,
    estadoAuth,
    errorAuth,
    enviarLinkDeAcceso,
    cerrarSesion,
    actualizarTamano,
    registrarMovimientoStock,
    alternarVisible,
    alternarDestacado,
    accionMasiva,
    cambiarPreciosMasivo,
    crearPerfume,
    editarPerfume,
    eliminarPerfume,
    resolverConflicto,
    registrarPedido,
    actualizarEstadoPedido,
    actualizarNegocio,
    invitarUsuario,
    cambiarRolUsuario,
    desactivarUsuario,
    deshacerEntry,
    subirFoto,
    colaFotosPendientes,
  };

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePanel(): PanelContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("usePanel debe usarse dentro de <PanelProvider>");
  return ctx;
}
