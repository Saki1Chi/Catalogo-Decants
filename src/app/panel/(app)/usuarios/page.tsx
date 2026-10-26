"use client";

import { useState } from "react";
import { usePanel } from "@/panel/store";
import { Rol } from "@/panel/types";
import { fechaHora } from "@/panel/format";
import { ListaVacia } from "@/components/panel/EstadosLista";

export default function PanelUsuariosPage() {
  const { sesion, estado, invitarUsuario, cambiarRolUsuario, desactivarUsuario } = usePanel();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<Rol>("empleado");
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invitando, setInvitando] = useState(false);

  if (sesion?.rol !== "dueño") {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-10 lg:px-8">
        <ListaVacia
          titulo="Solo el dueño puede ver esta sección"
          texto="Pedile a Alfredo que invite o gestione usuarios."
        />
      </div>
    );
  }

  const invitar = async () => {
    if (!nombre.trim() || !email.trim()) return;
    setError(null);
    setInvitando(true);
    try {
      const { whatsappUrl } = await invitarUsuario(nombre.trim(), email.trim(), rol);
      setWhatsappUrl(whatsappUrl);
      setNombre("");
      setEmail("");
    } catch {
      setError("No se pudo invitar — revisá el email e intentá de nuevo.");
    } finally {
      setInvitando(false);
    }
  };

  return (
    <div className="mx-auto max-w-[860px] px-6 pb-16 pt-6 lg:px-8">
      <p className="eyebrow text-accent">Solo dueño</p>
      <h1 className="mt-2.5 font-serif text-[34px] font-light leading-none text-ink">Usuarios</h1>

      <ul className="mt-6 divide-y divide-border border border-border bg-surface">
        {estado.usuarios.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
            <div className="flex h-9 w-9 flex-none items-center justify-center bg-ink text-[12px] font-medium text-background">
              {u.nombre.split(" ").slice(0, 2).map((p) => p[0]).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-[14px] ${u.activo ? "text-ink" : "text-muted line-through"}`}>{u.nombre}</p>
              <p className="mt-1 text-[12px] text-muted">Desde {fechaHora(u.invitadoEn)}</p>
            </div>
            <select
              value={u.rol}
              onChange={(e) => cambiarRolUsuario(u.id, e.target.value as Rol)}
              disabled={u.id === sesion.uid}
              className="border border-border bg-surface px-2.5 py-1.5 text-[12px] text-ink focus:border-ink focus:outline-none disabled:opacity-50"
            >
              <option value="dueño">Dueño</option>
              <option value="empleado">Empleado</option>
            </select>
            <button
              type="button"
              onClick={() => desactivarUsuario(u.id)}
              disabled={u.id === sesion.uid}
              className="eyebrow border border-border px-3 py-1.5 text-muted transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              {u.activo ? "Desactivar" : "Reactivar"}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 border border-border bg-surface p-5">
        <p className="eyebrow text-muted">Invitar usuario</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            className="min-w-[180px] flex-1 border border-border bg-background px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            className="min-w-[200px] flex-1 border border-border bg-background px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          />
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value as Rol)}
            className="border border-border bg-background px-3 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          >
            <option value="empleado">Empleado</option>
            <option value="dueño">Dueño</option>
          </select>
          <button
            type="button"
            onClick={invitar}
            disabled={invitando}
            className="eyebrow border border-ink bg-ink px-4 py-2.5 text-background transition-colors hover:bg-transparent hover:text-ink disabled:opacity-50"
          >
            {invitando ? "Invitando…" : "Invitar"}
          </button>
        </div>

        {error && <p className="mt-3 text-[12px] text-danger">{error}</p>}

        {whatsappUrl && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-[12px] text-muted">
              Le mandamos un email con el link de acceso. Avisale por WhatsApp para que lo revise:
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block eyebrow border border-ink px-3 py-2 text-ink transition-colors hover:bg-ink hover:text-background"
            >
              Abrir WhatsApp
            </a>
          </div>
        )}
      </div>

      <p className="mt-5 text-[12px] leading-relaxed text-muted">
        La invitación manda un email real con el link de acceso — sin contraseña. Solo entra
        quien haya sido invitado desde acá (o quien esté configurado como dueño inicial).
      </p>
    </div>
  );
}
