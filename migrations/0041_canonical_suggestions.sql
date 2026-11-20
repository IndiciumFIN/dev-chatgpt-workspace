-- Sugestoes. Nenhuma autoriza producao.

create table if not exists canonical_suggestion (
  id text primary key,
  divergence text not null,
  proposta text not null,
  evidencia text not null,
  referencia text not null,
  aplicar_em_producao boolean not null default false check (aplicar_em_producao = false)
);

insert into canonical_suggestion (id, divergence, proposta, evidencia, referencia) values
(
  'S01',
  'D03',
  'Manter as oito tabelas do Kernel neste banco local e nao executa-las no Supabase ate existir uma ordem com as dez relacoes reais como destino.',
  'A trigger do candidato le policy_registry.active, policy_registry.version e decisions.human_required, human_status, decided_at, scope_ref. O catalogo Wave 10 confirma que essas relacoes existem no Supabase e que as oito candidatas nao existem.',
  'Open Policy Agent: a decisao nasce negada e so passa com prova. COSO: quem pede nao e quem aprova, ja imposto por maker_actor <> checker_actor.'
),
(
  'S02',
  'D04',
  'Nao escolher um vencedor entre os 92 conflitos de arquivo. Guardar os dois hashes e so promover o que tiver a mesma prova de blob.',
  'Wave 10 registrou 149 conflitos, 92 nao equivalentes e zero aprovacoes formais.',
  'Git identifica conteudo pelo blob. NIST AI RMF, funcao Govern: medida sem dono nao vira decisao.'
),
(
  'S03',
  'D05',
  'Nao mesclar grook_10_26 nem a projecao com a main. Copiar SQL conferido, como nesta branch, e o caminho. Mesclar historias sem ancestral cria um ponto de juncao sem base comum.',
  'A matriz marca unrelated_history verdadeiro nessas duas branches.',
  'Git exige --allow-unrelated-histories justamente porque essa juncao nao e o merge comum.'
),
(
  'S04',
  'D02',
  'Nao fundir public.kernel_order com cko_orch.kernel_admission_decisions. A primeira acompanha conteudo. A segunda so admite com politica verificada, validador, humano e evidencia.',
  'kernel_order aceita admitida com approver_id. A trigger candidata recusa ADMITTED se a prova falha. Os nomes parecidos nao sao o mesmo fato.',
  'OPA, default deny. ISO/IEC 27001:2022, controle 5.3, segregacao de funcoes.'
),
(
  'S05',
  'D07',
  'Nao alterar o projeto Calculadoras-Smart a partir desta branch. Quando houver ordem, comparar coluna a coluna com pg_attribute antes de qualquer DDL.',
  'A leitura de 2026-11-01 achou 240 migrations e as dez relacoes de base. Este banco local tem 38 migrations proprias.',
  'ISO/IEC 27001:2022, controle 8.32, gestao de mudancas. O registro estrutural proibe mutacao sem ordem governada.'
),
(
  'S06',
  'D06',
  'Manter review_item sem aprovacao. Traducao vazia continua vazia. Conteudo clinico nao sai da fila por sugestao.',
  'A coluna aprovado recusa true. 24881 linhas foram contadas e zero estavam aprovadas.',
  'O mesmo portao fail-closed do Kernel: ausencia de prova nao vira aceite.'
);
