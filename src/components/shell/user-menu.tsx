"use client";
import { useNavigate } from "~/lib/navegacao";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { MenuConteudo, MenuGatilho, MenuItem, MenuRaiz, MenuSeparador } from "~/components/ui/menu";
import { encerrarSessao, iniciais, primeiroNome, useSessao } from "~/lib/sessao";

// Pílula com avatar e primeiro nome; abre atalhos da conta.
export function UserMenu() {
  const { usuario } = useSessao();
  const navegar = useNavigate();
  if (!usuario) return null;

  function sair() {
    encerrarSessao({ voluntaria: true });
    navegar("/login", { replace: true });
  }

  return (
    <MenuRaiz>
      <MenuGatilho
        aria-label={`Menu da conta de ${usuario.nome}`}
        className="flex h-10 items-center gap-2 rounded-xl border border-marca-borda bg-marca-2 py-1 pl-1 pr-2 text-marca-texto outline-none transition hover:bg-marca-3 focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/50 sm:pr-3"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
          {iniciais(usuario.nome)}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-bold sm:inline">{primeiroNome(usuario.nome)}</span>
        <ChevronDown className="size-4 text-marca-texto-suave" aria-hidden />
      </MenuGatilho>
      <MenuConteudo>
        <div className="px-3 py-2">
          <p className="truncate text-sm font-bold text-foreground">{usuario.nome}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{usuario.email}</p>
        </div>
        <MenuSeparador />
        <MenuItem onSelect={() => navegar("/perfil")}>
          <UserRound className="text-[var(--success-texto)]" aria-hidden />
          Meu perfil e redefinir senha
        </MenuItem>
        <MenuItem onSelect={sair} className="text-destructive">
          <LogOut aria-hidden />
          Sair da conta
        </MenuItem>
      </MenuConteudo>
    </MenuRaiz>
  );
}
