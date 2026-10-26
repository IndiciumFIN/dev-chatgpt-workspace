# 2FN e 3FN

A 1FN já foi provada: não há lista nem JSON, e toda tabela tem chave primária. Aqui entra o que a 1FN não diz.

2FN: em chave composta, nenhuma coluna fora da chave depende só de uma parte dela.

3FN: nenhuma coluna fora da chave depende de outra coluna fora da chave.

Não houve divisão. O paciente e o escore da visita continuam fora do banco.

## Chave simples

Nestas tabelas a 2FN não se aplica. A 3FN vale porque o texto de uma coluna não determina o texto de outra. Onde há segunda chave, ela está nomeada. Depender dela não quebra a 3FN.

| Tabela | Chave | Segunda chave | Colunas fora da chave |
|---|---|---|---|
| user | id | email | nome, verificação, imagem, datas |
| session | id | token | validade, usuário, endereço, agente |
| account | id | — | provedor, conta externa, usuário, tokens |
| verification | id | — | identificador, valor, validade |
| member | user_id | — | papel, data |
| subscription | user_id | — | estado, data |
| community_post | id | — | autor, texto, oculto, data |
| source_tool | slug | — | tipo, título, lead, publicado, categoria, modo NANDA, faixa, evidência, versão, autor da capa |
| process | id | — | ligado, autor, data |
| piece | id | — | tipo, título, texto, publicado, autor |
| page | slug | — | tipo, título, lead, publicado, peça, autor |
| media | id | path | texto alternativo, legenda, autor |
| audit_event | id | — | ator, ação, entidade, id da entidade, data |
| policy_ack | id | — | dono, data |
| governance_item | id | — | tipo, título, texto, estado, aprovador, data |
| data_specification | id | entidade + característica | definição, sintaxe, unidade, obrigatoriedade, dono, origem, estado |
| locale | id | — | nome, se é a fonte |
| intake_batch | id | — | origem, data |
| work_order | id | — | projeto, ambiente, título, estado, portão, motivo |
| cmd_command | id | — | ordem, modo, texto, ator, correlação, estado, motivo, data |
| cmd_run | id | ordem + tentativa | comando, estado, chave de idempotência, ator, data |
| cmd_event | id | execução + sequência | tipo, detalhe, ator, data |
| ops_record | id | — | módulo, tipo, nome, estado, nota, data |
| site_route | path | — | idioma, contrato, título, lead, corpo, estado, caminho de origem |
| content_object | slug | origin_path | tipo, capa quando é instrumento |
| content_alias | path | — | objeto, idioma, vista |
| schema_layer | id | — | nome, posição |
| schema_entity | name | — | camada, chave descrita, finalidade, ligação |
| ai_principle | id | — | nome, definição, posição |
| ai_control | id | — | princípio, título, enunciado, exigência humana, estado, aprovador |
| policy_package | id | — | título, estado |
| policy_decision | id | — | pacote, regra, ação, papel, efeito, ator, data |
| kernel_atom | id | — | domínio, título, enunciado, fonte, estado |
| kernel_claim | id | — | átomo, título, enunciado, estado |
| kernel_evidence | id | — | afirmação, tipo, localizador, nota |
| agent | id | — | nome, estado, missão, escopo, pode escrever, pode publicar |
| kernel_order | id | — | título, estado, aprovador, motivo |
| kernel_manifest | order_id | — | estado, aprovador |
| business_rule | id | — | entidades, enunciado, onde aplica, estado |
| tool_formula | tool_slug | — | método, enunciado |
| nav_item | id | — | pai, posição, rótulo, destino |
| specialty | position | — | nome |
| phase_note | id | — | posição, nome, estado, detalhe |
| color_token | name | — | cor, papel, se foi recusada |
| inst_page | path | — | título, linha fina, lead, tipo |
| library_shelf | id | — | posição, título, lead, tipo |
| editorial_template | id | — | posição, tipo, nome, categoria, descrição |
| fundamento | id | — | nome, domínio, direito, prioridade |
| policy_part | id | — | posição, rótulo, ajuda |
| media_asset | path | — | tipo, nota |
| crawl_rule | position | — | diretiva |
| sitemap_url | position | — | endereço |
| template_family | id | — | posição, nome, texto |
| fundamento_pack | id | — | arquivo, hash, se o texto exato está guardado |
| specimen | id | — | título, lead, fonte |
| section_page | slug | — | linha fina, título, lead, tipo |
| content_place | id | — | objeto, seção de tela, página institucional |
| screen_dest | id | — | tipo, lugar, ferramenta, âncora, página, modelo |

`page` guarda o id da peça, não o título dela. `community_post` e `audit_event` guardam o id da pessoa, não o nome. Por isso não há dependência transitiva.

`account` não declara unicidade de provedor mais conta externa. A chave continua sendo `id`. Não se altera esta tabela: ela é do mecanismo de sessão.

## Chave composta

