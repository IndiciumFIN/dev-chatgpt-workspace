---
document_id: WUTRIB-DOC-PLAN-VALIDATORS-001
version: 0.3.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: QUALITY_ASSURANCE
reviewer_role: GOVERNANCE_AND_INTERNAL_AUDIT
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Plano diretor de validadores, meta-validadores e auditoria técnica — WU-TRIB v0.3.0

**Objeto:** replanejar a **estratégia** dos validadores. **Não representa execução, programação, homologação ou autorização fiscal.**
**Linha de base:** revisão v0.2.0 do mesmo documento, preservada no histórico Git; complementos do anexo de 08/11/2026. **WO:** WUTRIB-WO-PLAN-018, vinculada às WOs 016 e 017. **Estado:** DRAFT / HOLD_HUMAN.
**Fonte registral:** [Catálogo v0.3 com 28 validadores e fontes](validadores/CATALOGO_VALIDADORES.v0.3.json) e [protocolo de meta-validação](validadores/PROTOCOLO_META_VALIDACAO.md). O catálogo é **proposta de escopo**, não um conjunto de 28 programas entregues.

## 1. Correções de premissas da v0.2.0

- O plano anterior continha quatro candidatos principalmente documentais. Agora abrange os **domínios de governança, metamodelos, dicionários Protheus, master data, dados fiscais, métodos de auditoria, segurança, UX, desempenho, sustentabilidade e IA condicional**.
- COSO ICIF, COSO ERM e COBIT servem como **frameworks de risco, controle e governança**, não oráculos de regras fiscais. Cada mapeamento P/objetivo no catálogo é **candidato** até revisão especializada do texto aplicável/licenciamento; uma referência de matriz não equivale a adesão ao framework inteiro.
- **IA significa duas coisas distintas:** *auditoria interna* (IIA/IPPF) e *inteligência artificial* (ISO/IEC 42001, NIST AI RMF). COSO possui orientação de 2026 para **IA generativa**, separada de COSO ICIF 2013 e COSO ERM 2017. Não existe nesta proposta uma fictícia norma independente intitulada "COSO para Auditoria Interna".
- **MOF também é ambíguo:** OMG Meta Object Facility 2.5.1 = metamodelo; manuais SPED/MOC/atos/NTs = fontes fiscais. Prefixos distintos em todos os registros: OMG_MOF_251 e SPED/NFE. Um validador MOF não certifica XML fiscal.
- O cabeçalho anterior possuía o campo incorreto "aprover_role", alterado para "approver_role"; nenhuma identidade ou assinatura foi inventada.
- **Busca por palavras ou ausência de strings "APPROVED" no código não demonstra segurança**. Deve-se verificar dados, execução controlada, efeitos colaterais, fronteiras de autorização e comportamento ante falhas.
- O digest do **conteúdo** deve ser estável quando os dados e versões não mudarem. Timestamp, executor, runId e ambiente ficam no envelope de execução, sem contaminar o cálculo semântico reprodutível.

## 2. Fundamentos e aplicabilidade verificados

| Referência | Função no desenho | Limitação |
|---|---|---|
| COSO ICIF 2013: cinco componentes, 17 princípios | desenho dos controles, informação, comunicação e monitoramento | não é motor fiscal nem certificado de cumprimento |
| COSO ERM 2017 | identificação, apetite, tratamento e monitoramento do risco; ligação à estratégia | decisão de risco pertence a uma pessoa habilitada |
| COSO *Achieving Effective Internal Control Over Generative AI* 2026 | controles sobre manipulação de prompts, opacidade, deriva, mudanças de modelo, supervisão | **somente** onde houver IA generativa |
| COBIT 2019: 40 objetivos | objetivos de TI selecionados: EDM03, APO12/13/14, BAI06/10, DSS04/05/06, MEA02/03/04 | são objetivos de controle, não testes fiscais |
| IIA Global Internal Audit Standards, edição 2024, efetiva 2025 | independência, evidência, qualidade, comunicação de achados e monitoramento | aplicabilidade à atividade profissional de auditoria interna; software não passa a ser auditor |
| NBC TA 500 / NBC TA 530 | evidência e amostragem; inspiração para metodologia | normas de auditoria independente de informação contábil histórica; formalizar aplicabilidade à revisão fiscal privada |
| ISO/IEC/IEEE 12207:2026 + 15289:2019 + 29119-2/-3:2021 | processos de ciclo, documentos, técnicas e resultados de testes | definir gate do produto; não constituem limiar de SLO universal |
| OMG MOF 2.5.1 | coerência de metamodelos, transformação e intercâmbio quando arquitetura MOF escolhida | não obriga projeto simples a usar MOF |
| SPED, MOC NF-e, XSD, Ato COTEPE, TOTVS por release | **oráculos normativos/contratuais aplicáveis** ao domínio fiscal quando comprovados | corpus tem de ser obtido, versionado, conferido e aprovado antes de execução de regra |
| ISO/IEC 42001:2023, 23894:2023, 5338:2023, 42005:2025; NIST AI RMF 1.0 e NIST AI 600-1; ISO/IEC 5259 | governança, risco, ciclo, impacto, dados e segurança de **sistemas que usam IA** | scripts determinísticos sem modelos de IA não recebem automaticamente status de sistema de IA |
| OWASP ASVS 5.0, ISO 25010:2023, WCAG 2.2, ISO 21031:2024 | segurança, qualidade, acessibilidade, sustentabilidade | métodos exigem evidência e ambiente; sem homologação por mera indicação |

