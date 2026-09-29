#!/usr/bin/env bash
# flow-guard — grava um evento em .flow-guard/log.jsonl.
# Uso: flowguard-log.sh <evento> [<valor>]
set -euo pipefail

EVENTO="${1:-}"
VALOR="${2:-}"
[ -n "$EVENTO" ] || { echo "uso: flowguard-log.sh <evento> [<valor>]" >&2; exit 1; }

mkdir -p .flow-guard
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
jq -cn --arg ts "$TS" --arg evento "$EVENTO" --arg valor "$VALOR" \
  '{ts: $ts, evento: $evento, valor: $valor}' >> .flow-guard/log.jsonl
