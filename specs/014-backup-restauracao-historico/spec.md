# Feature Specification: Backup e restauração do histórico

**Feature Branch**: `014-backup-restauracao-historico`

**Created**: 2026-10-01

**Requisito de produto**: RF-31 (backup e restauração do histórico; a registrar em `docs/PRD.md`)

**Status**: Draft

**Input**: User description: "Backup e restauração do histórico. Na aba Configurações, seção \"Backup\" com \"Exportar dados\" e \"Importar dados\". Exportar gera um arquivo versionado com sessões finalizadas e seus exercícios (programa, treino, peso, marcações), estado da sequência por programa e configurações; programas, exercícios e agenda do seed ficam de fora. O arquivo vai para a folha de compartilhamento do sistema, com nome gymflow-backup-AAAA-MM-DD (data local). Importar: o usuário escolhe o arquivo; validação antes de alterar qualquer dado; resumo (quantidade de sessões, período) e confirmação explícita avisando que o histórico atual será substituído; substituição total, atômica, sem mesclar. Fora de escopo: backup automático, nuvem, mesclagem, criptografia."

## Clarifications

**Tela/UI:** sim — a aba Configurações existente ganha uma seção "Backup" com dois botões e diálogos de resumo/confirmação/resultado.

### Session 2026-10-01

- Q: Ao importar, o que acontece com os dados já presentes no aparelho? → A: Substituir tudo (histórico, estado de sequência e configurações atuais são trocados pelos do arquivo), com confirmação explícita; sem mesclar.
- Q: Qual forma de backup? → A: Exportar/importar um arquivo pela folha de compartilhamento do sistema; o destino fica a critério do usuário. Sem backup automático do sistema.
- Q: Sessão em andamento durante a importação? → A: Bloquear a importação e orientar a finalizar ou descartar a sessão antes (sem descarte automático).
- Q: Backup que referencia programa, treino ou exercício que não existe mais no app? → A: Recusar o arquivo inteiro, com mensagem clara e sem alterar nada (sem importação parcial).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exportar meus dados para um arquivo (Priority: P1)

O usuário toca em "Exportar dados" nas Configurações e recebe um arquivo de backup, que pode salvar ou enviar para onde quiser (Drive, WhatsApp, Arquivos), para não perder o histórico se reinstalar o app ou trocar de aparelho.

**Why this priority**: Sem um arquivo exportado não há como preservar o histórico; é o pré-requisito da restauração e já entrega valor sozinho.

**Independent Test**: Com histórico existente, tocar em "Exportar dados" e verificar que a folha de compartilhamento abre com um arquivo `gymflow-backup-AAAA-MM-DD` (data local) contendo sessões finalizadas, estado de sequência e configurações.

**Acceptance Scenarios**:

1. **Given** um histórico com sessões finalizadas, **When** o usuário toca em "Exportar dados", **Then** o sistema gera o arquivo de backup e abre a folha de compartilhamento do sistema com ele.
2. **Given** nenhum treino finalizado ainda, **When** o usuário exporta, **Then** o arquivo é gerado normalmente (com zero sessões, mas com estado de sequência e configurações).
3. **Given** uma sessão em andamento, **When** o usuário exporta, **Then** a sessão em andamento não é incluída e nada é alterado no app.
4. **Given** a folha de compartilhamento foi cancelada pelo usuário, **When** ele volta ao app, **Then** nenhum dado foi alterado e nenhum erro é exibido.

---

### User Story 2 - Restaurar meus dados a partir de um arquivo (Priority: P1)

Num aparelho novo ou após reinstalar, o usuário toca em "Importar dados", escolhe um arquivo de backup, vê um resumo do que será restaurado, confirma e passa a ter o histórico, a posição na sequência de cada programa e as configurações idênticos aos do momento do backup.

**Why this priority**: É o objetivo da feature — um backup que não pode ser restaurado não protege nada.

**Independent Test**: Exportar, apagar o histórico (ou reinstalar o app), importar o arquivo e conferir que histórico, estatísticas, posição na sequência e configurações são idênticos aos de antes.

**Acceptance Scenarios**:

1. **Given** um arquivo de backup válido, **When** o usuário o seleciona em "Importar dados", **Then** o sistema valida o arquivo e mostra um resumo (quantidade de sessões e período coberto) sem alterar nenhum dado.
2. **Given** o resumo exibido, **When** o usuário confirma explicitamente (o aviso informa que o histórico atual será substituído), **Then** os dados atuais de usuário são substituídos pelos do arquivo e o app informa que a restauração foi concluída.
3. **Given** o resumo exibido, **When** o usuário cancela, **Then** nenhum dado é alterado.
4. **Given** a restauração concluída, **When** o usuário abre Histórico, Estatísticas e Home, **Then** veem as mesmas sessões, métricas e próximo treino do momento do backup.
5. **Given** a última carga de um exercício, **When** a restauração termina, **Then** a última carga continua derivada das sessões restauradas do mesmo programa.

