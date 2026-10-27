# Handoff de execução — piloto canônico reaproveitável

**Data:** 26/10/2026 · **Branch:** `work/editorial-canonical-learning-20261026` · **Destino futuro:** processo Kernel controlado, NÃO `main` direta.

## Concluído, comprovado e reutilizável

| Etapa | Resultado | Evidência |
|---|---|---|
| Origem DB-first | Consulta READ_ONLY no Supabase Calculadoras-Smart, com dois grafos candidatos contendo master, versões, campos, claims, requisitos e vínculos normativos | `docs/audits/sql/CKO_CANONICAL_PILOT_MANIFEST_20261026.sql`, `audit-evidence/cko/db-first/20261026/candidate-canonical-tool-graph.json` |
| Template genérico | Consulta read-only reaproveitável mediante troca de lista de slugs; não duplica tabelas | `docs/audits/sql/CKO_CANONICAL_TOOL_GRAPH_TEMPLATE.sql` |
| Motor de diagnóstico | CLI Node seguro que percorre grafos candidatos, exige ligações e mantém release fail-closed | `scripts/cko-canonical-pilot.mjs` |
| Testes de snapshot | 243 combinações sintéticas de Apgar, faixas aritméticas 0–10 e casos inválidos; **não são casos-ouro clínicos** | `scripts/cko-db-first-replay.test.mjs`, `CKO_APGAR_SYNTHETIC_ENUM_REPLAY_20261026.sql` |
| Bridge de evidências | 6/6 IDs Apgar → requisitos de extração normativa identificados; ainda CANDIDATE_UNCHECKED | `docs/audits/sql/CKO_APGAR_REQUIREMENT_BRIDGE_20261026.sql` |
| CI real | Testes e segurança executados com sucesso no branch: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/40427015329 | GitHub Actions |
| PMO | `WO-CKO-001` ativada para diagnóstico técnico; fila canônica `readOnly=true` revision 19 | `registers/pmo/queue.v1.json` |
| Governança | 4 FINDs, 4 TASKs, 4 WOs **candidatos**, não submetidos/admitidos | `registers/governance/candidates/` |
| Normativos | Separação entre ciência da escala e norma profissional; COFEN 1/2024 e 743/2024; variantes Fugulin e sobreposição de 34 | `docs/audits/CKO_PILOT_NORMATIVE_APPLICABILITY_20261026.md` |
| Handoff clínico | Matriz de requisitos de Apgar e checklist de revisão das duas variantes | `docs/governance/CKO_APGAR_FUGULIN_INDEPENDENT_REVIEW_PACK_20261026.md` |

## Ainda bloqueado, sem alegação de conclusão
1. **Escrita no banco de governança:** tentativa de inserir achados em `cko_validation.findings` foi bloqueada pelo controle de segurança da conexão. Nenhuma linha foi registrada; IDs e conteúdo mantidos nos FINDs versionados do Git. Não repetir por via alternativa não autorizada.
2. **Concluir fontes e direitos:** exigir autorização/licença por uso (cálculo, texto, imagens, PDF, IA externa), snapshot e hash durável; AAP/ACOG e instrumentos Fugulin.
3. **Homologação clínica:** seis requisitos AAP ainda sem checker; Fugulin precisa revisão de variantes 9/12 e da ambiguidade no ponto 34.
4. **Engine específico e rule packs** do CKO em NULL; não converter replay sintético em motor clínico publicado; versão e vetor-ouro assinados.
5. **Admissão Kernel e migrations:** política + validador aplicáveis, tarefas/WOs formalmente admitidas, aprovação da alteração de dados, transação staging e reexecução de testes. Candidatos atuais declaram `kernel_admission=NOT_SUBMITTED`.
6. **Publicação derivada:** integração segura DB→motor→template → guia com capa/i18n/PDF somente após aprovação e prova em staging; o catálogo público estático contém divergência de `publicacao` de Apgar em relação ao CKO, sem correção em produção nesta branch.
7. **Guia editorial Apgar com capa:** ainda falta confirmar o artefato exato; há piloto técnico distinto. Fugulin possui guia editorial anterior identificado, mas versão/direitos/assets precisam conciliar.

## Critério de sucesso do futuro caso-modelo
Uma única versão aprovada no Supabase deve permitir repetir cálculo seguro, interpretação, projeções HTML/PDF, conteúdo didático e i18n, com vínculo por ID de evidência e norma, sem duplicação de fatos, com teste de regressão e revogação/rollback. O piloto atual **não atingiu este critério clínico**, apesar de ter concluído o ensaio técnico de integridade.

## Verificação operacional
```bash
node --test scripts/cko-canonical-pilot.test.mjs scripts/cko-db-first-replay.test.mjs scripts/cko-db-first-evidence.test.mjs scripts/cko-governance-pilot.test.mjs
node scripts/cko-canonical-pilot.mjs
```
A saída do segundo comando deve permanecer `HOLD` e `can_calculate=false` / `can_publish=false`. GitHub Actions executa os mesmos checks sem credenciais do Supabase.

**Não alterados:** `main`, registros clínicos, código das páginas públicas e permissões RLS/produção do Supabase.
