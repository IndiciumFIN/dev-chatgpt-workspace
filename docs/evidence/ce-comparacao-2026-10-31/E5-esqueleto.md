# E5 — O esqueleto CE atual (o que está construído e o que falta)

## Estado medido (31/10/2026, local)
- 45 famílias (36 domínio + 9 transversais) · **410 serviços lógicos** (274 DOMAIN / 97 PLATFORM / 39 CROSS_CUTTING) · **201 capabilities** (20 famílias, todas `CANDIDATE`) · 16 bindings por tipo de objeto · 3 schemas de piloto.
- **905 ficheiros gerados** por script determinístico (`scripts/generate-skeleton.mjs`), **zero drift** em `--check`.
- **70/72 testes verdes** (45 de família + 20 de capability + 5 de piloto) · **gate de estrutura 11/11** (fail-closed).
- Tudo em `CANDIDATE_HOLD`: os 410 serviços **lançam** `NOT_IMPLEMENTED_CANDIDATE_HOLD`; não há mock que finja sucesso.
- Núcleo canónico presente: `src/core/experience/resolver.ts` (puro, 16 tipos, nunca devolve PASS) · `state.ts` (11 campos, `object_ref + capability_id`, guest-first) · `metamodel.ts` (20+10 campos + validação fail-closed) · `profile-contracts.ts` (settings/output/preview, vazios por decisão) · `module-status.ts` (cobertura vs plano).
- Toolchain fixada na canónica: vite 8.2.0 · react 19.2.0 · lucide-react 0.510.0 · typescript 5.7.0.

## Lacunas medidas contra o plano canónico (secção 11 do plano PMO)
1. **Módulos-alvo: 2 de 10.** Faltam `capabilities.ts`, `action-bar.tsx`, `preview.ts`, `settings.ts`, `help.ts`, `output.ts` (P0) e `views.ts`, `events.ts` (P1).
2. **Metamodelo vs registo:** o registo candidato traz 14 campos por capability (plano exige 20) e 7 por binding (plano exige 10+); 11 + 5 campos em falta, incluindo `supported_channels`, `permission_policy`, `audiences`, `policy_refs`.
3. **P1/P2 não implementados:** Saved Views, Saved Search, Collections/Basket, Lifecycle/Recovery, Event Backbone, Capture/Inbox, Follow/Alerts, Collaboration, search semântico, sync.
4. **3 de 16 tipos de objeto** com schema.
5. **Não é runtime:** zero React/rotas/renderers/i18n; não é aplicação.
6. **Sem contratos de API/evento entre serviços**, sem grafo de dependências, sem dono/SLA/versionamento.
7. **Eventos/telemetria/auditoria:** `telemetry_contract` é string, não contrato; sem log append-only.
8. **Acessibilidade/i18n/privacidade:** declarados, não medidos (sem browser).
9. **Os 16 FINDs da PR #21 não estão no `find-register.v1.json`** → sem baseline de não-regressão.
10. **Sem CI** (escrita em `.github/workflows/` bloqueada pela API), sem critérios de não-regressão, sem rollback.
11. **410 serviços para 3 domínios maduros** → vocabulário precisa de fusão antes de admitir WO.

## O que este esqueleto NÃO faz (limite explícito)
Não executa, não persiste, não chama rede, não tem UI, não cria as 215 tabelas da especificação DOCX, não altera o `main`, não promove nada. Promoção exige FIND → política → validador → WO → OPA → Kernel → testes → auditoria → decisão humana.
