import { Suspense } from "react";
import type { Metadata } from "next";
import Tela from "~/telas/login";

export const metadata: Metadata = { title: "Entrar" };

export default function Pagina() {
  return (
    <Suspense>
      <Tela />
    </Suspense>
  );
}