| Tabela | Chave | Por que a parte da chave não basta |
|---|---|---|
| block | page_slug + position | O título e o texto são deste bloco. A página tem vários. A posição 1 não é o mesmo bloco em outra página |
| media_layer | media_id + position | O tipo e o valor são desta camada nesta figura. A posição 1 não é sempre o mesmo tipo |
| page_media | page_slug + media_id | A posição é desta figura nesta página. A mesma figura pode ocupar outra posição em outra página |
| process_setting | process_id + key | O valor é deste processo com esta chave. A mesma chave muda de processo |
| tool_criterion | tool_slug + id | O mesmo id pode ter outro rótulo em outra ferramenta |
| tool_choice | tool_slug + criterion_id + value | O valor 1 não tem o mesmo rótulo em outro critério |
| tool_field | tool_slug + id | Unidade, mínimo, máximo e passo são deste campo nesta ferramenta |
| tool_select | tool_slug + id | O rótulo é desta escolha nesta ferramenta |
| tool_select_option | tool_slug + select_id + value | O valor não carrega o rótulo sozinho |
| tool_meta | tool_slug + id | O rótulo é deste metadado nesta ferramenta |
| tool_meta_option | tool_slug + meta_id + value | O valor não carrega o rótulo sozinho |
| tool_output | tool_slug + id | Unidade e casas decimais são desta saída nesta ferramenta |
| tool_band | tool_slug + min_score | O mesmo mínimo não tem o mesmo rótulo, o mesmo teto nem o mesmo tom em outra escala |
| tool_band_nanda | tool_slug + min_score + label | Não há coluna fora da chave |
| tool_reference | tool_slug + position | A citação é desta posição nesta ferramenta |
| tool_step | tool_slug + position | O texto é deste passo nesta ferramenta |
| tool_faq | tool_slug + position | A pergunta não é chave. Outra ferramenta pode repetir o texto com outra resposta |
| tool_related | tool_slug + related_slug | A posição é deste par |
| tool_specific | tool_slug + position | O texto é desta nota nesta ferramenta |
| document_version | item_id + version | O texto é desta versão deste documento. A versão 1 não é o mesmo texto em outro item |
| intake_file | batch_id + path | O módulo e o veredito são deste caminho nesta passagem. O mesmo caminho muda de passagem |
| tool_text | slug + locale | O título é desta ferramenta neste idioma. O português não é o texto de outro idioma |
| suggestion | batch_id + path | O título sugerido é deste caminho nesta passagem. Ainda não é publicação |
| content_text | slug + locale + view | O título e o corpo são desta vista neste idioma. O português não determina o texto de outro idioma |
| schema_column | entity + name | A definição é desta coluna nesta tabela. O mesmo nome muda de tabela |
| schema_term | domain + code | O rótulo é deste código neste domínio. O mesmo código muda de domínio |
| policy_rule | package_id + id | O efeito é desta regra neste pacote. O mesmo id muda de pacote |
| agent_rule | agent_id + position | O limite é deste agente nesta posição |
| kernel_order_policy | order_id + package_id + rule_id | A regra exigida é deste pedido. A mesma regra muda de pedido |
| kernel_validator | order_id + id | O resultado é deste validador neste pedido |
| schema_relation | from_entity + name | A cardinalidade é desta ligação nesta tabela pai. O mesmo nome muda de pai |
| tool_formula_step | tool_slug + position | O passo é desta conta nesta posição |
| chrome_label | locale + group_id + key | O texto é deste rótulo neste grupo neste idioma |
| catalog_item | list_id + position | O card é desta lista nesta posição |
| inst_section | path + position | A seção é desta página nesta posição |
| inst_child | path + position | A filha é desta página nesta posição |
| library_item | shelf_id + position | O item é desta prateleira nesta posição |
| editorial_line | template_id + position | O trecho é deste modelo nesta posição |
| agent_basis | agent_id + position | A citação é deste agente nesta posição |
| agent_check | agent_id + position | A conferência é deste agente nesta posição |
| specimen_module | specimen_id + position | O bloco é desta amostra nesta posição |
| specimen_line | specimen_id + module_position + position | O trecho é deste bloco nesta posição |
| section_block | slug + position | O bloco é desta seção nesta posição |
| section_link | slug + block_position + position | O item é deste bloco nesta posição |

Em `tool_faq`, a resposta não depende da pergunta sozinha. Depende da ferramenta e da posição. Isso é o que mantém a 3FN.

`site_route`, `page`, `block`, `piece`, `media`, `media_layer`, `page_media` e `tool_text` foram copiadas para o objeto e depois retiradas. Não são mais tabelas. `work_order` não é `kernel_order`: a primeira executa um comando, a segunda admite. `governance_item`, `business_rule` e `policy_rule` também não se repetem: documento, enunciado e decisão.

## O que ficou de fora

A conta continua interpretada no navegador. O método está em `tool_formula`. Dado de paciente não tem coluna. JSON de configuração foi removido em `0005_controls.sql` e virou `process_setting`, uma linha por chave.
