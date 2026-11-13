"use client";
import { motion } from "motion/react";

// Formas suaves com degradê da primária e da secundária.
const BLOBS = [
  { cor: "var(--primary)", classe: "left-[8%] top-[10%] size-[55%]", dx: 18, dy: 12 },
  { cor: "var(--secondary)", classe: "right-[6%] top-[22%] size-[48%]", dx: -14, dy: 16 },
  { cor: "var(--info)", classe: "bottom-[4%] left-[30%] size-[40%]", dx: 12, dy: -14 },
];

export function VisualAbstrato() {
  return (
    <div className="relative size-full overflow-hidden" role="img" aria-label="Ilustração abstrata">
      {BLOBS.map((b, i) => (
        <motion.span
          key={i}
          className={`absolute rounded-full blur-2xl ${b.classe}`}
          style={{ background: `radial-gradient(circle at 35% 35%, ${b.cor}, transparent 70%)`, opacity: 0.55 }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.55, scale: 1, x: [0, b.dx, 0], y: [0, b.dy, 0] }}
          transition={{
            opacity: { duration: 0.8, delay: i * 0.15 },
            scale: { duration: 0.8, delay: i * 0.15 },
            x: { duration: 9 + i * 2, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 9 + i * 2, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}
