import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

// Selo em pílula: "Disponível", "Em breve", "Autenticado", "No prazo"...
export const seloVariantes = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider [&_svg]:size-3",
  {
    variants: {
      tom: {
        primario: "border-[var(--primary)]/30 bg-[var(--primary)]/15 text-[var(--primary-texto)]",
        primarioEscuro: "border-[var(--primary)]/30 bg-[var(--primary)]/15 text-[var(--primary)]",
        sucesso: "border-[var(--success)]/30 bg-[var(--success)]/12 text-[var(--success-texto)]",
        alerta: "border-[var(--warning)]/35 bg-[var(--warning)]/12 text-[var(--warning-texto)]",
        info: "border-[var(--info)]/30 bg-[var(--info)]/12 text-[var(--info)]",
        neutro: "border-border bg-muted text-muted-foreground",
      },
      caixa: { alta: "", normal: "normal-case tracking-normal" },
    },
    defaultVariants: { tom: "primario", caixa: "alta" },
  },
);

export function Selo({
  className,
  tom,
  caixa,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof seloVariantes>) {
  return <span className={cn(seloVariantes({ tom, caixa }), className)} {...props} />;
}
