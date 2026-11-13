import type { Metadata } from "next";
import NaoEncontrado from "~/telas/nao-encontrado";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function Pagina() {
  return <NaoEncontrado />;
}
