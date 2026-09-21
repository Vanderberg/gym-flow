# Contrato: tela de treino e resumo (UI)

Direção visual: `docs/design-telas.md` §1–3 e §5 ("Placar de academia"); tokens de `src/constants/theme.ts`. Textos em pt-BR.

## Rotas

| Rota | Tipo | Conteúdo |
|------|------|----------|
| `/workout` | empilhada, sem abas | Tela de treino |
| `/workout/summary?sessionId=` | empilhada | Resumo pós-finalização |

## Tela de treino

- **Cabeçalho**: `‹` (voltar não descarta; a sessão fica em andamento), "TREINO <código>", nome do treino, `ProgramBadge`, `SegmentedProgress` com "N / M realizados". Slots opcionais para `?` (legenda) e `ⓘ` (por exercício) só renderizados se houver handler (spec 008); cronômetro ⏱ é da spec 011.
- **Aquecimento**: texto da `warmup_note` sob o cabeçalho; sem cartão, sem checkbox, fora de "N / M".
- **Cartões** por `display_order`; qualquer um pode ser expandido e marcado (sem bloqueio de ordem):
  - pendente = expandido: nome, `PrescriptionBlock` (prescrição, `TechniqueChip`, observações como estão), "ÚLTIMA CARGA X kg" ou "Sem carga anterior", `WeightInput` (− / campo / +, teclado decimal, sufixo kg), **Usar X kg** (só se houver última carga; nunca preenche sozinho), **✓ FEITO**.
  - feito = colapsado: borda `accent`, nome, primeira linha da prescrição + carga; tocar reabre para editar ou **desmarcar**.
  - bi-set: dois cartões independentes, cada um com chip BI-SET e a observação do parceiro, exibidos como estão (sem barra ou vínculo derivado da técnica).
- **Peso**: vírgula ou ponto; vazio permitido; salvo ao terminar de digitar (perda de foco, −/+, "Usar X kg"); pendente é gravado ao tocar FEITO e ao finalizar. Inválido: "Informe um valor maior ou igual a 0" ligada ao campo, sem gravar.
- **Sem exercícios**: `EmptyState` "Este treino não tem exercícios"; finalizar continua permitido.
- **Erro ao salvar**: aviso inline no cartão + **Tentar de novo**; o valor digitado não se perde.
- **Teclado aberto**: a lista rola para manter o campo visível e a barra FINALIZAR se esconde enquanto digita.
- **FINALIZAR TREINO**: barra fixa inferior, sempre habilitada (mesmo com 0 marcados); um segundo toque depois de finalizada leva ao resumo. Abre `ConfirmDialog`: "Finalizar treino? N de M exercícios realizados. (K pendentes serão registrados como não realizados)" com **Cancelar** / **Finalizar**. Falha na finalização: aviso "Não foi possível finalizar. Nada foi alterado." e a sessão continua em andamento.
- **Sem sessão em andamento** ao abrir: volta à Home (`router.replace('/')`).
- **Sem** ação de descartar (fica na Home, spec 006).

## Resumo

"Treino concluído", "N de M exercícios realizados", duração (ex.: "52 min") e **Voltar ao início** (`router.replace('/')`). Sem "Próximo" e sem confete.

## Acessibilidade

Progresso sempre com texto além da barra; estado feito/pendente com ícone e `accessibilityState` além da cor; alvos ≥ 48 dp; nome longo em até 2 linhas; `accessibilityLabel` nos botões −/+ ("Diminuir 2,5 quilos", "Aumentar 2,5 quilos").
