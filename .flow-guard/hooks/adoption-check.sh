#!/usr/bin/env bash
# flow-guard — SessionStart: avisa (nunca bloqueia) enquanto a adoção não rodou.
set -euo pipefail

# Resolve lib-flowguard.sh ao lado do PRÓPRIO script, não por caminho fixo a
# partir do cwd — funciona tanto testado isoladamente (arquivos lado a lado
# em .flow-guard/) quanto instalado de verdade (lado a lado em .flow-guard/hooks/).
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -r "$HOOK_DIR/lib-flowguard.sh" ] || exit 0
. "$HOOK_DIR/lib-flowguard.sh"

fg_repo_governado && exit 0

MSG='[flow-guard] A adoção deste repositório ainda não foi concluída (falta constituição preenchida e/ou o evento "diagnostico" no log). Na primeira feature real (não trivial), conduza o diagnóstico de adoção e a constituição antes do /speckit-plan — ver docs/02-guia-de-adocao.md.'

jq -cn --arg msg "$MSG" '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: $msg}}'
