import { Suspense } from "react";
import type { Metadata } from "next";
import Tela from "~/telas/esqueci-senha";

export const metadata: Metadata = { title: "Recuperar acesso" };

export default function Pagina() {
  return (
    <Suspense>
      <Tela />
    </Suspense>
  );
}
