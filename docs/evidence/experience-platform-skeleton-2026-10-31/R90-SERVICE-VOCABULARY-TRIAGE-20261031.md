# R90 — Triage do vocabulário Experience Platform (31/10/2026)

**Escopo:** inventário de candidatos, read-only; **NÃO** resolução canônica, implementação, homologação, ou admissão Kernel.

## Resultado medido em fonte versionada

Fonte `docs/evidence/experience-platform-skeleton-2026-10-31/catalog/service-catalog.v1.json`, blob Git **`e93506ee9963469e15450a4019c44a4d4c29b13b`**, SHA-256 `37106a8b76e1c80faef65b69ff11170471580006e5ef605bc0473eb49b71b2cc`.

**45 famílias / 410 entradas**; é impreciso tratar todas as entradas como serviços lógicos. O discriminador `kind` evidencia **305 `LOGICAL_SERVICE`** e **105 `EXPERIENCE_CAPABILITY_GROUP`** em nove famílias de experiência (`preview`, `configuracoes`, `ajuda-contextual`, `onboarding`, `outputs`, `renderizacao`, `acoes`, `estado-da-experiencia`, `contexto`). Por `layer`: 274 DOMAIN, 97 PLATFORM e 39 CROSS_CUTTING. O registro da PR #21 com **201 capabilities / 16 object bindings** é uma população *distinta*; 105 agrupamentos de experiência não equivalem a 105 capabilities do registro.

`registers/governance/r90-service-boundary-candidates.v1.json` preserva **410 entradas qualificadas pela família**, 45 contagens e dois discriminadores, com **406 IDs de serviço não qualificados únicos**. O namespace deve ser `family/service`, não `service` isolado.

## Colisões exatas (quatro, nenhuma resolvida)

| ID sem família | Entradas | Hipótese de separação para revisão |
|---|---|---|
| `connector-registry` | `source-acquisition` / `integrations` | Proveniência/licenciamento de fonte ≠ catálogo de adaptadores técnicos; definir produtor/consumidor por contrato |
| `read-later` | `personalization` / `acoes` | Estado persistente pessoal ≠ ação de UI |
| `subscription` | `subscription-entitlement` / `contexto` | Autoridade de assinatura/permissão ≠ projeção de contexto |
| `print` | `outputs` / `acoes` | Formato renderizado ≠ comando de impressão |

**Não** fundir por string; mesmo nomes idênticos podem representar fronteiras distintas.

## Seis grupos candidatos de sobreposição de autoridade

1. `CONTROL_AUTHORITY_AND_REVIEW`: registries/policy/Kernel-admission/work-order/human-review; não criar autor de aprovação concorrente ao Kernel.
2. `SCHEMA_REGISTRY_AND_ADMIN_MANAGEMENT`: separar contrato/schema, registro de validadores e interface de administração.
3. `TASK_EXECUTION_AND_ORCHESTRATION`: tarefa autorizada ≠ agendamento, enfileiramento e processamento técnico.
4. `AUDIT_EVIDENCE_VS_TELEMETRY`: eventos/traces e logs ≠ evidência imutável, checker independente ou assinatura.
5. `POLICY_RULE_RELEASE`: política aplicável ≠ avaliação de regra e decisão de promoção.
6. `SOURCE_CONNECTORS_AND_INTEGRATION`: fonte/linhagem/direitos ≠ adaptador de conexão.

Os grupos não são proof de equivalência. Governança é interface de controle com **autoridade existente do Kernel**, Audit & Assurance produz/reconcilia evidência e apoia revisão, Observability mede telemetria e o Admin Control Plane apresenta read models, sem aprovação autônoma.

## Implementação técnica da proteção

- `scripts/check-r90-service-boundaries.mjs`: recalcula blob SHA-1 Git, SHA-256, população 45/410, tipo 305/105, camada, nomes, namespace, quatro colisões, seis revisões, e ausência de falsas autorizações/admissões.
- `scripts/check-r90-service-boundaries.test.mjs`: regressões negativas de falso status, alteração de fonte, alteração de inventário, falso merge e violação de autoridade; integração como etapa **obrigatória no workflow candidato** `.github/workflows/pmo-candidate-unit-regressions.yml`.
- Não modifica `main`, WOs, fila PMO, registos originais da PR #21, Supabase, OAuth ou runtime dos 410 candidatos.
- `FIND-EXP-CAP-REF-001` permanece `OPEN_HOLD`: `LibraryEntity → CAP-RELATED-CONTENT` falta no registro da PR #21. Não foi criada equivalência falsa com `CAP-CLINICAL-RELATED`.

## Decisões pendentes para TASK-PLAN-121 e 126

**Não há ainda total-alvo de serviços depois da fusão**, pois as quatro colisões podem representar contratos distintos. A revisão deve resultar em IDs canônicos/versionados por fronteira, autoridade proprietária, consumidores e API/contratos de evento, com FIND→política→validador→task→WO→Kernel→testes e checker antes de qualquer promoção. Os 201 IDs de capabilities e 16 bindings exigem validação de correspondência por tipo de objeto e natureza de agrupamento. Até lá, todos os elementos permanecem candidatos e nenhum microserviço novo é autorizado.
