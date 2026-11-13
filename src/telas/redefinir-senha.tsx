"use client";
import { useState } from "react";
import { Link, useSearchParams } from "~/lib/navegacao";
import { Check, Circle } from "lucide-react";
import { empresa } from "~/tema/empresa";
import { api, ErroApi } from "~/lib/api";
import { Botao } from "~/components/ui/botao";
import { Campo } from "~/components/ui/campo";
import { AuthLayout, useNoCliente } from "~/components/blocos/auth-layout";
import { AuthAviso } from "~/components/blocos/auth-aviso";
import { cn } from "~/lib/utils";


const REGRAS = [
  { id: "tamanho", texto: "Mínimo de 8 caracteres", ok: (s: string) => s.length >= 8 },
  { id: "letra", texto: "Pelo menos uma letra", ok: (s: string) => /\p{L}/u.test(s) },
  { id: "numero", texto: "Pelo menos um número", ok: (s: string) => /\d/.test(s) },
];

const classeLink =
  "rounded-sm font-bold text-foreground underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

function Titulo({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-black tracking-tight text-foreground">{titulo}</h1>
      <p className="text-muted-foreground">{texto}</p>
    </div>
  );
}

export default function RedefinirSenha() {
  const [params] = useSearchParams();
  const noCliente = useNoCliente();
  const token = noCliente ? params.get("token") : null;

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erros, setErros] = useState<{ senha?: string; confirmacao?: string }>({});
  const [estado, setEstado] = useState<"form" | "expirado" | "sucesso">("form");
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function salvar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!token) return;
    setErroGeral(null);
    const novos: typeof erros = {};
    if (!REGRAS.every((r) => r.ok(senha))) novos.senha = "A senha ainda não cumpre todas as regras.";
    if (!confirmacao) novos.confirmacao = "Confirme a nova senha.";
    else if (confirmacao !== senha) novos.confirmacao = "As senhas não são iguais.";
    setErros(novos);
    if (novos.senha || novos.confirmacao) return;

    setEnviando(true);
    try {
      await api.redefinirSenha(token, senha);
      setEstado("sucesso");
    } catch (err) {
      if (err instanceof ErroApi && err.status === 410) setEstado("expirado");
      else if (err instanceof ErroApi && err.status < 500) setErroGeral(err.message);
      else setErroGeral("Não foi possível salvar agora. Tente de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  let conteudo: React.ReactNode;

  if (!noCliente) {
    conteudo = <div className="h-64" aria-hidden />;
  } else if (!token) {
    conteudo = (
      <>
        <Titulo titulo="Link inválido" texto="Este link de redefinição não está completo ou não é mais válido." />
        <p className="mt-6 text-sm text-muted-foreground">
          <Link to="/esqueci-senha" className={classeLink}>
            Pedir um novo link
          </Link>
        </p>
      </>
    );
  } else if (estado === "expirado") {
    conteudo = (
      <>
        <Titulo titulo="Este link expirou" texto="Por segurança, o link de redefinição vale por pouco tempo." />
        <Botao asChild tamanho="lg" className="mt-8 w-full">
          <Link to="/esqueci-senha">Pedir outro link</Link>
        </Botao>
      </>
    );
  } else if (estado === "sucesso") {
    conteudo = (
      <>
        <Titulo titulo="Senha alterada" texto="Sua nova senha já está valendo. Use a nova senha para entrar." />
        <AuthAviso tom="sucesso" className="mt-6">
          Senha redefinida com sucesso.
        </AuthAviso>
        <Botao asChild tamanho="lg" className="mt-6 w-full">
          <Link to="/login">Ir para o login</Link>
        </Botao>
      </>
    );
  } else {
    conteudo = (
      <>
        <Titulo titulo="Crie uma nova senha" texto="Escolha uma senha que você não usa em outros lugares." />
        <form onSubmit={salvar} noValidate className="mt-8 space-y-5">
          <Campo
            rotulo="Nova senha"
            icone="lock"
            type="password"
            name="nova-senha"
            autoComplete="new-password"
            required
            value={senha}
            onChange={(ev) => setSenha(ev.target.value)}
            erro={erros.senha}
          />
          <ul className="space-y-1.5" aria-label="Regras da senha">
            {REGRAS.map((r) => {
              const ok = r.ok(senha);
              return (
                <li
                  key={r.id}
                  className={cn(
                    "flex items-center gap-2 text-sm transition-colors",
                    ok ? "font-medium text-[var(--success-texto)]" : "text-muted-foreground",
                  )}
                >
                  {ok ? <Check className="size-4" aria-hidden /> : <Circle className="size-4" aria-hidden />}
                  {r.texto}
                  <span className="sr-only">{ok ? "(cumprida)" : "(pendente)"}</span>
                </li>
              );
            })}
          </ul>
          <Campo
            rotulo="Confirmar nova senha"
            icone="lock"
            type="password"
            name="confirmar-senha"
            autoComplete="new-password"
            required
            value={confirmacao}
            onChange={(ev) => setConfirmacao(ev.target.value)}
            erro={erros.confirmacao}
          />

          {erroGeral ? <AuthAviso tom="erro">{erroGeral}</AuthAviso> : null}

          <Botao type="submit" tamanho="lg" className="w-full" carregando={enviando}>
            Salvar nova senha
          </Botao>
        </form>
      </>
    );
  }

  return <AuthLayout>{conteudo}</AuthLayout>;
}
