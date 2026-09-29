# Guia da entrevista de constituição — flow-guard

Procedimento de setup único por projeto (spec Seção 6). Não gera código nem
hook; é lido pelo agente ao conduzir a entrevista (greenfield) ou ao revisar
o diagnóstico (brownfield), sempre antes do primeiro `/speckit-plan`.

**Sem template de stack pré-definido.** Nenhuma pergunta abaixo tem resposta
padrão — cada projeto do autor pode ser backend, frontend, mobile ou
full-stack, e presumir um deles contaminaria os outros.

## Perguntas, uma por vez, sem agrupar

1. **Estilo arquitetural** — como o código se organiza (camadas, módulos, monorepo/polyrepo).
2. **Stack e frameworks, com versões** — não aceite "microserviço" sem a stack concreta.
3. **Estratégia de testes** — unitário, integração, e2e; o que é obrigatório antes de mergear.
4. **Padrões de segurança e nomenclatura**.
5. **Regras implícitas** que o autor considera inegociáveis.
6. **Perfil do projeto** — pergunta obrigatória, não existia no SulaFlow original.
   Uma ou mais destas quatro opções (backend, frontend, mobile, full-stack), registradas
   literalmente em `.flow-guard/constitution.md` na linha `Perfil do projeto: <valores>`:
   - `backend`
   - `frontend`
   - `mobile`
   - `full-stack` (equivale a `backend, frontend`)

   É o dado que `route-skills.sh` (spec Seção 7.3) usa para decidir quais skills
   condicionais injetar — sem essa linha exata, o roteamento por stack não funciona.

## Paths sensíveis (dado pessoal)

Não entra na constituição diretamente — vai para `.flow-guard/paths-sensiveis.conf`.
Pergunte por três formas de captura, não só "qual tabela do banco" (spec Seção 3):
API/backend, formulário/client-side (relevante em projetos Supabase-frontend),
e permissão de dispositivo (mobile: localização, contatos, câmera).
