#!/usr/bin/env bash
# flow-guard — UserPromptSubmit: gate de design (spec Seção 5.2.1).
set -euo pipefail

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -r "$HOOK_DIR/lib-flowguard.sh" ] || exit 0
. "$HOOK_DIR/lib-flowguard.sh"

FEATURE_DIR="$(fg_active_feature_dir)"
[ -n "$FEATURE_DIR" ] || exit 0

SPEC="$FEATURE_DIR/spec.md"
PLAN="$FEATURE_DIR/plan.md"
TOKENS="$FEATURE_DIR/design/tokens.md"

[ -r "$SPEC" ] || exit 0
grep -qE '\*\*Tela/UI:\*\*\s*sim' "$SPEC" || exit 0
[ -r "$PLAN" ] || exit 0
[ -r "$TOKENS" ] && exit 0

if [ ! -f "${HOME}/.claude/skills/ui-design-continuity/SKILL.md" ]; then
  MSG="[flow-guard] Esta feature respondeu 'sim' à pergunta de tela/UI, mas a skill ui-design-continuity não está instalada em ~/.claude/skills/ — rode install.sh novamente antes de prosseguir para o /speckit-tasks."
else
  MSG="[flow-guard] Esta feature inclui tela/UI. Antes do /speckit-tasks, invoque a skill ui-design-continuity (que aciona frontend-design) para travar direção visual e tokens em ${FEATURE_DIR}/design/tokens.md — cada task de UI deve referenciar esses tokens em vez de decidir estilo sozinha."
fi

# Loga uma vez por feature, não a cada prompt -- o gate continua disparando
# (e reimprimindo a mensagem) em todo UserPromptSubmit até tokens.md
# existir; o log.jsonl (Seção 8 da spec) serve para entender o que
# aconteceu na sessão, não para contar quantas vezes o agente foi lembrado.
FEATURE="$(basename "$FEATURE_DIR")"
mkdir -p .flow-guard/.state
DESIGN_LOGGED=".flow-guard/.state/gate-${FEATURE}.design-logged"
if [ ! -f "$DESIGN_LOGGED" ]; then
  touch "$DESIGN_LOGGED"
  if [ -f "$HOOK_DIR/flowguard-log.sh" ]; then
    bash "$HOOK_DIR/flowguard-log.sh" design_gate "$FEATURE" 2>/dev/null || true
  fi
fi

jq -cn --arg msg "$MSG" '{hookSpecificOutput: {hookEventName: "UserPromptSubmit", additionalContext: $msg}}'
