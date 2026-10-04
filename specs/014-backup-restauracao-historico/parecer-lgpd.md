# Parecer LGPD: Backup e restauração do histórico

**Feature**: [spec.md](spec.md)
**Data**: 2026-10-01

## Análise das três formas de captura de dado pessoal

| Forma | Esta feature usa? | Observação |
|---|---|---|
| Via API/backend | Não | O app não tem backend nem API própria (offline-first). Exportar e importar não fazem nenhuma chamada de rede (SC-006). O arquivo só deixa o aparelho se o usuário o enviar, por ação explícita, a um destino que ele escolhe na folha de compartilhamento do sistema; esse envio é feito pelo app de destino (Drive, WhatsApp etc.), fora do controle e do escopo do GymFlow |
| Via formulário/client-side | Parcial | A feature não coleta dado novo. Ela **reempacota dado pessoal que já existe no aparelho**: histórico de treinos (datas, programa, treino, exercícios marcados) e cargas usadas (pesos de exercício, não peso corporal), estado de sequência e configurações. É dado pessoal do próprio usuário, com viés de saúde e hábitos (frequência de treino). Os dados exportados são os mesmos já armazenados no SQLite local |
| Via permissão de dispositivo (mobile) | Não | A folha de compartilhamento e o seletor de arquivos são mecanismos do sistema operacional, acionados pelo usuário, e dispensam permissões declaradas (sem acesso amplo a armazenamento, galeria, contatos, câmera ou localização). O app só lê o arquivo que o usuário escolhe e só grava o arquivo temporário que ele pediu para exportar |

## Dado envolvido, base legal, minimização, retenção

- **Dado**: histórico de sessões finalizadas, cargas por exercício, posição de sequência por programa e configurações do app. Não inclui peso corporal, saúde clínica, localização, identificadores (nome, e-mail, ID de aparelho) nem dados de terceiros.
- **Base legal presumida**: execução de ação solicitada pelo próprio titular (ele aciona a exportação e a importação). O tratamento é feito pelo próprio titular em uso pessoal e não econômico, o que a LGPD (art. 4º, I) exclui de sua incidência. A análise é registrada de forma conservadora, caso o app venha a ser distribuído.
- **Minimização**: o arquivo contém só o necessário para restaurar o histórico. Programas, exercícios, agenda e textos de ajuda do seed ficam de fora (FR-003) e nenhum identificador do aparelho ou do usuário é gravado.
- **Retenção**: o app não guarda cópia do arquivo exportado. O arquivo temporário gerado para a folha de compartilhamento deve ser removido do armazenamento do app depois do compartilhamento ou na próxima exportação (a ser tratado no plan). Depois que o arquivo sai, a retenção é responsabilidade do usuário e do destino que ele escolheu.
- **Anonimização/pseudonimização**: não se aplica; o arquivo não tem identificador pessoal direto e é de uso do próprio titular.
- **Criptografia**: fora de escopo da spec (registrado em Assumptions). O arquivo é texto legível; o usuário deve escolher destinos de sua confiança. Risco residual aceito: baixo, por não haver identificação direta nem dado sensível clínico.

## Riscos e mitigações a levar ao plan

1. **Arquivo temporário residual** no armazenamento do app: apagar após o compartilhamento ou na próxima exportação.
2. **Importação de arquivo malicioso ou corrompido**: validação completa antes de tocar no banco (FR-008) e atomicidade (FR-010).
3. **Arquivo não deve vazar para log**: o conteúdo do backup não pode ser escrito em logs nem em relatórios de erro.

## Conclusão

A feature não coleta dado novo, não usa rede e não pede permissão de dispositivo. Ela exporta e importa, por ação explícita do titular, dados pessoais que o app já mantém localmente. Isso é compatível com a LGPD e com o requisito do projeto de que nenhum dado saia do aparelho sem ação do usuário. Segue com as mitigações acima registradas para o plan.
