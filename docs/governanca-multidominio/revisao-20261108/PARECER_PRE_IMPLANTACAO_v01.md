---
document_id: CROSS-DOC-REV-001
version: 0.1.0
status: DRAFT
wo_lineage: WUTRIB-WO-PLAN-018
owner_role: GOVERNANCE_PMO
reviewer_role: FISCAL_CLINICAL_QA_SECURITY
approver_role: AUTHORIZED_DOMAIN_OWNERS
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Parecer de avaliação pré-implementação — inventário normativo multidomínio

**Data de referência:** 2026-11-08. **Objeto:** confrontar o texto enviado pelo usuário (309 linhas) com fontes oficiais públicas e a documentação de WU-TRIB, preservando o escopo separado das Calculadoras de Enfermagem. **Status:** avaliação documental preliminar DRAFT, **não é auditoria de conteúdo, execução de validadores ou parecer de homologação**.

## 1. Método, evidências e limites

Fontes analisadas: anexo `Texto colado(20261108-191710).txt`, GitHub WU-TRIB nos arquivos `agents/doc-governance.mjs`, `agents/normative-applicability.mjs`, `agents/meta-validator.mjs`, `scripts/validate-validators.mjs` da branch `wutrib/validators-plan-20261108`, [28 validadores planejados](../../homologacao/v1/validadores/CATALOGO_VALIDADORES.v0.3.json), [expansão v0.2](../../homologacao/v1/expansoes/v02/README.md) e páginas primárias oficiais listadas no [catálogo de 55 referências](FONTES_NORMATIVAS_MULTIDOMINIO_v01.json).

**Limites de prova:**
- A verificação de fontes é documental por metadados e páginas oficiais públicas; normas ISO/ABNT/COSO/ISACA e documentos de fornecedor podem exigir acesso/licença e validação de edição. Um catálogo não significa leitura integral de seus textos.
- **Não foi executado** qualquer validador, teste fiscal/clínico, teste de capacidade, E2E ou acesso a sistemas empresariais.
- O repositório separado `IndiciumFIN/calculadorasdeenfermagem` **não pôde ser confirmado pela ação GitHub disponível** (resposta 404 no contexto da conexão). Isso **não prova inexistência**; pode refletir falta de permissão. Nenhuma conclusão sobre código/funcionalidades clínicas em produção será deduzida desta revisão.
- A documentação anterior relata resultados de testes WU-TRIB, mas **não foram reexecutados**; manter status `HISTORICAL_REPORTED` até revisão.
- Em todo domínio: fato comprovado, fato histórico do anexo, inferência, hipótese de engenharia, conflito e HOLD_HUMAN devem ser categorias distintas.

## 2. Correções verificadas e decisões de interpretação

