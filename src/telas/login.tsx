"use client";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "~/lib/navegacao";
import { ArrowRight } from "lucide-react";
import { empresa, useEmpresa } from "~/tema/empresa";
import { api, ErroApi } from "~/lib/api";
import { iniciarSessao, useSessao } from "~/lib/sessao";
import { Botao } from "~/components/ui/botao";
import { Campo } from "~/components/ui/campo";
import { Marcar } from "~/components/ui/marcar";
import { AuthLayout, EMAIL_VALIDO, useNoCliente } from "~/components/blocos/auth-layout";
import { AuthAviso } from "~/components/blocos/auth-aviso";
import { AuthDivisor, BotaoGoogle } from "~/components/blocos/auth-google";


/** Só aceita caminhos internos em ?voltar (evita redirecionar para outro site). */
function destinoSeguro(voltar: string | null) {
  if (voltar && voltar.startsWith("/") && !voltar.startsWith("//") && !voltar.startsWith("/login")) return voltar;
  return "/painel";
}

export default function Login() {
  const e = useEmpresa();
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const noCliente = useNoCliente();
  const { sessao, pronto } = useSessao();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manter, setManter] = useState(false);
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [avisoGoogle, setAvisoGoogle] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const sessaoExpirou = noCliente && params.get("motivo") === "sessao";

  useEffect(() => {
    if (pronto && sessao) navegar("/painel", { replace: true });
  }, [pronto, sessao, navegar]);

  function validar() {
    const novos: typeof erros = {};
    if (!email.trim()) novos.email = "Informe seu e-mail.";
    else if (!EMAIL_VALIDO.test(email.trim())) novos.email = "Digite um e-mail válido.";
    if (!senha) novos.senha = "Informe sua senha.";
    setErros(novos);
    return !novos.email && !novos.senha;
  }

  async function entrar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setErroGeral(null);
    if (!validar()) return;
    setEnviando(true);
    try {
      const r = await api.login(email.trim(), senha);
      iniciarSessao(
        { token: r.token, usuario: r.usuario, expiraEm: Date.now() + r.expiraEmSegundos * 1000 },
        manter,
      );
      navegar(destinoSeguro(params.get("voltar")), { replace: true });
    } catch (err) {
      if (err instanceof ErroApi && (err.status === 401 || err.status === 422)) {
        setErroGeral(err.status === 401 ? "E-mail ou senha incorretos." : err.message);
        if (err.campos) setErros({ email: err.campos.email, senha: err.campos.senha });
      } else {
        setErroGeral("Não foi possível entrar agora. Verifique sua conexão e tente de novo.");
      }
      setEnviando(false);
    }
  }

  function entrarComGoogle() {
    // O fluxo do Google depende de um endpoint em lib/api.ts que ainda não existe.
    setAvisoGoogle(true);
  }

  return (
    <AuthLayout>
      <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground lg:hidden">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
        Acesso corporativo seguro • {e.nome}
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Bem-vindo de volta</h1>
        <p className="text-muted-foreground">{e.login.formSubtitulo}</p>
      </div>

      {sessaoExpirou ? (
        <AuthAviso tom="alerta" className="mt-6">
          Sua sessão expirou. Entre novamente.
        </AuthAviso>
      ) : null}

      <form onSubmit={entrar} noValidate className="mt-8 space-y-5">
        <Campo
          rotulo="E-mail corporativo"
          icone="mail"
          type="email"
          name="email"
          inputMode="email"
          placeholder="nome@empresa.com"
          autoComplete="username"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          erro={erros.email}
        />
        <Campo
          rotulo="Senha"
          icone="lock"
          type="password"
          name="senha"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(ev) => setSenha(ev.target.value)}
          erro={erros.senha}
          acaoRotulo={
            <Link
              to="/esqueci-senha"
              className="rounded-sm text-xs font-semibold text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Esqueci a senha
            </Link>
          }
        />
        <Marcar rotulo="Manter conectado" checked={manter} onCheckedChange={(v) => setManter(v === true)} />

        {erroGeral ? <AuthAviso tom="erro">{erroGeral}</AuthAviso> : null}

        <Botao type="submit" tamanho="lg" className="w-full" carregando={enviando}>
          Entrar no painel
          {!enviando ? <ArrowRight /> : null}
        </Botao>
      </form>

      {e.recursos.loginGoogle ? (
        <div className="mt-6 space-y-5">
          <AuthDivisor />
          <BotaoGoogle onClick={entrarComGoogle} />
          {avisoGoogle ? <AuthAviso tom="info">Login com Google ainda não configurado.</AuthAviso> : null}
        </div>
      ) : null}
    </AuthLayout>
  );
}
