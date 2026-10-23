# Oficina local isolada — v0.5.0

**Escopo:** apenas o backup público parcialmente homologado. Não é um deploy do GitHub nem um bypass de autenticação da área administrativa.

## Separação de autoridade

| Interface | Rota | Persistência | Autoridade |
|---|---|---|---|
| Oficina local | `/oficina-local` | `localStorage` do navegador | Rascunhos editoriais apenas |
| Administração remota | `/admin` | Camada de servidor existente | Requer autenticação e autorização existentes |
| Site público | `/ferramentas/$slug` | Publicação remota já existente | Não consome os rascunhos locais nesta versão |

## Funcionalidade entregue

- Edição de título, descrição e flag editorial de cada uma das cinco ferramentas existentes.
- Validação de limites, IDs conhecidos, tipos e duplicação de slug.
- Armazenamento local e exportação/importação JSON com validação antes de aceitar.
- Sem armazenamento clínico, paciente, credenciais, tokens ou dados sensíveis.
- Sem qualquer função que chame o servidor para salvar rascunhos locais.
- Reutiliza o catálogo e as famílias de contratos que vieram do backup.

## Testes e evidências

- Build TanStack/Vite: PASS (código 0).
- Typecheck após geração de rotas: PASS (código 0).
- Auditoria estática de navegação: 22 arquivos de rotas, 19 links literais, zero irresolvidos. Teste não cobre navegação real.
- Renderização e interações reais: NOT_VERIFIED; o ambiente anterior falhou em `uv_interface_addresses` e não foram geradas screenshots.

## Gaps

- Não sincroniza conteúdo local com a versão pública ou outra máquina.
- Não é fonte canônica multiusuário: localStorage pode ser alterado por qualquer usuário do navegador.
- Ainda não existe promoção assinada de rascunho local para publicação remota; implementar somente sob autorização e validação específica.
- Contrato formal de cada rota e paridade visual permanecem incompletos.

## Context lock

Toda execução futura deve ler `AGENTS.project.md` e executar `npm run audit:context` antes de afirmar homologação ou reconciliar arquivos externos.
