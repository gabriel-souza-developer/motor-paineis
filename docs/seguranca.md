# Sessão e segurança

**Hoje:** o token fica no `sessionStorage` (some ao fechar a aba) ou no `localStorage` quando o usuário marca "Manter conectado". Qualquer script injetado na página consegue ler esse token.

**Limitação da arquitetura atual:** a API da LogMovy e o painel de referência estão em sites diferentes. Cookies entre esses sites podem ser restringidos pelo navegador; a solução precisa ser validada para os domínios e a implantação reais.

**Recomendado para produção:**
1. Colocar painel e API no mesmo domínio principal (ex.: `painel.logmovy.com.br` e `api.logmovy.com.br`).
2. Projetar com a API uma sessão em cookie `HttpOnly; Secure` com `SameSite`, CORS e proteção CSRF adequados à implantação, e testar o fluxo completo no navegador. A mudança envolve backend, front-end e infraestrutura.
3. Configurar e testar uma Content Security Policy adequada ao build e ao provedor de hospedagem. O tema usa script inline em `src/app/layout.tsx`; inspecione também os scripts gerados pelo Next antes de definir hashes ou outras permissões. CSP reduz riscos, mas não elimina o risco de armazenar tokens acessíveis ao JavaScript.

A proteção de rotas no front é só experiência de uso. Quem garante o acesso é a API.
