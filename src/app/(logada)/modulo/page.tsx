import { Suspense } from "react";
import type { Metadata } from "next";
import Tela from "~/telas/modulo";

export const metadata: Metadata = { title: "Módulo" };

export default function Pagina() {
  return (
    <Suspense>
      <Tela />
    </Suspense>
  );
}
