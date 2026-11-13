import { Suspense } from "react";
import type { Metadata } from "next";
import Tela from "~/telas/redefinir-senha";

export const metadata: Metadata = { title: "Nova senha" };

export default function Pagina() {
  return (
    <Suspense>
      <Tela />
    </Suspense>
  );
}
