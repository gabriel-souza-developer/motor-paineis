import { apiBase, usarMock, empresa } from "~/tema/empresa";
import { encerrarSessao, tokenAtual, type Usuario } from "./sessao";

export class ErroApi extends Error {
  constructor(
    public status: number,
    message: string,
    public campos?: Record<string, string>,
  ) {
    super(message);
  }
}

// Endpoints centralizados. Ajuste aqui para a API real.
export const ENDPOINTS = {
  login: "/auth/login",
  eu: "/auth/me",
  esqueciSenha: "/auth/forgot-password",
  redefinirSenha: "/auth/reset-password",
} as const;

async function chamar<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  const token = tokenAtual();
  const r = await fetch(apiBase + caminho, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (r.status === 401) {
    encerrarSessao();
    throw new ErroApi(401, "Sua sessão expirou. Entre novamente.");
  }
  if (!r.ok) {
    const corpo = await r.json().catch(() => ({}));
    throw new ErroApi(r.status, corpo.message ?? "Não foi possível concluir. Tente de novo.", corpo.errors);
  }
  return r.status === 204 ? (undefined as T) : r.json();
}

// ---------- Mock: permite usar a prévia sem API ----------
const espera = (ms = 600) => new Promise((r) => setTimeout(r, ms));
const usuarioMock: Usuario = {
  id: "1",
  nome: "Operador Teste",
  email: `teste@${empresa.slug}.com`,
  funcao: "Operador de Escalas e Monitoramento",
  status: "autenticado",
};

export interface RespostaLogin {
  token: string;
  usuario: Usuario;
  expiraEmSegundos: number;
}

export const api = {
  async login(email: string, senha: string): Promise<RespostaLogin> {
    if (usarMock) {
      await espera();
      if (senha.length < 4) throw new ErroApi(422, "E-mail ou senha incorretos.");
      return { token: "mock", usuario: { ...usuarioMock, email }, expiraEmSegundos: 8 * 3600 };
    }
    return chamar(ENDPOINTS.login, { method: "POST", body: JSON.stringify({ email, senha }) });
  },
  async eu(): Promise<Usuario> {
    if (usarMock) return usuarioMock;
    return chamar(ENDPOINTS.eu);
  },
  async esqueciSenha(email: string): Promise<void> {
    if (usarMock) return void (await espera());
    return chamar(ENDPOINTS.esqueciSenha, { method: "POST", body: JSON.stringify({ email }) });
  },
  async redefinirSenha(token: string, senha: string): Promise<void> {
    if (usarMock) {
      await espera();
      if (token === "expirado") throw new ErroApi(410, "Este link expirou.");
      return;
    }
    return chamar(ENDPOINTS.redefinirSenha, { method: "POST", body: JSON.stringify({ token, senha }) });
  },
  async indicadorPublico(endpoint: string): Promise<string | null> {
    if (usarMock) return null; // usa o valor do perfil
    try {
      const r = await chamar<{ valor: string }>(endpoint);
      return r.valor;
    } catch {
      return null;
    }
  },
};
