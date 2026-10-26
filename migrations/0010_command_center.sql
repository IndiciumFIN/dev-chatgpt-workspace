-- Parecer sobre a proposta da Central de Comando. Nasce em rascunho.
-- Aprovar aceita o HOLD. Não cria tabela e não abre publicação.

insert into governance_item (id, kind, title, body)
values (
  'escopo-central-comando',
  'escopo',
  'Central de Comando: aceitar o parecer, sem criar tabela',
  'Proposta v1.0 de 26/10/2026, não homologada. Aprovar este item aceita só o parecer: reutilizar as 36 entidades já descritas, não renomear para os 18 schemas e não criar as 215 tabelas lógicas (120 B0 e 95 B1) nesta onda. A Central de Comando não é um segundo Kernel nem um segundo PMO. Faltam as quatro faixas (monitor, comunicação, prompt e ordem de serviço), a máquina de estados da ordem e o executor com lease. Isso fica em espera até um inventário em separado. Este botão não cria tabela, não grava segredo e não declara conformidade.'
)
on conflict (id) do nothing;
