# Motor de Painéis

Gera painéis web para várias empresas a partir de um layout compartilhado, inspirado na [LogMovy](https://gest-ologmovy.pages.dev/).
Cada empresa fornece `perfil.json` (nome, textos, módulos e URLs), `paleta.json` (cores) e seus arquivos públicos, como logo e favicon.
O resultado é um build **100% estático** (HTML, CSS e JavaScript), pronto para qualquer servidor que só recebe arquivos de front-end.

## Começar

Requisitos: Node.js 20.9 ou superior e npm. Para testes visuais, instale o Google Chrome ou informe seu caminho em `CHROME`.

```bash
npm install
npm run dev                      # prévia da LogMovy em http://localhost:3000 (login de teste: qualquer e-mail, senha com 4+ caracteres)
EMPRESA=demo npm run dev         # prévia de outra empresa
EMPRESA=aurora npm run dev       # prévia da Aurora
```

No modo de prévia, a API é simulada (mock): os dados de login não são enviados a uma API externa.

Os comandos de preparação, teste e build sobrescrevem `src/tema/ativa/` e `public/`. Execute-os sequencialmente no mesmo checkout; para trabalhar com empresas ao mesmo tempo, use checkouts isolados. Arquivos de perfis e quaisquer URLs incluídos em uma entrega estática podem ser lidos por quem a acessar: não coloque credenciais neles.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run nova-empresa -- <slug> --nome "Nome" --primaria "#hex"` | Cria `empresas/<slug>/` e gera o tema |
| `npm run tema -- <slug>` | Completa a paleta e gera `tema.css` e `relatorio-cores.md` (contraste WCAG AA) |
| `npm run checar -- <slug>` | QA: cor fixa, travessão, ícones, rotas, contraste, typecheck e capturas em `relatorios/<slug>/` |
| `EMPRESA=<slug> AMBIENTE=<dev\|homologacao\|producao> npm run build:empresa` | **Build final.** Só quando o usuário pedir. Sai em `dist/<slug>/` |

O build recusa: ambiente não informado, URL da API vazia para o ambiente e build de produção apontando para Dev.

## Empresa nova, passo a passo

1. `npm run nova-empresa -- acme --nome "Acme" --primaria "#7C3AED"`
2. Edite `empresas/acme/perfil.json`: textos do login, indicadores, módulos e URLs da API. O comando copia o perfil da LogMovy, inclusive textos e URLs; substitua ou remova esses dados antes de compartilhar ou publicar a nova empresa.
3. Troque `empresas/acme/public/logo.svg` e `favicon.svg` pelos arquivos reais.
4. `npm run checar -- acme` e confira as capturas.
5. Quando autorizado: `EMPRESA=acme AMBIENTE=producao npm run build:empresa` e suba a pasta `dist/acme/`.

## Testes

| Comando | O que faz | Quando usar |
|---|---|---|
| `npm run checar -- <slug>` | Revisão rápida do código e do visual: cor fixa, travessão, ícones, contraste, typecheck e capturas em `relatorios/<slug>/` | Depois de mexer no perfil, na paleta ou nas telas |
| `npm run testar -- <slug>` | Gera o build de teste (API simulada), serve os arquivos como um servidor comum e roda os fluxos no Chrome: login, validações, senha, painel de módulos, busca, menu, perfil, 404, celular e movimento reduzido. As expectativas saem do `perfil.json` da empresa. Relatório em `relatorios/<slug>/testes/index.html` | Antes de pedir o build final e sempre que uma tela mudar |
| `npm run verificar-deploy -- <slug> <url> [--ambiente producao]` | Confere o site já publicado, só leitura e sem login: todas as páginas (com e sem barra final), título, arquivos de `/_next` completos, CSS com o tipo certo, 404, favicon e, com `--ambiente`, a URL da API certa e nenhuma referência a Dev em produção. Salva `relatorios/<slug>/deploy-checklist.txt` e uma captura do login | **Sempre depois de subir os arquivos no servidor** |

Opções do `testar`: `--sem-build` reaproveita o último build de teste; `--servir` só sobe o servidor do build para conferir no navegador. O Chrome usado é `/usr/bin/google-chrome` (troque com a variável `CHROME`).

## O que cada empresa configura

- **perfil.json:** nome, produto, slogan, URLs da API por ambiente, textos e visual do login (`rede`, `abstrato`, `grafico`, `imagem`), chips e indicadores (`fonte: "api"` busca o valor ao vivo; `"fixo"` usa o texto e esconde o selo "tempo real"), módulos (`ativo`, `em-breve`, `bloqueado-permissao`) e recursos (login Google, modo escuro, validade do link de senha).
- **Painel (opcionais em `perfil.painel`):** `saudacao` (ex.: `"Bem-vindo, {nome}!"`), `cta` (botão no hero, ex.: "Ver imóveis"), `indicadores` (faixa de cards abaixo do hero) e `rotuloAtivo` (selo dos módulos ativos, padrão "Disponível"). `recursos.sso: true` mostra "Segurança: SSO Ativo" no card da conta.
- **Exemplos prontos:** `logmovy` (referência), `aurora` (empresa fictícia), `shalom` (imobiliária de exemplo) e `demo` (empresa fictícia com cor principal escura).
- **paleta.json:** `primaria` (obrigatória), `secundaria` e `superficieMarca` (o quase preto do login, topbar e hero). O resto é gerado.

Ícones: nomes do Lucide em kebab-case (https://lucide.dev/icons). O `checar` avisa se algum não existir.

## Telas prontas

Login (`/login`), esqueci a senha, redefinir senha (`?token=`), painel de módulos (`/painel`), perfil e senha (`/perfil`), entrada de módulo (`/modulo?id=`) e 404.
As telas internas de cada módulo são feitas sob medida e entram como telas novas: componente em `src/telas/` e página em `src/app/<rota>/page.tsx`.

## Pendências para produção

- Conferir os endpoints em `src/lib/api.ts` (`ENDPOINTS`) e o formato das respostas com a API real.
- Preencher as URLs de `homologacao` e `producao` no `perfil.json`.
- Logo real da LogMovy em `empresas/logmovy/public/` (hoje há um provisório "LM").
- Login com Google: falta o fluxo real (hoje mostra aviso).
- Sessão: ver `docs/seguranca.md`.

## Orientações para desenvolvimento

Leia [AGENTS.md](AGENTS.md) para regras de implementação, arquivos gerados e verificações. [docs/seguranca.md](docs/seguranca.md) registra os limites da sessão atual, e [docs/evolucao.md](docs/evolucao.md) lista o trabalho pendente para publicação e escala. Os agentes opcionais em `.claude/agents/` tratam de tema, telas, QA e build; seguem as mesmas regras do projeto.

## Stack

Next.js 16 (App Router, `output: "export"`), React 19, Tailwind CSS 4, Radix, Motion, Lucide, culori e colorjs.io (paleta), Playwright (testes e capturas).
