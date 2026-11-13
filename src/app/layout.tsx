import type { Metadata } from "next";
import { empresa } from "~/tema/empresa";
import { Provedores } from "~/components/shell/provedores";
import "~/estilos.css";

export const metadata: Metadata = {
  title: { default: `${empresa.nome} | ${empresa.eyebrowLogin}`, template: `%s | ${empresa.nome}` },
  icons: { icon: `/${empresa.logos.favicon}` },
};

// Aplica o tema salvo antes da pintura, para não piscar.
const scriptTema = `try{var t=localStorage.getItem("${empresa.slug}_tema");if(t==="escuro"||(!t&&${empresa.recursos.modoEscuro}&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <Provedores>{children}</Provedores>
      </body>
    </html>
  );
}
