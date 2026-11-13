import { useSyncExternalStore } from "react";
import { empresa } from "~/tema/empresa";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  funcao: string;
  status: "autenticado";
}

interface Sessao {
  token: string;
  usuario: Usuario;
  expiraEm: number; // epoch ms
}

// Guardada no sessionStorage, ou no localStorage se "Manter conectado".
// Painel e API em domínios diferentes impedem cookie httpOnly; ver docs/seguranca.md.
const CHAVE = `${empresa.slug}_sessao`;
let atual: Sessao | null = null;
let carregada = false;
const ouvintes = new Set<() => void>();

function ler(): Sessao | null {
  if (typeof window === "undefined") return null;
  if (!carregada) {
    carregada = true;
    try {
      const bruto = sessionStorage.getItem(CHAVE) ?? localStorage.getItem(CHAVE);
      const s = bruto ? (JSON.parse(bruto) as Sessao) : null;
      atual = s && s.expiraEm > Date.now() ? s : null;
    } catch {
      atual = null;
    }
  }
  if (atual && atual.expiraEm <= Date.now()) encerrarSessao();
  return atual;
}

function avisar() {
  ouvintes.forEach((f) => f());
}

export function iniciarSessao(s: Sessao, manterConectado: boolean) {
  atual = s;
  carregada = true;
  try {
    (manterConectado ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(s));
  } catch {
    /* navegação privada: fica só em memória */
  }
  avisar();
}

let saidaVoluntaria = false;

/** true quando a sessão foi encerrada pelo próprio usuário (botão Sair), e não por expiração. */
export function saiuPorVontade() {
  const v = saidaVoluntaria;
  saidaVoluntaria = false;
  return v;
}

export function encerrarSessao(opcoes?: { voluntaria?: boolean }) {
  saidaVoluntaria = !!opcoes?.voluntaria;
  atual = null;
  try {
    sessionStorage.removeItem(CHAVE);
    localStorage.removeItem(CHAVE);
  } catch {
    /* sem storage */
  }
  avisar();
}

export function tokenAtual() {
  return ler()?.token ?? null;
}

/** null no build (sem window) e quando deslogado. `pronto` diferencia os dois casos. */
export function useSessao() {
  const sessao = useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    ler,
    () => null,
  );
  const pronto = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return { sessao, usuario: sessao?.usuario ?? null, pronto };
}

export function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

export function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}
