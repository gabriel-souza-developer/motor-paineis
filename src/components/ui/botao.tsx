"use client";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

export const botaoVariantes = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-bold transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variante: {
        primario: "bg-primary text-primary-foreground shadow-lg shadow-[var(--brilho)] hover:bg-[var(--primary-hover)]",
        escuro: "bg-marca-1 text-[var(--primary)] hover:bg-marca-2 border border-marca-borda",
        contorno: "border border-border bg-card text-foreground hover:bg-muted",
        fantasma: "text-foreground hover:bg-muted",
        destrutivo: "bg-destructive text-marca-texto hover:opacity-90",
        link: "text-[var(--primary-texto)] underline-offset-4 hover:underline px-0",
      },
      tamanho: { md: "h-11 px-5", sm: "h-9 px-3 text-xs", lg: "h-11 px-6 text-sm", icone: "size-10" },
    },
    defaultVariants: { variante: "primario", tamanho: "md" },
  },
);

type Props = React.ComponentProps<"button"> &
  VariantProps<typeof botaoVariantes> & { asChild?: boolean; carregando?: boolean };

export function Botao({ className, variante, tamanho, asChild, carregando, children, disabled, ...props }: Props) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(botaoVariantes({ variante, tamanho }), className)}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {carregando ? <Loader2 className="animate-spin" /> : null}
          {children}
        </>
      )}
    </Comp>
  );
}
