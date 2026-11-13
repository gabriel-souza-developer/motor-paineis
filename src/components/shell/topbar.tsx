import { Link } from "~/lib/navegacao";
import { Bell } from "lucide-react";
import { BrandMark } from "~/components/blocos/brand-mark";
import { UserMenu } from "./user-menu";

// Barra superior da área logada: logo à esquerda, notificações e menu do usuário à direita.
export function Topbar() {
  return (
    <header className="superficie-marca sticky top-0 z-40 h-[var(--topbar-altura)] border-b border-marca-borda bg-marca-1/95 shadow-lg backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-painel items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/painel"
          aria-label="Ir para o painel"
          className="min-w-0 rounded-[var(--radius)] outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/50"
        >
          <BrandMark compacto />
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notificações"
            className="relative grid size-10 place-items-center rounded-xl border border-marca-borda bg-marca-2 text-marca-texto-suave outline-none transition hover:text-marca-texto focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/50"
          >
            <Bell className="size-[18px]" aria-hidden />
            <span aria-hidden className="absolute right-2 top-2 size-2 rounded-full border-2 border-marca-2 bg-[var(--primary)]" />
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
