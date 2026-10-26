"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePanel } from "@/panel/store";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Toast } from "./Toast";
import { StockAdjustModal } from "./StockAdjustModal";
import { RegisterOrderModal } from "./RegisterOrderModal";

export function PanelShell({ children }: { children: React.ReactNode }) {
  const { sesion, estadoAuth } = usePanel();
  const router = useRouter();
  const [colapsado, setColapsado] = useState(false);
  const [modal, setModal] = useState<"stock" | "pedido" | null>(null);

  // La sesión se carga async (onAuthStateChanged + doc de usuarios/{uid} en
  // Firestore, ver PanelProvider) — recién cuando `estadoAuth` sale de
  // "cargando"/"creando-cuenta" sabemos si hay sesión de verdad o no, así
  // que solo ahí decidimos si redirigir al login. Antes esto era un
  // setTimeout(60ms) fijo, que asumía que localStorage siempre respondía
  // rápido; con Firebase (red real de por medio) eso podía rebotar a
  // alguien con sesión válida antes de que terminara de cargar.
  const listoParaDecidir = estadoAuth === "con-sesion" || estadoAuth === "sin-sesion";

  useEffect(() => {
    // Arranca colapsada en pantallas angostas (celular): 232px de sidebar fija
    // no deja espacio útil por debajo de ~1024px. Es solo el punto de partida
    // — el botón de la topbar sigue alternándola en cualquier tamaño.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura de window, solo existe en cliente
    setColapsado(window.innerWidth < 1024);
  }, []);

  useEffect(() => {
    if (listoParaDecidir && !sesion) {
      router.replace("/panel/login");
    }
  }, [listoParaDecidir, sesion, router]);

  const alternarColapso = () => setColapsado((prev) => !prev);

  if (!sesion) {
    return <div className="flex min-h-screen items-center justify-center bg-background" />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar colapsado={colapsado} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            colapsado={colapsado}
            onToggleSidebar={alternarColapso}
            onAjustarStock={() => setModal("stock")}
            onRegistrarPedido={() => setModal("pedido")}
          />
          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>

      {modal === "stock" && <StockAdjustModal onClose={() => setModal(null)} />}
      {modal === "pedido" && <RegisterOrderModal onClose={() => setModal(null)} />}
      <Toast />
    </div>
  );
}
