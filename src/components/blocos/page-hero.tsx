import { ShieldCheck } from "lucide-react";
import { Selo } from "~/components/ui/selo";
import { cn } from "~/lib/utils";

// Cabeçalho de página sobre a superfície da marca: avatar com status, selo, título e linha de apoio.
export function PageHero({
  iniciais,
  selo,
  titulo,
  subtitulo,
  children,
  className,
}: {
  iniciais: string;
  selo?: string;
  titulo: string;
  subtitulo?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-card border border-marca-borda bg-marca-1 superficie-marca bg-gradient-to-br from-marca-1 via-marca-2 to-marca-3 p-8 shadow-xl",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full opacity-90 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brilho), transparent 70%)" }}
      />
      <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <span className="grid size-20 place-items-center rounded-card border border-[var(--primary)]/40 bg-marca-2 text-2xl font-black text-[var(--primary)]">
            {iniciais}
          </span>
          <span aria-hidden className="absolute -bottom-1 -right-1 size-4 rounded-full border-[3px] border-marca-1 bg-[var(--success)]" />
        </div>
        <div className="min-w-0 space-y-1.5">
          {selo ? (
            <Selo tom="info">
              <ShieldCheck aria-hidden />
              {selo}
            </Selo>
          ) : null}
          <h1 className="truncate text-2xl font-black text-marca-texto">{titulo}</h1>
          {subtitulo ? <p className="truncate font-mono text-sm text-marca-texto-suave">{subtitulo}</p> : null}
          {children}
        </div>
      </div>
    </section>
  );
}
