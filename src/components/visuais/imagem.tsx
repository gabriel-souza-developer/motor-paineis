"use client";
import { VisualAbstrato } from "./abstrato";

// Foto da empresa (login.imagem) com véu da superfície da marca para manter o contraste.
export function VisualImagem({ src }: { src?: string }) {
  if (!src) return <VisualAbstrato />;
  return (
    <div className="relative size-full">
      <img src={`/${src.replace(/^\//, "")}`} alt="" className="size-full object-cover" loading="eager" />
      <div className="absolute inset-0 bg-gradient-to-t from-marca-1/85 via-marca-1/30 to-marca-1/10" />
    </div>
  );
}
