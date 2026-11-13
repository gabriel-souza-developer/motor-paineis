<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Objetivo e fontes de configuração

O projeto gera um site estático por empresa a partir de um layout compartilhado. Antes de alterar a interface, consulte a página de referência indicada no README quando isso for relevante; ela mostra o comportamento público, não a implementação privada do serviço.

- `empresas/<slug>/perfil.json`: nome, textos, módulos, recursos e URLs por ambiente. `paleta.json`: cores de entrada. `public/`: logo e favicon da empresa.
- `npm run tema -- <slug>` gera o tema e o relatório de contraste em `empresas/<slug>/`. Não edite o CSS gerado manualmente.
- `EMPRESA=<slug> npm run dev` prepara a empresa ativa e inicia a prévia. Sem `EMPRESA`, usa `logmovy`. A prévia usa API simulada por padrão.
- `src/tema/ativa/` e `public/` são gerados e sobrescritos por `scripts/empresa-ativa.mjs`; edite as fontes em `empresas/`. O mesmo checkout não suporta preparar ou gerar builds de empresas simultaneamente: os diretórios são compartilhados.

## Regras de implementação

- Preserve o export estático (`output: "export"`): não introduza APIs, middleware ou funcionalidades que exijam servidor Next sem uma decisão explícita sobre a arquitetura. Consulte a documentação local do Next antes de alterar código.
- Os textos, módulos, cores e imagens específicos devem vir do perfil e da paleta, não de condicionais por empresa nos componentes. O gerador de temas e o perfil são a fonte de verdade.
- Use os tokens de `src/estilos.css` e do tema gerado; em superfícies da marca, use `--marca-primary` para destaque de cor, conferindo o contraste. Cores oficiais de marcas externas podem ser exceções documentadas, como o símbolo do Google.
- Mantenha rótulos acessíveis, foco visível, contraste e funcionamento em telas pequenas. Respeite `prefers-reduced-motion` também em animações que não sejam controladas por `MotionConfig`.
- As rotas de interface usam `src/app/` e telas em `src/telas/`. A navegação existente usa `~/lib/navegacao`; ao adicionar rotas ou alterar URLs, verifique o comportamento do export estático.
- Login de prévia, sessão no armazenamento do navegador, URLs de API e Google ainda não são uma solução de autenticação pronta para produção. Não apresente mocks como integração real. Consulte `docs/seguranca.md`.
- Não inclua credenciais, dados pessoais, tokens ou arquivos locais de ambiente no repositório. Perfis e URLs incluídos no repositório ou no build devem ser considerados públicos.
- `npm run build:empresa` gera uma entrega e só deve ser executado quando o usuário solicitar o build final; o build de teste de `npm run testar` é destinado à validação local.

## Verificação

- Execute `EMPRESA=<slug> npm run typecheck` para alterações TypeScript e `npm run testar -- <slug>` para mudanças de fluxo ou interface. O segundo gera um build estático simulado e grava relatórios em `relatorios/<slug>/`.
- Execute `npm run checar -- <slug>` após mudanças no tema ou layout e inspecione os resultados relevantes. As ferramentas usam Chrome local; consulte o README para configuração.
- Rode verificações de empresas diferentes sequencialmente, pois os scripts compartilham arquivos gerados. Informe testes não executados e limitações concretas.
- Em revisões, priorize problemas reproduzíveis, com arquivo, impacto e validação; não afirme ter testado API real, integração de navegador ou produção sem evidência.
