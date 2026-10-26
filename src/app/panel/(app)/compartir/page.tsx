"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePanel } from "@/panel/store";
import { tiempoRelativo } from "@/panel/format";
import { paraCatalogoPublico } from "@/panel/merge";
import { descargarPreciosCSV, descargarRespaldoJSON } from "@/panel/backup";

export default function PanelCompartirPage() {
  const { perfumes, estado, sesion } = usePanel();
  const [url, setUrl] = useState("");
  const [copiado, setCopiado] = useState(false);
  const visibles = paraCatalogoPublico(perfumes).length;
  const ocultos = perfumes.length - visibles;

  useEffect(() => {
    // Lectura de window.location: solo existe en el cliente. Se hace en un
    // efecto (no en el render) para que el HTML exportado y la primera
    // hidratación coincidan.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(window.location.origin + "/");
  }, []);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Portapapeles bloqueado: no es crítico, el link sigue visible para copiar a mano.
    }
  };

  const mensajeWhatsApp = encodeURIComponent(
    `Mirá nuestro catálogo de decants: ${url}`,
  );
  const qrSrc = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(url)}`
    : "";

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-12 pt-6 lg:px-8">
      <p className="eyebrow text-accent">Catálogo público</p>
      <h1 className="mt-2.5 font-serif text-[34px] font-light leading-none text-ink">Compartir catálogo</h1>
      <p className="mt-3 text-[13px] text-muted">
        Actualizado {tiempoRelativo(estado.catalogoActualizadoEn)} · {visibles} perfumes visibles
        {ocultos > 0 && ` · ${ocultos} ocultos`}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <div className="border border-border bg-surface p-5">
            <p className="eyebrow text-muted">Link del catálogo</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <code className="min-w-0 flex-1 truncate border border-border bg-background px-3 py-2.5 text-[13px] text-ink">
                {url || "cargando…"}
              </code>
              <button
                type="button"
                onClick={copiar}
                className="eyebrow flex-none border border-ink px-4 py-2.5 text-ink transition-colors hover:bg-ink hover:text-background"
              >
                {copiado ? "Copiado" : "Copiar link"}
              </button>
            </div>
            <a
              href={`https://wa.me/?text=${mensajeWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow mt-3.5 inline-block border border-ink bg-ink px-4 py-2.5 text-background transition-colors hover:bg-transparent hover:text-ink"
            >
              Enviar por WhatsApp
            </a>
          </div>

          <div className="border border-border bg-surface p-5">
            <p className="eyebrow text-muted">Cómo instalarlo como app</p>
            <ol className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink">
              <li>1. Abrir el link del catálogo desde el navegador del celular.</li>
              <li>2. Tocar el menú (⋮ en Android, compartir en iPhone).</li>
              <li>3. Elegir &quot;Agregar a pantalla de inicio&quot; o &quot;Instalar app&quot;.</li>
            </ol>
            <p className="mt-3 text-[12px] text-muted">
              Una vez instalado, se puede abrir sin internet con la última versión descargada.
            </p>
          </div>

          {sesion?.rol === "dueño" && (
            <div className="border border-border bg-surface p-5">
              <p className="eyebrow text-muted">Respaldo</p>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                Una copia de todo el catálogo, guardada fuera de la nube. No reemplaza la carga
                diaria desde el panel — es solo para tener a mano.
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => descargarRespaldoJSON(perfumes)}
                  className="eyebrow border border-ink px-4 py-2.5 text-ink transition-colors hover:bg-ink hover:text-background"
                >
                  Respaldo completo (JSON)
                </button>
                <button
                  type="button"
                  onClick={() => descargarPreciosCSV(perfumes)}
                  className="eyebrow border border-border px-4 py-2.5 text-muted transition-colors hover:border-ink hover:text-ink"
                >
                  Solo precios (Excel/CSV)
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border border-border bg-surface p-6 text-center">
          <p className="eyebrow text-muted">Código QR</p>
          {qrSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrSrc} alt="Código QR del catálogo" className="mx-auto mt-4 h-[180px] w-[180px]" />
          )}
          <Link
            href="/panel/afiche"
            className="eyebrow mt-4 block border border-ink px-4 py-2.5 text-ink transition-colors hover:bg-ink hover:text-background"
          >
            Ver afiche para imprimir
          </Link>
        </div>
      </div>
    </div>
  );
}
