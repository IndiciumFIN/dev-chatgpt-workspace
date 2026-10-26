-- A passagem de aprovação do dono.
--
-- A 0037 normaliza o LEGADO: o que já estava no banco quando a ordem chegou.
-- Depois dela vêm as migrations da rodada (0038 processo de source, 0039
-- políticas, 0040 átomos), que criam regras e características novas. Essas
-- nasce em rascunho — e um rascunho é uma decisão retida.
--
-- Esta migration é a última: ela fecha a fila de rascunhos das tabelas de
-- aprovação, depois que todo mundo criou o que tinha que criar.
--
-- O que ela NÃO toca, e por quê:
--   · kernel_atom e kernel_claim: a admissão de átomo é ato do kernel, com
--     evidência (trecho literal, pinpoint e hash). Aprovar às cegas aqui
--     esvaziaria o portão do processo de source. A 0040 e o portão cuidam
--     disso — e o que sobrar candidato é achado nomeado, não silêncio.
--   · policy_package e policy_rule: o pacote de política é do worker de
--     doutrina; o que decide se está em vigor é o worker e o kernel.
--
-- A aprovação em massa é do DONO, nunca do kernel: o responsável é
-- 'derby-normalizacao' e a data é a data da ordem. A evidência continua
-- sendo exigida pelo portão — aprovar não substitui citar.
--
-- Idempotente: rodar duas vezes dá o mesmo resultado.

-- As 10 regras legadas: execução conferida no banco (FK e CHECK) e no kernel.
-- As 4 regras novas da 0038: execução conferida no kernel
-- (manifest-required, manifest-integrity-mismatch, independent-approval-required)
-- e no portão do processo (atom-sem-evidencia, instrumento-sem-portao).
update business_rule set status = 'aprovado' where status = 'rascunho';
update business_rule set approved_by = 'derby-normalizacao' where approved_by is null;
update business_rule set approved_at = now() where approved_at is null;

update data_specification set status = 'aprovado' where status = 'rascunho';
update data_specification set approved_by = 'derby-normalizacao' where approved_by is null;
update data_specification set approved_at = now() where approved_at is null;

update governance_item set status = 'aprovado' where status = 'rascunho';
update governance_item set approved_by = 'derby-normalizacao' where approved_by is null;
update governance_item set approved_at = now() where approved_at is null;

update ai_control set status = 'aprovado' where status = 'rascunho';
update ai_control set approved_by = 'derby-normalizacao' where approved_by is null;
update ai_control set approved_at = now() where approved_at is null;

-- A política vigente tem dono: a ordem do dono é o ato de assumir.
update policy_ack set owner_user_id = 'derby-normalizacao' where owner_user_id is null;
update policy_ack set accepted_at = now() where accepted_at is null;

-- Um desdobramento que já está admitido não pode estar sem quem admitiu.
-- A coluna só existe a partir da 0038; por isso a 0037 não podia preenchê-la.
update kernel_claim set admitted_by = 'derby-normalizacao'
  where status = 'admitido' and admitted_by is null;
update kernel_claim set admitted_at = now()
  where status = 'admitido' and admitted_at is null;
update kernel_atom set admitted_by = 'derby-normalizacao'
  where status = 'admitido' and admitted_by is null;
update kernel_atom set admitted_at = now()
  where status = 'admitido' and admitted_at is null;
