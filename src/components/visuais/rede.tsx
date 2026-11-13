"use client";
import { motion, useReducedMotion } from "motion/react";

const ROTAS = [
  { d: "M 95 190 C 205 190, 270 120, 400 210 C 510 285, 575 195, 705 220", cor: "var(--marca-primary)", tempo: 3.8, traco: "110 420", largura: "3.5", de: 530, para: 0 },
  { d: "M 245 75 C 320 110, 340 165, 400 210 C 460 255, 535 320, 665 340", cor: "var(--secondary)", tempo: 5.2, traco: "90 390", largura: "3", de: 480, para: 0 },
  { d: "M 155 335 C 255 320, 320 255, 400 210 C 480 165, 535 100, 650 90", cor: "var(--marca-primary)", tempo: 4.4, traco: "85 400", largura: "3", de: 0, para: -485 },
];
const PONTOS = [
  [95, 190, 0], [245, 75, 1], [400, 210, 0], [705, 220, 0],
  [650, 90, 1], [155, 335, 1], [665, 340, 0],
];

export function VisualRede() {
  const movimentoReduzido = useReducedMotion();
  return (
    <svg
      viewBox="0 0 800 420"
      className="h-full max-h-[360px] w-full object-contain opacity-95"
      role="img"
      aria-label="Ilustração de uma rede conectada"
    >
      <defs>
        <filter id="rede-brilho" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g fill="none" stroke="var(--marca-superficie-texto-suave)" strokeOpacity="0.13" strokeWidth="1.5" strokeDasharray="4 6">
        <path d="M 60 90 L 250 90 L 340 165 L 700 165" />
        <path d="M 110 340 L 290 250 L 530 250 L 720 190" />
        <path d="M 240 40 L 240 190 L 420 310 L 420 390" />
        <path d="M 560 45 L 470 160 L 610 295 L 690 375" />
      </g>
      <circle cx="400" cy="210" r="44" fill="none" stroke="var(--marca-primary)" strokeOpacity="0.2" strokeDasharray="5 5" />
      <circle cx="400" cy="210" r="88" fill="none" stroke="var(--marca-primary)" strokeOpacity="0.11" />
      <circle cx="400" cy="210" r="138" fill="none" stroke="var(--secondary)" strokeOpacity="0.08" />
      {ROTAS.map((rota) => (
        <g key={rota.d} fill="none" strokeLinecap="round">
          <path d={rota.d} stroke={rota.cor} strokeWidth={rota.largura} opacity="0.2" />
          <motion.path d={rota.d} stroke={rota.cor} strokeWidth={rota.largura} strokeDasharray={rota.traco} filter="url(#rede-brilho)"
            initial={false}
            animate={movimentoReduzido ? { strokeDashoffset: 0 } : { strokeDashoffset: [rota.de, rota.para] }}
            transition={{ duration: rota.tempo, repeat: Infinity, ease: "linear" }} />
        </g>
      ))}
      {PONTOS.map(([x, y, alternativa], i) => {
        const cor = alternativa ? "var(--secondary)" : "var(--marca-primary)";
        const raioMin = i === 2 ? 12 : 7;
        const raioMax = i === 2 ? 24 : 14;
        return <g key={`${x}-${y}`} transform={`translate(${x}, ${y})`}>
          <motion.circle fill={cor} initial={false}
            animate={movimentoReduzido ? { r: raioMin, opacity: 0.16 } : { r: [raioMin, raioMax, raioMin], opacity: [0.28, 0.04, 0.28] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
          <circle r={i === 2 ? 6.5 : 4.5} fill={cor} filter="url(#rede-brilho)" />
          <circle r={i === 2 ? 3 : 2} fill="var(--marca-superficie-1)" />
        </g>;
      })}
    </svg>
  );
}
