"use client";
import { useEffect, useState } from "react";
import { api } from "~/lib/api";
import { Icone } from "~/components/ui/icone";
import type { Indicador } from "~/tema/tipos";

// Faixa de indicadores abaixo do hero (opcional, vem de perfil.painel.indicadores).
// Fonte "api": busca o valor no endpoint; se falhar, mostra o valor do perfil.
function Item({ ind }: { ind: Indicador }) {
  const [valor, setValor] = useState(ind.valor);
  useEffect(() => {
    if (ind.fonte !== "api" || !ind.endpoint) return;
    let vivo = true;
    api.indicadorPublico(ind.endpoint).then((v) => vivo && v !== null && setValor(v));
    return () => {
      vivo = false;
    };
  }, [ind]);
  return (
    <div className="flex items-center gap-4 rounded-card border bg-card p-5 shadow-xs">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-[var(--primary-texto)]">
        <Icone nome={ind.icone} className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{ind.rotulo}</p>
        <p className="text-xl font-black text-foreground">{valor}</p>
      </div>
    </div>
  );
}

export function IndicadoresPainel({ indicadores }: { indicadores: Indicador[] }) {
  return (
    <section aria-label="Indicadores" className="grid gap-6 sm:grid-cols-3">
      {indicadores.map((ind) => (
        <Item key={ind.rotulo} ind={ind} />
      ))}
    </section>
  );
}
