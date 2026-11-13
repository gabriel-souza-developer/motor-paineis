import { useEmpresa } from "~/tema/empresa";
import { Selo } from "~/components/ui/selo";
import { cn } from "~/lib/utils";

// Logo com anel e ponto de status + nome + eyebrow ou selo do produto.
// Sempre sobre superfície escura da marca.
export function BrandMark({ compacto = false, className }: { compacto?: boolean; className?: string }) {
  const e = useEmpresa();
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative shrink-0">
        <img
          src={`/${e.logos.escura}`}
          alt={e.nome}
          width={compacto ? 40 : 48}
          height={compacto ? 40 : 48}
          className={cn(
            "rounded-full bg-marca-2 object-cover ring-2 ring-[var(--primary)]/70 shadow-lg shadow-[var(--brilho)]",
            compacto ? "size-10" : "size-12",
          )}
        />
        <span className="absolute -bottom-0.5 -right-0.5 flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--success)] opacity-60" />
          <span className="relative inline-flex size-3 rounded-full border-2 border-marca-1 bg-[var(--success)]" />
        </span>
      </div>
      <div className="min-w-0 leading-tight">
        <div className="flex items-center gap-2">
          <span className={cn("font-extrabold text-marca-texto", compacto ? "text-base uppercase" : "text-lg")}>{e.nome}</span>
          {compacto ? <Selo tom="primarioEscuro" className="px-2 text-[10px]">{e.produto}</Selo> : null}
        </div>
        <p className={cn("truncate text-marca-texto-suave", compacto ? "text-xs" : "text-[11px] font-bold uppercase tracking-widest")}>
          {compacto ? e.slogan : e.eyebrowLogin}
        </p>
      </div>
    </div>
  );
}
