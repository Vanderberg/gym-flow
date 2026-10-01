# Contrato de UI: Imagens de exercício

## `ExerciseImage`

**Localização**: `src/components/workout/ExerciseImage.tsx`

**Props**:

| Prop | Tipo | Descrição |
|---|---|---|
| `name` | `string` | Nome do exercício (`WorkoutScreenItem.name`); usado para derivar a chave da imagem |

**Comportamento**:

- Resolve `normalizeName(name)` e busca em `EXERCISE_IMAGES` (`src/assets/exercises/index.ts`).
- Encontrada → `<Image>` preenchendo uma área de tamanho fixo, `resizeMode="cover"`.
- Não encontrada → placeholder genérico na mesma área de tamanho fixo (mesmo componente/ícone para
  qualquer exercício sem imagem).
- Não recebe nem chama nenhum callback; não lê nem altera estado de sessão, peso, cronômetro ou
  sequência.
- Não implementa zoom, toque para ampliar ou qualquer interação (fora de escopo desta spec).

## `ExerciseCard` (spec 007) — mudança

- Passa a renderizar `<ExerciseImage name={item.name} />` no topo do card, antes do cabeçalho
  (marcação + nome), tanto no estado recolhido quanto no expandido.
- Nenhuma prop nova é adicionada a `ExerciseCard`; `ExerciseImage` deriva tudo de `item.name`, já
  disponível.
- Bi-sets: como cada exercício do par já é um `ExerciseCard` independente (regra da spec 007), cada
  um renderiza sua própria `ExerciseImage` sem nenhuma mudança adicional.
