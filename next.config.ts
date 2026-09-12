import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export estático — fase 1 no tiene rutas de servidor (API routes, server
  // actions), así que un sitio 100% estático es más fácil de hostear y evita
  // problemas de symlinks al deployar desde Windows. Sacar esta línea cuando
  // se agregue backend real (transacciones, pedidos, chat en vivo — fase 2).
  output: "export",
};

export default nextConfig;
