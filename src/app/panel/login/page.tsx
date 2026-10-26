"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePanel } from "@/panel/store";

export default function PanelLoginPage() {
  const { estado, sesion, estadoAuth, errorAuth, enviarLinkDeAcceso, configurado } = usePanel();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [linkEnviado, setLinkEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sesion) router.replace("/panel");
  }, [sesion, router]);

  const nombreNegocio = estado.negocio.nombreNegocio ?? "Nombre del Negocio";

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await enviarLinkDeAcceso(email);
      setLinkEnviado(true);
    } catch {
      setError("No se pudo enviar el link. Revisá el email e intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (!configurado) {
    return (
      <PantallaCentrada>
        <p className="eyebrow text-accent">Panel de gestión</p>
        <h1 className="mt-3 font-serif text-3xl font-light text-ink">Falta configurar Firebase</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          No hay credenciales en <code>.env.local</code>. Copiá{" "}
          <code>.env.local.example</code> y completá los valores del proyecto de Firebase
          (ver Configuración del proyecto en la consola de Firebase).
        </p>
      </PantallaCentrada>
    );
  }

  if (estadoAuth === "cargando") {
    return (
      <PantallaCentrada>
        <p className="text-[13px] text-muted">Cargando…</p>
      </PantallaCentrada>
    );
  }

  if (estadoAuth === "creando-cuenta") {
    return (
      <PantallaCentrada>
        <p className="eyebrow text-accent">Un momento</p>
        <h1 className="mt-3 font-serif text-3xl font-light text-ink">Configurando tu cuenta…</h1>
        <p className="mt-3 text-[13px] text-muted">Esto tarda unos segundos la primera vez.</p>
      </PantallaCentrada>
    );
  }

  if (linkEnviado) {
    return (
      <PantallaCentrada>
        <p className="eyebrow text-accent">Revisá tu email</p>
        <h1 className="mt-3 font-serif text-3xl font-light text-ink">Te mandamos un link a {email}</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          Tocá el link desde el mismo dispositivo (o confirmá el email si lo abrís en otro) y vas a
          entrar directo — no hace falta contraseña.
        </p>
        <button
          type="button"
          onClick={() => setLinkEnviado(false)}
          className="mt-6 text-[13px] text-accent underline-offset-4 hover:underline"
        >
          Usar otro email
        </button>
      </PantallaCentrada>
    );
  }

  return (
    <PantallaCentrada>
      <p className="eyebrow text-accent">Panel de gestión</p>
      <h1 className="mt-3 font-serif text-4xl font-light text-ink">{nombreNegocio}</h1>
      <p className="mt-3 text-[13px] text-muted">Ingresá tu email para recibir el link de acceso.</p>

      <form onSubmit={enviar} className="mt-8 space-y-4">
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-ink px-4 py-3 text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {enviando ? "Enviando…" : "Enviarme el link de acceso"}
        </button>
      </form>

      {(error || errorAuth) && (
        <p className="mt-4 text-[12px] text-danger">{error ?? errorAuth}</p>
      )}

      <p className="mt-6 text-center text-[12px] leading-relaxed text-muted">
        Solo entran las personas que Alfredo invitó desde Usuarios. Si todavía no te
        invitaron, pedile que lo haga y probá de nuevo.
      </p>
    </PantallaCentrada>
  );
}

function PantallaCentrada({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">{children}</div>
    </div>
  );
}
