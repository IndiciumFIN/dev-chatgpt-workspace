---
document_id: WUTRIB-DOC-MASTER-001
version: 0.1.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: PMO
reviewer_role: QUALITY_ASSURANCE
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Plano mestre de gestão documental e homologação (proposta)

## Escopos independentes
**Trilha A — piloto sintético web:** entrada somente de fixtures, isolamento do GitHub, UI/UX, segurança cliente, validação de limites, preview e UAT demonstrativo. **Trilha B — plataforma fiscal corporativa:** normas e vigência, Protheus TES/FISA170, autenticação corporativa, integração de dados reais, isolamento organizacional, proteção LGPD, evidências e aceites fiscais. Um sign-off A **não** libera B.

## A WO é canônica desde a concepção
Abertura de WO com objetivos, contexto, responsáveis e escopo → tarefas homólogas ao catálogo de artefatos → revisão e admissibilidade da WO → arquitetura e contratos → desenvolvimento → testes → UAT → decisão Go/No-Go → implantação controlada → monitoramento e revisão → descontinuação/retentiva. `FIND` nasce quando há desvio conhecido em qualquer fase; não é obrigatório início do projeto.

## Gates formais e passagem
| Gate | Fase | Exigência de entrada/saída | Bloqueio |
|---|---|---|---|
| G00 | Abertura | WO com origem, escopo, classificação, partes e owner | Falta de autorização/escopo |
| G01 | Planejamento | Charter, RCM, requisitos e RTM básicos | P0 sem dono/evidência |
| G02 | Arquitetura | ADRs, contratos, metamodelos, dicionários, fontes oficiais, threat model | Fonte sem vigência/risco crítico |
| G03 | Preparação | MTP, técnicas, fixtures, ambiente/segurança de dados, critérios assinados | Plano/testes não rastreáveis |
| G04 | Execução | Log imutável, testes funcionais/segurança/dados/resiliência e defeitos | FAIL crítico e dados não aprovados |
| G05 | Qualidade em uso | UAT, acessibilidade WCAG/EM, sustentabilidade e experiência | Falha crítica de acesso/usabilidade |
| G06 | Consolidação | Test closure, cobertura, riscos residuais, evidências de retestes | P0/P1 impeditivo |
| G07 | Decisão | Comitê/CAB, Go/No-Go, sign-off e versão/hash congelados | Assinatura ausente |
| G08 | Release | Plano implantação/rollback, restore, monitoramento, release ID | Rollback/teste de recuperação ausente |
| G09 | Estabilização | Hypercare, incidentes, SLIs/SLO, observabilidade e ownership | Erro crítico pós-virada |
| G10 | Encerramento | Lição aprendida, retenção, revisão periódica e plano de descontinuação | Evidência arquivística incompleta |

## 14 famílias de validação previstas
Funcional/negócio; fiscal/normativa; qualidade de dados; segurança; IAM/segregação; rastreabilidade; integração; resiliência; performance/capacidade; acessibilidade; UX/UAT; sustentabilidade digital; compatibilidade/i18n; operação/governança. Cada família possui documento-modelo e controle de avaliação, com escopo e limiares aprovados **antes de executar**.

## Critérios Go/No-Go por proposta
Aprovação de 100% dos requisitos P0 **aplicáveis**; não permitir FAIL/HOLD de gate crítico; nenhuma aprovação fictícia; assinatura independente de negócio/fiscal/segurança conforme risco; evidências hash+ambiente+commit+dados+esperado/observado; recuperação e plano de retrocesso demonstrados; exceções permitidas apenas quando justificadas, não contrárias à lei ou à privacidade. Limiares numéricos (SLO, p95, RTO, RPO, gCO₂e) devem ser **aprovados** após baseline, nunca presumidos das normas.

## Controle de transição
A transição não deve ser autorizada por Supabase, script, IA ou commit isoladamente. A decisão final deve identificar pessoa/alçada, documento, versão, data e commit SHA imutável. A falta de material obrigatório implica HOLD_HUMAN e retorno à tarefa pertinente; história não é truncada.

## Situação vigente
Existe histórico de 84 testes Node verdes e 12 varreduras automáticas axe sem violações no candidato WU-TRIB, mas **isso não é homologação fiscal, UAT real nem acessibilidade manual**. Vercel preview corrigida bloqueada pelo limite diário (HTTP 402). Docs existentes no SOT permanecem DRAFT. Nenhum teste de produção é autorizado por este plano.
