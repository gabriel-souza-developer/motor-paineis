"use client";
import { useEffect } from "react";
import { useLocation, useNavigate } from "~/lib/navegacao";
import { saiuPorVontade, useSessao } from "~/lib/sessao";
import { Topbar } from "~/components/shell/topbar";
import { Rodape } from "~/components/shell/rodape";

// Proteção no navegador (experiência de uso). Quem garante o acesso é a API.
export default function AreaLogada({ children }: { children: React.ReactNode }) {
  const { sessao, pronto } = useSessao();
  const navegar = useNavigate();
  const local = useLocation();

  useEffect(() => {
    if (pronto && !sessao) {
      if (saiuPorVontade()) navegar("/login", { replace: true });
      else navegar(`/login?voltar=${encodeURIComponent(local.pathname + local.search)}&motivo=sessao`, { replace: true });
    }
  }, [pronto, sessao, navegar, local]);

  if (!pronto || !sessao) return <div className="min-h-dvh bg-background" />;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Topbar />
      <main id="conteudo" className="mx-auto w-full max-w-painel flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <Rodape />
    </div>
  );
}
