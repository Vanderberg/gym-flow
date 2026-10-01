# Feature Specification: Imagens de exercício na execução do treino

**Feature Branch**: `013-imagens-exercicio`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "Imagens de exercício na tela de execução do treino: cada exercício exibido durante um treino em andamento mostra uma imagem ilustrativa, resolvida por convenção a partir do name_key do exercício (asset empacotado no app, ex. src/assets/exercises/<name_key>.jpg). Quando não houver imagem disponível para o exercício (cobertura parcial esperada, especialmente no Treino Monstro), exibir um placeholder genérico no lugar, sem quebrar o layout. Bi-sets mostram a imagem de cada exercício do par normalmente, sem tratamento especial. Fora do escopo desta spec: produção/recorte das imagens em si (fornecidas manualmente depois), tela de ajuda/legenda de técnicas, zoom/lightbox da imagem, e qualquer mudança de schema do banco (a resolução é por convenção de nome de arquivo, não por coluna no SQLite)."

## Clarifications

**Tela/UI:** sim — a tela de execução de treino existente ganha um novo elemento visual (imagem/placeholder por exercício).

### Session 2026-09-30

- Q: Esta feature inclui alguma tela/interface nova ou alterada? → A: Sim — a tela de execução de treino existente ganha um novo elemento visual (imagem/placeholder por exercício).
- Q: Como a imagem deve se comportar dentro do espaço reservado no card do exercício, já que as fotos fornecidas depois podem ter proporções diferentes entre si? → A: Enquadrar cortando o excesso, preenchendo todo o espaço reservado (área de tamanho fixo), mantendo o layout sempre idêntico entre exercícios.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver imagem do exercício durante o treino (Priority: P1)

Enquanto executa um treino, o usuário vê uma imagem ilustrativa de cada exercício, ajudando a confirmar a postura/execução correta sem precisar lembrar de cor ou consultar outra fonte.

**Why this priority**: É o valor central da feature — sem isso não há entrega.

**Independent Test**: Iniciar um treino que tenha ao menos um exercício com imagem disponível e verificar que a imagem aparece junto ao exercício correspondente na tela de execução.

**Acceptance Scenarios**:

1. **Given** um treino em andamento com um exercício que possui imagem cadastrada, **When** o usuário visualiza esse exercício na tela de execução, **Then** a imagem correspondente é exibida junto às informações do exercício (prescrição, técnica, peso).
2. **Given** um treino com um bi-set (dois exercícios distintos em sequência), **When** o usuário visualiza a tela de execução, **Then** cada exercício do par exibe sua própria imagem de forma independente.

---

### User Story 2 - Layout consistente quando não há imagem (Priority: P2)

Como a cobertura de imagens é parcial (principalmente no Treino Monstro, e parte do Treino Padrão), o usuário não deve ver a tela quebrada, vazia ou inconsistente quando um exercício ainda não tem imagem.

**Why this priority**: Sem isso, a maioria dos exercícios (sem imagem ainda) teria uma experiência degradada, e a feature dependeria de 100% de cobertura de imagens para ser utilizável — o que não é o caso hoje.

**Independent Test**: Iniciar um treino com um exercício que não possui imagem e verificar que um placeholder genérico aparece no lugar, mantendo o mesmo layout dos exercícios com imagem.

**Acceptance Scenarios**:

1. **Given** um treino em andamento com um exercício sem imagem cadastrada, **When** o usuário visualiza esse exercício na tela de execução, **Then** um placeholder genérico de "sem imagem disponível" é exibido no espaço da imagem.
2. **Given** uma lista de exercícios na tela de execução onde alguns têm imagem e outros não, **When** o usuário rola a tela, **Then** o alinhamento e o espaçamento dos itens permanecem consistentes entre exercícios com e sem imagem.

### Edge Cases

