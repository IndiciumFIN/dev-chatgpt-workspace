-- CE: corrective forward migration. Historical 0037 retained; no production approval.
-- A technical normalization actor is not a human approver. Idempotent.
-- Deliberately scoped: do not erase any approval made by a real reviewer.
update content_text set status = 'rascunho'
where status = 'publicado' and review_state = 'DERBY';
update kernel_atom set status = 'candidato', admitted_by = null, admitted_at = null
where admitted_by = 'derby-normalizacao';
update kernel_claim set status = 'candidato', admitted_by = null, admitted_at = null
where admitted_by = 'derby-normalizacao';
update business_rule set status = 'rascunho', approved_by = null, approved_at = null
where approved_by = 'derby-normalizacao';
update ai_control set status = 'rascunho', approved_by = null, approved_at = null
where approved_by = 'derby-normalizacao';
update governance_item set status = 'rascunho', approved_by = null, approved_at = null
where approved_by = 'derby-normalizacao';
update data_specification set status = 'rascunho', approved_by = null, approved_at = null
where approved_by = 'derby-normalizacao';
update policy_ack set owner_user_id = null, accepted_at = null
where owner_user_id = 'derby-normalizacao';
-- Claims auto-admitted by 0037 without actor have no valid approval evidence.
update kernel_claim set status = 'candidato'
where status = 'admitido' and (admitted_by is null or btrim(admitted_by) = '');
-- Candidate-only; this script is not authority for release or production execution.
