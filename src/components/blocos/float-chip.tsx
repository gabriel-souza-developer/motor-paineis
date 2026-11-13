import type { Chip } from "~/tema/tipos";
import { Icone } from "~/components/ui/icone";
import { Selo } from "~/components/ui/selo";
import { cn } from "~/lib/utils";

// Cartão flutuante sobre o visual do login (ex.: "Rota otimizada", "No prazo").
export function FloatChip({ chip, className }: { chip: Chip; className?: string }) {
  return (
    <div
      className={cn(
        "flex max-w-[280px] items-start gap-3 rounded-2xl border border-marca-borda bg-marca-1/90 p-3 shadow-xl backdrop-blur",
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-icone border border-marca-borda bg-marca-2 text-[var(--primary)]">
        <Icone nome={chip.icone ?? "sparkles"} className="size-4" />
      </span>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-marca-texto">{chip.titulo}</span>
          {chip.selo ? (
            <Selo tom="sucesso" className="px-2 text-[10px]">
              {chip.selo}
            </Selo>
          ) : null}
        </div>
        <p className="text-xs leading-snug text-marca-texto-suave">{chip.texto}</p>
      </div>
    </div>
  );
}
