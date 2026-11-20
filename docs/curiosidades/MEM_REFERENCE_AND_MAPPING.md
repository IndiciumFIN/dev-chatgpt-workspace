# Curiosidades — MEM canônico confirmado (2026-10-26)

## Referência indicada pelo proprietário

**Página de referência:** https://dev-chatgpt-workspace.vercel.app/blog/mary-eliza-mahoney

A composição executável da página foi localizada na árvore Git `main@6c62bb61791631681979b229ccfbb05f7f5ac411`:

| Responsabilidade | Componente fonte |
|---|---|
| Frame do site | `src/components/site/shell.tsx` |
| Moldura editorial MEM | `src/components/article/article-page.tsx` |
| Implementação de referência | `src/components/templates/biography-view.tsx` |
| Blocos reutilizáveis | `src/components/article/pieces.tsx` |
| Estilo compartilhado | `src/styles/article.css`, importado em `src/styles.css` |
| Rota editorial | `src/routes/blog.$slug.tsx` |
| Metadados de catálogo | `src/lib/content/articles/` |
| Contrato de frame | `src/lib/template-contract.ts` (`kind: "artigo"`) |

**Importante:** MEM é a designação confirmada pelo proprietário para essa referência de produto; não há pacote de código chamado literalmente "MEM" no repositório examinado. Não trocar por outro design, não bifurcar CSS e não alterar a página Mary Eliza Mahoney.

## Bridge implementada na branch

- `src/lib/content/curiosidades/model.ts`: contrato dos registros estruturados e gate editorial fail-closed.
- `src/components/templates/curiosity-view.tsx`: projeção exclusivamente via `ArticlePage`, `ArticleFaq`, `Cite`, `ContextGrid`, `Keyline`, `ReferenceList` e classes existentes do MEM.
- `scripts/export-curiosidades-preview.mjs`: somente `SELECT` no Supabase; exportação de 87 páginas para diretório local ignorado pelo Git. Credencial read-only necessária.
- `scripts/test-curiosidades-mem.mjs`: verificador estrutural do inventário e do reaproveitamento canônico.

Os dez tipos de bloco existentes no banco foram mapeados sem criar DS alternativo:

| Tipo em `content_json.sections[].components` | Saída no MEM |
|---|---|
| cards | `.inst-cards` / `.inst-card` |
| stats | `.inst-cards` / `.inst-card` |
| pair | `ContextGrid` |
| conflict | `ContextGrid` |
| callout | `Keyline` |
| evidence | `Keyline` |
| faq | `ArticleFaq` |
| checkgrid | `.inst-cards` com listas `.inst-list` |
| timeline | `.inst-chronology` |
| quote | `blockquote` com `.inst-history` |

## Estado da fonte consultada em 26/10/2026

- 87 páginas, oito categorias, 662 seções, 659 componentes.
- 43 `NEEDS_REVIEW`; 44 `BLOCKED_SOURCE`; 0 aprovadas.
- 108 fontes cadastradas, 160 vínculos em `page_sources`, 220 itens de mídia.
- 19 IDs distintos de referência encontrados nos artigos **não constam** da tabela `sources` (consulta read-only); requer reconciliação.
- Um registro sem `source_sha256`: `17-de-setembro-dia-mundial-da-seguranca-do-paciente`.
- Mídias ainda não estão individualmente aptas à publicação: 173 `SELF_CREATED_CONTENT_UNVERIFIED`, 41 `ORIGINAL_DIAGRAM`, quatro `SELF_CREATED_AI`, uma `ARCHIVAL_CANDIDATE_RIGHTS_REVIEW`, uma `PD_US_BRAZIL_REVIEW`; todas com etapa de produção ou revisão pendente.

**Estes números são somente o recorte consultado, não prova de legitimidade/validação do material.**

## Contratos de segurança editorial

1. Inventário e fetch editorial não equivalem a direitos ou autorização para publicar.
2. `mayPublishCuriosity` exige `APPROVED` no registro de origem, contratos válidos e **sete** gates explicitamente verdadeiros.
3. Não listar candidatos no sitemap/Route Registry nem abrir rota pública para registros `BLOCKED_SOURCE`/`NEEDS_REVIEW`.
4. Credenciais devem ser de leitura e permanecer no servidor local; não serializar segredos para navegador ou Git.
5. Nenhuma imagem é renderizada automaticamente enquanto licença, hash, direitos e acessibilidade estiverem pendentes. Sem `dangerouslySetInnerHTML`.
6. Sem conteúdo completo no repositório público: exportação usa `.curiosidades-private-draft/`, que consta do `.gitignore`.
7. Visual QA, typecheck, E2E e revisão humana permanecem `NOT_RUN`/`PENDING`, salvo evidência CI verificável da execução.

## Próxima fila

1. Executar exportação somente com credencial de leitura e reconciliar fontes ausentes.
2. Construir preview editorial **autenticado** que injete `CuriosityContent` e `CuriositySource` no componente existente.
3. Rodar `node scripts/test-curiosidades-mem.mjs`, `npm run typecheck`, `npm test`, teste de responsividade, acessibilidade, teclado, RTL e captura visual da referência versus amostras.
4. Resolver `BLOCKED_SOURCE`, mídias/licenças e revisão de claims; armazenar decisões por slug.
5. Publicar **somente** os registros individualmente aprovados, com SEO/hreflang e rotas.
