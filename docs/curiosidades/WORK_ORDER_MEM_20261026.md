# Curiosidades — frente editorial MEM

## Identidade e limites
- Fonte de conteúdo: Supabase **Calculadoras-Smart**, schema `ce_curiosidades_v1`, tabela `pages` (READ_ONLY).
- Snapshot **somente metadados** de 87 páginas em `registers/curiosidades/mem-content-inventory.v1.json` (43 NEEDS_REVIEW; 44 BLOCKED_SOURCE).
- Design obrigatório: **MEM já homologado pelo proprietário**. **MEM confirmado pelo proprietário** pela referência https://dev-chatgpt-workspace.vercel.app/blog/mary-eliza-mahoney; implementação no repositório: `BiographyView` sobre `ArticlePage` + `pieces.tsx` + `article.css`. Reutilizar essas peças, sem criar outro DS. A referência HTTP não pôde ser inspecionada diretamente nesta sessão; identificação de código feita no GitHub.
- Esta branch não concede aprovação de conteúdo nem autorização para publicar material bloqueado. Não realizar consultas públicas ou exportação integral de conteúdo para o GitHub antes de esclarecer licença/direitos.
- Não escrever em Supabase, em `main` ou em outros repositórios. Não criar componentes visuais novos enquanto fonte MEM não identificada.

## Resultado verificável
- Branch: `feat/curiosidades-mem-87-20261026`, derivada do commit `6c62bb61791631681979b229ccfbb05f7f5ac411` da main.
- Inventário importado por consulta read-only; preserva slugs, títulos, categorias, hashes, seções, referências e status da fonte.
- 8 categorias: people, origins, places, symbols, history, myths, terms, culture.
- Nenhuma página pública criada nesta entrega; os gates permanecem abertos conforme origem.

## Fila de implementação (sem reexecutar etapas concluídas)
1. **MEM-01 — contrato identificado (DONE_CODE_REFERENCE)**: referência fornecida pelo proprietário e mapeada no código. Ver `docs/curiosidades/MEM_REFERENCE_AND_MAPPING.md`. Revisão pixel-a-pixel do deployment permanece NOT_RUN.
2. **MEM-02 — crosswalk de metadados (DONE_INVENTORY)**: 87 slugs, 8 categorias e situações editoriais versionadas. `content_json` permanece no Supabase; script local read-only de exportação criado para a etapa segura de revisão.
3. **MEM-03 — renderer tipado (DONE_CODE; E2E PENDING)**: `src/components/templates/curiosity-view.tsx` suporta os dez tipos observados de blocos, usando MEM existente. Ainda falta integrar uma fonte de conteúdo autenticada e testar páginas reais.
4. **MEM-04 — QA de todas as 87 (PENDING)**: validar slugs, fontes, títulos, mídia/licenças, imagens, texto alternativo, navegação, responsividade, acessibilidade, internacionalização real e SEO. Gerar FIND por falha; nunca promover HOLD como PASS.
5. **MEM-05 — preview isolado (PENDING)**: renderizar somente registros autorizados para preview. Bloquear indexação/publicação de `NEEDS_REVIEW` e `BLOCKED_SOURCE`.
6. **MEM-06 — homologação (PENDING)**: revisão editorial, direitos, governança e autorização humana por item, depois PR draft sem merge automático.

## Critério de conclusão por página
`source_confirmed && license_cleared && design_MEM_exact && content_validated && media_cleared && references_verified && accessibility_pass && visual_pass && owner_approved`.

## Nota de arquitetura
O repositório já possui `/blog/$slug`, `src/lib/content/articles`, geração de índices e `route-registry`, mas hoje cobre um artigo de biografia. A estratégia não é editar arquivos gerados manualmente nem colocar os 87 registros bloqueados em `routeRegistry` com `indexavel:true`. Integração deverá separar `draft` de `published` em política fail-closed.

## Evidências de execução CI
- Gate de contratos e typecheck do MEM: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/40422244596 (conclusão SUCCESS verificada).
- O workflow anterior de Curiosidades ainda depende de rotas reais dos candidatos bloqueados; não flexibilizar seus asserts para dar PASS.
- O registro PMO canônico tem freeze validado por CI; sua alteração foi revertida na branch. Esta WO fica documentada sem modificar o PMO congelado.
