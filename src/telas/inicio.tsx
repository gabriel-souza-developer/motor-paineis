"use client";
import { useEffect } from "react";
import { useNavigate } from "~/lib/navegacao";
import { useSessao } from "~/lib/sessao";

// "/" decide no navegador: logado vai ao painel, deslogado ao login.
export default function Inicio() {
  const { sessao, pronto } = useSessao();
  const navegar = useNavigate();
  useEffect(() => {
    if (pronto) navegar(sessao ? "/painel" : "/login", { replace: true });
  }, [pronto, sessao, navegar]);
  return <div className="min-h-dvh bg-marca-1" />;
}
