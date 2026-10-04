# Design tokens: Backup e restauração do histórico

**Direção visual**: reaproveita integralmente "Placar de academia" (tema escuro), já estabelecida em
`src/constants/theme.ts` e `docs/design-telas.md`. Modo "aplicar, não inventar": esta feature não cria
direção nova, nem token novo, nem componente base novo. A seção Backup é composta só de
componentes e tokens que já existem na tela de Configurações.

## Estrutura da seção (dentro de `settings.tsx`, abaixo de "DESCANSO")

```text
BACKUP                         <- título de seção (estilo de "DESCANSO")
Exportar dados               › <- SettingsRow (56 dp), toque abre a folha de compartilhamento
Importar dados               › <- SettingsRow (56 dp), toque abre o seletor de arquivos
```

Alinhamento à esquerda, igual ao restante da tela. Sem cartão envolvendo a seção: segue as
linhas com `borderBottom` já usadas nas outras seções.

## Componentes reaproveitados (nenhum novo)

| Necessidade | Componente existente | Observação |
|---|---|---|
| Título da seção | estilo `section` de `settings.tsx` (`typography.label`, `colors.textSecondary`, `marginTop: spacing.lg`) | Mesmo padrão de "DESCANSO"; texto "BACKUP" |
| Ações Exportar / Importar | `SettingsRow` (`src/components/settings/SettingsRow.tsx`) com `onPress` | Mostra `›`; durante a operação, `disabled` para evitar toque duplo |
| Resumo da importação + confirmação | `ConfirmDialog` (`src/components/common/ConfirmDialog.tsx`) com `destructive` | O cancelamento é o botão primário (acento); "Substituir histórico" fica como `danger`. Mesmo comportamento já usado em "Reiniciar sequência" |
| Bloqueio por sessão em andamento | `InProgressBlockSheet` (`src/components/settings/InProgressBlockSheet.tsx`) | Reuso do fluxo Continuar / Descartar já existente (ver extensão abaixo) |
| Resultado (sucesso, erro, arquivo inválido) | `Sheet` (`src/components/common/Sheet.tsx`) com título, mensagem e um `Button` primário "Entendi" | Mesmo padrão visual de `ConfirmDialog`, com uma ação só |
| Operação em andamento | `Button`/`SettingsRow` com `disabled` e, no botão de resultado, `loading` | Sem spinner novo |

## Tokens reaproveitados (todos de `src/constants/theme.ts`)

| Token | Uso nesta feature |
|---|---|
| `colors.bg`, `colors.surface`, `colors.border` | Fundo da tela, fundo dos sheets e linhas, como em Configurações |
| `colors.text`, `colors.textSecondary` | Rótulos (`text`) e mensagens/resumo (`textSecondary`) |
| `colors.accent`, `colors.onAccent` | Botão primário (Cancelar/Entendi), como nos demais diálogos |
| `colors.danger` | Botão destrutivo "Substituir histórico" |
| `typography.title`, `typography.body`, `typography.label` | Títulos de sheet, texto e título de seção |
| `spacing.xs`, `spacing.lg` | Espaçamento do título de sheet e da seção |
| `sizes.row` (56), `sizes.button` (56) | Altura das linhas e botões; alvo de toque ≥ 48 dp |

## Extensão explícita (pequena, sinalizada)

| Item | Mudança | Justificativa |
|---|---|---|
| `InProgressBlockSheet` | Receber `message` por prop (hoje fixo: "…para trocar de programa") e usar o texto atual como padrão | Reaproveitar o mesmo bloqueio na importação sem duplicar o componente; o texto da importação é "Há um treino em andamento. Finalize ou descarte para importar o backup." Mudança retrocompatível: a tela de programa não muda |

Nenhuma outra deriva em relação à direção visual.

## Textos (pt-BR, sentença normal, verbo no imperativo, mesmo vocabulário em todo o fluxo)

| Momento | Título | Mensagem | Ações |
|---|---|---|---|
| Linha | Exportar dados | — | — |
| Linha | Importar dados | — | — |
| Resumo e confirmação | Substituir histórico? | "{N} treinos, de {data inicial} a {data final}. Seu histórico atual, a posição na sequência e as configurações serão substituídos. Isso não pode ser desfeito." (com zero sessões: "Este backup não tem treinos. Seu histórico atual será apagado…") | Cancelar (primário) · Substituir histórico (danger) |
| Bloqueio | Treino em andamento | "Há um treino em andamento. Finalize ou descarte para importar o backup." | Continuar · Descartar (com confirmação já existente) |
| Sucesso da importação | Backup restaurado | "{N} treinos restaurados." | Entendi |
| Arquivo inválido | Arquivo inválido | "Este arquivo não é um backup do Gym Flow ou está corrompido. Nada foi alterado." | Entendi |
| Versão futura | Versão não suportada | "Este backup é de uma versão mais recente do app. Atualize o Gym Flow e tente de novo. Nada foi alterado." | Entendi |
| Referência desconhecida | Backup incompatível | "Este backup usa programas ou exercícios que não existem nesta versão do app. Nada foi alterado." | Entendi |
| Falha ao gravar | Não foi possível restaurar | "Ocorreu um erro e seus dados continuam como estavam." | Entendi |
| Falha ao exportar | Não foi possível exportar | "Não foi possível gerar o arquivo de backup. Tente de novo." | Entendi |
| Compartilhamento indisponível | Compartilhamento indisponível | "Este aparelho não permite compartilhar arquivos." | Entendi |

Cancelar a folha de compartilhamento ou o seletor de arquivos não exibe nada (FR-013).

## Estados

- **Repouso**: duas linhas ativas.
- **Em andamento** (gerando arquivo, lendo, restaurando): as duas linhas `disabled` até terminar.
- **Vazio**: não há; exportar com zero treinos é válido.
- **Erro**: sempre o `Sheet` de resultado acima, nunca mensagem solta nem `Alert` do sistema.

## Regra para as tasks de UI

Toda task desta spec que tocar `BackupSection.tsx`, `settings.tsx` ou `InProgressBlockSheet.tsx` MUST
compor apenas os componentes e tokens listados aqui (via `src/constants/theme.ts`), usar os textos
da tabela e nunca valores soltos (magic numbers) ou cores fora de `colors`.
