// src/components/ui/client-loading-wrapper.tsx
"use client";

import { useState, useEffect } from "react";
import SplashScreen from "./splash-screen";

export default function ClientLoadingWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulamos una carga inicial de 2 segundos para mostrar la marca
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <SplashScreen />}
      <div className={loading ? "hidden" : "block animate-in fade-in duration-700"}>
        {children}
      </div>
    </>
  );
}