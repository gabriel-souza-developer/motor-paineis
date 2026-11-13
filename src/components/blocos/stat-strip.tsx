"use client";
import { useEffect, useState } from "react";
import type { Indicador } from "~/tema/tipos";
import { Icone } from "~/components/ui/icone";
import { api } from "~/lib/api";
import { cn } from "~/lib/utils";

// Cor do valor por posição, igual à referência: 1º texto, 2º primária, 3º sucesso.
const corValor = ["text-marca-texto", "text-[var(--primary)]", "text-[var(--success)]"];

function useValor(ind: Indicador) {
  const [valor, setValor] = useState(ind.valor);
  useEffect(() => {
    if (ind.fonte !== "api" || !ind.endpoint) return;
    let vivo = true;
    api.indicadorPublico(ind.endpoint).then((v) => {
      if (vivo && v != null) setValor(v);
    });
    return () => {
      vivo = false;
    };
  }, [ind.fonte, ind.endpoint]);
  return valor;
}

function Item({ ind, posicao }: { ind: Indicador; posicao: number }) {
  const valor = useValor(ind);
  return (
    <div className="flex min-w-0 items-center gap-3 px-4 py-4 first:pl-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-icone border border-marca-borda bg-marca-2 text-marca-texto-suave">
        <Icone nome={ind.icone} className="size-4" />
      </span>
      <div className="min-w-0 leading-tight">
        <dt className="truncate text-[11px] font-medium text-marca-texto-suave">{ind.rotulo}</dt>
        <dd className={cn("text-base font-bold leading-tight sm:text-lg", corValor[posicao] ?? "text-marca-texto")}>{valor}</dd>
      </div>
    </div>
  );
}

export function StatStrip({ indicadores, className }: { indicadores: Indicador[]; className?: string }) {
  const lista = indicadores.slice(0, 3);
  if (!lista.length) return null;
  return (
    <dl
      className={cn(
        "grid grid-cols-3 divide-x divide-marca-borda rounded-card border border-marca-borda bg-marca-1",
        className,
      )}
    >
      {lista.map((ind, i) => (
        <Item key={ind.rotulo + i} ind={ind} posicao={i} />
      ))}
    </dl>
  );
}
