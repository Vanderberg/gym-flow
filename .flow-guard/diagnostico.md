# Diagnóstico de adoção — <!-- PENDENTE nome do projeto -->

Preenchido rodando comandos reais (spec Seção 6), nunca por inferência.
Cada célula vazia usa `<!-- PENDENTE -->` até ser perguntada/rodada.

## Seção A — Terreno (comandos)

| Campo | Comando | Resultado |
|---|---|---|
| Linguagens e proporção | `git ls-files \| sed 's/.*\.//' \| sort \| uniq -c \| sort -rn \| head` | <!-- PENDENTE --> |
| Gerenciador de pacotes | `ls package.json requirements.txt pyproject.toml go.mod Cargo.toml pom.xml build.gradle 2>/dev/null` | <!-- PENDENTE --> |
| Arquitetura de pastas | `git ls-files \| awk -F/ 'NF>1{print $1"/"$2}' \| sort -u \| head -30` | <!-- PENDENTE --> |
| Testes existentes | `git ls-files \| grep -iE '(^\|/)(tests?\|spec)s?/\|_test\.\|test_\|\.spec\.' \| head -20` | <!-- PENDENTE --> |

## Seção B — Entrevista (uma pergunta por vez)

- B1. Comandos de build/teste/subir local: <!-- PENDENTE -->
- B2. Perfil do projeto (backend/frontend/mobile/full-stack): <!-- PENDENTE -->

## Dado pessoal (alimenta `.flow-guard/paths-sensiveis.conf`)

Pergunte pelas três formas de captura de dado pessoal, não só a tabela do banco.

- Via API/backend: <!-- PENDENTE -->
- Via formulário/client-side: <!-- PENDENTE -->
- Via permissão de dispositivo (mobile): <!-- PENDENTE -->

## Gate de completude

Antes de propor `/speckit-constitution`, conte:
`grep -c '<!-- PENDENTE -->' .flow-guard/diagnostico.md`
Se maior que 0, diga o que falta e pare.
