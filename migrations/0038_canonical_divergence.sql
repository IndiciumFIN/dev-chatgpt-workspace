create table if not exists canonical_divergence (
  code text not null,
  classe text not null,
  detalhe text not null
);
insert into canonical_divergence (code, classe, detalhe) values
('D01','igual','0001_auth, 0002_source e 0003_community sao o mesmo arquivo na overlay e em grook_10_26.'),
('D02','so_grook','103 tabelas publicas entram por 0004 a 0037. A overlay so tinha user, session, account, verification, member, source_tool, subscription e community_post.'),
('D03','candidato_bloqueado','Oito relacoes do Kernel continuam so no SQL candidato. A aplicacao local falha porque referenciam cko_orch e cko_governance, que existem no Supabase e nao neste repositorio.'),
('D03','candidato_bloqueado','cko_orch.work_order_admission_requests'),
('D03','candidato_bloqueado','cko_orch.work_order_policy_bindings'),
('D03','candidato_bloqueado','cko_orch.policy_bundle_artifacts'),
('D03','candidato_bloqueado','cko_orch.work_order_policy_evaluations'),
('D03','candidato_bloqueado','cko_orch.work_order_required_validators'),
('D03','candidato_bloqueado','cko_orch.work_order_validator_results'),
('D03','candidato_bloqueado','cko_orch.kernel_admission_decisions'),
('D03','candidato_bloqueado','cko_governance.agent_tool_scopes'),
('D04','nao_equivalente','Wave 10 registrou 149 conflitos de caminho, 92 nao equivalentes. Sao blobs de arquivo, nao colisao de tabela. Nenhum foi aprovado.'),
('D05','historia','grook_10_26 e feat/projection-unica-f0-suite-real nao tem ancestral comum com main. O SQL foi copiado; o historico nao foi mesclado.'),
('D06','revisao','0036 e 0037 trazem review_item. aprovado permanece falso. Isso nao publica conteudo.'),
('D07','supabase','As dez relacoes cko_* lidas no Supabase nao foram recriadas aqui. Este banco e local e nao altera o projeto Calculadoras-Smart.');
