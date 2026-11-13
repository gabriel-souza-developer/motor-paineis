"use client";
import { useEffect, useState } from "react";
import { CircleCheck, Clock, KeyRound } from "lucide-react";
import { empresa, useEmpresa } from "~/tema/empresa";
import { iniciais, useSessao } from "~/lib/sessao";
import { api, ErroApi } from "~/lib/api";
import { PageHero } from "~/components/blocos/page-hero";
import { Botao } from "~/components/ui/botao";
import { Selo } from "~/components/ui/selo";


const ESPERA_REENVIO = 60;

export default function Perfil() {
  const e = useEmpresa();
  const { usuario } = useSessao();
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [restante, setRestante] = useState(0);

  useEffect(() => {
    if (restante <= 0) return;
    const t = setTimeout(() => setRestante((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [restante]);

  if (!usuario) return null;

  async function pedirLink() {
    if (!usuario) return;
    setErro(null);
    setCarregando(true);
    try {
      await api.esqueciSenha(usuario.email);
      setEnviado(true);
      setRestante(ESPERA_REENVIO);
    } catch (err) {
      setErro(err instanceof ErroApi ? err.message : "Não foi possível enviar o link. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  const funcaoCurta = (usuario.funcao.trim().split(/\s+/)[0] ?? "").toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero iniciais={iniciais(usuario.nome)} selo={funcaoCurta} titulo={usuario.nome} subtitulo={usuario.email} />

      <section
        aria-labelledby="senha-titulo"
        className="flex flex-col gap-5 rounded-card border bg-card p-6 shadow-xs md:flex-row md:items-center"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-icone bg-marca-1 text-[var(--primary)]">
          <KeyRound className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="senha-titulo" className="font-black text-foreground">
              Redefinir senha de acesso
            </h2>
            <Selo tom="alerta" caixa="normal">
              <Clock aria-hidden />
              Link válido por {e.recursos.tokenSenhaMin} min
            </Selo>
          </div>
          <p className="text-sm text-muted-foreground">
            Enviaremos para <strong className="font-mono text-foreground">{usuario.email}</strong> um link para você criar
            uma nova senha.
          </p>
          <div aria-live="polite">
            {enviado ? (
              <Selo tom="sucesso" caixa="normal">
                <CircleCheck aria-hidden />
                Link enviado. Confira seu e-mail.
              </Selo>
            ) : null}
          </div>
          {erro ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {erro}
            </p>
          ) : null}
        </div>
        <Botao
          variante="escuro"
          className="w-full md:w-auto"
          onClick={pedirLink}
          carregando={carregando}
          disabled={restante > 0}
        >
          {carregando ? null : <KeyRound aria-hidden />}
          {restante > 0 ? `Reenviar em ${restante}s` : enviado ? "Reenviar link" : "Quero redefinir minha senha"}
        </Botao>
      </section>
    </div>
  );
}
