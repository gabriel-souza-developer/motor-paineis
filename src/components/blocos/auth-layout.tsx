"use client";
import { useSyncExternalStore } from "react";
import { motion, type Variants } from "motion/react";
import { useEmpresa } from "~/tema/empresa";
import { BrandMark } from "./brand-mark";
import { LiveBadge } from "./live-badge";
import { StatStrip } from "./stat-strip";
import { AuthHero } from "./auth-hero";

const grupo: Variants = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item: Variants = {
  oculto: { opacity: 0, y: 12 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** false no HTML pré-renderizado, true no navegador. Evita divergência ao ler ?query. */
export function useNoCliente() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// Lado da marca (sempre escuro): logo, selo ao vivo, visual, título e indicadores.
function LadoMarca() {
  const { login } = useEmpresa();
  return (
    <motion.aside
      variants={grupo}
      initial="oculto"
      animate="visivel"
      className="relative hidden min-h-dvh flex-col overflow-hidden bg-marca-1 p-10 xl:p-12 lg:flex"
    >
      <motion.div variants={item} className="flex shrink-0 items-center justify-between gap-4">
        <BrandMark />
        <LiveBadge />
      </motion.div>

      <motion.div variants={item} className="relative my-6 min-h-[300px] w-full flex-1">
        <AuthHero tipo={login.visual} imagem={login.imagem} chips={login.chips} className="h-full" />
      </motion.div>

      <div className="shrink-0 space-y-5">
        <div className="space-y-3">
          <motion.h2 variants={item} className="text-3xl font-black leading-tight text-marca-texto xl:text-4xl">
            {login.titulo}
          </motion.h2>
          <motion.p variants={item} className="max-w-xl text-base text-marca-texto-suave">
            {login.subtitulo}
          </motion.p>
        </div>

        <motion.div variants={item}>
          <StatStrip indicadores={login.indicadores} />
        </motion.div>
      </div>
    </motion.aside>
  );
}

// Layout das telas de acesso: 52/48 no lg (igual à referência); abaixo disso só o formulário com faixa da marca.
export function AuthLayout({ children }: { children: React.ReactNode }) {
  const e = useEmpresa();
  const ano = new Date().getFullYear();
  return (
    <div className="grid min-h-dvh bg-card lg:grid-cols-[52%_1fr]">
      <LadoMarca />
      <div className="flex min-h-dvh flex-col">
        <motion.main
          id="conteudo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10"
        >
          <div className="w-full max-w-[400px]">{children}</div>
        </motion.main>
        <footer className="px-6 pb-6 text-center text-xs text-muted-foreground">
          {e.nome} © {ano} • Plataforma de {e.eyebrowLogin}
        </footer>
      </div>
    </div>
  );
}
