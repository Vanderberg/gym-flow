#!/usr/bin/env bash
# flow-guard — UserPromptSubmit: skills condicionais por perfil de projeto (spec Seção 7.3).
# frontend-design NUNCA é roteada aqui — ela tem gatilho próprio em design-gate.sh (5.2.1).
set -euo pipefail

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -r "$HOOK_DIR/lib-flowguard.sh" ] || exit 0
. "$HOOK_DIR/lib-flowguard.sh"

FEATURE_DIR="$(fg_active_feature_dir)"
[ -n "$FEATURE_DIR" ] || exit 0
[ -r "$FEATURE_DIR/tasks.md" ] || exit 0

PERFIL=""
if [ -r .flow-guard/constitution.md ]; then
  PERFIL="$(grep -E '^Perfil do projeto:' .flow-guard/constitution.md | head -1 | cut -d: -f2- || true)"
fi

LINES=()
LINES+=("test-generator (código já existente, sempre útil em brownfield)")

case "$PERFIL" in
  *PENDENTE*|"") : ;;
  *backend*|*full-stack*) LINES+=("api-design (consistência de endpoints, semântica HTTP)") ;;
esac

if [ -r TECH-DEBT.md ] && grep -q 'status: open' TECH-DEBT.md 2>/dev/null; then
  LINES+=("refactor-guide (TECH-DEBT.md tem item aberto)")
fi

JOINED="$(printf '%s; ' "${LINES[@]}")"
MSG="[flow-guard] Skills condicionais pelo perfil do projeto: ${JOINED}"

jq -cn --arg msg "$MSG" '{hookSpecificOutput: {hookEventName: "UserPromptSubmit", additionalContext: $msg}}'
