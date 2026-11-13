# Evolução e preparação para publicação

Este documento descreve o estado observado do projeto e os trabalhos pendentes. A página pública de referência serve para comparar a interface; ela não revela a implementação privada do backend ou as garantias de segurança dele.

## Antes de publicar o repositório

- Revisar perfis de empresas, imagens, nomes, URLs e histórico Git para decidir o que pode ser público. Remover segredos antes de criar qualquer commit; `.gitignore` não protege arquivos já versionados.
- Definir a licença e documentar responsáveis e forma de contribuição, de acordo com o destino do projeto.
- Criar automação de integração contínua que instale dependências e execute verificações por empresa, em ambientes isolados ou sequencialmente. Os scripts atuais usam arquivos gerados compartilhados.
- Confirmar que a versão de Node e o Chrome necessários para as verificações estão documentados e disponíveis no ambiente de CI.

## Antes de produção

- Definir e testar contratos reais de autenticação, renovação de sessão, encerramento, recuperação de senha e autorização na API. O login de prévia é simulado e a proteção de rotas no navegador não substitui a autorização do servidor.
- Definir o fluxo real de login Google ou desabilitar o recurso no perfil; atualmente o botão só exibe um aviso.
- Revisar armazenamento e revogação de sessão, proteção contra scripts injetados e configuração de cabeçalhos. Consulte `seguranca.md`; a solução de cookies depende dos domínios, da API e do modelo de implantação.
- Validar URLs e ambientes de cada empresa, conferir o build e testar em homologação com a API real. Os testes atuais cobrem a interface com mock, não a integração real.
- Corrigir o ciclo de vida da sessão entre `sessionStorage` e `localStorage` e testar mudança de conta, expiração e saída em múltiplas abas.

## Para crescer com várias empresas

- Isolar a preparação e a saída de cada build. Atualmente `scripts/empresa-ativa.mjs` recria `src/tema/ativa/` e `public/`, e builds concorrentes no mesmo checkout podem se misturar.
- Validar o formato de `perfil.json`, os identificadores de empresa e as URLs antes de gerar arquivos ou executar comandos. Evitar interpolar valores em comandos de shell.
- Acrescentar testes de contrato da API e testes de integração para os ambientes reais; manter testes de interface por empresa representativa e acessibilidade.
- Se a quantidade de empresas justificar, avaliar como distribuir builds e configurações. A arquitetura atual gera um site estático separado por empresa e não faz seleção dinâmica de empresa em tempo de execução.
