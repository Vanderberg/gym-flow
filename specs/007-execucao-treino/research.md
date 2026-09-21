# Research: Execução do Treino

## D1 — Finalização em uma transação, com pesos pendentes
- **Decision**: `FinishWorkout.execute({ sessionId, pendingWeights? })` roda em `db.transaction` (repositórios construídos sobre a transação; sessão já finalizada → `ConflictError`, e a UI navega ao resumo): (1) grava os `pendingWeights` (mapa `exerciseId → number | null`, já validados), (2) `finishSession`, (3) se `settings.sequenceType = 'CONTINUOUS'`, `SequenceStateRepository.upsert(programId, advancePosition(treino.position, posiçõesAtivas))`, (4) devolve o resumo. Qualquer falha desfaz tudo; a sessão segue em andamento e a posição não muda (SC-004).
- **Rationale**: FR-005 e constituição X. Levar os pesos pendentes na mesma transação garante que nada digitado se perde (clarificação 4) e que a finalização é atômica.
- **Alternatives**: gravar os pesos antes, fora da transação (uma falha na finalização deixaria pesos gravados, mas a sessão continua em andamento e isso é inofensivo; porém dois passos separados complicam o tratamento de erro).

## D2 — Avanço a partir do treino finalizado (clarificação 1)
- **Decision**: a nova posição é `advancePosition(finishedWorkout.position, activePositions)` (004), independente da `current_position` anterior. Treino finalizado que não está mais ativo (desativado por atualização do seed durante a sessão) conta como "sem correspondência" na função da 004 (resultado: a segunda posição), sem erro. Na semanal, nada é gravado.
- **Rationale**: o app segue o que o usuário fez; cobre reinício e troca de tipo com sessão em andamento.

## D3 — Persistência a cada alteração (FR-006)
- **Decision**: marcar/desmarcar chama `SetExerciseCompleted` (idempotente: define o estado alvo, não alterna); o peso é gravado ao terminar de digitar (perda de foco, `−`/`+`, "Usar X kg") por `SetExerciseWeight`; `SetExerciseCompleted` aceita `pendingWeight` opcional para gravar peso e marcação numa transação curta (FEITO com o campo ainda focado).
- **Rationale**: clarificação 4 e SC-002; idempotência evita estado errado em toque duplo.
- **Alternatives**: gravar a cada tecla (excesso de escritas, sem ganho); só ao tocar FEITO (perde o valor se o app fechar antes).

## D4 — Peso: entrada e validação
- **Decision**: `parseWeightInput(text)` aceita vírgula ou ponto como separador; texto vazio → `{ ok: true, value: null }`; número finito ≥ 0 → arredondado a 2 casas decimais; negativo, não numérico, `NaN` ou `Infinity` → `{ ok: false, reason: 'INVALID' }` ("Informe um valor maior ou igual a 0"). `formatWeight` exibe com vírgula e sem zeros à direita. Não há limite superior nesta spec.
- **Rationale**: constituição IV (peso nulo ou ≥ 0) e edge case de vírgula/ponto; o schema já garante `weight >= 0`.
- **Alternatives**: limite máximo (regra inventada, fora do escopo).

## D5 — `−` / `+` e "Usar X kg"
- **Decision**: `−`/`+` ajustam o campo em passos de 2,5 kg (mínimo 0) e gravam ao soltar; "Usar X kg" copia a última carga para o campo e grava. Nenhum preenche sozinho.
- **Rationale**: design §3/§5; ajuda de digitação, não sugestão (constituição VIII).

## D6 — Última carga
- **Decision**: `GetWorkoutSession` chama `SessionRepository.getLastWeight(programId, exerciseId)` por item (mesmo programa; sessões finalizadas com peso; a sessão atual não conta por estar em andamento). Sem histórico → "Sem carga anterior".
- **Rationale**: FR-004; volume pequeno (≤ 15 itens), sem consulta nova na 002.

## D7 — Bi-set sem vínculo derivado
- **Decision**: bi-set = dois cartões independentes, cada um com o chip da técnica (`TechniqueChip`) e a observação do parceiro, exibidos como estão. O app não deriva vínculo visual a partir de `technique`.
- **Rationale**: constituição VII (o app não interpreta técnica nem prescrição); o design já diz que chip e observação bastam para indicar o par sem depender de cor.
- **Alternatives**: barra lateral entre cartões consecutivos com `technique = 'BI-SET'` (interpretaria a técnica; exigiria emenda à constituição).

## D8 — Aquecimento fora das contagens
- **Decision**: `WarmupNote` exibe `workout.warmup_note` como texto sob o cabeçalho; não é item, não tem estado e `computeProgress` só conta linhas de `workout_session_exercise`.
- **Rationale**: FR-007, BL-121.

## D9 — Resumo pós-finalização (clarificação 2)
- **Decision**: `/workout/summary?sessionId=…` lê a sessão finalizada (`GetFinishSummary`): "N de M exercícios realizados" e duração (`formatDuration(started_at, finished_at)`, por exemplo "52 min"), botão **Voltar ao início**; sem "Próximo".
- **Rationale**: FR-005a; a Home mostra o próximo treino.

## D10 — Descartar e ajuda fora desta tela
- **Decision**: a tela não tem "Descartar" (clarificação 3; fica na Home, spec 006). `?`/`ⓘ` e o cronômetro são das specs 008 e 011: a tela só aceita handlers opcionais e reserva o espaço.
- **Rationale**: escopo; evita botões mortos.

## D11 — Estado e recuperação
- **Decision**: `workoutStore` guarda só estado de UI (rascunho de peso por cartão, expandidos, erro por cartão); tudo o que importa vem do SQLite. Ao abrir `/workout` sem sessão em andamento, volta à Home (`router.replace('/')`). Ao reabrir o app, a Home oferece Continuar (006) e a tela recarrega marcações e pesos do banco.
- **Rationale**: constituição I; US3 cenário 2 e SC-002.

## D12 — Erros de salvamento
- **Decision**: falha ao gravar mostra aviso inline no cartão com **Tentar de novo**; o texto digitado permanece no rascunho e é tentado de novo, e a finalização o inclui em `pendingWeights`.
- **Rationale**: design §5.4; nada digitado se perde.
