"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePanel } from "@/panel/store";
import { calcularMetricas } from "@/panel/metricas";
import {
  IconoCatalogo,
  IconoCompartir,
  IconoHistorial,
  IconoInicio,
  IconoNegocio,
  IconoPedidos,
  IconoStock,
  IconoUsuarios,
} from "./iconos";

type Item = {
  href: string;
  etiqueta: string;
  icono: (p: { className?: string }) => React.ReactElement;
  contador?: number;
  puntoUrgente?: boolean;
  soloDueno?: boolean;
};

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Sidebar({ colapsado }: { colapsado: boolean }) {
  const pathname = usePathname();
  const { perfumes, estado, sesion, cerrarSesion } = usePanel();
  const metricas = calcularMetricas(perfumes, estado.pedidos);
  const esDueno = sesion?.rol === "dueño";

  const itemsTrabajo: Item[] = [
    { href: "/panel", etiqueta: "Inicio", icono: IconoInicio },
    { href: "/panel/catalogo", etiqueta: "Catálogo", icono: IconoCatalogo, contador: perfumes.length },
    {
      href: "/panel/stock",
      etiqueta: "Stock",
      icono: IconoStock,
      contador: metricas.agotados,
      puntoUrgente: metricas.agotados > 0,
    },
    { href: "/panel/pedidos", etiqueta: "Pedidos", icono: IconoPedidos, contador: metricas.pedidosPendientes },
    { href: "/panel/compartir", etiqueta: "Compartir catálogo", icono: IconoCompartir },
  ];

  const itemsAdmin: Item[] = [
    { href: "/panel/negocio", etiqueta: "Datos del negocio", icono: IconoNegocio, soloDueno: true },
    { href: "/panel/usuarios", etiqueta: "Usuarios", icono: IconoUsuarios, soloDueno: true },
    { href: "/panel/historial", etiqueta: "Historial", icono: IconoHistorial },
  ];

  const activo = (href: string) => (href === "/panel" ? pathname === "/panel" : pathname.startsWith(href));

  const renderItem = (item: Item) => {
    const bloqueado = item.soloDueno && !esDueno;
    const esActivo = activo(item.href);

    const contenido = (
      <>
        <span className="flex items-center gap-3">
          <item.icono className="h-[15px] w-[15px] flex-none" />
          <span className="whitespace-nowrap">{item.etiqueta}</span>
        </span>
        {item.contador !== undefined && (
          <span className="inline-flex items-center gap-1.5">
            {item.puntoUrgente && <span className="h-1.5 w-1.5 rounded-full bg-danger" />}
            <span className="text-[12px] tabular-nums text-muted">{item.contador}</span>
          </span>
        )}
      </>
    );

    const clases = `flex items-center justify-between gap-2 px-5 py-2.5 text-[14px] no-underline transition-colors ${
      esActivo
        ? "border-l-[3px] border-ink bg-surface-alt pl-[17px] font-medium text-ink"
        : bloqueado
          ? "cursor-not-allowed text-muted/50"
          : "text-ink hover:bg-surface-alt/60"
    }`;

    if (bloqueado) {
      return (
        <span key={item.href} className={clases} title="Solo el dueño puede ver esta sección">
          {contenido}
        </span>
      );
    }

    return (
      <Link key={item.href} href={item.href} className={clases}>
        {contenido}
      </Link>
    );
  };

  return (
    <nav
      className={`flex flex-none flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-200 ${
        colapsado ? "w-0 border-r-0" : "w-[232px]"
      }`}
    >
      <div className="w-[232px] flex-1 flex flex-col">
        <div className="border-b border-border px-5 py-[18px] pt-[22px]">
          <p className="eyebrow text-accent">Panel</p>
          <p className="mt-2 font-serif text-2xl font-medium leading-tight text-ink">
            {estado.negocio.nombreNegocio ?? "Nombre del Negocio"}
          </p>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-4">
          <p className="eyebrow px-5 pb-2.5 text-muted">Trabajo diario</p>
          {itemsTrabajo.map(renderItem)}

          <div className="my-4 mx-5 h-px bg-border" />

          <p className="eyebrow px-5 pb-2.5 text-muted">Administración</p>
          {itemsAdmin.map(renderItem)}
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-border px-5 py-4">
          <div className="flex h-[34px] w-[34px] flex-none items-center justify-center bg-ink text-[13px] font-medium text-background">
            {iniciales(sesion?.nombre ?? "?")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{sesion?.nombre}</p>
            <p className="eyebrow mt-0.5 text-accent">{sesion?.rol === "dueño" ? "Dueño" : "Empleado"}</p>
          </div>
          <button
            type="button"
            onClick={cerrarSesion}
            className="eyebrow flex-none text-muted transition-colors hover:text-ink"
            title="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
