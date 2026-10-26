import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export estático — sigue siendo válido con el backend real de fase 2:
  // Firebase (Firestore/Storage/Auth) se usa 100% por SDK cliente, sin API
  // routes de Next.js, así que no hace falta un servidor Next propio. Ver
  // src/lib/firebase.ts y design/panel-admin/05-backend.md.
  output: "export",
};

export default nextConfig;
