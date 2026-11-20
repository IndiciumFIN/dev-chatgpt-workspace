# Arquitetura de Conteúdo Canônico Orientado ao Banco — Ferramenta Inteira
**Data de elaboração:** 2026-10-26  
**Status documental:** PROPOSTA TÉCNICA / diagnóstico read-only; sem homologação, migração ou admissão Kernel  
**Escopo:** `IndiciumFIN/dev-chatgpt-workspace` · `work/editorial-canonical-learning-20261026`  
**Origem:** Supabase `Calculadoras-Smart` (`pgsybzggewhinaniybiy`) · inspeção SQL somente leitura em 2026-10-26

## 1. Decisão de arquitetura
Toda a família da ferramenta (calculadora/escala, ficha, guia completo, conteúdo básico/avançado, PDF, infográfico, flashcard, quiz, casos, pesquisa, SEO e tradução) deve derivar de **um grafo canônico versionado e governado no banco de dados**. O HTML e o PDF são projeções e não repositórios de fatos clínicos; o cálculo não pode depender de copiar texto de um PDF ou de executar um trecho livre de LLM.

**Importante:** esta é uma **decisão de desenho solicitada**, não autorização para promover material clínico, operar Supabase em escrita ou reativar o DB da cópia pública. A cadeia FIND → política → validador → tarefa → WO → admissão Kernel → execução/teste/auditoria → promoção humana continua aplicável.

### Linha de dependência
`Fonte primária identificada + versão + direitos + snapshot/hash`
→ `fragmento localizado` → `assertion` → `claim/requisito validável`
→ `autoridade normativa / aplicabilidade / vigência`
→ `objeto de ferramenta e variante/versionamento`
→ `campos + critérios + fórmula AST + regras de interpretação + casos-ouro`
→ **motor determinístico versionado** e, independentemente, **projeções editoriais versionadas**
→ interface, calculadora, relatórios, estudo e derivados.

Um vínculo com lei de exercício profissional, LGPD, acessibilidade ou padrão de data **não comprova** critérios, pontos, fórmula ou corte de escala. Esses fatos exigem fontes científicas originais, versão específica do instrumento, evidências e homologação do domínio.

## 2. Reutilizar as tabelas e os contratos que já existem
| Camada lógica | Persistência canônica identificada | Contrato existente | Função |
|---|---|---|---|
| Identidade/master | `cko_master.entities`, `cko_master.aliases`, `cko_master.relationships` | `canonical_object.schema.json` / `tool.schema.json` | Um identificador de ferramenta por objeto/versão; aliases não criam nova escala |
| Dossiê | `cko_closure.tool_dossiers` e `cko_governance.md_tool_registry_v2_candidate` | `tool.schema.json` | Variantes, rotas, ownership, release/HOLD |
| Campos | `cko_governance.field_catalog` e `cko_governance.md_tool_field_contract_v2_candidate` | `field_definition.schema.json` | ID, unidade, dados de entrada, tipagem, validação, privacidade |
| Fontes/evidências | `cko_evidence.sources`, `snapshots`, `fragments`, `assertions`, `claims`, `evidence_bundles` | `source.schema.json`, `claim.schema.json`, `audit_evidence.schema.json` | Origem, trecho, direitos, conteúdo e proveniência verificável |
| Regulação/contexto | `cko_governance.normative_reference_catalog`; `cko_regulatory.instruments`; `cko_governance.field_normative_bindings` e `artifact_normative_bindings` | `authority_binding.schema.json`, `applicability.schema.json` | Fonte, alcance, edição, requisito/cláusula realmente examinada, validade temporal e geográfica |
| Versionamento | `cko_governance.object_versions` e `controlled_artifacts` | `formula.schema.json`, `clinical_rule.schema.json`, `interpretation.schema.json` | Imutabilidade lógica por versão, payload tipado, dependências, controle da mudança |
| Direitos | `cko_governance.rights_records` e `cko_evidence.source_accreditations` | `source.schema.json` | Usos permitidos e proibidos; licença e prova, não mera URL |
| Validação | `cko_validation.validators`, `rule_packs` e evidências de auditoria | `runtime_test.schema.json`, `audit_evidence.schema.json` | Testes determinísticos, recorrentes, negativos e de regressão |
| Educação | Resolver CKO + `contracts/cko-editorial` (8 perfis e `projection_request`/`block_instance`) | `learning_resource.schema.json`, `publication.schema.json` | Guias com capa, artigos, quiz, PDF, slides etc., sem replicar dados clínicos |
| Ingestão | `cko_staging.import_packages`, registries e pipeline pré-existente | Contratos existentes de fonte/asset/claim | Entrada controlada; jamais elevar manifestos externos a fonte-verdade por simples importação |

**Nota de integridade:** contratos presentes no Git ≠ entidades integralmente materializadas, relacionadas e aprovadas no banco. `cko_master.entities.source_of_truth=false` nos exemplos de Apgar/Fugulin. O desenho não altera essa flag. **Ausência identificada:** não foi demonstrada uma tabela relacional específica já ativa para fórmulas AST/regras clínicas e vetores de teste dessas escalas. Antes de criar tabelas ou tipos de entidade, exigir FIND de lacuna com inspeção de todos os mecanismos existentes e migração aprovada, preservando `object_versions`.

