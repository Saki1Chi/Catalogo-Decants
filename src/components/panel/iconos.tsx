// Set chico de íconos de línea fina (trazo 1.5, sin relleno) — mismo lenguaje
// que el resto del sitio. Un solo archivo porque son puramente decorativos.
type Props = { className?: string };

const base = "none" as const;

function Svg({ className, children, viewBox = "0 0 18 18" }: Props & { children: React.ReactNode; viewBox?: string }) {
  return (
    <svg
      viewBox={viewBox}
      fill={base}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconoInicio(p: Props) {
  return (
    <Svg {...p}>
      <path d="M2 7.5 9 2l7 5.5V16H2z" />
    </Svg>
  );
}

export function IconoCatalogo(p: Props) {
  return (
    <Svg {...p}>
      <rect x="2" y="2" width="6" height="6" />
      <rect x="10" y="2" width="6" height="6" />
      <rect x="2" y="10" width="6" height="6" />
      <rect x="10" y="10" width="6" height="6" />
    </Svg>
  );
}

export function IconoStock(p: Props) {
  return (
    <Svg {...p}>
      <rect x="3" y="5" width="12" height="11" />
      <path d="M6 5V2h6v3" />
    </Svg>
  );
}

export function IconoPedidos(p: Props) {
  return (
    <Svg {...p}>
      <path d="M2 4h14M2 9h14M2 14h9" />
    </Svg>
  );
}

export function IconoCompartir(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="14" cy="4" r="2" />
      <circle cx="4" cy="9" r="2" />
      <circle cx="14" cy="14" r="2" />
      <path d="M6 8l6-3M6 10l6 3" />
    </Svg>
  );
}

export function IconoNegocio(p: Props) {
  return (
    <Svg {...p}>
      <path d="M3 16V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12" />
      <path d="M11 8h4v8" />
      <path d="M6 6h2M6 9h2M6 12h2" />
    </Svg>
  );
}

export function IconoUsuarios(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="6.5" cy="6" r="2.5" />
      <path d="M2 15c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
      <circle cx="13" cy="6.5" r="2" />
      <path d="M11 15c0-2 1.5-3.4 3.5-3.4S16 13 16 15" />
    </Svg>
  );
}

export function IconoHistorial(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="9" cy="9" r="7" />
      <path d="M9 5.5V9l3 2" />
    </Svg>
  );
}

export function IconoMenu(p: Props) {
  return (
    <Svg {...p}>
      <path d="M2.5 5h13M2.5 9h13M2.5 13h13" />
    </Svg>
  );
}

export function IconoBuscar(p: Props) {
  return (
    <Svg {...p} viewBox="0 0 14 14">
      <circle cx="6" cy="6" r="4.5" />
      <path d="M9.5 9.5 13 13" />
    </Svg>
  );
}

export function IconoX(p: Props) {
  return (
    <Svg {...p} viewBox="0 0 9 9">
      <path d="M1 1l7 7M8 1l-7 7" />
    </Svg>
  );
}

export function IconoCheck(p: Props) {
  return (
    <Svg {...p} viewBox="0 0 9 7">
      <path d="M1 3.5 3.5 6 8 1" />
    </Svg>
  );
}

export function IconoChevronAbajo(p: Props) {
  return (
    <Svg {...p} viewBox="0 0 10 6">
      <path d="M1 1l4 4 4-4" />
    </Svg>
  );
}

export function IconoAlerta(p: Props) {
  return (
    <Svg {...p} viewBox="0 0 11 11">
      <circle cx="5.5" cy="5.5" r="4.5" />
      <path d="M5.5 3v3.2M5.5 8.2v.3" />
    </Svg>
  );
}

export function IconoFrasco(p: Props) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill={base}
      stroke="#c6bdaf"
      strokeWidth="6"
      strokeLinejoin="round"
      className={p.className}
      aria-hidden="true"
    >
      <rect x="49" y="8" width="22" height="18" />
      <path d="M53 26h14v9H53z" />
      <path d="M55 35h10v8H55z" />
      <path d="M42 43h36a10 10 0 0 1 10 10v83a10 10 0 0 1-10 10H42a10 10 0 0 1-10-10V53a10 10 0 0 1 10-10Z" />
      <rect x="45" y="74" width="30" height="34" opacity="0.5" />
      <path d="M52 86h16M52 94h10" opacity="0.5" />
    </svg>
  );
}