- Exercício com `name_key` que não corresponde a nenhum asset de imagem empacotado: tratado como "sem imagem disponível" (placeholder), não como erro.
- Imagem fornecida com proporção diferente da área reservada (ex.: foto muito larga ou muito alta): é enquadrada cortando o excesso, sem esticar nem alterar a altura do card do exercício.
- Treino sem nenhum exercício com imagem cadastrada (ex.: todo o Treino Monstro hoje): tela de execução funciona normalmente, todos os itens mostram placeholder.
- Sessão retomada (Continuar após reabrir o app): imagens/placeholders são resolvidos da mesma forma que ao iniciar a sessão pela primeira vez.
- Abrir/fechar a ajuda contextual (`?`/`ⓘ`) durante o treino não deve ser afetado pela presença ou ausência de imagem do exercício.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir, para cada exercício mostrado na tela de execução de um treino em andamento, uma imagem ilustrativa associada a esse exercício, quando disponível.
- **FR-002**: O sistema DEVE associar a imagem ao exercício por convenção a partir de um identificador estável e único já existente do exercício (`name_key`), sem exigir alteração no schema do banco de dados.
- **FR-003**: Quando não houver imagem disponível para um exercício, o sistema DEVE exibir um placeholder genérico e consistente no lugar, sem alterar o restante do layout do item nem gerar erro visível ao usuário.
- **FR-003a**: O espaço reservado para a imagem (ou placeholder) DEVE ter tamanho fixo e idêntico entre exercícios; imagens com proporção diferente do espaço DEVEM ser enquadradas cortando o excesso (preenchendo toda a área), nunca esticadas ou deixando o card com altura variável entre exercícios.
- **FR-004**: Em exercícios com técnica bi-set, o sistema DEVE exibir a imagem (ou placeholder) de cada exercício do par de forma independente, já que cada um é um item próprio.
- **FR-005**: A exibição (ou ausência) de imagem NÃO DEVE alterar nenhum outro comportamento da tela de execução (marcar exercício, registrar peso, cronômetro, ordem livre, finalizar treino).
- **FR-006**: O sistema DEVE funcionar corretamente mesmo quando nenhum exercício do treino tiver imagem cadastrada (cobertura zero) e mesmo quando todos tiverem (cobertura total).
- **FR-007**: Adicionar uma nova imagem para um exercício NÃO DEVE exigir mudança de código além de incluir o arquivo de imagem seguindo a convenção estabelecida.

### Key Entities

- **Exercise (existente)**: entidade já modelada (`exercise.name_key`); nesta feature passa a ter, opcionalmente, uma imagem associada por convenção externa ao banco (arquivo de asset), não por novo campo de dado.
- **Imagem de exercício**: recurso visual estático, um por exercício (quando existente), associado por convenção de nome ao `name_key` do exercício correspondente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ao abrir a tela de execução de qualquer treino, 100% dos exercícios exibem, sem erro ou espaço quebrado, ou uma imagem ilustrativa ou um placeholder genérico.
- **SC-002**: Adicionar a imagem de um novo exercício (arquivo seguindo a convenção) faz a imagem aparecer na tela de execução sem necessidade de qualquer outra alteração funcional.
- **SC-003**: A presença ou ausência de imagens não aumenta o tempo de carregamento percebido da tela de execução de forma perceptível ao usuário.

## Assumptions

- A cobertura de imagens será parcial no lançamento desta feature (especialmente no Treino Monstro) e deve crescer aos poucos, sem exigir nova versão do app a cada imagem adicionada além de incluir o arquivo de asset.
- As imagens são fornecidas manualmente pelo usuário/mantenedor do app fora do escopo desta spec; esta spec cobre apenas a exibição.
- Não há requisito de acessibilidade além do já praticado no restante do app (ex.: texto alternativo básico), já que o app é de uso pessoal.
- Zoom/lightbox da imagem, tela de ajuda/legenda de técnicas e qualquer mudança de schema do banco estão fora do escopo desta spec.
