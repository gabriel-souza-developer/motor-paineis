import { icons, type LucideProps } from "lucide-react";

// Ícone pelo nome em kebab-case vindo do perfil.json (ex.: "calendar-check").
export function Icone({ nome, ...props }: { nome: string } & LucideProps) {
  const chave = nome.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase()) as keyof typeof icons;
  const Comp = icons[chave] ?? icons.Circle;
  return <Comp aria-hidden {...props} />;
}
