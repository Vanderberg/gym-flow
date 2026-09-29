#!/usr/bin/env bash
# flow-guard — biblioteca compartilhada. NÃO é um hook: não é registrado em
# settings.json, não lê stdin. Carregada com `. .flow-guard/hooks/lib-flowguard.sh`
# pelos hooks que precisam das respostas abaixo.
#
# A distinção entre "marcador de template" e "conteúdo preenchido" segue o
# mesmo raciocínio documentado no lib-governanca.sh do SulaFlow original: o
# Spec-Kit grava um bloco <!-- Sync Impact Report --> no TOPO da constituição
# mesmo quando ela está vazia — um grep ingênuo no arquivo inteiro conta esse
# cabeçalho como "preenchido". Por isso ignoramos tudo entre `<!--` e `-->`
# antes de procurar marcadores [ALGO_EM_MAIUSCULA].

fg_marcadores_constituicao() {
  local const="${FG_CONSTITUICAO:-.flow-guard/constitution.md}"
  [ -s "$const" ] || return 0
  awk '/<!--/{c=1} c{print ""; if(/-->/) c=0; next} {print}' "$const" \
    | grep -nEo '\[[A-Z][A-Z0-9_]{2,}\]' 2>/dev/null | sort -u -t: -k2 || true
}

fg_constituicao_preenchida() {
  local const="${FG_CONSTITUICAO:-.flow-guard/constitution.md}" n
  [ -s "$const" ] || return 1
  n="$(fg_marcadores_constituicao | grep -c . || true)"
  [ "${n:-0}" -lt 2 ]
}

fg_diagnostico_registrado() {
  [ -r .flow-guard/log.jsonl ] || return 1
  grep -q '"evento":"diagnostico"' .flow-guard/log.jsonl 2>/dev/null
}

fg_repo_governado() {
  fg_constituicao_preenchida && fg_diagnostico_registrado
}

# Simplificação deliberada vs. o SulaFlow original (que lê .specify/feature.json
# do próprio Spec-Kit): assume que o autor trabalha uma feature por vez, e usa a
# pasta mais recentemente tocada em specs/. Documentado como simplificação
# aceita na spec (Global Constraints deste plano).
fg_active_feature_dir() {
  # `ls` exits non-zero when the specs/*/ glob matches nothing (fresh
  # install, before the first /speckit-specify) -- under set -euo pipefail
  # that would abort the calling hook entirely instead of just finding no
  # active feature. The `|| true` makes "no feature yet" a normal, silent
  # empty result rather than a fatal error.
  ls -td specs/*/ 2>/dev/null | head -1 | sed 's:/$::' || true
}
