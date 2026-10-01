# Quickstart: Imagens de exercício na execução do treino

1. `npx expo start` e abra um treino em andamento (Android com `a`).
2. Exercícios que já têm imagem cadastrada em `src/assets/exercises/` mostram a imagem no topo do
   card, cortada para preencher a área sem esticar.
3. Exercícios sem imagem cadastrada mostram o placeholder genérico na mesma área.
4. Num treino com bi-set, confira que os dois exercícios do par mostram imagem/placeholder
   independentes.
5. Marcar/desmarcar, registrar peso e finalizar o treino continuam funcionando exatamente como
   antes (spec 007) — a imagem não interfere em nada disso.

## Adicionando uma nova imagem

1. Coloque o arquivo em `src/assets/exercises/<algo>.jpg` (ou `.png`).
2. Em `src/assets/exercises/index.ts`, adicione uma linha ao mapa `EXERCISE_IMAGES`:
   `'<name_key do exercício>': require('./<algo>.jpg')`.
   O `name_key` é o nome do exercício normalizado (minúsculas, sem espaços duplicados) — o mesmo
   valor que já existe em `exercise.name_key` no banco.
3. Reinicie o bundler (`npx expo start`); a imagem passa a aparecer automaticamente em qualquer
   treino que use esse exercício, sem nenhuma outra mudança de código.
