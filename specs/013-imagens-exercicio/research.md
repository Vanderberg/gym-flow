# Research: Imagens de exercício na execução do treino

## D1 — Resolução da imagem por registro estático, não por `require()` dinâmico

- **Decision**: manter um arquivo único `src/assets/exercises/index.ts` que exporta um mapa
  `EXERCISE_IMAGES: Record<string, ImageSourcePropType>`, com uma entrada `require('./<arquivo>')`
  por imagem existente, chaveada pelo `name_key` do exercício (mesmo valor gerado por
  `normalizeName` em `src/utils/normalizeName.ts`, já usado pelo `exercise` no banco).
- **Rationale**: o bundler do Expo/Metro exige que `require()`/`import` de assets estáticos use um
  literal de string analisável em tempo de build; não é possível montar o caminho a partir de uma
  variável (`require(`./${nameKey}.jpg`)` não funciona). Um registro único e explícito é o padrão
  recomendado pelo Expo para esse caso e mantém a resolução 100% offline, sem I/O de arquivo em
  runtime.
- **Consequência para FR-007**: adicionar uma nova imagem exige (a) incluir o arquivo em
  `src/assets/exercises/` e (b) acrescentar uma linha ao registro `EXERCISE_IMAGES` apontando para
  ele — não uma mudança de arquitetura, caso de uso ou schema, apenas registrar o novo asset.
- **Alternatives considered**:
  - Caminho salvo em coluna no banco (`image_path`): rejeitado pela spec (fora de escopo,
    exigiria migration) e por não trazer benefício real num app offline sem CDN.
  - `require()` dinâmico por template string: não suportado pelo Metro bundler.
  - Biblioteca de carregamento de assets por pasta (ex. `expo-asset` com manifesto gerado):
    complexidade desnecessária para um conjunto pequeno de imagens (constituição XII).

## D2 — Identificador usado para buscar a imagem

- **Decision**: `WorkoutScreenItem` não ganha campo novo; a tela deriva a chave com
  `normalizeName(item.name)` (mesma função usada pelo repositório de `exercise`) e consulta
  `EXERCISE_IMAGES[chave]`.
- **Rationale**: evita duplicar dado (a chave já é 1:1 derivável do nome) e não infla o contrato
  de `GetWorkoutSession` (mesmo raciocínio do D4 da spec 008 — não trazer dado extra que pode ser
  derivado sob demanda). `normalizeName` é puro e já teste coberto.
- **Alternatives considered**: adicionar `nameKey` ao `WorkoutScreenItem`/`ExerciseRow` — rejeitado
  por duplicar um valor já derivável e aumentar a superfície do contrato sem necessidade.

## D3 — Componente de imagem com enquadramento fixo e placeholder

- **Decision**: componente `ExerciseImage` em `src/components/workout/ExerciseImage.tsx` que
  recebe `name: string`, resolve a chave e a imagem, e renderiza:
  - Se encontrada: `<Image source={...} resizeMode="cover" style={styles.box} />` dentro de uma
    área de tamanho fixo (mesma largura/altura para todo exercício).
  - Se não encontrada: um placeholder genérico (ícone neutro) na mesma área de tamanho fixo.
- **Rationale**: atende à clarificação de enquadramento (cortar o excesso, nunca esticar, nunca
  variar a altura do card) e mantém o card testável e isolado (entrada: nome do exercício; saída:
  imagem ou placeholder), sem lógica de negócio.
- **Alternatives considered**: `resizeMode="contain"` com altura variável — rejeitado na
  clarificação por gerar cards de alturas diferentes entre exercícios.

## D4 — Nenhuma mudança de schema ou de camada de domínio/aplicação

- **Decision**: a feature é só de apresentação; não toca `domain/`, `application/`, `data/` nem
  migrations. `ExerciseCard` (spec 007) passa a renderizar `<ExerciseImage name={item.name} />`
  antes do cabeçalho do card.
- **Rationale**: constituição II (domínio puro, UI sem regra de negócio) e XII (simplicidade);
  a resolução da imagem é puramente apresentacional e não precisa de caso de uso novo.

## D5 — Cobertura de testes

- **Decision**:
  - Teste unitário de `ExerciseImage`/da função de resolução: nome com imagem cadastrada resolve
    a imagem certa; nome sem imagem cadastrada resolve o placeholder; nomes com acentuação/maiúsculas
    diferentes resolvem à mesma chave (reaproveita casos já cobertos por `normalizeName`).
  - Teste RNTL do `ExerciseCard`/tela de execução: exercício com imagem mostra a imagem; exercício
    sem imagem mostra o placeholder; um bi-set (dois itens) mostra a imagem/placeholder de cada um
    independentemente; nenhuma interação de imagem/placeholder chama `onSetCompleted`,
    `onWeightChange` ou qualquer callback de sessão (garante FR-005).
- **Rationale**: constituição XI (testes por camada) e FR-005/FR-006 da spec.
