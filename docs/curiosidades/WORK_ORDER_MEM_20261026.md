# Curiosidades — frente editorial MEM

## Identidade e limites
- Fonte de conteúdo: Supabase **Calculadoras-Smart**, schema `ce_curiosidades_v1`, tabela `pages` (READ_ONLY).
- Snapshot **somente metadados** de 87 páginas em `registers/curiosidades/mem-content-inventory.v1.json` (43 NEEDS_REVIEW; 44 BLOCKED_SOURCE).
- Design obrigatório: **MEM já homologado pelo proprietário**. **Não substituir** com `ArticlePage`, `BiographyView`, CSS institucional ou outro design concorrente sem verificar que é o MEM. A árvore deste repositório não contém arquivo nomeado MEM; localização do artefato original continua NOT_VERIFIED.
- Esta branch não concede aprovação de conteúdo nem autorização para publicar material bloqueado. Não realizar consultas públicas ou exportação integral de conteúdo para o GitHub antes de esclarecer licença/direitos.
- Não escrever em Supabase, em `main` ou em outros repositórios. Não criar componentes visuais novos enquanto fonte MEM não identificada.

## Resultado verificável
- Branch: `feat/curiosidades-mem-87-20261026`, derivada do commit `6c62bb61791631681979b229ccfbb05f7f5ac411` da main.
- Inventário importado por consulta read-only; preserva slugs, títulos, categorias, hashes, seções, referências e status da fonte.
- 8 categorias: people, origins, places, symbols, history, myths, terms, culture.
- Nenhuma página pública criada nesta entrega; os gates permanecem abertos conforme origem.

## Fila de implementação (sem reexecutar etapas concluídas)
1. **MEM-01 — localizar original**: identificar o template executável MEM e registrar localização, versão, hash, contrato de slots, tokens, classes e componentes. Não confundir com CSS `src/styles/article.css`, que se declara institucional.
2. **MEM-02 — crosswalk**: cada slug do inventário deve apontar para categoria, modelo MEM, dados de origem e gates. Corpos `content_json` permanecem no banco, até validação dos direitos.
3. **MEM-03 — adapter**: implementar renderização de Curiosidades por dados estruturados, não 87 páginas JSX duplicadas. Reutilizar MEM existente, preservar schema/lineage, links e referências.
4. **MEM-04 — QA de todas as 87**: validar slugs, fontes, títulos, mídia/licenças, imagens, texto alternativo, navegação, responsividade, acessibilidade, internacionalização real e SEO. Gerar FIND por falha; nunca promover HOLD como PASS.
5. **MEM-05 — preview isolado**: renderizar somente registros autorizados para preview. Bloquear indexação/publicação de `NEEDS_REVIEW` e `BLOCKED_SOURCE`.
6. **MEM-06 — homologação**: revisão editorial, direitos, governança e autorização humana por item, depois PR draft sem merge automático.

## Critério de conclusão por página
`source_confirmed && license_cleared && design_MEM_exact && content_validated && media_cleared && references_verified && accessibility_pass && visual_pass && owner_approved`.

## Nota de arquitetura
O repositório já possui `/blog/$slug`, `src/lib/content/articles`, geração de índices e `route-registry`, mas hoje cobre um artigo de biografia. A estratégia não é editar arquivos gerados manualmente nem colocar os 87 registros bloqueados em `routeRegistry` com `indexavel:true`. Integração deverá separar `draft` de `published` em política fail-closed.
