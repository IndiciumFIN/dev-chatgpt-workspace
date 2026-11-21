# CE — PR #32: conclusão estrutural dos 486 e triagem dos 17 (20/11/2026)

**Escopo:** somente a divergência entre a PR histórica [#32](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/32) e a `main` do Workspace. **Baseline**: PR #32 em `8c0c4b6f9c049bb5bf13de260074b5020b08a07d`, base antiga `e9f7fe66075ebe5d7346072dc3a1b4934678c6de`, main em `f3390cb134db09195cf3c78a7db2b896ec304d6e`. A automação nesta PR #78 não faz merge nem declara admissão clínica.

## Resultado demonstrado por árvores Git e bytes

- A API da PR #32 registra **13.770** arquivos; Git nativo contra a base histórica reproduz **13.770/13.770**. O comparador anterior usava a `main` atual como base, que gera **13.284**, sem que isso represente perda de 486 arquivos.
- Os **486** caminhos que desaparecem do diff contemporâneo existem na `main`: **469** com mesmo blob/modo/tipo e **17** diferentes. Zero ausentes. Há ainda **5 mudanças de status `A → M`** entre bases, mas não são arquivos faltantes.
- Os 17 pares de blobs foram efetivamente lidos em Git, com SHA-1 de objeto e SHA-256 de bytes, sem executar código. **1/17** tem bytes iguais e apenas modo Git diferente; **16/17** têm bytes diferentes; **7/17** mudam de modo `100644 → 100755`.
- [Execução #44823025322](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/44823025322): `git-reconcile=SUCCESS`, 7 testes negativos novos PASS, relatório `pr32-17-content-screen.json` no artefato `ce-live-git-reconciliation-44823025322`, SHA-256 lógico `41511c202740122f2cac57c2445309b34a94bff3246b65adf14998f653b160cd`. Este hash é do relatório, não de documentos privados.
- **Nenhuma decisão semântica final aprovada** (0/17). O gate `HOLD_INDEPENDENT_SEMANTIC_REVIEW` permanece.

## Fila priorizada — item por item

| Prioridade | Arquivo | Evidência objetiva | Decisão pendente |
|---|---|---|---|
| P0 | `registers/canonical/surface-contracts.v2.json` | 33→53 entradas, nenhuma removida, 11 bindings alterados | Validar 11 bindings, autoridade, rotas e testes de import |
| P0 | `scripts/header-entry.test.mjs` | Teste histórico exige link direto; teste atual exige `AccountSlot` dependente de papel | Preservar controle RBAC, teste negativo sessão sem papel |
| P0 | `src/components/site/shell.tsx` | `main` usa `AccountSlot`, origem não; outras alterações de cabeçalho | Comparar UI, foco, contraste, i18n e fluxo autorizado |
| P0 | `src/lib/contract-index.generated.ts` | 2 IDs de ferramenta históricos não aparecem no index atual: `CE-TOOL-aldrete`, `CE-TOOL-exames-laboratoriais` | Catálogo e rota: os dois IDs estão em `candidateTools`, não no conjunto ativo `tools`; rota exige `readTool` e `published`. Conferir cadastros reais antes de admissões |
| P0 | `src/routes/blog.$slug.tsx` | Preview de curiosidades por `import.meta.env.DEV` + opt-in estava na origem e não está na main | Direitos editoriais, 404 corretos, versão autorizada |
| P0 | `src/routes/kids.$section.tsx` | Origem renderiza `VilaHub`; main usa `PageHero`; componente `VilaHub` existe na main | E2E por seção, acessibilidade, segurança infantil e autorização |
| P0 | `src/routes/kids.index.tsx` | Mesmo desvio VilaHub → placeholder `PageHero` | E2E navegação da Vila e regras de conteúdo |
| P0 | `src/routes/login.tsx` | Origem contém parâmetro de origem `de`; main contém `authEnabled` e `SignInGate` | Regressão negativa de autenticação, sessões, callback, 401/403 |
| P1 | `registers/canonical/route-contracts.v1.json` | **33/33 entradas históricas preservadas sem alterações**, main total 53 | Superset estrutural comprovado; homologar integração visual/rotas |
| P1 | `scripts/test-locale-registry.mjs` | Verificador atual cruza runtime e cadastro; origem verifica somente cadastro | Testar consistência 19 idiomas; não alegar tradução completa |
| P1 | `src/lib/header-i18n.ts` | Main limita seletor a interface `partial_existing` | Confirmar 4 idiomas selecionáveis sem divulgar 15 como completos |
| P1 | `src/lib/locale-registry.ts` | Origem: 15 `missing`; main: 15 `header_only`, 0 `interface_ready` | Fonte e cobertura de 15 traduções de cabeçalho |
| P1 | `src/lib/vila-assets.ts` | Import deslocado; manifests sob `contracts/vila` e `src/data/contracts/vila` têm mesmo blob | Confirmar resolução no build e arquivos binários/licenças |
| P1 | `src/routeTree.gen.ts` | Main possui árvore gerada ampliada | Regenerar/validar contra rotas reais; evitar copiar gerado histórico |
| P1 | `src/routes/viladocuidado.tsx` | Import deslocado; ambos módulos VilaPage existem na main com mesmo blob | Confirmar resolução e E2E do piloto |
| P2 | `src/lib/vila-canonical.ts` | Bytes idênticos nos dois SHAs; apenas `100644 → 100755` | Verificar política de bits executáveis sem mudar conteúdo |
| P2 | `src/routes/kids.tsx` | Mudança do wrapper `Outlet` e modo do arquivo | Smoke da rota pai e permissão Git |

## Evidência adicional dos dois IDs clínicos

Na `main` atual, `src/lib/tools/catalog.ts` mantém `aldrete` e `examesLaboratoriais` em `candidateTools`, enquanto `tools` contém somente Braden, Morse, APGAR, gotejamento e IMC. O índice gerado `contractTools` cobre o segundo conjunto, por isso não lista os dois candidatos. A rota genérica `/ferramentas/$slug` chama `readTool` e exige `loaded.published`; a implementação do servidor lê a ficha de `source_tool` e não devolve objeto sem ficha. **Conclusão parcial:** os 2 IDs de índice não comprovam perda de fonte e correspondem à separação ativo/candidato no código; **não comprova ausência de publicação no banco operacional**, que precisa ser auditado em seu ambiente real antes de afirmar segurança clínica.

## Ordem de execução (não repetir o censo)

1. **P0 segurança/clínica/contratos:** 8 itens acima, com testes negativos de origem/atuais, decisão por arquivo, revisor independente e verificação de rotas; priorizar login, Vila e o índice de ferramentas.
2. **P1 compatibilidade e localização:** 7 itens com checagem de imports, geradores, direitos e runtime.
3. **P2 modo e wrapper:** 2 itens de baixo risco, sem fingir aprovação E2E.
4. Registrar a disposição final de cada item como `EXACT_IN_CANONICAL`, `INTEGRATED_VERIFIED`, `SUPERSEDED_WITH_PROOF`, `ARCHIVED_INERT_WITH_PROOF` ou `HOLD` **somente após** teste, evidência e aprovação competente; não usar o censo Git como prova clínica.
5. Prosseguir no cross GitHub↔Supabase↔Drive, executando apenas em fontes privadas autorizadas os snapshots sensíveis; jamais colocar documentos/IDs privados ou segredo em workflow de repositório público. Não marcar a PR #32 nem a branch como `SEALED` apenas pelo esclarecimento dos 486.

## Evidência e decisão

Códigos candidatos em PR #78: `scripts/ce-pr32-baseline-diagnostic.mjs`, `scripts/ce-pr32-17-content-screen.mjs`, suas suítes negativas e workflow `ce-live-branch-reconciliation.yml`. Tudo **read-only**. A `main` e o Supabase permanecem intactos; merge, deploy, direitos editoriais e segurança clínica têm gates separados.