| Nº | Asserção do anexo ou lacuna | Avaliação antes de implementar | Efeito no planejamento |
|---|---|---|---|
| C01 | “Auditores PASS” equivale a aderência técnica suficiente | **Incorreto.** Os scripts inspecionados só verificam forma, metadata e trechos de código; não provam detecção de falhas. | Qualificar validadores com golden sets independentes, mutações, erros induzidos, impacto e falso negativo. |
| C02 | Meta-validador testa a si próprio | **Incorreto no código observado.** Ele exclui `meta-validator.mjs` do loop profundo e contém duas verificações `true` para si mesmo. | Revisor/runner externo e teste independente de comportamento; não permitir autocertificação. |
| C03 | Ausência de strings de rede/IA garante sandbox | **Incorreto.** Regex é contornável por import dinâmico, alias ou outros módulos; política não constitui isolamento técnico. | Restrição de filesystem/network/process pelo ambiente e testes adversariais, não por busca textual. |
| C04 | Normas de conteúdo estão efetivamente validadas | **Não demonstrado.** `normative-applicability.mjs` exige `verifiedDocumentBody=false` e `TO_ASSESS`, validando só metadados. | `REFERENCE_METADATA` ≠ `SOURCE_CONTENT_VERIFIED` ≠ `APPLICABLE_RULE_APPROVED`. |
| C05 | Cofen 358/2009 vigente | **Revogada** pela Res. COFEN 736/2024. | Usar 736/2024 como referencial atual e manter 358/2009 como história, com período e contexto. |
| C06 | IEC/ISO 40500 e WCAG 2.2 são versões sempre idênticas | **Diferença editorial:** ISO/IEC 40500:2025 reproduz WCAG 2.2 de outubro de 2023; W3C tem versão de dezembro de 2024. | Congelar versão de critérios, nível e edição usados na avaliação. |
| C07 | Acessibilidade pode ser certificada por axe sem erros | **Não.** WCAG-EM 2.0 (W3C Group Note, 2026) requer avaliação de escopo, amostra, suporte e evidências manuais. | Validadores automáticos + avaliação com teclado/leitores/usuários; declaração circunscrita. |
| C08 | ESG / ISO Guide 82 substituem norma específica de sustentabilidade digital | **Não.** ISO/IEC 21031:2024 define SCI; W3C WSG em outubro de 2026 é **Draft Note**, não norma final. | Métrica por unidade funcional, energia e carbono medido/estimado; ESG complementar. |
| C09 | Norma ISO 25010 define apenas oito características | **Desatualizado.** 25010:2023 tem nove características do produto; 25019:2023 descreve qualidade em uso. | Separar avaliação do produto e efeitos no contexto de uso. |
| C10 | MOC e XSD NF-e podem usar sempre “versão mais recente” | **Não.** Exigir pacote XSD/MOC/NT por evento, tipo, vigência e ambiente autorizado; rejeições SEFAZ têm contexto. | Versionar regras por período, sistema, UF e release. |
| C11 | Guia EFD 3.2.4 e PVA 6.2.0 são o mesmo artefato | **Não.** Um é especificação de escrituração, outro é software de validação; ambos com publicações próprias em 2026. | Oráculos diferentes e comparação independente sem assumir equivalência 1:1. |
| C12 | Todos os blocos EFD são obrigatórios em todo arquivo | **Não pode ser assumido.** Blocos, registros, perfis e condições dependem do guia, período, operação e contribuinte. | Matriz por COD_VER, condições de obrigatoriedade e casos negativos por perfil. |
| C13 | FISA170 anula TES integralmente | **Não pode ser presumido.** Híbrido exige conhecer tributo, operação, parâmetros, compartilhamento e release do cliente. | Oráculo fiscal e dicionário SX2/SX3/SIX autorizados por release. |
| C14 | “MOF” é exclusivamente manual fiscal ou norma de BD | **Ambíguo.** OMG MOF 2.5.1 trata de metamodelagem; manuais fiscais são outra família. | Namespaces distintos `OMG_MOF` e `FISCAL_MOC` / guias. |
| C15 | “1SFN” é norma de normalização | **Não verificado.** 1FN/2FN/3FN são formas normais; não inferir que SFN Protheus corresponde a “primeira forma”. | Abrir FIND terminológico; não definir validador normativo 1SFN sem fonte. |
| C16 | RLS do Supabase prova compatibilidade do DBAccess Protheus | **Não.** Bancos, APIs, recursos, políticas e releases são ambientes/tecnologias distintos. | Validar separadamente matriz de suporte TOTVS, segurança Supabase, tenancy e chaves físicas. |
| C17 | Qualquer calculadora clínica é apenas educativa e está fora de SaMD | **Incorreto como regra geral.** O enquadramento depende da finalidade pretendida e função; ANVISA RDC 657/2022 deve ser analisada por módulo. | Gate regulatório SaMD; IEC 62304 e ISO 14971 condicionais a essa classificação. |
| C18 | RIPD é sempre obrigatório para todo aplicativo | **Incorreto.** ANPD orienta avaliar risco, finalidade e contextos específicos; pode ser exigido. | Registro de decisão para tratamentos com dados pessoais; dados de saúde têm análise reforçada. |
| C19 | Auditoria IA = inteligência artificial | **Ambíguo.** IIA define normas profissionais de auditoria interna; ISO 42001/NIST AI RMF tratam de IA artificial. | Separar competência de auditoria, governança de modelos e controles de agente. |
| C20 | Sem teste automático novo pode-se afirmar “todas as falhas cobertas” | **Não.** Não há sistema que garanta encontrar qualquer falha desconhecida; demonstrar detecção por classe e risco residual. | Relatório de lacunas e eficácia por escopo, `NO_COVERAGE_CLAIM` em classes não testadas. |

