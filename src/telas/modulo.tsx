"use client";
import { Link, useSearchParams } from "~/lib/navegacao";
import { ArrowLeft } from "lucide-react";
import { useEmpresa } from "~/tema/empresa";
import { Botao } from "~/components/ui/botao";

// Ponto de entrada dos módulos: /modulo?id=<id>.
// As telas internas de cada módulo são feitas sob medida para cada empresa
// e entram como rotas próprias (componente em src/telas e página em src/app/<rota>/page.tsx).
export default function Modulo() {
  const [params] = useSearchParams();
  const modulo = useEmpresa().modulos.find((m) => m.id === params.get("id"));
  return (
    <section className="space-y-4">
      <Botao asChild variante="fantasma" tamanho="sm">
        <Link to="/painel">
          <ArrowLeft /> Voltar aos módulos
        </Link>
      </Botao>
      <div className="rounded-card border bg-card p-8">
        <h1 className="text-2xl font-black">{modulo?.titulo ?? "Módulo não encontrado"}</h1>
        <p className="mt-2 text-muted-foreground">
          {modulo ? "Este módulo ainda não tem telas internas." : "Confira o endereço ou volte ao painel."}
        </p>
      </div>
    </section>
  );
}
