"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { useEmpresa } from "~/tema/empresa";
import { primeiroNome, useSessao } from "~/lib/sessao";
import { HeroCard } from "~/components/blocos/hero-card";
import { ProfileCard } from "~/components/blocos/profile-card";
import { ModuleCard } from "~/components/blocos/module-card";
import { IndicadoresPainel } from "~/components/blocos/indicadores-painel";


// Entrada curta: fade + 12px, atraso máximo 150ms + 250ms de duração (total 400ms).
const DURACAO = 0.25;
const entrada = (atraso: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURACAO, delay: Math.min(atraso, 0.15), ease: "easeOut" as const },
});

const normalizar = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export default function Painel() {
  const e = useEmpresa();
  const { usuario } = useSessao();
  const [busca, setBusca] = useState("");

  const disponiveis = e.modulos.filter((m) => m.status === "ativo").length;
  const filtrados = useMemo(() => {
    const q = normalizar(busca.trim());
    if (!q) return e.modulos.map((m, i) => ({ m, i }));
    return e.modulos
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => normalizar(`${m.titulo} ${m.descricao}`).includes(q));
  }, [busca, e.modulos]);

  if (!usuario) return null;

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div className="lg:col-span-2" {...entrada(0)}>
          <HeroCard
            selo={e.painel.seloHero}
            nome={primeiroNome(usuario.nome)}
            texto={e.painel.heroTexto}
            saudacao={e.painel.saudacao}
            cta={e.painel.cta}
          />
        </motion.div>
        <motion.div {...entrada(0.05)}>
          <ProfileCard usuario={usuario} sso={e.recursos.sso} />
        </motion.div>
      </div>

      {e.painel.indicadores?.length ? (
        <motion.div {...entrada(0.08)}>
          <IndicadoresPainel indicadores={e.painel.indicadores} />
        </motion.div>
      ) : null}

      <section aria-labelledby="modulos-titulo" className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="modulos-titulo" className="text-xl font-black text-foreground">
              Módulos do sistema
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {disponiveis} de {e.modulos.length} disponíveis
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={busca}
              onChange={(ev) => setBusca(ev.target.value)}
              placeholder="Pesquisar módulos..."
              aria-label="Pesquisar módulos"
              className="h-11 w-full rounded-[var(--radius)] border border-input bg-card pl-10 pr-3.5 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/25"
            />
          </div>
        </div>

        {filtrados.length === 0 ? (
          <p role="status" className="rounded-card border bg-card p-8 text-center text-sm font-bold text-muted-foreground">
            Nenhum módulo encontrado
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map(({ m, i }, pos) => (
              <motion.li key={m.id} className="h-full" {...entrada(0.1 + pos * 0.03)}>
                <ModuleCard modulo={m} indice={i} rotuloAtivo={e.painel.rotuloAtivo} />
              </motion.li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
