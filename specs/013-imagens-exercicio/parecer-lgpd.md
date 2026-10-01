# Parecer LGPD: Imagens de exercício na execução do treino

**Feature**: [spec.md](spec.md)
**Data**: 2026-09-30

## Análise das três formas de captura de dado pessoal

| Forma | Esta feature usa? | Observação |
|---|---|---|
| Via API/backend | Não | O app não tem backend nem API própria (offline-first); a feature não introduz nenhuma chamada de rede. As imagens são assets estáticos empacotados no próprio app, não obtidas de serviço externo |
| Via formulário/client-side | Não | Não há captura de dado do usuário nesta feature; a tela de execução apenas passa a exibir uma imagem ilustrativa (recurso estático do próprio exercício, já cadastrado via seed), sem coletar nenhuma informação nova do usuário |
| Via permissão de dispositivo (mobile) | Não | As imagens são assets empacotados no bundle do app (ex. `src/assets/exercises/...`); não há acesso à câmera, galeria de fotos do dispositivo nem a qualquer outra permissão para exibi-las |

## Conclusão

Nenhuma das três formas de captura de dado pessoal se aplica a esta feature. Não há dado pessoal envolvido: as imagens são conteúdo estático do próprio programa de treino (equivalente a um ícone ou ilustração), não dado do usuário. Não há base legal, minimização, retenção ou anonimização a avaliar.
