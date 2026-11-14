# ADR-CKO-002 — Destino do Corpus Acquisition Engine / Supabase

**Estado:** `PROPOSED_HOLD_HUMAN`; nenhuma decisão de infraestrutura foi aprovada pelo usuário nesta execução.
**Data de evidência:** 2026-11-14.
**Origem:** PMO Mestre `PMO-010` e `PMO-011`; programa `PMO-013`; crosswalk `GATE_CROSSWALK_TRIPLO_20261114.md`.
**Escopo:** somente CKO/CE; exclui dados e produtos de contabilidade/tributação.

## Situação observada por leitura do Supabase
| Item | `Calculadoras-Smart` | `SOT-10-09-2026` |
|---|---|---|
| Ref do projeto | `pgsybzggewhinaniybiy` | `hcqukuotfwflmebjygam` |
| Status | `ACTIVE_HEALTHY` | `ACTIVE_HEALTHY` |
| Organização | `bekcrbwjlhpnyewukoqw` | **mesma** `bekcrbwjlhpnyewukoqw` |
| Papel atual | CKO/CE operacional, universo de dados distinto dos arquivos M03 | piloto legado de aquisição de corpus registrado como PMO-011 |
| Corpus | `cko_evidence.sources=157`, `documents=187`, `claims=41`, etc. | 10 tabelas `public.corpus_*`; lista de tabelas indicou **0 linhas em todas** |
| Controles de acesso de tabelas | não reavaliados nesta ADR | 10/10 com RLS; `pg_policies`: 0 policies no conjunto; grants diretos a `anon` e `authenticated`: 0 no conjunto examinado |
| Edge Functions | fora desta inspeção | **9 funções ACTIVE**; 6 com `verify_jwt=true`, **3 com `verify_jwt=false`** (`corpus-test-ui`, `corpus-demo-health`, `corpus-public-health`) |

**Limites de evidência:** consultas somente leitura a metadados e tabelas; não houve pentest, verificação de conteúdo retornado pelos endpoints, análise de secrets, contratos, custos, backup/restore, autenticação do usuário ou revisão de código das 9 funções. RLS e ausência de grants identificados **não provam** segurança da superfície Edge Functions. `verify_jwt=false` pode ser apropriado a endpoints públicos deliberados; exige inspeção individual de métodos/respostas/limites.

## Alternativas candidatas
| Opção | Benefício | Risco | Situação |
|---|---|---|---|
| A. Reaproveitar **SOT apenas como piloto controlado** após revisão | Infra já existe, 10 tabelas corpus e funções já implantadas | Mesma organização CE; limite de isolamento, funções públicas e projeto sem dados | CANDIDATE |
| B. Provisionar **organização/projeto isolados para corpus governado**, mantendo SOT somente como laboratório/legado | Atende requisito histórico de isolamento organizacional, facilita segregação de segredos e recursos | Custo, permissões, runbooks, migrações e aprovação a documentar | PROPOSTO — **SEM AUTORIZAÇÃO DE CRIAÇÃO** |
| C. Misturar corpus novo diretamente em `Calculadoras-Smart` | Evita novo projeto | Risco de dependências, direitos, RLS, licenças e versões sobre sistema existente | NÃO RECOMENDADO SEM NOVO ADR |

### Recomendação para decisão humana
Seguir **A para diagnóstico somente leitura** e avaliar **B para o destino de ingestão/produção** após charter e orçamento, com separação de direitos e segredos. Não ativar ingestão, alterar RLS, substituir dados ou criar organização agora. O usuário deverá aprovar isolamento e titularidade com evidências do PMO histórico.

## Gates e tarefas
- `DRIVE_EXEC:G4` e `R04:G10` possuem requisitos de isolamento/provisionamento; `GIT_CKO:G7` é integração, **não é o mesmo gate**.
- PXC-002: revisar organização, ownership, custo, rate limit, política de snapshots e ciclo de fontes.
- B41–B44: schema/RLS/API contracts e migrações candidatas apenas após ADR admitido.
- R16: área pública de funções sem teste de conteúdo/segurança; R17: isolamento organizacional histórico não demonstrado.
- Aprovação só por responsável autorizado; guardar event log, rollback e evidência de aceite.

**Estado final:** `HOLD_INFRA_DECISION`, 0 writes Supabase e 0 deploys, sem merge na main.
