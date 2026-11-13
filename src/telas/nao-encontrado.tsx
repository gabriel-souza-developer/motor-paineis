import { Link } from "~/lib/navegacao";
import { SearchX } from "lucide-react";
import { Botao } from "~/components/ui/botao";

export default function NaoEncontrado() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6 text-center">
      <div className="max-w-sm space-y-4">
        <div className="mx-auto grid size-14 place-items-center rounded-icone bg-marca-1 text-[var(--primary)]">
          <SearchX className="size-6" />
        </div>
        <h1 className="text-2xl font-black">Página não encontrada</h1>
        <p className="text-muted-foreground">O endereço pode ter mudado ou não existe mais.</p>
        <Botao asChild>
          <Link to="/painel">Voltar ao painel</Link>
        </Botao>
      </div>
    </main>
  );
}