## 3. Domínios e produtos — todos os assuntos do anexo, sem misturar escopos

| Domínio | Objetos exigidos no planejamento | Gate e status |
|---|---|---|
| Clínica / enfermagem | Processo de Enfermagem, atribuições, ética, medicamentos, escalas validadas, terminologias, artigos, protocolos, ensino, IA clínica se usada | `CLINICAL_SOURCE_REVIEW`, `CLINICAL_ORACLE`, `SAMD_CLASSIFICATION`: HOLD_HUMAN |
| Fiscal / WU-TRIB | XML/MOC/XSD/NT, EFD/COD_VER/atos, chave NF-e, TES/FISA170, SX2/SX3/SIX, DBAccess, reforma, conciliação de origens e auditoria | `FISCAL_SOURCE_AND_ERP_RELEASE`: HOLD_HUMAN |
| Engenharia de dados | Metamodelo OMG MOF opcional, 1FN/2FN/3FN, chaves, tipos, qualidade de dados, RLS, integridade referencial, versionamento de snapshots, linhagem | `DATA_DICTIONARY_AND_INTEGRITY`: HOLD_HUMAN |
| Gestão de conhecimento | Conteúdos, evidências científicas, licenças, traduções, escalas originais/adaptações, bibliotecas, quizzes e simulados | `EVIDENCE_RIGHTS_AND_EDITORIAL`: HOLD_HUMAN |
| Auditoria e análises | 22 módulos, 28 validadores, estatística, amostragem, erro, anomalia, séries temporais, join, seleção, evidência, MRC e RCM | `ENGINE_CONTRACTS_AND_META_VALIDATION`: HOLD_HUMAN |
| Segurança e privacidade | OWASP ASVS, NIST SSDF, ISO 27001, tokens/IAM/SoD, limite de acesso, dados reais, LGPD, ANPD, RIPD conforme risco | `ACCESS_AND_PRIVACY`: HOLD_HUMAN |
| Produto e operação | ISO 25010/25019/25040, UX/HCD/ISO9241, WCAG 2.2/40500/ABNT, SCI, capacidade, resiliência, recuperação, observabilidade e custo | `QUALITY_AND_OPERATIONS`: HOLD_HUMAN |
| Governança documental | ISO 12207:2026, 15289:2019, 29119, 15489, 10007, COSO/COBIT/IIA, WO, RTM, RCM, FIND, autorizações e release | `WO_AND_SIGNOFF`: HOLD_HUMAN |

A lista completa das **62 unidades de verificação de cobertura**, incluindo tópicos como ABNT NBR 17060, RDC 67/2007, 1SFN, XML, ferramentas analíticas e plataformas de mercado, está em [MATRIZ_COBERTURA_TOPICOS_v01.json](MATRIZ_COBERTURA_TOPICOS_v01.json). Não há indicação de aprovação de nenhum item.

## 4. Fontes primárias prioritárias e evidências checadas

