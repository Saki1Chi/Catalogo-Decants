// Frasco en line-art fino: mientras no haya fotografía real de producto, un
// trazo delgado y consistente sostiene mejor la página que una silueta rellena.
// TODO: cuando haya fotos, reemplazar por <Image> apuntando a /public.
export function BottleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
        {/* tapa */}
        <rect x="49" y="8" width="22" height="18" />
        <path d="M53 26h14v9H53z" />
        {/* cuello */}
        <path d="M55 35h10v8H55z" />
        {/* cuerpo */}
        <path d="M42 43h36a10 10 0 0 1 10 10v83a10 10 0 0 1-10 10H42a10 10 0 0 1-10-10V53a10 10 0 0 1 10-10Z" />
        {/* etiqueta */}
        <rect x="45" y="74" width="30" height="34" opacity="0.5" />
        <path d="M52 86h16M52 94h10" opacity="0.5" />
      </g>
      {/* reflejo: una sola banda vertical, muy tenue */}
      <rect
        x="38"
        y="52"
        width="6"
        height="86"
        fill="currentColor"
        opacity="0.07"
      />
    </svg>
  );
}
