# Boas práticas — gym-flow

Manual de referência rápida para quem (pessoa ou agente) for tocar este código. Não substitui `CLAUDE.md` nem `.specify/memory/constitution.md` — só condensa em checklist o que já está espalhado nesses documentos.

## 1. Antes de codar

- Leia `CLAUDE.md` e o plan ativo (`specs/<feature>/plan.md`) antes de implementar qualquer coisa.
- Toda mudança real de comportamento segue o ciclo Spec-Kit: `specify → clarify → LGPD → plan → tasks → analyze → implementação com TDD` (ver `.flow-guard/catalogo-disciplinas.md`). Só mudanças triviais (1 arquivo, sem mudar comportamento) pulam o ciclo.
- Referencie o ID do backlog (ex.: `BL-031`) no commit/PR quando o trabalho vier de lá.
- Se o código for divergir da documentação, **atualize a documentação junto**, no mesmo PR.

## 2. TDD é obrigatório

> "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST." (`.flow-guard/catalogo-disciplinas.md`)

- Escreva o teste que falha antes do código de produção. Depois o mínimo para passar. Depois refatore.
- `systematic-debugging`: reproduzir → isolar → diagnosticar → corrigir com teste de regressão. Nunca "tentar um fix" sem antes reproduzir o bug com um teste.
- `verification-before-completion`: antes de declarar algo pronto, rode `npm run check` e confirme a saída — não assuma que passou.
- Cobertura mínima esperada (ver seção Testes do `CLAUDE.md`): sequência contínua e semanal, troca de programa/estratégia, médias e intervalo de estatísticas, sessão (criar/finalizar/recuperar/editar), UI (iniciar, marcar, peso, finalizar, editar histórico, abrir ajuda sem alterar sessão).

## 3. Arquitetura — não furar as camadas

```
UI → Hooks/Application → Domain → Repositories → SQLite
```

- **Domain é puro**: nada de React, SQLite ou chamadas de API em `src/domain/`. Se um teste de domínio precisar mockar SQLite ou renderizar componente, a regra está na camada errada.
- Estratégias de sequência (`ContinuousSequenceStrategy`, `WeeklyScheduleSequenceStrategy`) são escolhidas via `NextWorkoutResolver`. **Nunca** espalhar `if/else` de estratégia pela UI ou pelos casos de uso.
- **Nunca codificar regra por nome de programa** (ex.: "se for Treino Monstro, usa semana"). Qualquer programa pode usar qualquer tipo de sequência — isso é dado de configuração, não lógica hardcoded.
- Zustand só guarda estado de UI/sessão atual/cronômetro/settings carregados. **SQLite é a fonte de verdade** — não duplique estado persistente na store sem necessidade.
- Presentation (telas/componentes) não tem regra de negócio complexa; se uma tela está calculando próximo treino ou validando integridade de dado, isso pertence ao domain/application.

## 4. Persistência

- Migrations são versionadas; nunca editar uma migration já aplicada — criar uma nova.
- Seed é idempotente — rodar duas vezes não deve duplicar nem quebrar dado.
- Exercício reutilizado entre treinos é **uma entidade** (`exercise`) referenciada por vários `workout_exercise`, com `UNIQUE(workout_id, exercise_id)`. Não duplicar exercício por treino.
- Datas: sempre local do usuário, nunca UTC cru que possa deslocar o treino de dia.
- `weight` nulo ou `>= 0`; "última carga" é **derivada** de sessões finalizadas — não criar coluna `last_weight` para cachear isso.
- Finalizar sessão é transacional: persistir exercícios → marcar `completed` → atualizar sequência (se aplicável) → limpar sessão em andamento. Se qualquer passo falhar, nada disso deve ficar parcialmente aplicado.

## 5. TypeScript / estilo

- `strict` está ligado — não usar `any` para contornar erro de tipo; resolver o tipo de verdade.
- `npm run check` = `typecheck + lint + format:check + test`. É o gate mínimo antes de considerar algo pronto — rode sempre, não só quando "parece que vai passar".
- ESLint (`eslint-config-expo`) e Prettier são a fonte de estilo — não discutir formatação manualmente, deixar o Prettier decidir.
- Evite abstração prematura: três linhas parecidas não justificam um helper novo se só existe um uso hoje. Uma correção de bug não precisa de refatoração ao redor.
- Não adicionar fallback/validação para cenário que não pode acontecer internamente; validar só nas bordas (input do usuário).

## 6. Domínio de negócio — armadilhas conhecidas

- Trocar programa ou tipo de sequência **não apaga nem altera** sessões antigas.
- Reiniciar sequência só existe para `CONTINUOUS`; volta ao primeiro treino do programa e **nunca apaga histórico**.
- Agenda semanal (`weekly_schedule`) nunca cria sessão automaticamente — o usuário sempre inicia e finaliza manualmente.
- Bi-set é **dois exercícios distintos** na mesma técnica — não modelar como uma entidade "par".
- Aquecimento é nota livre (`workout.warmup_note`), não é exercício e não entra em contagem.
- `?` e `ⓘ` (ajuda contextual) nunca alteram exercício, peso, sequência, cronômetro ou sessão ao abrir/fechar — se um teste de UI para ajuda mexer em estado de sessão, é bug.
- Todo exercício de todo programa precisa ter `primary_muscle`, `secondary_muscles` e `description` preenchidos no seed — há teste cobrindo isso, não o remova.
- **Nunca** implementar recomendação de carga/exercício/treino, IA, dieta ou peso corporal — está fora de escopo por design (ver `CLAUDE.md`, "Fora do escopo").

## 7. Antes de implementar algo "em aberto"

A seção "Pontos em aberto na documentação" do `CLAUDE.md` lista decisões ainda não confirmadas (variações de exercício, cardio, `sequence_type` global vs. estado por programa, troca de programa com sessão em andamento, agenda semanal editável). Se a tarefa tocar uma dessas áreas, **confirme antes de implementar** em vez de assumir — não adivinhar comportamento não especificado.

## 8. Requisitos não funcionais (sempre válidos)

- Offline-first, sem backend, sem login, sem sync no MVP.
- Nenhum dado sai do aparelho; nenhuma permissão desnecessária.
- Código compartilhado Android/iOS; validar os dois quando a mudança afetar UI ou storage.

## 9. Commits, branches e fechamento de feature

- Commits e textos de UI em português (pt-BR).
- Nunca criar commit sem que o usuário peça explicitamente.
- Ao declarar uma feature pronta: revisão estruturada (`superpowers:requesting-code-review`) → commit/push/PR padronizado → decidir destino da branch (`superpowers:finishing-a-development-branch`).
- Nunca usar `--no-verify`, `--no-gpg-sign` ou pular hook sem pedido explícito do usuário; se um hook falhar, corrigir a causa.

## 10. Comandos úteis

```bash
npx expo start          # roda o app (Android: tecla "a")
npm run check            # typecheck + lint + format:check + testes — gate mínimo
npm run typecheck
npm run lint
npm run format
npm test
```