**Fonte de evidências:** links oficiais, edições e status no catálogo JSON. Normas de texto protegido não são copiadas integralmente. As fontes oficiais fiscais e do ERP devem ter registro de edição, período, autenticidade e hash obtido do arquivo original; a simples URL não comprova que seu conteúdo foi avaliado.

## 3. Arquitetura de validação em camadas

**Plano de controle (autoridade e proveniência):** uma WO canônica admite tarefas; registry de fontes/contratos/versões; RCM vincula riscos e controles; gate determina se um candidato é admissível. Fora desse plano, nenhum script, agente, Supabase RPC, tarefa CI ou IA autoriza execução ou promoção.

**Plano de dados (aquisição e organização):** snapshots sintéticos ou expressamente autorizados → validação de integridade e formato → metadados SX2/SX3/SIX e tabelas fiscais → master data (participantes/produtos/CFOP/NCM/CST/TES) → modelo físico e semântico com vigência. Ausência de dados não é resultado zero, é BLOCKED/NOT_RUN conforme o caso.

**Plano técnico determinístico:** validação de tipos, chaves, XSD, COD_VER, relações, algoritmos de valor, cruzamentos, provas, amostragem reproduzível, acessos, capacidade e acessibilidade. Cada verificador consome **contratos versionados**, não páginas web arbitrárias.

**Plano de análise de risco e IA (quando habilitado):** IA pode sugerir classificações, prioridades, explicações ou cobertura; **não pode** sobrescrever o resultado determinístico, inferir fonte ausente, autorizar acesso, aplicar regra fiscal sem oráculo, alterar uma WO homologada ou assinar parecer. Toda sugestão é ADVISORY e revisável.

**Plano de auditoria independente:** meta-validadores testam se os verificadores detectam defeitos; evidências são preservadas com integridade; revisor competente examina os riscos; autoridades humanas separadas determinam o go/no-go por domínio. Um check verde significa que o check mediu seu oráculo, não que todo o produto esteja conforme.

### Ordem de execução futura (ainda NÃO autorizada)

1. WO e classificação de risco/escopo; aprovação do plano e mapeamento normativo.
2. Registro de fontes e snapshots/fixtures com integridade, origem, vigência, direitos e permissões.
3. Validação **dos validadores** em laboratório isolado com testes positivos, negativos, adversariais e falhas injetadas.
4. Validação de contratos de dados, tipos, esquemas, master data, ERP e leiautes oficiais.
5. Execução de validações de negócio sob autorização de ambiente, de volume e de dados.
6. Consolidação de achados, evidências e relatórios; revisão por domínio e decisão humana.
7. Homologação do **piloto sintético** separada de eventual homologação **fiscal corporativa**.

## 4. Catálogo proposto — 28 validadores

O arquivo [CATALOGO_VALIDADORES.v0.3.json](validadores/CATALOGO_VALIDADORES.v0.3.json) contém para cada candidato: identificador, owner, entrada, evidência esperada, COSO P selecionado, objetivos COBIT, fontes de referência, criticidade, aplicabilidade condicional e estado **PLANNED_NOT_EXECUTED**.

