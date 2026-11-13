import { Suspense } from "react";
import type { Metadata } from "next";
import Tela from "~/telas/painel";

export const metadata: Metadata = { title: "Painel" };

export default function Pagina() {
  return (
    <Suspense>
      <Tela />
    </Suspense>
  );
}
