# CE — Ordem de integração canônica da base ao produto (v0.6.3)

**Status: CANDIDATE / READ_ONLY / HOLD_HUMAN.** Escopo: 26 refs no snapshot GitHub de 2026-11-01; baseline `main` SHA `e9f7fe6`; overlay `081c61a`. Não é uma migração executada.

## Autoridades existentes: REUTILIZAR

Fonte: `contracts/cko-governance/structural-table-registry.v1.json` na integração, blob `684926fb2439cdaf2a789b104f048b37d836cd6f`; banco Supabase `Calculadoras-Smart` consultado somente leitura. Confirmadas 12/12 tabelas estruturais reutilizadas; 0/8 tabelas candidatas de WO/Kernel implantadas; 160 tabelas nas cinco áreas CKO, todas com PK, e 240 migrations observadas. Em 160 tabelas, três exibem RLS habilitada. **A falta de RLS não é automaticamente vulnerabilidade** em schemas privados: inspecionar grants e exposição das APIs antes de classificar risco.

**Não implementar um segundo sistema de autoridade.** Primeiro reconciliar contratos de IDs, PK/FK, dependências, versão e escopo; integrar candidato de governança apenas quando realmente necessário e autorizado. O SQL `migrations/candidates/20261026_governance_kernel_opa_agents.sql` está NOT_APPLIED. Conferir chaves FK reais, transações, RLS, grants, schema search_path, qualidade do trigger e compatibilidade com migrations históricas em um PostgreSQL descartável antes de qualquer DDL remoto.

## Waves em ordem de dependência

| Wave | Entrega | Evidência de saída obrigatória |
|---|---|---|
| BASE-00 | Fixar as 26 refs e PRs | SHA, ancestralidade, branches sem ancestral, conflitos e inventário completo de blobs, sem truncamento |
| BASE-01 | Identidade, snapshots, fontes e versões | Eixos Source→Snapshot→Fragment/Atom→Claim→Evidence→Objeto; ID, hash, licença e proveniência verificáveis |
| BASE-02 | Estrutura de banco e relações existentes | Matriz tabela/coluna/PK/FK/índices/RLS/grants/exposição; órfãos e cardinalidades; deduplicação de contratos |
| BASE-03 | DDL e schemas candidatos por domínio | Crosswalk de SQL e JSON Schema: existente vs novo vs colisão vs subcontrato; execução apenas descartável |
| BASE-04 | Governança e admissão | FIND→política→validador→TASK→WO→Kernel, OPA, assinatura, Maker/Checker, antirreplay e vetos testados |
| BASE-05 | Corpus e domínio | CKO, escalas, bibliotecas, conteúdos, simulados, pesquisa, direitos e revisão científica |
| BASE-06 | Serviços | Auth/RLS, APIs, workflows, importadores, jobs, auditoria, idempotência, segurança |
| BASE-07 | Aplicação | Componentes, DS canônico, formulários, páginas, idiomas, UX, WCAG; nenhum renderer duplica domínio |
| BASE-08 | Lançamento | CI global no SHA exato, QA/E2E, evidência visual, revisão independente, proteção main, aprovação de promoção |

Uma branch pode alimentar várias waves; `firstPhase` no JSON registra **a primeira dependência a reconciliar**, não exclusividade nem autorização de incorporação.

## Origem dos candidatos estruturais identificados

- Overlay: registry CKO e oito tabelas de admissão propostas, além de OPA. Reconciliar com doze tabelas existentes antes de estudar DDL.
- Carreira: migrations `0004` a `0007`, schemas editoriais, atômicos e de governança; comparar nomes/identidade com contratos CKO antes de novos objetos.
- Pesquisa: `0004_research_participation_candidate.sql` e nove JSON schemas; cruzar consentimento, autorizações e claims.
- Simulados: migrations candidatas `0001`–`0003`, isolamento de gabaritos, RLS e RPC; preservar HOLD de conteúdo e validação no PostgreSQL descartável.
- Vila: `migrations/candidate/vila/0001_vila_candidate.sql` e contratos de ativos/templating; não criar modelo concorrente de conteúdo.
- Drive/CKO: snapshots importados são **fontes**, não prova de conteúdo completo ou admissão; 37 arquivos ausentes do snapshot anteriormente examinados exigem reconciliação própria.
- Outras branches: componentes, DS, i18n, roteamento, Commander e histórico entram nas waves subsequentes, mas continuam incluídas na auditoria cruzada de SHA/blobs de BASE-00.

## Gates de bloqueio que permanecem

1. Auditoria de 143 divergências está presa ao commit anterior `3143107`; recomputar após integração. Das 143, 86 exigiam reconciliação; zero aprovações formais. Não reaproveitar números históricos como status atual.
2. Não há prova verificável de admissão Kernel para o patch. Não alterar PMO read-only nem gerar autoaprovação.
3. CI no HEAD `081c61a`: 8 SUCCESS, 2 FAILURE, 1 SKIPPED; os dois FAIL eram registros MEM faltantes. O pacote contém verificador dry-run de blobs, não a materialização.
4. A `main` não tinha ruleset nem proteção ativos na leitura do GitHub. Não promover nenhuma wave para `main` sem defesa de branch e autorização própria.
5. Branches sem ancestral comum (`feat/projection-unica-f0-suite-real`, `grook_10_26`) devem ser tratadas por árvore/hash, nunca `merge --allow-unrelated-histories` automático.
6. Conflitos de migrations 0004 (Carreira × Pesquisa), contratos compartilhados, auth e DS exigem eleição de vencedor por critérios técnicos e decisão registrada; proibir merge integral por ordem temporal.

## Execução local reproduzível

`node scripts/governance/structural-base-gate.mjs` emite resultado de conformidade do **snapshot estático**. `--git-check` executado **dentro de um clone real completo**, já com `git fetch --all --prune`, verifica contra `git ls-remote --heads origin` e recusa refs faltantes ou movidas. Em nenhum modo aprova merge, aplica DDL, altera arquivo, ou executa comandos remotos destrutivos.

Após este gate, usar `scripts/governance/inventory-branch-candidates.mjs` para comparar árvores de blobs entre **todas** as refs estáveis e o candidato, e gerar FINDs de colisão antes da eleição canônica. A saída pode ser grande e deve ser arquivada como artefato de CI imutável.

## Situação

BASE-00: ref count e SHAs observados, não homologados. BASE-01/02: inspeção inicial de catálogo, insuficiente para aprovação. BASE-03 a BASE-08: HOLD. Nenhuma branch foi mesclada e nenhum DDL remoto foi executado por este pacote.
