"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePanel } from "@/panel/store";

// Fuera del grupo (app) a propósito: sin sidebar ni topbar, para que
// "Imprimir" (tamaño carta) no incluya el cromo del panel.
export default function PanelAfichePage() {
  const { estado } = usePanel();
  const [url, setUrl] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- window.location solo existe en cliente
    setUrl(window.location.origin + "/");
  }, []);

  const qrSrc = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=10&data=${encodeURIComponent(url)}`
    : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 print:hidden">
        <Link href="/panel/compartir" className="eyebrow link-underline text-ink">
          ← Volver
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="eyebrow border border-ink bg-ink px-4 py-2.5 text-background transition-colors hover:bg-transparent hover:text-ink"
        >
          Imprimir
        </button>
      </div>

      <div className="mx-auto my-10 flex aspect-[8.5/11] w-full max-w-[680px] flex-col items-center justify-center border border-border bg-surface px-10 py-16 text-center print:m-0 print:h-screen print:w-screen print:max-w-none print:border-0">
        <p className="eyebrow text-accent">
          {estado.negocio.eslogan ?? "Decants originales de las casas que ya conocés"}
        </p>
        <h1 className="mt-6 font-serif text-5xl font-light leading-tight text-ink">
          {estado.negocio.nombreNegocio ?? "Nombre del Negocio"}
        </h1>
        <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
          Escaneá el código para ver el catálogo completo de fragancias fraccionadas.
        </p>

        {qrSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrSrc} alt="Código QR del catálogo" className="mt-10 h-[220px] w-[220px]" />
        )}

        <p className="eyebrow mt-8 text-muted">Escaneá con la cámara de tu celular</p>
      </div>
    </div>
  );
}
