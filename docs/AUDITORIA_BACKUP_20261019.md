# Auditoria do backup — 2026-10-19

Escopo: snapshot ZIP recebido, 204 entradas, teste `unzip -t` aprovado. Este documento registra evidências estáticas, sem afirmar aprovação funcional ou visual.

## Achados

| ID | Risco | Evidência | Critério de saída |
|---|---|---|---|
| FIND-001 | Crítico | `src/lib/source.functions.ts` edita apenas `title`, `lead`, `published`; `src/lib/tools/catalog.ts` mantém conteúdo clínico | Toda entidade publicável usa revisão versionada na fonte administrativa |
| FIND-002 | Crítico | `src/routes/ferramentas.$slug.tsx` usa `readCatalog().catch(() => null)` e substitui pela versão em código | Falha da fonte resulta em estado indisponível, nunca em publicação presumida |
| FIND-003 | Crítico | `src/components/site/areas.tsx` exige usuário; `source.functions.ts` exige `authMiddleware` em POST | Acesso livre local apenas para leitura/edição local; mutações remotas autorizadas no servidor |
| FIND-004 | Alto | `public/sitemap.xml` estático e `src/lib/contract.ts` gera rotas separadamente | Sitemap e menus gerados do registro canônico, com teste bidirecional |
| FIND-005 | Alto | `src/lib/template-contract.ts` define tipos sem associar automaticamente cada rota | Toda rota declara `templateId`, `contractVersion`; bloqueio CI para órfãos |
| FIND-006 | Alto | Não há suíte de casos clínicos testando `src/lib/tools/engine.ts` e todas as bandas | Casos-ouro, limites, inválidos, mutações e revisão clínica independente |
| FIND-007 | Alto | `src/lib/seo.ts` define quatro idiomas | Política de idiomas ativos e cobertura real por idioma, sem hreflang especulativo |
| FIND-008 | Alto | `src/lib/translate.ts` envia textos ao endpoint externo MyMemory | Proibição de PHI e restrição a conteúdo editorial explicitamente autorizado |
| FIND-009 | Alto | `package.json` une `vite build` e `db:migrate` | Migrações executadas em pipeline separado, controlado e reversível |
| FIND-010 | Alto | `docs/continuidade.md` declara ausência de edição de miolo no admin | Admin gerencia seções, peças, evidência, mídia e publicações mediante validação |

## Matriz de auditorias e gates

| Frente | Procedimento mínimo | Evidência de homologação |
|---|---|---|
| SEO | Crawl interno, canônicos, hreflang, sitemap, robots, indexabilidade | Toda rota pública válida e rastreável |
| Técnico | Build, typecheck, dependências, erros runtime, fallbacks | CI verde e SSR/CSR consistente |
| Conteúdo | Fonte, licença, autoria, revisão, vigência, E-E-A-T clínico | Claim→evidência→revisor→publicação |
| Usabilidade/UI/UX | Fluxos reais em desktop/tablet/mobile e por teclado | Sem bloqueios e com tarefas concluídas |
| Segurança | OWASP ASVS, armazenamento, autorização, XSS, CSRF, cabeçalhos | Testes negativos e ausência de escrita anônima remota |
| Saúde do site | 404, 5xx, links, assets, monitoramento | Sem rotas órfãs ou erros ocultos |
| Dados estruturados | JSON-LD validado e correspondente ao texto visível | Sem propriedades enganosas ou markup inválido |
| Compatibilidade | Chromium, Firefox, WebKit, mobile, JS restrito | Matriz de resultados e exceções |
| Performance | LCP, INP, CLS, TTFB, peso e cache | Limiares Core Web Vitals em dados de campo e laboratório |
| Acessibilidade | WCAG 2.2 AA + verificações manuais | Zero violações bloqueantes e testes assistivos |
| Sustentabilidade | Bytes por rota, imagens, fontes, cache, estimativas de carbono | Linha de base replicável e melhoria verificada |
| Paridade visual | Screenshots por família e tokens | Diferenças justificadas por variante formal |
| Rotas e menus | Registro→manifesto→menus→breadcrumbs→sitemap→link checker | Todas as arestas levam a rota publicada |

## Política de execução

`FIND → política aplicável → validador → tarefa → WO → admissão Kernel verificável → alteração isolada → testes independentes → auditoria → homologação`. Não houve admissão Kernel neste snapshot. Nenhum achado está homologado.

## Fontes primárias

- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Google Search Central: https://developers.google.com/search/docs
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- Core Web Vitals: https://web.dev/articles/vitals
- Green Web Foundation: https://www.thegreenwebfoundation.org/co2-js/
