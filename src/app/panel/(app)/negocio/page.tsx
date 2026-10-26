"use client";

import { useState } from "react";
import { usePanel } from "@/panel/store";
import { siteConfig } from "@/data/site-config";
import { ListaVacia } from "@/components/panel/EstadosLista";

export default function PanelNegocioPage() {
  const { sesion, estado, actualizarNegocio } = usePanel();
  const [guardado, setGuardado] = useState(false);

  const [nombreNegocio, setNombreNegocio] = useState(estado.negocio.nombreNegocio ?? siteConfig.nombreNegocio);
  const [eslogan, setEslogan] = useState(estado.negocio.eslogan ?? siteConfig.eslogan);
  const [introHero, setIntroHero] = useState(estado.negocio.introHero ?? siteConfig.introHero);
  const [telefono, setTelefono] = useState(estado.negocio.contacto?.telefono ?? siteConfig.contacto.telefono);
  const [whatsapp, setWhatsapp] = useState(estado.negocio.contacto?.whatsapp ?? siteConfig.contacto.whatsapp);
  const [horario, setHorario] = useState(estado.negocio.contacto?.horario ?? siteConfig.contacto.horario);
  const [instagram, setInstagram] = useState(estado.negocio.redes?.instagram ?? siteConfig.redes.instagram);

  if (sesion?.rol !== "dueño") {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-10 lg:px-8">
        <ListaVacia
          titulo="Solo el dueño puede ver esta sección"
          texto="Pedile a Alfredo que haga este cambio, o que te cambie el rol si te corresponde."
        />
      </div>
    );
  }

  const guardar = () => {
    actualizarNegocio({
      nombreNegocio,
      eslogan,
      introHero,
      contacto: { telefono, whatsapp, horario },
      redes: { instagram },
    });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  return (
    <div className="mx-auto max-w-[860px] px-6 pb-16 pt-6 lg:px-8">
      <p className="eyebrow text-accent">Solo dueño</p>
      <h1 className="mt-2.5 font-serif text-[34px] font-light leading-none text-ink">Datos del negocio</h1>
      <p className="mt-3 text-[13px] text-muted">
        Esto es una vista de demostración: los cambios se guardan en este panel, pero todavía no se reflejan en el
        sitio público real (eso vive hoy en <code>src/data/site-config.ts</code>).
      </p>

      <div className="mt-6 space-y-5">
        <CampoNegocio etiqueta="Nombre del negocio" dondeAparece="Header, footer y barra lateral del panel">
          <input
            value={nombreNegocio}
            onChange={(e) => setNombreNegocio(e.target.value)}
            className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          />
        </CampoNegocio>

        <CampoNegocio etiqueta="Eslogan" dondeAparece="Hero de la portada">
          <input
            value={eslogan}
            onChange={(e) => setEslogan(e.target.value)}
            className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          />
        </CampoNegocio>

        <CampoNegocio etiqueta="Texto de introducción" dondeAparece="Debajo del titular del hero">
          <textarea
            value={introHero}
            onChange={(e) => setIntroHero(e.target.value)}
            rows={2}
            className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          />
        </CampoNegocio>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <CampoNegocio etiqueta="Teléfono" dondeAparece="Footer y sección de contacto">
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
            />
          </CampoNegocio>
          <CampoNegocio etiqueta="WhatsApp (solo dígitos)" dondeAparece="Botones de consulta del catálogo">
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] tabular-nums text-ink focus:border-ink focus:outline-none"
            />
          </CampoNegocio>
        </div>

        <CampoNegocio etiqueta="Horario" dondeAparece="Sección de contacto">
          <input
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          />
        </CampoNegocio>

        <CampoNegocio etiqueta="Instagram (usuario o URL)" dondeAparece="Footer">
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          />
        </CampoNegocio>

        <button
          type="button"
          onClick={guardar}
          className="eyebrow border border-ink bg-ink px-6 py-3.5 text-background transition-colors hover:bg-transparent hover:text-ink"
        >
          Guardar cambios
        </button>
        {guardado && <span className="ml-4 text-[13px] text-success">Guardado</span>}
      </div>
    </div>
  );
}

function CampoNegocio({
  etiqueta,
  dondeAparece,
  children,
}: {
  etiqueta: string;
  dondeAparece: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[12px] text-muted">{etiqueta}</span>
        <span className="text-[11px] text-accent">{dondeAparece}</span>
      </span>
      {children}
    </label>
  );
}
