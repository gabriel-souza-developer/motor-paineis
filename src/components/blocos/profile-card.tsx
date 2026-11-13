import { Link } from "~/lib/navegacao";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Botao } from "~/components/ui/botao";
import { Selo } from "~/components/ui/selo";
import { iniciais, type Usuario } from "~/lib/sessao";
import { cn } from "~/lib/utils";

// Resumo da conta logada no painel.
export function ProfileCard({ usuario, sso, className }: { usuario: Usuario; sso?: boolean; className?: string }) {
  return (
    <section aria-label="Sua conta" className={cn("flex h-full flex-col rounded-card border bg-card p-6 shadow-xs", className)}>
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-icone border border-[var(--primary)]/40 bg-marca-1 font-black text-[var(--primary)]">
          {iniciais(usuario.nome)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-foreground">{usuario.nome}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{usuario.email}</p>
        </div>
      </div>
      <hr className="my-5 border-border" />
      <dl className="flex-1 space-y-3">
        <div>
          <dt className="text-xs text-muted-foreground">Função:</dt>
          <dd className="text-sm font-bold text-foreground">{usuario.funcao}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Status da conta:</dt>
          <dd className="mt-1">
            <Selo tom="sucesso" caixa="normal">• Autenticado</Selo>
          </dd>
        </div>
        {sso ? (
          <div>
            <dt className="text-xs text-muted-foreground">Segurança:</dt>
            <dd className="mt-1">
              <Selo tom="info" caixa="normal">
                <ShieldCheck aria-hidden />
                SSO Ativo
              </Selo>
            </dd>
          </div>
        ) : null}
      </dl>
      <Botao asChild variante="escuro" className="mt-5 w-full">
        <Link to="/perfil">
          <KeyRound aria-hidden />
          Meu perfil e senha
        </Link>
      </Botao>
    </section>
  );
}
