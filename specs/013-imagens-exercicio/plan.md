# Implementation Plan: Imagens de exercício na execução do treino

**Branch**: `013-imagens-exercicio` | **Date**: 2026-09-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/013-imagens-exercicio/spec.md`
**Backlog**: BL-130, BL-131, BL-132
**Requisitos de produto**: RF-05 (Exibir exercícios — extensão visual não listada no PRD v1.1, adicionada por esta spec)
**Parecer LGPD**: [parecer-lgpd.md](parecer-lgpd.md) — nenhuma forma de captura de dado pessoal se aplica
**Depende de**: 007 (`ExerciseCard`, `WorkoutScreenItem`, tela de execução)

## Summary

Cada exercício exibido na tela de execução do treino (spec 007) passa a mostrar uma imagem
ilustrativa, resolvida por convenção a partir do nome do exercício (mesma normalização já usada
para `exercise.name_key`), sem nenhuma mudança de schema, domínio ou caso de uso — é puramente
apresentacional. As imagens ficam em `src/assets/exercises/`, registradas num mapa estático
`EXERCISE_IMAGES` (exigência do bundler Metro, que não suporta `require()` dinâmico). Quando não
há imagem para um exercício (cobertura parcial esperada, sobretudo no Treino Monstro), um
placeholder genérico ocupa a mesma área de tamanho fixo, com a imagem sempre enquadrada cortando o
excesso (`resizeMode="cover"`) para o card nunca variar de altura entre exercícios. Decisões em
[research.md](research.md); modelo em [data-model.md](data-model.md); contrato de UI em
[contracts/ui.md](contracts/ui.md); tokens visuais em [design/tokens.md](design/tokens.md)
(reaproveita a direção "Placar de academia" já existente, sem criar identidade nova).

## Technical Context

**Language/Version**: TypeScript strict (projeto da 001)

**Primary Dependencies**: nenhuma nova (usa `Image` do React Native/Expo já disponível)

**Storage**: nenhuma migration; nenhuma leitura/escrita adicional no banco

**Testing**: Jest para a resolução de imagem (unitário); RNTL para `ExerciseCard`/tela de execução
(imagem presente, placeholder, bi-set, e que nenhum callback de sessão é chamado)

**Target Platform**: Android e iOS (código compartilhado)

**Project Type**: mobile-app (projeto único)

**Performance Goals**: renderizar a imagem/placeholder sem atraso perceptível na abertura da tela
de execução (SC-003); assets empacotados no bundle, sem I/O de rede

**Constraints**: offline; sem mudança de schema (FR-002); layout do card com altura fixa e igual
entre exercícios com e sem imagem (FR-003a); nenhuma alteração de comportamento de sessão, peso,
cronômetro ou sequência (FR-005)

**Scale/Scope**: 1 componente novo (`ExerciseImage`), 1 registro estático de assets, 1 alteração em
`ExerciseCard` (spec 007); cobertura de imagens inicialmente parcial, crescendo aos poucos

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first | ✅ Imagens são assets empacotados no bundle; nenhuma chamada de rede |
| II. Domínio puro e camadas | ✅ Feature é só apresentação (`components/`); não toca `domain/`, `application/` nem `data/` |
| III. TypeScript estrito | ✅ `EXERCISE_IMAGES: Record<string, ImageSourcePropType>`, sem `any` |
| IV. Registro livre e finalização flexível | ✅ Não alterado; imagem não interfere em marcação, ordem ou finalização |
| V. Histórico preservado | ✅ Não se aplica (sem leitura/escrita de sessão) |
| VI. Programa e sequência independentes | ✅ Não se aplica; imagem resolvida só pelo nome do exercício, nunca por programa |
| VII. Prescrição como dado | ✅ Não se aplica; imagem não é prescrição, técnica nem observação |
| VIII. Sem recomendações | ✅ Imagem é conteúdo ilustrativo do próprio exercício, não sugestão de carga/treino |
| IX. Estatísticas | ✅ Não se aplica |
| X. Transações e datas locais | ✅ Não se aplica (sem escrita) |
| XI. Testes por camada | ✅ Unitário (resolução de imagem) + RNTL (card com imagem, placeholder, bi-set, sem efeito colateral em sessão) |
| XII. Simplicidade | ✅ Sem dependência nova; registro estático mínimo, cresce por linha adicionada conforme imagens chegam |

Sem violações ⇒ Complexity Tracking vazio. Reavaliação pós-design: **sem mudanças, continua
passando**.

## Project Structure

### Documentation (this feature)

```text
specs/013-imagens-exercicio/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── parecer-lgpd.md
├── contracts/
│   └── ui.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
src/
├── assets/
│   └── exercises/
│       └── index.ts          # EXERCISE_IMAGES: Record<string, ImageSourcePropType>
├── components/
│   └── workout/
│       ├── ExerciseCard.tsx   # alterado: renderiza <ExerciseImage name={item.name} />
│       └── ExerciseImage.tsx  # novo
tests/
├── unit/
│   └── components/workout/ExerciseImage.test.tsx
└── (RNTL) tests/component ou tests/ui — seguindo convenção já usada pela spec 007 para ExerciseCard
```

**Structure Decision**: projeto único (mobile-app), sem novos diretórios de topo. A feature entra
inteiramente em `src/assets/exercises/` (novo) e `src/components/workout/` (novo componente +
alteração pontual no `ExerciseCard` existente).

## Complexity Tracking

Sem violações do Constitution Check — seção não aplicável.
