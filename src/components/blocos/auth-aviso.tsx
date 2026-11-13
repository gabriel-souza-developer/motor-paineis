import { Icone } from "~/components/ui/icone";
import { cn } from "~/lib/utils";

type Tom = "alerta" | "erro" | "sucesso" | "info";

const estilos: Record<Tom, { caixa: string; icone: string; nomeIcone: string }> = {
  alerta: {
    caixa: "border-[var(--warning)]/35 bg-[var(--warning)]/12 text-[var(--warning-texto)]",
    icone: "text-[var(--warning-texto)]",
    nomeIcone: "clock-alert",
  },
  erro: {
    caixa: "border-destructive/30 bg-destructive/10 text-destructive",
    icone: "text-destructive",
    nomeIcone: "circle-alert",
  },
  sucesso: {
    caixa: "border-[var(--success)]/30 bg-[var(--success)]/12 text-[var(--success-texto)]",
    icone: "text-[var(--success-texto)]",
    nomeIcone: "circle-check",
  },
  info: {
    caixa: "border-[var(--info)]/30 bg-[var(--info)]/10 text-foreground",
    icone: "text-[var(--info)]",
    nomeIcone: "info",
  },
};

// Caixa de mensagem das telas de acesso. Erro e alerta são anunciados ao leitor de tela.
export function AuthAviso({
  tom,
  children,
  className,
}: {
  tom: Tom;
  children: React.ReactNode;
  className?: string;
}) {
  const s = estilos[tom];
  return (
    <div
      role={tom === "erro" || tom === "alerta" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-[var(--radius)] border px-3.5 py-3 text-sm font-medium", s.caixa, className)}
    >
      <Icone nome={s.nomeIcone} className={cn("mt-0.5 size-4 shrink-0", s.icone)} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
