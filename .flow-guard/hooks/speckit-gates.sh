#!/usr/bin/env bash
# flow-guard — PostToolUse: garante que /speckit-clarify (+ a pergunta fixa de
# UI, spec Seção 5.2) não seja pulado quando spec.md nasce sem ## Clarifications.
set -euo pipefail

ERRLOG=".flow-guard/hooks-errors.log"
INPUT=""
[ -t 0 ] || INPUT="$(cat 2>/dev/null || true)"

PATH_TARGET="$(printf '%s' "$INPUT" | jq -r '
  (.tool_input.file_path? // .tool_input.path? // "-")
' 2>>"$ERRLOG" || echo "-")"

# Claude Code always sends an absolute file_path (Windows-style with
# backslashes, or Unix-style), never the bare relative form -- normalize
# backslashes and accept either an absolute or relative specs/*/spec.md.
PATH_TARGET="$(printf '%s' "$PATH_TARGET" | tr '\\' '/')"

case "$PATH_TARGET" in
  specs/*/spec.md|*/specs/*/spec.md) : ;;
  *) exit 0 ;;
esac

FEATURE_DIR="$(dirname "$PATH_TARGET")"
FEATURE="$(basename "$FEATURE_DIR")"

grep -q '^## *Clarifications' "$PATH_TARGET" 2>/dev/null && exit 0

mkdir -p .flow-guard/.state
STATE=".flow-guard/.state/gate-${FEATURE}.clarify"
[ -f "$STATE" ] && exit 0
touch "$STATE"

MSG="[flow-guard] specs/${FEATURE}/spec.md foi criada sem '## Clarifications'. Execute /speckit-clarify agora, antes do plano. Durante o clarify, faça também a pergunta fixa: \"esta feature inclui alguma tela/interface nova ou alterada?\" e registre a resposta em spec.md como uma linha \`**Tela/UI:** sim\` ou \`**Tela/UI:** não\` — é o que o gate de design (design-gate.sh) consulta antes do /speckit-tasks."

jq -cn --arg msg "$MSG" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $msg}}'
