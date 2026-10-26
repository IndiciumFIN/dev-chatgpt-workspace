-- Políticas já existentes em IndiciumFIN/calculadorasdeenfermagem.
-- Entram em rascunho. A versão 1.0.0 do Git não é aprovação deste administrador.

insert into governance_item (id, kind, title, body)
values
  ('kernel-policy-001', 'politica', 'KERNEL-POLICY-001 — Normativo COFEN', 'Arquivo contracts/policies/KERNEL-POLICY-001 (arquivo), esquema CE-KERNEL-POLICY-1.0.0, versão 1.0.0 de 17 out. 2026. Fonte contracts/fontes/cofen_dou (arquivo). Valida resoluções do COFEN no DOU. Exige SHA-256, falha fechada, ordem de trabalho e revisão de enfermeiro em amostra de 10. Aprovar aqui não substitui o Reviewed-by do portão G6.'),
  ('kernel-policy-002', 'politica', 'KERNEL-POLICY-002 — Normativo ANVISA', 'Arquivo contracts/policies/KERNEL-POLICY-002 (arquivo), versão 1.0.0. Fonte contracts/fontes/anvisa_dou (arquivo). Valida RDCs, INs e portarias da Anvisa. Mesmas exigências de SHA-256, falha fechada, ordem de trabalho e revisão humana.'),
  ('kernel-policy-003', 'politica', 'KERNEL-POLICY-003 — CID-10', 'Arquivo contracts/policies/KERNEL-POLICY-003 (arquivo). Fonte contracts/fontes/cid10 (arquivo), DATASUS. Índice em docs/NOMENCLATURE_STANDARD.md.'),
  ('kernel-policy-004', 'politica', 'KERNEL-POLICY-004 — CID-11', 'Arquivo contracts/policies/KERNEL-POLICY-004 (arquivo). Fonte contracts/fontes/cid11 (arquivo), OMS.'),
  ('kernel-policy-005', 'politica', 'KERNEL-POLICY-005 — MeSH', 'Arquivo contracts/policies/KERNEL-POLICY-005 (arquivo). Fonte contracts/fontes/mesh (arquivo), NLM.'),
  ('kernel-policy-006', 'politica', 'KERNEL-POLICY-006 — Medicamentos ANVISA', 'Arquivo contracts/policies/KERNEL-POLICY-006 (arquivo). Fonte contracts/fontes/anvisa_med (arquivo).'),
  ('kernel-policy-007', 'politica', 'KERNEL-POLICY-007 — Vacinas CDC', 'Arquivo contracts/policies/KERNEL-POLICY-007 (arquivo). Fonte contracts/fontes/vacinas_cdc (arquivo).'),
  ('kernel-policy-008', 'politica', 'KERNEL-POLICY-008 — Sinais vitais FHIR', 'Arquivo contracts/policies/KERNEL-POLICY-008 (arquivo). Fonte contracts/fontes/fhir_vitais (arquivo).'),
  ('kernel-policy-009', 'politica', 'KERNEL-POLICY-009 — Dispositivos ANVISA', 'Arquivo contracts/policies/KERNEL-POLICY-009 (arquivo). Fonte contracts/fontes/anvisa_dev (arquivo).'),
  ('kernel-policy-010', 'politica', 'KERNEL-POLICY-010 — TACO', 'Arquivo contracts/policies/KERNEL-POLICY-010 (arquivo). Fonte contracts/fontes/taco (arquivo).'),
  ('kernel-policy-011', 'politica', 'KERNEL-POLICY-011 — SINAN', 'Arquivo contracts/policies/KERNEL-POLICY-011 (arquivo). Fonte contracts/fontes/sinan (arquivo).'),
  ('kernel-policy-012', 'politica', 'KERNEL-POLICY-012 — PNI', 'Arquivo contracts/policies/KERNEL-POLICY-012 (arquivo). Fonte contracts/fontes/pni (arquivo).'),
  ('kernel-policy-013', 'politica', 'KERNEL-POLICY-013 — CATMAT', 'Arquivo contracts/policies/KERNEL-POLICY-013 (arquivo). Fonte contracts/fontes/catmat (arquivo).'),
  ('kernel-policy-014', 'politica', 'KERNEL-POLICY-014 — ESAVI', 'Arquivo contracts/policies/KERNEL-POLICY-014 (arquivo). Fonte contracts/fontes/esavi (arquivo).'),
  ('kernel-policy-015', 'politica', 'KERNEL-POLICY-015 — MedlinePlus', 'Arquivo contracts/policies/KERNEL-POLICY-015 (arquivo). Fonte contracts/fontes/medlineplus (arquivo).'),
  ('kernel-policy-016', 'politica', 'KERNEL-POLICY-016 — SIES', 'Arquivo contracts/policies/KERNEL-POLICY-016 (arquivo). Fonte contracts/fontes/sies (arquivo).'),
  ('kernel-policy-017', 'politica', 'KERNEL-POLICY-017 — Atlas', 'Arquivo contracts/policies/KERNEL-POLICY-017 (arquivo). Fonte contracts/fontes/atlas (arquivo).'),
  ('kernel-policy-018', 'politica', 'KERNEL-POLICY-018 — CDSI', 'Arquivo contracts/policies/KERNEL-POLICY-018 (arquivo). Fonte contracts/fontes/cdsi (arquivo).'),
  ('kernel-policy-019', 'politica', 'KERNEL-POLICY-019 — Portarias MS', 'Arquivo contracts/policies/KERNEL-POLICY-019 (arquivo). Fonte contracts/fontes/ms_portarias (arquivo).'),
  ('kernel-policy-020', 'politica', 'KERNEL-POLICY-020 — Leis federais', 'Arquivo contracts/policies/KERNEL-POLICY-020 (arquivo), versão 1.0.0. Fonte contracts/fontes/lei_federal (arquivo). Valida leis do Planalto. Mesmas exigências de SHA-256, falha fechada, ordem de trabalho e revisão de enfermeiro.'),
  ('repo-mgn', 'politica', 'Manual de governança normativa', 'Arquivo docs/GOVERNANCE.md. Só entra fonte oficial. Um átomo é uma obrigação, com o dispositivo e o link. Aprovação técnica não é aprovação institucional.'),
  ('repo-gates', 'politica', 'Portões do corpus', 'Arquivo docs/GATES.md, versão 1.0.0. G1 a G5 fecham o pipeline se falhar. G6, a revisão humana no pull request, ainda não é automático.'),
  ('repo-regras', 'politica', 'Regras determinísticas', 'Arquivo docs/DETERMINISTIC_RULES.md, versão 1.0.0. O átomo nasce Não verificado. O identificador sai do algoritmo. A vigência exige o Diário Oficial e a assinatura de um enfermeiro.')
on conflict (id) do nothing;