| Camada | Identificadores | Exemplos de fronteira |
|---|---|---|
| Governança e evidências | VAL-001 a 005 | WO, RCM, norma, documentos e cadeia de custódia |
| Metamodelo, dicionário, master data e linhagem | VAL-006 a 010 | MOF, SX2/SX3/SIX, SA1/SA2/SB1, SF1/SF2/SFT/SF4/FISA170 |
| Leiautes, regras e auditoria | VAL-011 a 016 | EFD, MOC/XSD, vigência, XML×EFD×ERP, amostragem, findings |
| Segurança e privacidade | VAL-017 a 020 | tenant, autorização, ataques, supply chain, retenção |
| Qualidade do produto e operação | VAL-021 a 024 | carga, WCAG, carbono por unidade funcional, recuperação |
| Avaliação condicional de sistemas de IA | VAL-025 a 028 | catálogo/modelo, grounding, prompt injection, impacto e veto humano |

**Total: 24 validadores de escopo técnico/auditoria e 4 adicionais condicionais ao uso real de IA.** Nada está implementado por causa deste catálogo. Os sete agentes existentes e o check-wutrib-docs continuam **inventário legado a analisar**, não equivalentes automaticamente aos VAL-001 a 028.

## 5. Contrato obrigatório de um validador

Cada validador planejado deverá declarar:

