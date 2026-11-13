"use client";
import { useEffect, useState } from "react";
import { Link } from "~/lib/navegacao";
import { ArrowLeft, Send } from "lucide-react";
import { empresa } from "~/tema/empresa";
import { api, ErroApi } from "~/lib/api";
import { Botao } from "~/components/ui/botao";
import { Campo } from "~/components/ui/campo";
import { AuthLayout, EMAIL_VALIDO } from "~/components/blocos/auth-layout";
import { AuthAviso } from "~/components/blocos/auth-aviso";


const ESPERA_SEGUNDOS = 60;

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string>();
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [restante, setRestante] = useState(0);

  useEffect(() => {
    if (restante <= 0) return;
    const t = setTimeout(() => setRestante((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [restante]);

  async function enviar() {
    setErroGeral(null);
    const valor = email.trim();
    if (!valor) return setErro("Informe seu e-mail.");
    if (!EMAIL_VALIDO.test(valor)) return setErro("Digite um e-mail válido.");
    setErro(undefined);
    setEnviando(true);
    try {
      await api.esqueciSenha(valor);
      setEnviado(true);
      setRestante(ESPERA_SEGUNDOS);
    } catch (err) {
      // Resposta neutra: não revela se o e-mail existe. Só avisa falha de conexão ou do servidor.
      if (err instanceof ErroApi && err.status < 500 && err.status !== 429) {
        setEnviado(true);
        setRestante(ESPERA_SEGUNDOS);
      } else {
        setErroGeral("Não foi possível enviar agora. Tente de novo em instantes.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Esqueceu a senha?</h1>
        <p className="text-muted-foreground">
          Informe o e-mail que você usa para entrar. Vamos enviar um link para você criar uma nova senha.
        </p>
      </div>

      <form
        noValidate
        className="mt-8 space-y-5"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!enviado) void enviar();
        }}
      >
        <Campo
          rotulo="E-mail corporativo"
          icone="mail"
          type="email"
          name="email"
          inputMode="email"
          placeholder="nome@empresa.com"
          autoComplete="username"
          required
          readOnly={enviado}
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          erro={erro}
        />

        {erroGeral ? <AuthAviso tom="erro">{erroGeral}</AuthAviso> : null}

        {enviado ? (
          <>
            <AuthAviso tom="sucesso">
              Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.
            </AuthAviso>
            <Botao
              type="button"
              variante="contorno"
              tamanho="lg"
              className="w-full"
              disabled={restante > 0}
              carregando={enviando}
              onClick={() => void enviar()}
            >
              {restante > 0 ? `Reenviar em ${restante}s` : "Reenviar"}
            </Botao>
          </>
        ) : (
          <Botao type="submit" tamanho="lg" className="w-full" carregando={enviando}>
            Enviar link
            {!enviando ? <Send /> : null}
          </Botao>
        )}
      </form>

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 rounded-sm text-xs font-semibold text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar para o login
      </Link>
    </AuthLayout>
  );
}
