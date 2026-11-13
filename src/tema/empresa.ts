import perfilJson from "./ativa/perfil.json";
import type { Perfil } from "./tipos";


// A empresa é escolhida no build (EMPRESA=<slug>). O tema já vem embutido no CSS.
export const empresa = perfilJson as Perfil;
export const ambiente = (process.env.NEXT_PUBLIC_AMBIENTE ?? "dev") as "dev" | "homologacao" | "producao";
export const usarMock = process.env.NEXT_PUBLIC_MOCK === "1";
export const apiBase = empresa.api[ambiente] ?? "";

export function useEmpresa(): Perfil {
  return empresa;
}

/** Substitui {chave} em textos do perfil. Ex.: textoPerfil("Olá, {nome}", { nome: "Ana" }) */
export function textoPerfil(texto: string, vars: Record<string, string | number>) {
  return texto.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
