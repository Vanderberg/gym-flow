# Parecer LGPD: Alarme Sonoro do Cronômetro de Descanso

**Feature**: [spec.md](spec.md)
**Data**: 2026-09-29

## Análise das três formas de captura de dado pessoal

| Forma | Esta feature usa? | Observação |
|---|---|---|
| Via API/backend | Não | O app não tem backend nem API própria (offline-first); a feature não introduz nenhuma chamada de rede |
| Via formulário/client-side | Não | Não há tela nova, formulário novo, nem captura de dado do usuário (confirmado em Clarifications: sem tela/UI nova); o único estado envolvido é o estado em memória já existente do cronômetro (`RestTimerState`), que não contém dado pessoal |
| Via permissão de dispositivo (mobile) | Não | Reproduzir um som local não exige nenhuma permissão de dispositivo (diferente de câmera, localização, contatos); FR-007 exige explicitamente que nenhuma nova permissão seja solicitada |

## Conclusão

Nenhuma das três formas de captura de dado pessoal se aplica a esta feature. Não há dado pessoal novo, base legal, minimização, retenção ou anonimização a avaliar. A feature é puramente um efeito sonoro local atrelado a um evento que já existe (fim do cronômetro de descanso).