---

### User Story 3 - Ser protegido contra arquivos inválidos e falhas (Priority: P1)

O usuário nunca perde dados por importar um arquivo errado, corrompido, de versão incompatível, ou por uma falha no meio da restauração.

**Why this priority**: A importação substitui tudo; sem proteção, um arquivo ruim destruiria o histórico atual de forma irreversível.

**Independent Test**: Tentar importar arquivos inválidos (não é backup, corrompido, versão futura, programa desconhecido) e simular falha durante a gravação; em todos os casos o estado anterior permanece intacto.

**Acceptance Scenarios**:

1. **Given** um arquivo que não é um backup válido (formato ilegível, campos obrigatórios ausentes ou valores inválidos), **When** o usuário o seleciona, **Then** o sistema recusa com mensagem em português e nenhum dado é alterado.
2. **Given** um arquivo gerado por uma versão mais nova do app (versão do formato maior que a suportada), **When** o usuário o seleciona, **Then** o sistema recusa informando que o arquivo é de uma versão mais recente do app e nenhum dado é alterado.
3. **Given** um arquivo que referencia programa ou treino inexistente no app, **When** o usuário o seleciona, **Then** o sistema recusa e nenhum dado é alterado.
4. **Given** uma falha durante a gravação da restauração, **When** ela ocorre, **Then** todos os dados voltam exatamente ao estado anterior e o usuário é informado do erro.
5. **Given** uma sessão em andamento, **When** o usuário tenta importar, **Then** o sistema bloqueia a importação, orienta a finalizar ou descartar a sessão primeiro e não altera nada.
6. **Given** o usuário cancela a seleção de arquivo, **When** volta ao app, **Then** nenhum dado foi alterado e nenhum erro é exibido.

### Edge Cases

- Backup exportado com zero sessões: é válido; importá-lo substitui o histórico atual por um histórico vazio (após a confirmação, cujo resumo deixa isso explícito).
- Arquivo vazio, truncado ou de outro tipo (imagem, texto livre): recusado como inválido, sem alterar dados.
- Arquivo com sessões duplicadas internamente ou datas inconsistentes: recusado como inválido.
- Arquivo com peso negativo ou marcação de exercício inexistente no app: recusado como inválido.
- Importar o mesmo arquivo duas vezes seguidas: resultado idêntico, sem duplicar sessões (a importação substitui, não acrescenta).
- Datas e dias da semana: preservados como foram gravados (data/hora local do usuário), sem deslocamento por fuso.
- Backup de um aparelho com programas atualizados no seed (novas versões do app): importável enquanto as referências a programas e treinos existirem.
- Estado de sequência contínua de cada programa e programa/tipo de sequência ativos são restaurados junto; ao voltar a um programa ele retoma seu próprio estado.
- Exportação ou importação durante o cronômetro de descanso ativo: o cronômetro não é afetado (a importação só é possível sem sessão em andamento).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A aba Configurações DEVE exibir uma seção "Backup" com as ações "Exportar dados" e "Importar dados".
- **FR-002**: Ao exportar, o sistema DEVE gerar um arquivo de backup contendo: todas as sessões finalizadas com seus exercícios (programa, treino, exercício, marcação de concluído, peso), o estado de sequência de cada programa e as configurações do app (programa ativo, tipo de sequência, preferências do cronômetro).
- **FR-003**: O arquivo de backup NÃO DEVE conter programas, treinos, exercícios, prescrições, agenda semanal nem textos de ajuda do seed; esses dados são recriados pelo próprio app.
- **FR-004**: O arquivo de backup DEVE conter a versão do formato, para que o app possa decidir se sabe lê-lo.
- **FR-005**: O arquivo exportado DEVE se chamar `gymflow-backup-AAAA-MM-DD.json`, com a data local do usuário, e ser entregue pela folha de compartilhamento do sistema, deixando o destino a critério do usuário.
- **FR-006**: A exportação NÃO DEVE incluir sessão em andamento e NÃO DEVE alterar nenhum dado do app.
- **FR-007**: Nenhum dado DEVE sair do aparelho a menos que o usuário acione "Exportar dados" e escolha um destino; o app não DEVE enviar o arquivo por conta própria.
- **FR-008**: Ao importar, o sistema DEVE validar o arquivo por completo antes de alterar qualquer dado: formato legível, campos obrigatórios e valores válidos (peso nulo ou maior ou igual a zero; posição na sequência de 1 até a quantidade de treinos do programa; sem sessão duplicada, isto é, mesmo programa, treino e início), versão do formato menor ou igual à suportada, e referências a programas, treinos e exercícios existentes no app.
- **FR-009**: Após validação bem-sucedida, o sistema DEVE mostrar um resumo (quantidade de sessões e período coberto) e exigir confirmação explícita, com aviso claro de que o histórico atual será substituído.
- **FR-010**: Ao confirmar, o sistema DEVE substituir sessões, estado de sequência e configurações atuais pelos do arquivo, em uma única operação atômica: ou tudo é restaurado, ou nada muda.
- **FR-011**: A importação NÃO DEVE mesclar dados; o resultado DEVE ser exatamente o conteúdo do arquivo.
- **FR-012**: Se houver sessão em andamento, o sistema DEVE bloquear a importação e orientar o usuário a finalizar ou descartar a sessão antes.
- **FR-013**: Em qualquer arquivo inválido, versão futura, referência desconhecida, falha de gravação ou cancelamento, o sistema DEVE manter os dados anteriores intactos e informar o resultado em português (cancelamento não exibe erro).
- **FR-014**: Após restauração concluída, Histórico, Estatísticas, Home e "última carga" DEVEM refletir os dados restaurados sem exigir reinício do app.
- **FR-015**: Exportar e importar NÃO DEVEM alterar programas, treinos, exercícios, agenda nem conteúdo de ajuda do seed.
- **FR-016**: A importação restaurada DEVE preservar datas e horários como gravados, sem deslocamento de dia por fuso.
- **FR-017**: Todos os textos da interface e mensagens da feature DEVEM estar em português (pt-BR).

