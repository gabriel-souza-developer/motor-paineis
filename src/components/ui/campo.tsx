"use client";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "~/lib/utils";
import { Icone } from "./icone";

type Props = React.ComponentProps<"input"> & {
  rotulo: string;
  icone?: string;
  erro?: string;
  acaoRotulo?: React.ReactNode; // ex.: link "Esqueci a senha" na linha do rótulo
};

export function Campo({ rotulo, icone, erro, acaoRotulo, type, className, ...props }: Props) {
  const id = useId();
  const [ver, setVer] = useState(false);
  const senha = type === "password";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-foreground">
          {rotulo}
          {props.required ? <span className="sr-only"> (obrigatório)</span> : null}
        </label>
        {acaoRotulo}
      </div>
      <div className="relative">
        {icone ? (
          <Icone nome={icone} className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        ) : null}
        <input
          id={id}
          type={senha && ver ? "text" : type}
          aria-invalid={!!erro || undefined}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className={cn(
            "h-11 w-full rounded-[var(--radius)] border border-input bg-card px-3.5 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground",
            "focus-visible:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/25",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
            icone && "pl-10",
            senha && "pr-11",
            className,
          )}
          {...props}
        />
        {senha ? (
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Esconder senha" : "Mostrar senha"}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 outline-none"
          >
            {ver ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      {erro ? (
        <p id={`${id}-erro`} role="alert" className="text-xs font-medium text-destructive">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
