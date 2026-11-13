import { Suspense } from "react";
import type { Metadata } from "next";
import Tela from "~/telas/perfil";

export const metadata: Metadata = { title: "Meu perfil" };

export default function Pagina() {
  return (
    <Suspense>
      <Tela />
    </Suspense>
  );
}