### Key Entities

- **Arquivo de backup**: documento único, versionado, com os dados do usuário: sessões finalizadas (com seus exercícios), estado de sequência por programa e configurações. Referencia programas, treinos e exercícios do seed por identificadores estáveis, sem reproduzi-los.
- **Sessão finalizada (existente)**: sessão de treino concluída, com programa, treino, datas, e exercícios com marcação e peso; é o núcleo do histórico preservado.
- **Estado de sequência por programa (existente)**: posição atual da sequência contínua de cada programa.
- **Configurações (existente)**: programa ativo, tipo de sequência e preferências do cronômetro (registro único).
- **Resumo de importação**: informação apresentada antes da confirmação — quantidade de sessões e período (primeira e última data).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos casos de teste de ida e volta (exportar, apagar o histórico, importar), histórico, métricas de Estatísticas, posição na sequência de cada programa, configurações e "última carga" ficam idênticos aos de antes da exportação.
- **SC-002**: Em 100% dos casos de arquivo inválido (não é backup, corrompido, versão futura, programa ou treino desconhecido, valores inválidos), nenhum dado do aparelho é alterado e o usuário vê uma mensagem clara em português.
- **SC-003**: Em 100% das falhas simuladas durante a restauração, os dados voltam exatamente ao estado anterior.
- **SC-004**: O usuário conclui uma exportação em no máximo 3 toques a partir da aba Configurações, e uma importação (escolher arquivo, ler o resumo, confirmar) em no máximo 5 toques.
- **SC-005**: Exportar e restaurar um histórico de 2 anos de treinos (cerca de 400 sessões) leva menos de 5 segundos cada, em aparelho de gama média.
- **SC-006**: Nenhuma conexão de rede é feita por exportar ou importar, e nenhum dado sai do aparelho sem uma ação explícita do usuário.

## Assumptions

- O usuário tem um único aparelho em uso por vez; restaurar substitui tudo, e mesclar históricos de dois aparelhos não é necessário.
- O formato do arquivo é versionado; esta feature define a versão 1. Compatibilidade para versões futuras do formato é tratada por quem as introduzir.
- Backup de um app em versão mais nova que a do aparelho é recusado; backup de versões mais antigas é aceito enquanto todas as referências a programas, treinos e exercícios existirem (referência desconhecida recusa o arquivo inteiro, sem importação parcial).
- O arquivo não é criptografado nem protegido por senha (fora de escopo); o usuário é responsável por onde o compartilha.
- Os identificadores estáveis de programas, treinos e exercícios do seed não mudam entre versões do app; mudanças futuras no seed que os removam devem tratar a compatibilidade com backups antigos.
- Backup automático, nuvem, mesclagem e criptografia estão fora de escopo.
- O app continua offline-first, sem backend, login ou sincronização.