**Enfermagem e saúde:** [COFEN 736/2024](https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/), [COFEN 358/2009 revogada](https://www.portalcofen.gov.br/resoluo-cofen-3582009/), [Lei 7.498/1986](https://cofen.gov.br/lei-n-749886-de-25-de-junho-de-1986/), [MS/ANVISA medicamentos](https://bibliotecadigital.anvisa.gov.br/jspui/handle/anvisa/1770), [RDC 657/2022 SaMD](https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2022/software-como-dispositivo-medico-perguntas-e-respostas/). Escalas e terminologias requerem suas fontes originais, versões autorizadas e licença; não há uma norma única que valide automaticamente todas.

**Fiscal e ERP:** [EFD 3.2.4](https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/nova-versao-do-guia-pratico-da-efd-icms-ipi-2), [PVA 6.2.0](https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/publicacao-do-programa-efd-icms-ipi-versao-6-2.0), [Portal NF-e](https://www.nfe.fazenda.gov.br/portal/principal.aspx) e [TOTVS FISA170](https://centraldeatendimento.totvs.com/hc/pt-br/articles/35314721022103-Cross-Segmento-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Quais-tabelas-fazem-parte-do-Configurador-de-Tributos). Os atos/NTs e releases são por período; **não copiar regras de um ano para outro**.

**Engenharia, segurança e qualidade:** [ISO 12207:2026](https://www.iso.org/standard/90219.html), [ISO 25010:2023](https://www.iso.org/standard/78176.html), [ISO 25019:2023](https://www.iso.org/standard/78177.html), [ISO 38505-1:2026](https://www.iso.org/standard/87195.html), [OWASP ASVS 5.0](https://asvs.owasp.org/) e [NIST SSDF 1.1](https://csrc.nist.gov/pubs/sp/800/218/final). Direitos das publicações e aplicabilidade são verificados separadamente.

**Inclusão e sustentabilidade:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [ISO 40500:2025](https://www.iso.org/standard/91029.html), [ABNT NBR 17225:2025](https://www2.camara.leg.br/a-camara/estruturaadm/gestao-na-camara-dos-deputados/responsabilidade-social-e-ambiental/acessibilidade/pdfs/ABNTNBR17225AcessibilidadeDigitalparaWeb.pdf), [WCAG-EM 2.0](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/), [SCI ISO 21031:2024](https://www.iso.org/standard/86612.html) e [WSG Draft Note 2026](https://www.w3.org/standards/history/web-sustainability-guidelines/). A leitura de uma página pública não representa teste em aplicativo.

## 5. Decisão de arquitetura prévia — requisitos fiscais e clínicos não partilham oráculos

Embora ambos usem um processo similar de registro, validação, metamodelo e evidência, os *artefatos de conteúdo e as regras profissionais* são independentes.

Para saúde, o output do motor técnico pode calcular escore ou alerta didático quando validado, mas sua interpretação ou uso clínico real depende da finalidade, profissional, população e protocolos. Para fiscal, o motor pode detectar inconsistência técnica de layout e diferenças numéricas, mas um **parecer tributário** exige norma, vigência, dados/contexto e revisão competente. Para os dois: scripts não emitem decisão com alçada humana.

Nenhum acesso cruzado, migração de tabela, compartilhamento de corpus pessoal/fiscal, de credenciais, alteração de branch canônica ou deploy deve decorrer da existência deste documento.

## 6. Parecer formal preliminar

**Aprovado documentalmente:** apenas a identificação da necessidade de separar domínios, versionar fontes e adicionar controle independente dos validadores. **Não aprovado para execução:** todos os validadores fiscais, clínicos e operações reais; teste de eficácia e implantação continuam `NOT_RUN/HOLD_HUMAN`.

Nenhum padrão técnico geral permite alegar "valida todos os erros". Requisito correto: **declaração de cobertura e limitações por classe, método e população, mais riscos residuais explícitos**.

**Saída da etapa:** planejamento de revisão normativa versionado, sem aceites humanos, sem auditoria, sem modificação da aplicação.
