#!/usr/bin/env bash
# flow-guard — UserPromptSubmit: injeta o catálogo de disciplinas (spec Seção 7.1/7.2).
set -euo pipefail

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -r "$HOOK_DIR/lib-flowguard.sh" ] || exit 0
. "$HOOK_DIR/lib-flowguard.sh"

FEATURE_DIR="$(fg_active_feature_dir)"
[ -n "$FEATURE_DIR" ] || exit 0
[ -r "$FEATURE_DIR/tasks.md" ] || exit 0
FEATURE="$(basename "$FEATURE_DIR")"

# A mensagem abaixo referencia ".flow-guard/catalogo-disciplinas.md" como
# caminho relativo à RAIZ DO PROJETO (onde o agente opera), não a HOOK_DIR —
# são leitores diferentes: o agente lê essa string e resolve a partir do cwd
# da sessão; só a lib-flowguard.sh (acima) precisa ser resolvida pelo próprio
# script, porque é o hook mesmo quem a `source`ia.
INPUT=""
[ -t 0 ] || INPUT="$(cat 2>/dev/null || true)"
PROMPT="$(printf '%s' "$INPUT" | jq -r '.prompt? // ""' 2>/dev/null || echo "")"

MSG='[flow-guard] Núcleo fixo de disciplinas (.flow-guard/catalogo-disciplinas.md): test-driven-development, systematic-debugging, verification-before-completion. Anuncie qual está seguindo citando um trecho literal do arquivo antes de escrever código de produção.'

# Loga uma vez por feature, não a cada prompt -- este hook reimprime a
# mensagem em todo UserPromptSubmit enquanto tasks.md existir; o log.jsonl
# (Seção 8 da spec) serve para entender o que aconteceu na sessão, não para
# contar repetições do lembrete.
mkdir -p .flow-guard/.state
CORE_LOGGED=".flow-guard/.state/gate-${FEATURE}.disciplina-nucleo-logged"
if [ ! -f "$CORE_LOGGED" ]; then
  touch "$CORE_LOGGED"
  if [ -f "$HOOK_DIR/flowguard-log.sh" ]; then
    bash "$HOOK_DIR/flowguard-log.sh" disciplina test-driven-development 2>/dev/null || true
  fi
fi

if printf '%s' "$PROMPT" | grep -qiE 'pronto|conclu|terminei|finaliz'; then
  MSG="$MSG Fechamento de feature: também rode requesting-code-review, commit-push-pr e finishing-a-development-branch antes de considerar isto encerrado."

  CLOSING_LOGGED=".flow-guard/.state/gate-${FEATURE}.disciplina-fechamento-logged"
  if [ ! -f "$CLOSING_LOGGED" ]; then
    touch "$CLOSING_LOGGED"
    if [ -f "$HOOK_DIR/flowguard-log.sh" ]; then
      bash "$HOOK_DIR/flowguard-log.sh" disciplina fechamento 2>/dev/null || true
    fi
  fi
fi

jq -cn --arg msg "$MSG" '{hookSpecificOutput: {hookEventName: "UserPromptSubmit", additionalContext: $msg}}'
