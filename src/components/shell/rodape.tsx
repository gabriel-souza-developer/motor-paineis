import { useEmpresa } from "~/tema/empresa";

export function Rodape() {
  const e = useEmpresa();
  return (
    <footer className="border-t bg-card py-6 text-center">
      <p className="text-xs font-extrabold uppercase tracking-wider text-foreground">
        {e.nome} • {e.slogan} ({e.produto})
      </p>
      <p className="mt-1 text-xs text-muted-foreground">© {new Date().getFullYear()} {e.nome}. Todos os direitos reservados.</p>
    </footer>
  );
}