- Identidade \`validator_id\`, \`version\`, código/hash, responsável e escopo, dependências e versão dos oráculos.
- \`input_contract_id\`, \`source_snapshot_id\`, \`normative_source_id\`, \`effective_from/to\`, \`fiscal_period\`, \`ERP_release\` quando aplicáveis.
- \`control_id\`, \`risk_id\`, \`requirement_id\`, \`test_case_id\`, \`wo_id\`, mapeamento de COSO/COBIT **aplicável e revisado**, e justificativa de N/A.
- Fronteiras de execução: somente leitura por padrão, acesso mínimo, limite de CPU/memória/tempo/lote, ausência de rede para validators puros; aquisição de documentos por pipeline separado com autorização/proveniência.
- Oráculo e técnica: comparação independente, property-based, mutation, differential testing, golden fixtures de origem legítima, regressão, simulação de falha.
- Saída tipada: \`PASS | FAIL | BLOCKED | NOT_APPLICABLE | ERROR | NOT_RUN\` com razão, severidade, abrangência e diagnóstico; valores desconhecidos NUNCA se tornam PASS.
- Proveniência: digest SHA-256 dos bytes reais ou canonicalização definida, \`execution_id\`, \`captured_at\`, executor, versão do programa, ambiente, plano e evidências. Reprodutibilidade sem misturar timestamp no digest funcional.
- Saída fiscal obrigatória \`fiscalConformity = NOT_EVALUATED\` até ato humano externo ao motor; \`approvalStatus = NOT_APPROVED\` em todo script.
- Nenhuma ação de mutação, merge, deploy, mudança de regra, promoção de documento ou abertura pública de RLS.

A conclusão de **adequação de controle** exige parecer, amostra, desenho, operação e evidência da disciplina; a conclusão **tributária** exige especialistas, norma válida e dados autorizados. Não confundir com os statuses técnicos do script.

## 6. Auditoria dos próprios validadores — metodologia obrigatória

O \`meta-validator\` precisa ser **independente da implementação alvo**. Um programa não passa apenas porque se autoexecuta sem falhar. Mínimo:

1. **Testes positivos independentes:** fixtures corretas devem gerar PASS, com base em oráculos documentados.
2. **Negativos injetados:** mudar 1 campo, 1 versão de leiaute, 1 chave, 1 data, 1 permissão, 1 hash, 1 regra, 1 relação, 1 registro relevante; cada defeito conhecido precisa ser detectado.
3. **Propriedades/metamorfismo:** duplicação, reordenação, normalização autorizada, partição, repetição da execução e troca da identidade ou empresa; checar resultados esperados em cada transformação.
4. **Oráculos diferenciais:** comparar, quando legítimo, com PVA, XSD/validador oficial ou implementação humana de referência; não usar o próprio algoritmo como sua única verdade.
5. **Falhas e limites:** fonte ausente, malformed input, tamanho extremo, tempo esgotado, permissões incorretas, serviço indisponível, cliente/provedor não confiável, variação na ordem de dados.
6. **Cobertura:** requisito/riscos positivos e negativos, taxa de defeitos detectados, falso positivo e falso negativo, linhas/caminhos/condições pertinentes, mutation score e precisão quando mensuráveis.
7. **Proibição de autocertificação:** alguém diferente de quem implementou revisa amostras, scripts, hashes e parâmetros. Avaliações de IA, quando existentes, também exigem revisão humana e golden sets independentes.
8. **Parâmetros de aceite:** limiares de sensibilidade, especificidade, tempo, memória e false-negative devem ser definidos no Master Test Plan **antes** de avaliar cada classe de risco. Não declarar um percentual universal fabricado.
9. **Replay e audit trail:** reconstruir ambiente, dependências, insumos, oráculo, outputs, hashes e evidências a partir da WO; qualquer alteração relevante exige revalidação.
10. **SoD e veto:** falha crítica/ausência de evidência = BLOCKED ou FAIL, nunca PASS ou autorização de release.

**Amostragem:** distinguir teste a 100% de população, amostragem probabilística e seleção dirigida por risco. NBC TA 530 pode orientar desenho, tamanho e avaliação quando pertinente, mas **seleção dirigida não autoriza extrapolação estatística**. Não projetar distorção/finding sem método formal e premissas documentadas.

## 7. Controle COSO/COBIT: o que significa mapear corretamente

- **COSO ICIF:** definir objetivo, risco, controle e evidência mensurável; uso de componentes e princípios relevantes (ex. P7 identificação de risco; P10 controle; P11 tecnologia; P13 informação; P16 monitoramento) é **mapeamento proposto**, a conferir por pessoal qualificado.
- **COSO ERM:** definir risco residual, apetite, cenário, resposta, proprietário e mudança de estratégia. Nenhuma pontuação de script substitui decisão do risk owner.
- **COBIT 2019:** referenciar objetivos (por exemplo APO14 Managed Data, BAI10 Managed Configuration, MEA02 Managed System of Internal Control, MEA03 Managed Compliance with External Requirements, MEA04 Managed Assurance). Critério aplicável depende do desenho de governança da organização; listar código não prova aderência ao objetivo.
- **IIA:** o auditor que avalia os controles deve preservar independência e qualidade das provas; o verificador automatizado é ferramenta de apoio.
- **IA artificial:** aplicar NIST GOVERN/MAP/MEASURE/MANAGE, ISO 42001 AIMS e COSO GenAI 2026 apenas após inventário do subsistema realmente implementado. Controle de prompts, entradas adversariais, fontes, privacidade, deriva, monitoramento e autorização humana são gate adicional.

**Princípio de prevalência:** lei/regra fiscal aplicável e contratos oficiais na sua vigência → segurança/privacidade e restrições de operação → requisitos e critérios internos homologados → referências metodológicas/frameworks. Em caso de conflito de fontes ou edição não confirmada: HOLD_HUMAN e não publicação de conclusão.

## 8. Dois produtos distintos, duas linhas de homologação

| Tema | Piloto web sintético | Plataforma fiscal corporativa |
|---|---|---|
| Dados | Fixture fictícia com limites | Snapshots e ingestão de empresas autorizadas |
| Leiaute | Parcial explicitado | XSD/EFD por versão e período, vigência e testes oficiais |
| Protheus | Sem SX3 de cliente, catálogo candidato | SX2/SX3/SIX + dados mestres/tabelas + release e contrato aprovado |
| Segurança | Frontend local e backend fail-closed | Auth, tenant, RLS, monitoramento, anonimização/retentiva |
| Avaliação | Técnico, UX e synthetic throughput | Fiscal, controles internos, amostragem e operação robusta |
| Resultado permitido | Finding preliminar com NOT_EVALUATED | Finding auditável e parecer humano, nunca autoaprovação |
| Gate | UAT do piloto | Parecer fiscal/segurança/negócio/operacional separados |

## 9. Governança de alterações e dos modelos

- **D051:** lógica de ferramenta, fluxo e estados; **D052:** métodos de auditoria (controles/substantivos, testes analíticos); **D053:** política e registro de amostragem; **D054:** matriz de método×controle×evidência.
- Esses quatro documentos foram **propostos no anexo**, mas **não são considerados criados, preenchidos nem aprovados** pela presente revisão. Registrar futuramente no catálogo canônico documental (que possui 50 templates) e incrementar a versão/contagem após aprovação da mudança de escopo; não criar artefatos órfãos.
- Vincular este plano ao catálogo D004 RCM, D006 RTM, D007 aplicabilidade, D009/D010 metamodelo/dicionário, D021 MTP, D023 casos, D025 execução, D026 defeitos, D040 encerramento e D042/D043 sign-off.
- Manter registros de baseline por commit, hash do documento, mudanças em normas e release ERP, WP/WO, revisão, decisão e data. O SIG de autoridade é humano; um script não pode escrever \`APPROVED\` ou emitir documento de homologação.

## 10. Plano de implantação futuro dos validadores (não executar nesta WO)

**Wave V0 — harmonização documental e seleção:** reconciliar a v0.2.0, o registro v0.3.0 e os 50 documentos canônicos, aprovar nomes/escopos, matriz COSO/COBIT, fontes, oráculos e responsabilidades.

**Wave V1 — metamodelo e contratos:** formalizar schema JSON, dicionário de dados, OMG MOF se adotado, contratos por tabela e snapshot, regras de proveniência e criticidade. Nenhuma validação de imposto.

**Wave V2 — validadores do plano de controle:** implementar depois de autorizado os VAL-001 a 005 e meta-validator isolado. Validar negativos e provar que não conseguem aprovar documento nem promover WO.

**Wave V3 — validadores de dados e fiscal:** VAL-006 a 016, progressivamente, com guia e leiaute oficial; usar somente dados fictícios e casos controlados até admissibilidade de snapshots empresariais.

**Wave V4 — segurança, qualidade e operação:** VAL-017 a 024; teste de autorização, acessibilidade humana, performance e sustentabilidade mensuradas em ambientes designados.

**Wave V5 — IA somente se aplicável:** VAL-025 a 028 em sandbox e corpus de teste autorizado, com avaliação de impacto, regras de acesso e interrupção humana.

**Wave V6 — revisão de independência e decisão:** submeter eficácia e limitações dos validadores por domínio, parecer de risco, aprovação explícita para futura auditoria e, depois, possível execução da ferramenta em ambiente autorizado.

## 11. Gates da estratégia de validação

| Gate | Critério futuro | Estado agora |
|---|---|---|
| GV00 Registro | WO, plano, modelos, responsável e escopo | PLANEJADO |
| GV01 Autoridade normativa | fontes oficiais e aplicabilidade por edição sem conflito | HOLD |
| GV02 Contratos | entrada/saída/oráculo/efeitos e tratamento de erro versionados | HOLD |
| GV03 Meta-validação | testes falsos positivos/negativos, mutações e replay por validador | NOT_RUN |
| GV04 Sandbox | ambiente isolado, acesso mínimo, massa sintética e autorização | NOT_RUN |
| GV05 Independência | QA + governança revisam eficácia e riscos | HOLD_HUMAN |
| GV06 Admissão | autoridade humana vincula versões, hashes e gates em WO | HOLD_HUMAN |
| GV07 Auditoria | somente depois de GV06, execução de auditoria de conteúdo/sistema | NÃO AUTORIZADA |
| GV08 Homologação | parecer técnico, fiscal, jurídico, segurança e operação conforme escopo | NÃO AUTORIZADA |

**Falha de norma/corpus, ausência de oráculo, divergência de versão, credencial indisponível ou resposta IA sem evidência não permitem execução normal: HOLD/BLOCKED.**

## 12. Pendências explícitas e parecer

- Mapear e aprovar o texto/licenciamento de COSO/COBIT para IDs específicos antes de afirmar cobertura de princípio.
- Confirmar documentos oficiais, snapshot ERP e vigência fiscal por versão/país/UF.
- Criar contratos de 28 validadores e meta-validator por testes independentes **somente após aprovação do plano**.
- Deliberar se usar MOF 2.5.1 para metamodelo ou apenas JSON Schema + tabelas relacionais. MOF é opção arquitetural, não exigência genérica.
- Determinar aplicabilidade dos padrões IA após inventário; scripts determinísticos ≠ modelos IA.
- Aprovar conjunto completo de D051–D054 e reconcile baseline 50→54 sem destruir histórico.
- Conciliar as WOs 016/017/018 e o catálogo normativo já versionado com as novas fontes.
- Manter a prévia Vercel v0.3 inalterada e a API candidata desabilitada; não usar dados reais.

**PARECER:** Plano v0.3.0 **DRAFT**. Existência da estratégia não é prova de eficácia dos validadores. Nenhuma validação fiscal, autorização de dados empresariais, homologação, merge ou publicação foi executada neste replanejamento.
