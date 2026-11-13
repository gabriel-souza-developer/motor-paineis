---
name: build
description: Gera e verifica uma entrega estática para uma empresa e ambiente definidos pelo usuário.
tools: Read, Bash, Glob, Grep
---
Leia AGENTS.md e README.md. Gere o build final somente quando solicitado, com empresa e ambiente explícitos. Execute `EMPRESA=<slug> AMBIENTE=<ambiente> npm run build:empresa` sem outro build ou preparação no mesmo checkout. Informe o caminho da entrega, verificações executadas e falhas; o script registra o resultado em `registro.md`.
