// src/components/ui/gt-icon.tsx
export default function GTIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 160 90" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} transition-colors duration-300`}
    >
      {/* Definición del Gradiente Aqua/Cian para el efecto 'Nexo-Dark' */}
      <defs>
        <linearGradient id="gt-fluid-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" className="text-nexo-dark dark:text-nexo-light" style={{ stopColor: 'currentColor' }} />
          <stop offset="100%" className="text-slate-900 dark:text-white" style={{ stopColor: 'currentColor' }} />
        </linearGradient>
      </defs>

      {/* Trazo Fluido Único: La G se transforma en T suavemente */}
      <path
        d="M 65 30 C 65 15, 15 15, 15 45 C 15 75, 65 75, 65 60 V 45 H 45 M 65 45 Q 85 45, 95 30 L 140 30 M 117.5 30 V 75 Q 117.5 85, 107.5 85"
        stroke="url(#gt-fluid-gradient)"
        strokeWidth="10" // Grosor medio-alto para legibilidad y fluidez
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-95"
      />

      {/* Nodos de Ecosistema Integrados (Suaves y Redondos) */}
      {/* Nodo de entrada G (Soporte) */}
      <circle cx="65" cy="30" r="6.5" className="fill-nexo-dark dark:fill-nexo-light shadow-md" />
      {/* Nodo de salida G / Nexo Ecosistema (Punto clave) */}
      <circle cx="65" cy="45" r="7.5" className="fill-nexo-dark dark:fill-nexo-light shadow-lg" />
      {/* Nodo final T (Solución/Garantía) */}
      <circle cx="107.5" cy="85" r="6.5" className="fill-slate-900 dark:fill-white" />
    </svg>
  );
}