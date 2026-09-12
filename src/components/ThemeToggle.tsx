"use client";

// El estado visual del botón lo resuelve el CSS a partir de `data-tema` en
// <html> (ver .icono-sol / .icono-luna en globals.css). Por eso este componente
// no guarda estado en React: el markup es idéntico en servidor y cliente, no
// hay hydration mismatch ni un icono equivocado durante el primer frame.
export function ThemeToggle() {
  const alternar = () => {
    const raiz = document.documentElement;
    const actual =
      raiz.dataset.tema ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    const siguiente = actual === "dark" ? "light" : "dark";

    raiz.dataset.tema = siguiente;
    try {
      localStorage.setItem("tema", siguiente);
    } catch {
      // Modo privado o storage bloqueado: el tema igual cambia en esta pestaña.
    }
  };

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label="Cambiar entre modo claro y oscuro"
      title="Cambiar entre modo claro y oscuro"
      className="border border-border p-2.5 text-ink transition-colors hover:border-ink"
    >
      <svg
        viewBox="0 0 24 24"
        className="icono-luna h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 13.2A8.2 8.2 0 0 1 10.8 4a8.2 8.2 0 1 0 9.2 9.2Z" />
      </svg>

      <svg
        viewBox="0 0 24 24"
        className="icono-sol h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.1 5.1l1.4 1.4M17.5 17.5l1.4 1.4M18.9 5.1l-1.4 1.4M6.5 17.5l-1.4 1.4" />
      </svg>
    </button>
  );
}
