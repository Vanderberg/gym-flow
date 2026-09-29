#!/usr/bin/env bash
# flow-guard — SessionStart: lembra a régua de 2 níveis a cada sessão.
set -euo pipefail

MSG='[flow-guard] Régua: trivial (1 arquivo, sem mudar comportamento) executa direto; qualquer feature real passa pelo ciclo Spec-Kit completo (specify -> clarify -> LGPD -> plan -> tasks -> analyze -> implementação com TDD). Catálogo de disciplinas: .flow-guard/catalogo-disciplinas.md.'

jq -cn --arg msg "$MSG" '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: $msg}}'
