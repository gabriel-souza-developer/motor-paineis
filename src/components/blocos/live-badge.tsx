import { Icone } from "~/components/ui/icone";
import { useEmpresa } from "~/tema/empresa";
import { cn } from "~/lib/utils";

// Pílula "ao vivo" do topo do login. Só aparece quando o selo vem da API.
export function LiveBadge({ className }: { className?: string }) {
  const { login } = useEmpresa();
  if (!login.selo || login.selo.fonte !== "api") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-marca-borda bg-marca-2/60 px-3.5 py-1.5 text-xs font-bold text-marca-texto",
        className,
      )}
    >
      <Icone nome="navigation" className="size-3.5 text-[var(--primary)]" />
      {login.selo.texto}
    </span>
  );
}
