# Contrato: Home (UI)

Direção visual: `docs/design-telas.md` §1–4 ("Placar de academia"); tokens de `src/constants/theme.ts`. Textos em pt-BR.
Rota: `/(tabs)/index`.

## Estrutura

Cabeçalho "MEU TREINO" + `ProgramBadge` (nome do programa) + tipo de sequência ("Sequência contínua" / "Dias da semana");
indicador (SequenceRail ou WeekStrip, conforme `HomeView.indicator`); cartão principal; `SuggestionCard` quando houver
sugestão. **Sem** ÚLTIMO, ESTE MÊS nem "Reiniciar sequência".

## Cartão principal por estado

| `card.kind` | Conteúdo | Ação |
|-------------|----------|------|
| `WORKOUT` (contínua) | "PRÓXIMO TREINO · DIA 3 / Perna Completo · 6 exercícios" | **COMEÇAR TREINO** |
| `WORKOUT` (semanal) | "<DIA DA SEMANA> · TREINO C / nome · N exercícios"; marca "Concluído hoje" se `doneToday` | **COMEÇAR TREINO** (continua ativo) |
| `REST` | "<DIA> · DESCANSO" | secundária **Ver treinos do programa** |
| `OPTIONAL_DAY` | "<DIA> · OPCIONAL" + texto da agenda como está | secundária **Ver treinos do programa** |
| `NO_SCHEDULE` | "Sem agenda configurada para este programa" | **Voltar para sequência contínua** (chama `SelectSequenceStrategy('CONTINUOUS')`); sem iniciar |
| `NO_WORKOUTS` | "Este programa não tem treinos ativos" | nenhuma |
| `IN_PROGRESS` | "TREINO EM ANDAMENTO · <treino> · 4 / 9 realizados" | **CONTINUAR TREINO** (`router.push('/workout')`); sem botão de iniciar outro treino |

## Comportamento

- **COMEÇAR TREINO** chama `StartWorkout(workout.id)` e navega para `/workout`. Do abrir o app ao treino iniciado: 1 toque
  (2 pela lista "Ver treinos do programa": SC-001).
- **Ver treinos do programa** abre `ProgramWorkoutsSheet` com os treinos ativos; tocar em um chama `StartWorkout` com ele.
- **Sessão pendente ao abrir o app**: diálogo (uma vez por abertura) "Você possui um treino em andamento" — **Continuar**
  (primário) e **Descartar** (danger, segunda confirmação "Descartar o treino em andamento? Isso não altera sua sequência
  nem suas estatísticas."). Fechar o diálogo mantém o cartão `IN_PROGRESS`. Abrir e fechar não escreve nada.
- **Carregando**: `HomeSkeleton` com a altura do cartão principal (sem salto). **Erro**: "Não foi possível carregar seus
  treinos" + **Tentar de novo**.
- **Reavaliação**: ao voltar ao app ou à aba, a Home recarrega; se a data local mudou, o dia é reavaliado.
- Nenhum carregamento cria sessão. Nenhum texto é gerado pelo app: nota do dia e sugestão vêm do programa.
- Acessibilidade: dia atual e dias feitos no WeekStrip com ponto/✓ além da cor; alvos ≥ 48 dp; nome de treino longo até
  2 linhas sem cortar o botão.
