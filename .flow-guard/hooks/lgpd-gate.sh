#!/usr/bin/env bash
# flow-guard — PreToolUse: LGPD incondicional antes de plan.md.
set -euo pipefail

ERRLOG=".flow-guard/hooks-errors.log"
INPUT=""
[ -t 0 ] || INPUT="$(cat 2>/dev/null || true)"

PATH_TARGET="$(printf '%s' "$INPUT" | jq -r '
  (.tool_input.file_path? // .tool_input.path? // "-")
' 2>>"$ERRLOG" || echo "-")"

# Claude Code always sends an absolute file_path (Windows-style with
# backslashes, or Unix-style), never the bare relative form -- normalize
# backslashes and accept either an absolute or relative specs/*/plan.md.
PATH_TARGET="$(printf '%s' "$PATH_TARGET" | tr '\\' '/')"

case "$PATH_TARGET" in
  specs/*/plan.md|*/specs/*/plan.md) : ;;
  *) exit 0 ;;
esac

FEATURE_DIR="$(dirname "$PATH_TARGET")"
[ -r "$FEATURE_DIR/parecer-lgpd.md" ] && exit 0

REASON="LGPD incondicional: specs/$(basename "$FEATURE_DIR")/parecer-lgpd.md ainda não existe. Antes do /speckit-plan, produza o parecer LGPD (templates em .flow-guard/lgpd-auditor.md) cobrindo as 3 formas de captura de dado pessoal (API/backend, formulário/client-side, permissão de dispositivo) — mesmo que a spec não mencione dado pessoal explicitamente."

jq -cn --arg reason "$REASON" \
  '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: $reason}}'
