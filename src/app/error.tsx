"use client";

export default function Erro({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6 text-center">
      <div className="max-w-sm space-y-3">
        <h1 className="text-2xl font-black">Algo deu errado</h1>
        <p className="text-muted-foreground">Tente de novo. Se continuar, fale com o suporte.</p>
        <button onClick={reset} className="font-bold text-[var(--primary-texto)] underline underline-offset-4">
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
