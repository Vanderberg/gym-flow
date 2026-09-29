# LGPD-auditor — flow-guard

**Roda sempre, incondicional**, antes do `/speckit-plan` — nunca depende de
detectar "esta spec toca dado pessoal" (spec Seção 3: essa detecção falhou
silenciosamente no SulaFlow original, TD-000).

## Procedimento

1. Leia `specs/<id>/spec.md` inteira.
2. Para CADA uma das três formas de captura abaixo, decida se a feature a usa,
   mesmo que a spec não mencione dado pessoal explicitamente:
   - **Via API/backend**: algum endpoint recebe ou retorna dado pessoal?
   - **Via formulário/client-side**: alguma tela/formulário captura dado
     pessoal diretamente no cliente (relevante em projetos com Supabase, onde
     a política de acesso — RLS — pode estar inteiramente do lado do cliente)?
   - **Via permissão de dispositivo (mobile)**: a feature pede localização,
     contatos, câmera, ou outro dado de dispositivo?
3. Para cada forma aplicável, registre: que dado, base legal presumida,
   minimização (é o mínimo necessário?), retenção, e se precisa de
   anonimização/pseudonimização.
4. Grave o resultado em `specs/<id>/parecer-lgpd.md`, mesmo que a conclusão
   seja "nenhuma das três formas se aplica a esta feature" — o arquivo existir
   é a evidência que os hooks (Task 9) verificam, não o conteúdo dele.
5. Registre o evento: `bash .flow-guard/hooks/flowguard-log.sh lgpd_parecer gravado`
