// next.config.ts
import type { NextConfig } from "next";
import packageJson from "./package.json"; // Importamos el package para leer la versión dinámicamente

// Generamos la fecha de compilación en formato "27 jun 2026"
const buildDate = new Date().toLocaleDateString('es-CL', {
  day: '2-digit', 
  month: 'short', 
  year: 'numeric'
});

const nextConfig: NextConfig = {
  // Inyectamos las variables estáticas al momento de compilar
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_BUILD_DATE: buildDate,
  }
};

export default nextConfig;