## 3. Requisitos mínimos do objeto de ferramenta (pelo vínculo, não por novas cópias)
Cada versão candidata deve conseguir resolver, por chaves existentes ou extensão formal aprovada:

1. **Identidade:** `canonical_id`, variante/instrumento, versão, jurisdição, população-alvo, autoria e histórico.
2. **Fonte:** `source_id`, edição, URI oficial, snapshot/hash, localizador exato, data de consulta, direitos de armazenamento/publicação/transmissão à IA.
3. **Afirmações:** IDs das afirmações clínicas e educacionais; evidência/fragmento por afirmação; estado de revisão.
4. **Regras operacionais:** ID de campo, tipo, unidade, domínio de valores, seleção de opções, obrigatoriedade, precisão; critérios de score devem ter versão própria.
5. **Cálculo:** `formula.schema.json` com árvore de expressão referenciada (AST), bindings de campos, quantidade de saída, política de arredondamento/precisão e vetores de teste. **Não executar SQL, JS ou texto LLM retirado do banco como código arbitrário**; motor interpretador estritamente tipado/permitido e artefato de execução com hash.
6. **Interpretação:** `clinical_rule.schema.json`/`interpretation.schema.json` para faixas, limites, contraindicações e população; separar claramente pontuação numérica de conduta clínica.
7. **Normativos aplicáveis:** obrigatoriedade determinada por escopo e jurisdição, não por anexar lista genérica. Cada requisito vinculável a trecho/provisão efetivamente consultado, validade, tipo de autoridade e papel do vínculo (instrumento clínico, exercício profissional, segurança, privacidade, acessibilidade, i18n).
8. **Governança:** versão/pai/hash, autor, Maker/Checker/Auditor, decision refs, review dates, incident/FIND e promoção do Kernel.
9. **Projeções:** `projection_request` aponta para IDs **imutáveis por versão**, claim IDs, evidence IDs, resource bindings; renderer só projeta textos e mídia sem criar fatos. Idiomas distintos consomem o mesmo score e a mesma unidade canônica.
10. **Privacidade:** o banco de conhecimento guarda definições/regras **não dados pessoais do paciente**. Históricos de uso/PHI exigem domínio, finalidade, autorização, RLS e retenção separados — nunca entrar no content master.

## 4. Fronteira de autoridade normativa
| Classe de fonte | Que aspecto sustenta | O que não sustenta automaticamente |
|---|---|---|
| Artigo original do instrumento / manual autorizado / validação | Dimensões, ponderações, semântica, versão de score, populações validadas | Vigência de lei, conformidade LGPD, licença de republicação |
| Legislação/Resolução/Parecer profissional aplicável | Competência, registro, processo, dimensões profissionais, limites do exercício | Fórmula/ponto de corte específico quando não previstos na fonte |
| Diretriz/protocolo com versão | Contexto clínico e uso com suas condições e jurisdição | Redefinição implícita do instrumento original |
| ISO/IEC/W3C e outros padrões técnicos | Interoperabilidade, gestão, qualidade, acessibilidade e requisitos comprovados | Validação científica de escala clínica |

Usar `authority_binding.schema.json` e vínculos versionados com `provision_ref` / `requirement_ref` quando houver fonte realmente examinada. Normas licenciadas: a mera ficha no catálogo NÃO autoriza copiar, atomizar texto integral, publicar ou enviar a modelo externo; operar com metadados dentro dos direitos e marcar HOLD localizado.

## 5. Verificação read-only executada — 2026-10-26
Contagens obtidas por `SELECT COUNT(*)` (não estimativas `pg_stat`): **1.164** entidades master; **7.558** relações no master; **93** dossiês; **1.840** versões; **157** fontes CKO; **103** fragmentos; **46** assertions; **41** claims; **598** vínculos normativos de artefatos; **10.925** vínculos normativos de campos; **1.199** campos candidatos em `md_tool_field_contract_v2_candidate`; **77** validadores.

**Mas as relações gerais não comprovam cobertura clínica específica.** Amostra de cinco ferramentas:

| Slug | Campos candidatos | Campos `PASS*` (somente estado estrutural declarado) | Claims associados ao ID do dossiê | Vínculos normativos por campo | Vínculo normativo por artefato ligado ao master | Situação |
|---|---:|---:|---:|---:|---:|---|
| apgar | 9 | 9 | 3 (todos com revisão humana requerida) | 25 | 0 | HOLD, sem promoção |
| fugulin | 10 | 0 | 0 | 63 | 0 | HOLD, sem promoção |
| insulina | 2 | 0 | 0 | 13 | 0 | HOLD, sem promoção |
| gotejamento | 4 | 0 | 0 | 26 | 0 | HOLD, sem promoção |
| dimensionamento | 24 | 0 | 0 | 74 | 0 | HOLD, sem promoção |

