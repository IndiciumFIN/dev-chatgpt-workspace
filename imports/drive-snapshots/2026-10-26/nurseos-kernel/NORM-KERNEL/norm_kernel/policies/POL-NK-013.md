# POL-NK-013 — Ecossistema, Risco de Negócio e Oportunidades Governadas (v1.0.0)

**Aprovada por:** diretriz do Leivis (2026-09-29 15:05): analisar riscos,
stakeholders (avaliando cada um), concorrentes, fornecedores, parceiros,
continuidade, oportunidades em processo governado, internacionalização e
organismos de excelência do mercado.

## C1 — Registro canônico do ecossistema
registers/ecosystem.json: stakeholders, competitors, suppliers, partners,
continuity_risks, opportunities, internationalization, excellence organisms.
Análise de negócio tem o mesmo regime de qualidade que dado clínico: fonte,
avaliação, status, evidência.

## C2 — Stakeholder avaliado um a um
Cada stakeholder registra: interesse, poder, o que valoriza, avaliação (nossa
resposta) e engajamento. Nada fica genérico.

## C3 — Risco sem plano é violação
Todo risco de continuidade tem probabilidade, impacto, mitigação e dono.
Status honesto: open/mitigating/mitigated.

## C4 — Oportunidade é processo governado
Uma oportunidade nasce candidate (por OS), passa universe scan (POL-NK-012),
vira analyzed, validated (ADR) e então converted em item do backlog
(fonte/método/OS — G11) — ou rejected COM MOTIVO evidenciado. Oportunidade
sem OS e scan não existe.

## C5 — Internacionalização com cânone local
Entrar em mercado exige análise do segmento local, hábitos de consumo,
regulação e organismos — e as normas DO PAÍS entram no cânone
(POL-NK-009) como analysis_pending antes da entrada.

## C6 — Gate G15 bloqueante
Valida estrutura e honestidade do registro (stakeholder avaliado, risco com
mitigação/dono, oportunidade com status do processo, mercado com regulação
e organismos).

state: Active; severity: blocking; enforcement: gate G15 (pipeline v0.7.4)
