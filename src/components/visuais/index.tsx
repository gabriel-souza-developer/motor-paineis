"use client";
import type { VisualLogin as TipoVisual } from "~/tema/tipos";
import { VisualRede } from "./rede";
import { VisualAbstrato } from "./abstrato";
import { VisualGrafico } from "./grafico";
import { VisualImagem } from "./imagem";

// Escolhe a ilustração do login pelo perfil (login.visual).
export function VisualLogin({ tipo, imagem }: { tipo: TipoVisual; imagem?: string }) {
  switch (tipo) {
    case "rede":
      return <VisualRede />;
    case "grafico":
      return <VisualGrafico />;
    case "imagem":
      return <VisualImagem src={imagem} />;
    default:
      return <VisualAbstrato />;
  }
}
