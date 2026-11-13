import { Link } from "~/lib/navegacao";
import { ArrowRight, Lock } from "lucide-react";
import { Icone } from "~/components/ui/icone";
import { Selo } from "~/components/ui/selo";
import type { Modulo } from "~/tema/tipos";
import { cn } from "~/lib/utils";

const NOTA_PADRAO = "Este módulo está sendo preparado e logo estará disponível.";

function CaixaIcone({ modulo, indice, inativo }: { modulo: Modulo; indice: number; inativo?: boolean }) {
  const primeiro = indice === 0;
  return (
    <span
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-icone transition-transform duration-150",
        primeiro ? "bg-marca-1 text-[var(--primary)]" : "text-marca-texto",
        inativo ? "opacity-70 grayscale" : "group-hover:scale-110",
      )}
      style={primeiro ? undefined : { background: `var(--icone-${(indice % 5) + 1})` }}
    >
      <Icone nome={modulo.icone} className="size-6" />
    </span>
  );
}

// Card de módulo do painel. Ativo vira link; os demais ficam visíveis e não clicáveis.
export function ModuleCard({ modulo, indice, rotuloAtivo = "Disponível" }: { modulo: Modulo; indice: number; rotuloAtivo?: string }) {
  if (modulo.status === "ativo") {
    return (
      <Link
        to={modulo.rota ?? `/modulo?id=${encodeURIComponent(modulo.id)}`}
        data-testid={`modulo-${modulo.id}`}
        data-status={modulo.status}
        className="group flex h-full flex-col justify-between gap-5 rounded-card border bg-card p-6 shadow-xs outline-none transition duration-150 hover:-translate-y-1 hover:border-[var(--primary-texto)] hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <CaixaIcone modulo={modulo} indice={indice} />
            <Selo tom="primario">{rotuloAtivo}</Selo>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-foreground">{modulo.titulo}</h3>
            <p className="text-sm text-muted-foreground">{modulo.descricao}</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t pt-4 text-sm font-bold text-[var(--primary-texto)]">
          Acessar módulo
          <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
        </div>
      </Link>
    );
  }

  const emBreve = modulo.status === "em-breve";
  return (
    <div
      aria-disabled="true"
      data-testid={`modulo-${modulo.id}`}
      data-status={modulo.status}
      className="flex h-full cursor-not-allowed select-none flex-col justify-between gap-5 rounded-card border bg-muted/90 p-6 opacity-85 shadow-xs"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <CaixaIcone modulo={modulo} indice={indice} inativo />
          <Selo tom="neutro">
            <Lock aria-hidden />
            {emBreve ? "Em breve" : "Sem acesso"}
          </Selo>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-foreground">{modulo.titulo}</h3>
          <p className="text-sm text-muted-foreground">{modulo.descricao}</p>
        </div>
        {emBreve ? (
          <div className="flex gap-2.5 rounded-2xl border bg-card/60 p-3">
            <Lock className="mt-0.5 size-4 shrink-0 text-[var(--warning-texto)]" aria-hidden />
            <div className="space-y-0.5">
              <p className="text-xs font-bold tracking-wider text-foreground">EM DESENVOLVIMENTO</p>
              <p className="text-xs text-muted-foreground">{modulo.nota ?? NOTA_PADRAO}</p>
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between border-t pt-4 text-sm font-bold text-muted-foreground">
        {emBreve ? "Indisponível no momento" : "Sem permissão para este módulo"}
        <Lock className="size-4" aria-hidden />
      </div>
    </div>
  );
}
