# Administração governada — esqueleto completo (modo local)

Esqueleto executável da área administrativa do CKO / Calculadoras de Enfermagem: design system canônico, biblioteca de componentes, 22 módulos e motor determinístico de impacto. **Não é produção:** sem login, sem banco, sem rede, sem LLM/Kernel. Tudo persiste só no `localStorage` do navegador e cada mutação entra numa trilha de auditoria com hash encadeado.

```bash
npm install   # se houver conflito de peer deps: npm install --legacy-peer-deps
npm run dev        # http://localhost:8080
npm test           # 34 testes (node --test, sem dependências extras)
npm run build      # tsc --noEmit + vite build
```

## Princípios (herdados do plano e do AGENTS do projeto)
- **Estado honesto:** cada módulo declara o modo (derivado, somente leitura, local, planejado) e o que *não* está conectado. Botões indisponíveis são realmente `disabled`, com o motivo em texto fora do botão.
- **Evidência antes de afirmação:** alertas e indicadores derivam de registros existentes; sem SLAs, percentuais ou prazos inventados; “sem evidência” nunca é PASS.
- **Nada é apagado:** arquivar/restaurar; publicação e reversão criam novas revisões.
- **Maker ≠ Checker:** revisão clínica, decisão de impacto e aprovações recusam autor = revisor.
- **Credenciais nunca entram:** campos recusam valores com cara de segredo; o cofre é do ambiente.
- **Dados de demonstração** são opcionais e todas as linhas ficam marcadas `SINTÉTICO`. Fórmulas de teste são sintéticas (não clínicas).
- **Foco:** anel duplo do RFC-001 (halo branco 10,58:1 sobre navy + anel #1d4ed8 6,70:1 sobre branco), valores reconstruídos dos contrastes registrados — confirmar com o RFC-001.
- **DS congelado:** tokens de `contracts/entities/design-tokens.v1.json`; cores rejeitadas não aparecem (teste estático). Tema escuro do site não foi incluído (contraste não verificado).

## Módulos (src/core/modules.ts)
| Grupo | Módulo | Modo | O que faz | Limite declarado |
|---|---|---|---|---|
| Operação | Painel | derivado | Atenção hoje, jornada com estado real, limites do ambiente, demo | Sem SLAs |
| | Alertas | derivado | 14 regras sobre registros (credencial, cota, fonte revogada, revisão vencida…) | Sem ler/adiar/resolver |
| | Ordens e PMO | leitura | Fila real (`queue.v1.json` rev. 18) com busca/filtro/ordenação/paginação e detalhe em abas | Não cria OS |
| | Agenda | derivado | Linha do tempo só de datas registradas | Prazo ausente = “não definido” |
| | Playbooks | local | 4 roteiros guiados com progresso | Não é política aprovada |
| Governança | Políticas e controles | local | Mapa referencial→controle→evidência (sem “conforme”) | OPA/Kernel não conectados |
| | Commander | local | Composer (24–800 chars), rascunho em memória | Não envia nem salva |
| | Revisão clínica | local | Revisor, competência, validade, Maker≠Checker | Sem verificação de identidade |
| | Testes de referência | local | Casos esperados, execução, dica de erro de unidade | Só fórmulas sintéticas |
| Conhecimento | Fontes e normas | local | Vigência, direitos, hash, edição | Sem ingestão/diff automático |
| | APIs e fornecedores | local | Dossiê, direitos, cota, sombra/quarentena, rótulo de credencial | Não chama APIs |
| | Extração e átomos | local | Revisão original × extraído (aceitar/corrigir/rejeitar com nota) | Sem pipeline |
| | Templates canônicos | leitura | 14 templates do `templateCatalog` | Somente leitura |
| | Mídia | local | Metadados, alt obrigatório, licença | Não envia arquivos |
| Publicação | Conteúdos | local | Rascunho editorial | — |
| | Revisão e publicação | local | Dry-run, diff, gates, projeção versionada com hash, reversão como nova revisão | `md_gate` fechado; não publica em produção |
| | Configuração do site | local | SEO/JSON-LD, redirecionamentos (sem ciclos), sitemap derivado, idiomas | Não altera rotas reais |
| Risco e evidência | Impacto e cobertura | local | Registro de mudança, candidatos, decisão, grafo, simulador “e se”, cobertura com denominador | Sem fila durável nem OS criadas |
| | Auditoria | local | Trilha encadeada SHA-256, verificação, exportação | Não é auditoria imutável de servidor |
| | Modo auditor | derivado | Manifesto de hashes e pacote de evidência | Pacote não assinado |
| Sistema | Configurações e limites | local | Flags travadas, backup/restauração validados, apagar tudo | Auth/DB travados em “desligado” |
| | Perfil e sessão | planejado | Estado honesto; **Sair** desabilitado | Exige backend/RBAC |

## Biblioteca de componentes (src/ds)
`Panel`, `Stat`, `Tag`/`StatusBadge`/`ModeBadge`/`SyntheticTag`, `SourceStamp`, `DisabledAction`, `EmptyState`, `KeyValue`, `PageHead`, `Tabs`, `Stepper`, `Timeline`, `Drawer`, `ConfirmDialog` (foco preso, Esc, devolução de foco), `Toast`, `DataTable` (busca texto/ID, filtros visíveis, chips removíveis, ordenação, paginação, contagem com fonte, vazio, arquivados), `RecordForm` (label visível, obrigatório/opcional, ajuda, erro inline, resumo com foco), `GraphView` (SVG + alternativa textual), `FieldDiff`. Genérico de CRUD: `modules/Crud.tsx` (Novo, Abrir, Editar, Duplicar como rascunho, Arquivar/Restaurar, aba de auditoria por registro).

## Núcleo (src/lib, src/core, src/data)
`impact-engine` (grafo validado e versionado, classificação, severidade **proposta**, idempotência, ledger, triagem, decisão, cobertura) · `hash-chain` · `local-db` (store + coleções arquiváveis + backup) · `validate` · `attention` (regras de alerta) · `publication-gates` · `redirects` · `formulas` (sintéticas) · `list-query` · `schemas` (10 coleções) · `master` (enumerações do catálogo de dados mestres e templates) · `queue.v1.json` (PMO real do zip).

## Verificação executada (2026-11-01, neste ambiente)
- `tsc --strict --noEmit`: limpo. `vite build`: OK (JS 375 kB / 116 kB gzip).
- `npm test`: **35/35** (impacto 17, listas 6, núcleo 12: trilha, validação, regras, alertas, gates, diff, redirects, registro, dados demo, invariantes estáticas, foco em anel duplo).
- Navegador real (Playwright/Chromium) — `evidence/smoke-results.json`: **63/63**: 22 módulos renderizam; **axe (WCAG 2.0/2.1/2.2 A/AA) sem violações nos 22 módulos**; segredo recusado; CRUD; impacto→candidatos→decisão (Maker≠Checker); gates bloqueiam fonte revogada; trilha íntegra; skip link; **sem rolagem horizontal a 390 px**; **nenhuma requisição externa**; sem erros de console.
- **NOT_RUN:** leitor de tela real; navegação completa por teclado em todos os fluxos (só skip link e diálogos por inspeção); Safari/Firefox; teste com dados reais; integração com o repositório (typecheck/gates do repo).

## Integração no repositório
- Os tokens em `src/styles/tokens.css` espelham `--color-*`; ao integrar, **remova-os** e use os do site.
- Componentes `ds/*` devem substituir/alinhar com `Panel/Indicator/Stat` do `admin-console.tsx` (sem duplicar).
- `queue.v1.json` aqui é cópia do snapshot; no repo, importar de `registers/pmo/`.
- Dependências para backend (identidade, RBAC, trilha imutável, fila durável, cofre) estão listadas em “Limite declarado” de cada módulo; nada aqui as simula.
- A matriz de severidade do motor é **proposta** (`approved:false`): precisa de aprovação dos donos.


## Alinhamento ao Design System canônico (v2.1, candidato)
- Cabeçalho de página = `PageHero` oficial (`src/ds/PageHero.tsx`), com breadcrumbs e rodapé de modo local.
- Novo módulo **Design System** (37 componentes, 21 templates, 14 schemas, regra de imagens). Detalhes e limites: `docs/CANONICAL-MAPPING.md`.
- Os 142 bindings não foram recuperados e não são inferidos.
- Verificação: tsc strict limpo; 39/39 testes node; smoke Playwright+axe 65/65 (23 módulos). NÃO executado: leitor de tela real, Safari/Firefox, dados reais, integração ao repositório.
