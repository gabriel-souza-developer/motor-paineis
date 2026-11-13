// Apoio comum dos testes: perfil da empresa em teste, login e normalização de rotas.
import fs from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";
import type { Perfil } from "../src/tema/tipos";

export const slug = process.env.EMPRESA ?? "logmovy";
export const perfil: Perfil = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "empresas", slug, "perfil.json"), "utf8"),
);

export const SENHA_TESTE = "teste1234";
export const EMAIL_TESTE = `qa@${slug}.com`;
/** Nome do usuário do mock (src/lib/api.ts). */
export const NOME_MOCK = "Operador Teste";

/** Mesma normalização da busca do painel: sem acento e minúsculo. */
export const normalizarTexto = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Compara rotas ignorando barra final e ordem da query. */
export function normalizarRota(r: string) {
  const u = new URL(r, "http://x");
  const caminho = u.pathname.replace(/\/+$/, "") || "/";
  const q = [...u.searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return caminho + (q ? `?${q}` : "");
}

export const rotaDoModulo = (m: Perfil["modulos"][number]) => m.rota ?? `/modulo?id=${encodeURIComponent(m.id)}`;

export const campoEmail = (page: Page) => page.getByLabel(/^E-mail corporativo/);
export const campoSenha = (page: Page) => page.getByLabel(/^Senha/);
export const botaoEntrar = (page: Page) => page.getByRole("button", { name: "Entrar no painel" });

/** Abre o login e espera a página ficar interativa. */
export async function abrir(page: Page, rota: string) {
  await page.goto(rota, { waitUntil: "networkidle" });
}

/** Login pelo formulário (mock aceita senha com 4+ caracteres) e espera o painel. */
export async function entrar(page: Page, email = EMAIL_TESTE) {
  await abrir(page, "/login/");
  await campoEmail(page).fill(email);
  await campoSenha(page).fill(SENHA_TESTE);
  await botaoEntrar(page).click();
  await expect(page).toHaveURL(/\/painel\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}
