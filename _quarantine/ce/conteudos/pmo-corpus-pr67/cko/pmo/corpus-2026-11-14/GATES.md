# Matriz de gates (sem promoção automática)

| Gate | Objeto | Evidência mínima | Aprovação | Condição de bloqueio |
|---|---|---|---|---|
| G0 | Escopo/baseline | inventário, hash, acesso, snapshots | PMO | fonte sem localização |
| G1 | Inventário detalhado | schemas, IDs, duplicatas, direitos iniciais | DataQA | integridade não demonstrada |
| G2 | Governança | crosswalk do PMO e registries, política aplicável | PMO/Governance | regressão ou perda de campo |
| G3 | Trilha de carreira | ementas e UCs de origem com proveniência, especialidades many-to-many, etapas de carreira somente mediante fonte | CareerPath/CurriculumSource | grade/competência inventada, UC08 sem decisão |
| G4 | Autoridades e fontes | versão, jurisdição, vigente, URL, direitos | Authority/Rights | fonte inexistente/revogada |
| G5 | Atomização/claims | source span, hash, claim/review IDs | Evidence/Clinical | sem trecho auditável |
| G6 | Editorial | master e perfil editorial existente, links e revisão | Editorial | conteúdo não referenciado |
| G7 | Integração | contrato CKO, migrations dry-run, rollback | Architecture | schema mismatch |
| G8 | QA geral | integridade, segurança, direitos, a11y, CI, auditoria 360 | Independent QA | falha CI, PHI ou risco clínico |
| G9 | Publicação | assinatura clínica e jurídica/direitos, RC aprovado | Human clinical owner | HOLD não resolvido |
| G10 | Handoff | registro e operação de monitoramento | PMO | ausência de audit trail |

**Crosswalk**: esses gates são uma projeção proposta para o conteúdo. A planilha PMO histórica possui G0–G9 e R04 com G0–G12; comparar antes de estabelecer um vocabulário definitivo. Objetos que não demandam atos clínicos podem prosseguir quando o bloqueio só diz respeito a publicação clínica.
