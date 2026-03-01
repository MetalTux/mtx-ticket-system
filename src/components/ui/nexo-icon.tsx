// src/components/ui/nexo-icon.tsx
export default function NexoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 90 90" // Ajustado para que el símbolo esté centrado
      className={`${className} text-nexo-dark dark:text-nexo-light`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <g transform="translate(5, 5)">
        {/* Cuerpo de la N estructural */}
        <path
          d="M10,5 V75 L40,45 V75 M40,5 V35 L70,5 V75"
          className="stroke-current"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Nodos de Conexión en los vértices */}
        <circle cx="10" cy="5" r="9" className="fill-current" />
        <circle cx="70" cy="5" r="9" className="fill-current" />
        <circle cx="10" cy="75" r="9" className="fill-current" />
        <circle cx="70" cy="75" r="9" className="fill-current" />
      </g>
    </svg>
  );
}