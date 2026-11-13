import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "~/lib/navegacao";
import { Botao } from "~/components/ui/botao";
import { Icone } from "~/components/ui/icone";
import { Selo } from "~/components/ui/selo";
import { cn } from "~/lib/utils";

// Card de boas-vindas do painel, sobre a superfície escura da marca.
export function HeroCard({
  selo,
  nome,
  texto,
  saudacao = "Bem-vindo de volta, {nome}!",
  cta,
  className,
}: {
  selo: string;
  nome: string;
  texto: string;
  saudacao?: string;
  cta?: { texto: string; rota: string; icone?: string };
  className?: string;
}) {
  const [antes, depois = ""] = saudacao.split("{nome}");
  return (
    <section
      aria-labelledby="hero-titulo"
      className={cn(
        "relative h-full overflow-hidden rounded-card border border-marca-borda bg-marca-1 superficie-marca bg-gradient-to-br from-marca-1 via-marca-2 to-marca-3 p-6 shadow-xl sm:p-8",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full opacity-90 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brilho), transparent 70%)" }}
      />
      <div className="relative space-y-4">
        <Selo tom="primarioEscuro">
          <Sparkles aria-hidden />
          {selo}
        </Selo>
        <h1 id="hero-titulo" className="text-3xl font-black tracking-tight text-marca-texto sm:text-4xl">
          {antes}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(to right, var(--primary), var(--primary-degrade))" }}
          >
            {nome}
          </span>
          {depois}
        </h1>
        <p className="max-w-xl text-marca-texto-suave">{texto}</p>
        {cta ? (
          <Botao asChild tamanho="sm" className="mt-2">
            <Link to={cta.rota}>
              {cta.icone ? <Icone nome={cta.icone} /> : null}
              {cta.texto}
              <ArrowRight aria-hidden />
            </Link>
          </Botao>
        ) : null}
      </div>
    </section>
  );
}
