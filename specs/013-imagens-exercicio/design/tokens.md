# Design tokens: Imagens de exercício

**Direção visual**: reaproveita integralmente "Placar de academia" (tema escuro), já estabelecida
em `src/constants/theme.ts` e `docs/design-telas.md`. Esta feature **não** cria nenhuma direção
nova — apenas estende o `ExerciseCard` existente (spec 007) com um bloco de imagem/placeholder.

## Tokens reaproveitados (já existentes em `src/constants/theme.ts`)

| Token | Valor | Uso nesta feature |
|---|---|---|
| `radius.md` | 14 | Borda do bloco de imagem/placeholder — mesmo token usado em `Button` e `WeightInput`, elementos internos do mesmo card |
| `colors.surfaceRaised` | `#22251D` | Fundo do placeholder (um tom acima de `colors.surface`, o fundo do card) |
| `colors.border` | `#2E3227` | Borda do bloco de imagem/placeholder |
| `colors.textMuted` | `#7C8070` | Cor do glifo do placeholder — mesmo tom usado no ícone do `EmptyState` |
| `spacing.sm` | 8 | Espaço entre o bloco de imagem e o cabeçalho do card |

## Token novo desta feature (extensão explícita, não um novo sistema)

| Token | Valor | Justificativa |
|---|---|---|
| `EXERCISE_IMAGE_HEIGHT` | `160` | Altura fixa da área de imagem/placeholder dentro do card; múltiplo de 8 (mesma escala de `spacing`); calibrado para não empurrar a prescrição/peso para fora da tela quando o card expande. Definido em `src/components/workout/ExerciseImage.tsx` (não entra em `theme.ts` global por ser específico deste componente — se outra tela vier a precisar do mesmo valor, promover para `sizes`) |

## Placeholder ("sem imagem")

Reaproveita o vocabulário visual do `EmptyState` (`src/components/common/EmptyState.tsx`): um
glifo geométrico monocromático (mesma família de `✓`, `○`, `ⓘ` já usados no app — nunca emoji),
cor `colors.textMuted`, centralizado, sobre fundo `colors.surfaceRaised` com borda `colors.border`.
Glifo escolhido: `▦`.

## Regra para as tasks de UI

Toda task desta spec que tocar `ExerciseImage.tsx` ou `ExerciseCard.tsx` MUST usar os tokens desta
tabela (via `src/constants/theme.ts` + a constante local `EXERCISE_IMAGE_HEIGHT`), nunca valores
soltos (magic numbers) ou cores fora de `colors`.
