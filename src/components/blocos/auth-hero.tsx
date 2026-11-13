"use client";
import { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { Chip, VisualLogin as TipoVisual } from "~/tema/tipos";
import { VisualLogin } from "~/components/visuais";
import { FloatChip } from "./float-chip";
import { cn } from "~/lib/utils";

// Card do visual do login: grade sutil, brilho que acompanha o ponteiro, ilustração e chips flutuantes.
export function AuthHero({
  tipo,
  imagem,
  chips,
  className,
}: {
  tipo: TipoVisual;
  imagem?: string;
  chips: Chip[];
  className?: string;
}) {
  const [chipA, chipB] = chips;
  const cartaoRef = useRef<HTMLDivElement>(null);
  const [brilhoAtivo, setBrilhoAtivo] = useState(false);
  const movimentoReduzido = useReducedMotion();

  function moverBrilho(ev: React.PointerEvent<HTMLDivElement>) {
    if (movimentoReduzido || !cartaoRef.current) return;
    const r = cartaoRef.current.getBoundingClientRect();
    cartaoRef.current.style.setProperty("--brilho-x", `${ev.clientX - r.left}px`);
    cartaoRef.current.style.setProperty("--brilho-y", `${ev.clientY - r.top}px`);
  }

  return (
    <div
      ref={cartaoRef}
      onPointerMove={moverBrilho}
      onPointerEnter={() => !movimentoReduzido && setBrilhoAtivo(true)}
      onPointerLeave={() => setBrilhoAtivo(false)}
      className={cn(
        "relative h-full w-full overflow-hidden rounded-card border border-marca-borda bg-marca-2",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full opacity-30 blur-[90px]"
        style={{ background: "radial-gradient(circle, var(--marca-primary), transparent 75%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-20 size-72 rounded-full opacity-25 blur-[95px]"
        style={{ background: "radial-gradient(circle, var(--secondary), transparent 80%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(var(--marca-superficie-borda) 1px, transparent 1px), linear-gradient(90deg, var(--marca-superficie-borda) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: !movimentoReduzido && brilhoAtivo ? 1 : 0,
          background: "radial-gradient(360px circle at var(--brilho-x, 50%) var(--brilho-y, 50%), var(--brilho), transparent 65%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <VisualLogin tipo={tipo} imagem={imagem} />
      </div>
      {chipA ? <FloatChip chip={chipA} className="absolute left-4 top-4" /> : null}
      {chipB ? <FloatChip chip={chipB} className="absolute bottom-4 right-4" /> : null}
    </div>
  );
}