A consulta e suas qualificações estão em `docs/audits/sql/EDITORIAL_CANONICAL_READ_ONLY_20261026.sql`. **Os números da tabela são apenas cobertura encontrada por estas chaves/joins.** Podem existir candidatos ou regras em outras entidades/arquivos ainda não reconciliadas; um zero não prova ausência universal. `PASS*` inclui registro de classificação de campos de contexto legado, não aceitação clínica nem integralidade do algoritmo.

**FIND candidato material:** em Fugulin, os dez campos no catálogo inspecionado dizem respeito a nome/idade/setor/plantão, dados da unidade e equipe. Não representam os critérios de pontuação de versões de 9 e 12 áreas que aparecem no guia editorial; portanto **não usar estes dez campos como prova de que o cálculo está completo**. Em Apgar, tempo/minuto deve ser contexto separado dos critérios pontuáveis; os três claims são candidatos. Vínculos de campo inspecionados tratam majoritariamente de lei profissional, LGPD, WCAG e intercâmbio de datas — trazem controle transversal, não justificativa dos pontos da escala.

## 6. Regras operacionais para o motor e a publicação
- **Entrada:** leitura do registro versionado; nenhum input de paciente persistido no master.
- **Resolução:** selecionar variante/version + população + condições válidas. Se faltar fonte primária da regra, versão, direito, limite numérico ou homologação, **não gerar score operacional por fallback**.
- **Cálculo:** core determinístico, domínio de valores e política de arredondamento assinados; vetor ouro normal/borda/inválido, invariância de locale, confronto manual independente e regressão.
- **Interpretação:** dados numéricos e mensagens clínicas versionados separadamente; não inferir conduta de score.
- **Publicação:** regra existente `contracts/cko-editorial/policy/editorial_projection.rego` exige PASS nos gates de evidência, direitos, acessibilidade e fidelidade, sem blocking holds. O gate editorial **não substitui** gate de computação/segurança/Kernel.
- **Alteração normativa:** nova edição → checagem de aplicabilidade → análise de impacto na regra/versões/projeções → FIND/WO + testes + revisão → nova versão, sem mutação silenciosa de versão anterior.
- **Tradução:** i18n altera rótulos e acessibilidade, nunca fórmula, pontuação ou classificação.
- **Publicação derivada:** `HTML/PDF/Slides/Quiz/Flashcard` mostram versões/IDs e referências, herdam o padrão de capa/miolo do guia já existente; não criam novo template.

## 7. Fluxo de implantação com gates e responsabilidades
1. **Inventário materializado:** confirmar modelos existentes, colunas, integridade de constraints, storage de snapshots, versão, direitos; cruzar manuscritos antigos Fugulin/Apgar/Insulina/Gotejamento.
2. **Gap/FIND formal:** separar lacunas de cálculo, linkage e conteúdo, sem apagar candidato válido; nomear owner e evidência.
3. **Matriz de autoridade:** para cada campo, fórmula e faixa, vincular o tipo de fonte/requisito **específico**; tratar COFEN, LGPD e WCAG por seu escopo.
4. **Contratos:** adotar os schemas `formula`/`clinical_rule`/`tool`/`interpretation` e os existentes. Propor delta somente se relações tipadas/fórmulas/test vectors não puderem ser representadas adequadamente.
5. **Banco em ambiente governado:** após WO/Kernel e autorização de write, admissões em transação/migração versionada; constraints, índice, FK, autorização/RLS quando exposto; testes positivos/negativos e revalidação. Nada de mudar produção diretamente.
6. **Motor determinístico:** checksum da versão, typed DSL/AST autorizado, fórmulas aprovadas, propriedade dos casos-ouro e testes de borda/erro/versão.
7. **Renderer existente:** projeção referencial para guia completo HTML/PDF e demais recursos; comprovada fidelidade.
8. **Revisão independente:** especialista clínico, governança/licença, engenharia/QA e homologação humana antes de liberar cálculo e publicação.
9. **PMO:** encaminhar FINDs/WO pela fila canônica `registers/pmo/queue.v1.json`; não criar fila separada nesta branch.

### Critérios para considerar **uma ferramenta** pronta
- Objeto e versão únicos e vínculos de fonte com direitos comprovados.
- **Cada critério/entrada** tem fonte ou justificativa técnica adequadamente localizada; regras originais da escala revisadas.
- Fórmula executável proveniente de artefato estruturado/versionado + casos-ouro assinados, negativos, extremos, variantes e locale.
- Relações fonte→fragmento→claim→regra/fórmula→teste→renderer verificadas, com relatório de cobertura e lacunas.
- Matriz de normativos com pertinência, edição, cláusulas/provisões quando necessárias, vigência, jurisdição e alterações.
- Renderer, PDF, apps, conteúdo e traduções não divergentes do cálculo.
- Sem bypass de HOLD; release apenas com Kernel e revisão humana competente.

**Resultado da etapa atual:** arquitetura mapeada, inventário SQL read-only reproduzível, gaps e dependências identificados. **NOT_RUN:** DDL/migration, escrita Supabase, prova de funcionamento do motor, testes clínicos e publicação.