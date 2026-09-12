import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/data/site-config";

// Contraste tipográfico deliberado: serif de alto contraste solo para display
// (títulos grandes), grotesca neutra para todo lo demás. La serif no se usa en
// tamaños chicos porque pierde legibilidad.
const heading = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${siteConfig.nombreNegocio} — Decants de perfume`,
  description: siteConfig.eslogan,
};

// Corre antes del primer paint: sin esto la página pinta en claro y salta a
// oscuro recién al hidratar React.
const scriptTema = `
try {
  var t = localStorage.getItem('tema');
  if (t !== 'dark' && t !== 'light') {
    t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.tema = t;
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${heading.variable} ${body.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
        {children}
      </body>
    </html>
  );
}
