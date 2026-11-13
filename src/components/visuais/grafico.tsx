"use client";
import { motion } from "motion/react";

// Barras e linha de tendência, ilustrativas (não são dados reais).
const BARRAS = [42, 58, 50, 72, 64, 86, 78, 94];
const CORES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function VisualGrafico() {
  const largura = 600;
  const altura = 380;
  const base = 320;
  const passo = 60;
  const inicio = 70;
  const pontos = BARRAS.map((v, i) => [inicio + i * passo + 16, base - v * 2.6 - 18] as const);
  const linha = pontos.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${largura} ${altura}`} className="size-full" role="img" aria-label="Ilustração de gráfico em alta">
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={50}
          x2={560}
          y1={base - i * 70}
          y2={base - i * 70}
          strokeDasharray="4 8"
          className="stroke-marca-borda"
        />
      ))}
      {BARRAS.map((v, i) => (
        <motion.rect
          key={i}
          x={inicio + i * passo}
          y={base - v * 2.6}
          width={32}
          height={v * 2.6}
          rx={8}
          style={{ fill: CORES[i % CORES.length], transformBox: "fill-box", transformOrigin: "bottom" }}
          opacity={0.85}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: "easeOut" }}
        />
      ))}
      <motion.path
        d={linha}
        fill="none"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: "var(--primary)" }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
      />
      {pontos.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={5}
          style={{ fill: "var(--primary)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 + i * 0.1 }}
        />
      ))}
    </svg>
  );
}
