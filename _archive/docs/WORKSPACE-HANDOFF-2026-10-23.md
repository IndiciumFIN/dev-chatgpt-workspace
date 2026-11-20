# Handoff — workspace exclusivo ChatGPT (2026-10-23)

## Contrato e isolamento

- **ÚNICO repositório remoto autorizado para escrita:** `IndiciumFIN/dev-chatgpt-workspace` (privado; verificado acessível com permissão `push`).
- Repositórios anteriores ficam **fora de escopo**, inclusive `IndiciumFIN/ce-bibliotecas-dev`.
- O destino estava vazio em 2026-10-23, sem commit e sem referências Git. Sua branch inicial declarada é `main`.
- Não criar branches adicionais, não realizar merges automáticos, não sobrescrever refs com `--force`, não ativar Vercel nem Supabase sem gates/autorização.
- A branch `dev/bibliotecas` dentro do ZIP é um **nome local herdado**, e sua árvore contém o commit auditado; publicá-la como `main` inicial do **novo** repo NÃO altera a `main` de outros repositórios.
- `main` local herdada do ZIP corresponde à baseline anterior e não deve ser enviada como HEAD: a fonte de importação é a `dev/bibliotecas` local.

## Estado efetivo

- Verificado por conector: repo novo privado e vazio; conexão GitHub possui acesso de escrita.
- A importação remota não ocorreu no ambiente do assistente: conexão GitHub oferece criação de blobs/arquivos isolados, porém não importação do diretório `.git` ou `git push` de um ZIP. O ambiente de terminal não resolve `github.com`.
- **Não inicializar o GitHub com README/manual antes da importação**, pois isso interromperia a inclusão *fast-forward* do histórico original no repositório vazio.
- Para publicar os commits de maneira segura com Git local autenticado, executar `./tools/publicar-workspace.ps1` na pasta extraída no PowerShell. O script rejeita repositório remoto não vazio ou target diferente, valida gates e nunca usa `--force`.
- Pendente reproduzir `npm ci`, 200 testes, `tsc`, build SPA, E2E, captura visual, SEO inicial, acessibilidade e proteção privada da Vercel. **Não homologado para produção**.

## FIND-CKO-PACKAGING-001 — remediação

- Gate `node scripts/check-cko-packages.mjs` falhava na cópia **auditada**: 3 arquivos referenciados no manifesto de 625 entradas estavam ausentes por causa do padrão `.gitignore: dist`.
- Recuperados, sem modificação, da fonte original `REPOSITORIO-branch-bibliotecas.zip`:
  - `contracts/cko-tokens/dist/_cko-universal-content-tokens.scss`
  - `contracts/cko-tokens/dist/cko-universal-content-tokens.css`
  - `contracts/cko-tokens/dist/cko-universal-content-tokens.ts`
- Cada SHA256 conferiu com `registers/governance/cko-package-manifest.v1.json`.
- Acrescentada exceção restrita no `.gitignore` para versionar somente essa pasta CKO. Gate reexecutado: **30 checksums declarados + 625 pinados PASS**, sem órfãos.
- Workflow GitHub CI (somente leitura) ajustado para `push` da `main` do **novo workspace**. Nenhuma branch adicional é necessária.

## Próximos gates

1. Publicar o histórico intacto via `git push origin HEAD:refs/heads/main` com git autenticado, *somente se o remoto continuar sem nenhuma referência*.
2. Confirmar cinco commits no remoto e que a árvore inclui os três `dist` pinados. CI deve rodar somente-leitura.
3. Em ambiente com npm disponível: `npm ci`, `npm run typecheck`, `npm test`, `node scripts/audit-execution-gates.mjs`, `npm run build:spa`.
4. Validar privacidade, configuração de Node 22, 52 rotas e inexistência de backend real; iniciar apenas preview privado Vercel após gates completos.
5. Revisar pendências clínicas; continuar com `md_gate=CLOSED`, sem publicação clínica liberada.
