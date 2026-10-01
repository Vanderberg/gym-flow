# Data Model: Imagens de exercício na execução do treino

Sem tabelas, colunas ou migrations novas. Nenhuma leitura ou escrita adicional no banco. A
"entidade" desta feature é um recurso estático de apresentação, resolvido em memória a partir de
dado já existente (`exercise.name`, via `WorkoutScreenItem.name` entregue pela spec 007).

```ts
// src/assets/exercises/index.ts
export const EXERCISE_IMAGES: Record<string, ImageSourcePropType> = {
  'supino reto': require('./supino-reto.jpg'),
  // uma entrada por imagem disponível; chave = normalizeName(exercise.name)
};

// src/components/workout/ExerciseImage.tsx
interface ExerciseImageProps {
  name: string; // item.name do WorkoutScreenItem (spec 007)
}
```

## Regras

- **Chave**: `normalizeName(name)` (já existente em `src/utils/normalizeName.ts`), a mesma função
  usada para gerar `exercise.name_key` no banco — garante que a mesma normalização (trim, espaços
  únicos, NFC, minúsculas pt-BR) vale tanto para persistência quanto para resolução de imagem.
- **Resolução**: `EXERCISE_IMAGES[normalizeName(name)]` encontrado → exibe a imagem; não encontrado
  → placeholder genérico. Nunca lança erro nem deixa a área vazia.
- **Enquadramento**: área de imagem tem tamanho fixo e igual para todo exercício;
  `resizeMode="cover"` corta o excesso da imagem em vez de esticar ou variar a altura do card.
- **Independência por item**: bi-sets são dois `WorkoutScreenItem` distintos (regra já existente da
  spec 007); cada um resolve sua própria imagem/placeholder sem relação entre si.
- **Invariante**: renderizar `ExerciseImage` não lê nem escreve `workout_session`,
  `workout_session_exercise`, `program_sequence_state`, `app_settings` nem qualquer store; é uma
  função pura de `name` para um `ImageSourcePropType` (ou placeholder).
