---
document_id: WUTRIB-V1-ASSURANCE-NORM-001
version: 0.1.0
state: DRAFT_COMPARATIVE_DESIGN_EVALUATION
review_date: 2026-11-08
baseline: wutrib/v1-scope-freeze-candidate-20261108
baseline_version: 1.0.0-rc.0
project: WU-TRIB
approved_by: NONE
tests_executed: false
---

# Confronto da V1 com normas técnicas e fontes regulatórias

**Escopo:** avaliação de desenho documental, nunca auditoria de conformidade demonstrada. Os resumos das normas ISO/ABNT não equivalem à leitura integral de textos licenciados. Aplicabilidade fiscal é por período/UF/empresa/regime e deve ser decidida por profissional qualificado. A V1 é piloto sintético com no máximo NF-e modelo 55, subconjunto EFD ICMS/IPI e snapshots Protheus autorizados/sintéticos; não é um sistema de apuração/transmissão.

## 1. Matriz de comparação por referência

| Referência primária / edição verificada | Obrigatoriedade e papel | Estado do planejamento V1 | Lacuna a tratar antes de aprovar V1 de escopo | Criticidade |
|---|---|---|---|---|
| [ISO/IEC/IEEE 12207:2026](https://www.iso.org/standard/90219.html) | Referência de processos de ciclo de vida; não exige método de desenvolvimento específico | WO, 7 gates e histórico documentados | Criar mapa de processos/artefatos da concepção ao descarte, com governança de mudanças, sustentação e operação | P1 |
| [ISO/IEC/IEEE 15289:2019](https://www.iso.org/standard/74909.html) | Conteúdo de itens documentais; referência técnica, não implica 50 arquivos obrigatórios | 50 templates preservados, 10 documentos V1 | Contar templates não prova preenchimento, versão, aprovador ou adequação; exigir índice item→requisito→artefato→evidência | P0 |
| [ISO/IEC/IEEE 29119-2:2021](https://www.iso.org/standard/79428.html) | Processo de testes e gerenciamento | 30 grupos previstos, 7 gates | Plano mestre com níveis, responsabilidades, ambiente, execução, monitoramento, encerramento e controle de defeitos | P0 |
| [ISO/IEC/IEEE 29119-3:2021](https://www.iso.org/standard/79429.html) | Documentação de teste | Matriz NOT_RUN | Casos são títulos/oráculos genéricos; faltam precondições, fixture, passos, expected field-level, observed, evidência, tester, reteste | P0 |
| [ISO/IEC/IEEE 29119-4:2021](https://www.iso.org/standard/79430.html) | Técnicas de desenho de testes | Cita negativo, boundary, mutation, metamórficos | Associar técnica e orçamento a cada controle e classe de risco; independência do oráculo fiscal/ERP | P0 |
| [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) | Modelo de qualidade de produto com **nove** características | Abordado qualitativamente em UX, segurança e desempenho | Criar atributos mensuráveis e critérios de aceite inclusive **safety**, interação e flexibilidade; não usar modelo antigo de oito | P0 |
| [ISO/IEC 25019:2023](https://www.iso.org/standard/78177.html) | Qualidade em uso, contexto dos usuários | UAT citado | Perfis, tarefas observadas, eficácia/eficiência/satisfação e risco de interpretação errada sem avaliação humana | P1 |
| [ISO/IEC 25040:2024](https://www.iso.org/standard/83467.html) | Processo de avaliação de qualidade de software/dados/serviços | Sete gates documentados | Definir plano de avaliação, medidas, método de julgamento, independência e relatório; não cria método de teste por si | P1 |
| [ISO/IEC 25012:2008](https://www.iso.org/standard/35736.html) | Modelo de qualidade de dados estruturados (15 características), edição confirmada em 2025 | Hash, tipos, nulos e completude previstos | Dicionário de qualidade por campo: exatidão, atualidade, completude, consistência, rastreabilidade, interpretação, rejeições e thresholds | P0 |
| [ISO 10007:2017](https://www.iso.org/standard/70400.html) | Gestão de configuração desde concepção até descarte | Git/semver/PR planejados | Criar baseline configurável por norma, regra, XSD, release ERP, fixture, resultado e decisão; assinatura/diff/rollback independentes do commit | P1 |
| [ISO/IEC 27001:2022](https://www.iso.org/standard/27001) | Norma de sistema de gestão da segurança da informação; aplicar controles pertinentes, não alegar certificação | Segredos, tenant, papéis mencionados | Matriz de controles/risco operacional, acesso privilegiado, resposta a incidente, backup, revogação, auditoria de acessos | P0 |
| [OWASP ASVS 5.0.0](https://asvs.owasp.org/) | Referência técnica de verificação de web apps e APIs | ASVS citado sem sub-requisitos testados | Perfis de Auth/RBAC, IDOR/BOLA, escopo por tenant/filial, SSRF/XXE, uploads, rate limit, sessões, export e logs | P0 |
| [NIST SP 800-218 SSDF 1.1](https://csrc.nist.gov/pubs/sp/800/218/final) | Práticas de desenvolvimento seguro | CI/agent gates históricos | Security requirements/PR review, dependências e proveniência do build, segredos, defeitos e resposta a vulnerabilidades | P1 |
| [ISO 9241-210:2019](https://www.iso.org/standard/77520.html) e ISO 9241-11/-110 (edição a confirmar) | Human-centred design; usabilidade e interação | Fluxos UX descritos | Observação de usuários reais em tarefas de importação, Join, resolução e interpretação de “nenhuma divergência” | P1 |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) / [ISO/IEC 40500:2025](https://www.w3.org/WAI/standards-guidelines/wcag/) / [WCAG-EM 2.0](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/) | Critérios digitais e metodologia de avaliação; analisar ABNT NBR 17225:2025 conforme jurisdição/uso | A11y AA e manual previstos | Matriz de critérios por tela/estado, teclado/leitor, zoom/reflow, tabela virtualizada, mensagens de evidência e escopo amostral | P0 |
| [ISO/IEC 21031:2024](https://www.iso.org/standard/86612.html) | Método SCI, unidade funcional e medições; não exige “certificação ambiental” do software | Sustentabilidade planejada | Escolher unidade “1000 documentos auditados” etc., fatores de emissões, medições/estimativas e limites; não inventar carbono | P1 |
| [IIA Global Internal Audit Standards 2024](https://www.theiia.org/en/content/standards/complete-global-internal-audit-standards/) | Relevante se uso enquadrado como trabalho de auditoria interna profissional; não norma fiscal universal | RCM, workpapers e revisão previstos | Vincular objetivo, risco, critério, evidência suficiente, trabalho/supervisão e follow-up, segregação MRC/RCM | P1 |
| [COSO ICIF / COBIT 2019](https://www.isaca.org/resources/cobit) | Referências de controles e governança, a mapear conforme organização e licenças | Referidos genericamente | Controles de integridade, mudança, gestão de dados, acesso e riscos residuais com owner, evidência, teste de desenho/operação | P1 |
| [NBC TA 500/530 — CFC](https://cfc.org.br/tecnica/normas-brasileiras-de-contabilidade/) | Normas de auditoria independente; uso metodológico condicional a tipo de trabalho | Amostragem separada de filtros | Distinguir censo, seleção dirigida e amostra probabilística; sem extrapolação de seleção dirigida | P1 |

**Julgamento:** a documentação contém boa cobertura **de intenção**, mas quase nenhuma mensuração de adequação operacional. Não declarar aderência, certificação, eficácia ou controle implementado com base na referência bibliográfica.

## 2. Normas fiscais e particularidades que mudam a V1

### EFD ICMS/IPI — o mínimo não pode ignorar exceções

- A [publicação oficial do Guia 3.2.4 em 10/09/2026](https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/nova-versao-do-guia-pratico-da-efd-icms-ipi-2) referencia o Ato COTEPE/ICMS 86/2026. O [PVA 6.2.0 publicado em 04/11/2026](https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/publicacao-do-programa-efd-icms-ipi-versao-6-2.0) é **software validador**, não a edição do guia.
- O [texto integral do Guia EFD 3.2.4, página 63](https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/efd-icms-ipi/manuais-e-documentos-tecnicos/guia-pratico-efd-versao-3-2-4.pdf/@@display-file/file) especifica, para NF-e de emissão própria, regra geral de C100 + C190 e condições para C170, além de hipóteses de cancelamento e casos regidos por UF. **Proibir joins XML:item × EFD:C170 assumindo existência universal**.
- Exigir a matriz \`{COD_VER, perfil, IND_OPER, IND_EMIT, COD_MOD, COD_SIT, competência, UF, registro, regra, exceção}\`; registrar cobertura por registro/condição e \`NOT_SUPPORTED\` onde não houver prova.

### TOTVS Protheus TES × FISA170 híbrido — o maior gap específico do produto

- A [TOTVS lista explicitamente F20, F21–F29, F2A–F2N e tabelas CIN/CIO/CIQ/CIR/CIS/CIT/CIU/CIV/CIX/CIY/CJ0–CJ9/CJA/CJL](https://centraldeatendimento.totvs.com/hc/pt-br/articles/35314721022103-Cross-Segmento-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Quais-tabelas-fazem-parte-do-Configurador-de-Tributos) como tabelas principais do Configurador, conforme ambiente e versão.
- A [TOTVS explica que SD1/D1_IDTRIB, SD2/D2_IDTRIB e SFT/FT_IDTRIB identificam cálculo pelo Configurador](https://centraldeatendimento.totvs.com/hc/pt-br/articles/35357410638231-CROSS-Segmentos-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Como-confirmar-se-os-impostos-est%C3%A3o-sendo-gerados-pelo-Configurador-de-Tributos-ou-TES). A fonte de cálculo deve ser investigada por tributo, período, operação, release e perfil, com fallback. O mesmo artigo observa que outros arquivos da rotina não contêm esses campos.
- [Artigo oficial de configuração híbrida](https://centraldeatendimento.totvs.com/hc/pt-br/articles/36312155068823-CROSS-Segmentos-TOTVS-Backoffice-Linha-Protheus-FIS-Como-configurar-o-cClasstrib-410-para-opera%C3%A7%C3%B5es-Isentas-no-fisa170-forma-Hibrida) exemplifica ICMS/PIS/Cofins via TES e IBS/CBS via FISA170; **não é uma regra universal** nem permite inferir a configuração do cliente.
- A TOTVS [descreve transição de campos TES a partir de release 12.1.2510](https://centraldeatendimento.totvs.com/hc/pt-br/articles/34900857950615-CROSS-Segmentos-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Campos-da-TES-ir%C3%A1-permanecer-com-a-implanta%C3%A7%C3%A3o-do-Configurador-de-Tributos?sort_by=created_at); portanto, a V1 deve modelar \`ERP_RELEASE + PROFILE_CONFIG_SNAPSHOT + TAX_SOURCE_RESOLVER\` e considerar planos de migração e compartilhamento de tabelas por filial.

**Mudança necessária:** o catálogo atual cita principalmente SX2/SX3/SIX e SF4, mas **não especifica o conjunto de origem de imposto/configuração e o trajeto IDTRIB de modo suficiente**. Não basta adiar a inspeção de parâmetros toda para um módulo facultativo: os campos mínimos de origem/configuração de um cenário híbrido suportado são dependência do contrato V1, mesmo que não haja acesso ERP live.

### NF-e, RTC, privacidade

- [Portal NF-e](https://www.nfe.fazenda.gov.br/portal/principal.aspx): selecionar XSD, MOC, NT e eventos por edição/competência; fixtures **sintéticas sem autorização SEFAZ** não representam documento autorizado. O arquivo original e a avaliação de assinaturas precisam de status distinguíveis.
- [Reforma Tributária no site da Receita](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/reforma-tributaria-do-consumo/legislacao/principais-marcos-regulatorios): EC 132/2023, LC 214/2025, LC 227/2026, Decreto 12.955/2026. A V1 pode admitir IBS/CBS/IS no metamodelo sem afirmar cálculo material completo; exigir flag \`TAX_RULE_NOT_IMPLEMENTED\`.
- [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) e [ANPD RDCIS 15/2024](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis): estabelecer controladores, data minimization, classificação, direitos, critérios de incidente e retenção aplicáveis; não prometer compliance por usar dados sintéticos hoje.

## 3. Correções necessárias ao documento V1 atual

1. **Especificar um vertical slice auditável**: upload XML modelo 55 + EFD delimitado + snapshot Protheus sintético → validar origens → Join com cardinalidade → exceção e razão → evidência → revisão. Este resultado precisa ser o **critério operacional da V1**, não apenas presença dos 13 motores.
2. **FISA170/TES:** matriz real de origem do cálculo por tributo/profile/release, lineage IDTRIB e mapeamento versionado das tabelas Fxx/Cxx aplicáveis; sem banco empresarial.
3. **EFD:** matriz mínima de registros/condições por COD_VER, emissão, status, UF e perfil; diferença entre C100/C170/C190; caso negativo obrigatório.
4. **Fiscal versus estrutural:** para cada check, \`TECHNICAL_INTEGRITY\`, \`CROSS_SOURCE_RECONCILIATION\`, \`NORMATIVE_APPLICABILITY\` ou \`FISCAL_CALCULATION_HUMAN_APPROVED\` com resultados distintos. Não declarar tax engine pleno.
5. **Nove características ISO 25010:** critérios mensuráveis em vez de apenas citação, incluindo safety/fail-safe, escalabilidade e interação.
6. **Dados e capacidade:** volumes e SLOs determinados por requisito e testados em ambiente autorizado; ninguém deve assumir capacidade máxima do Vercel/DB por teste trivial.
7. **Homologação:** tarefas de teste com fixture, oracle externo, expected, observed, evidência, revisor e reteste; 30 grupos NOT_RUN não bastam para sign-off.
8. **Documentos:** índice de artefatos preenchidos com IDs/versões/assinaturas (não quantidade de templates) e RCM/RTM por requisito.

**Gate:** \`NO_SCOPE_FREEZE_SIGNOFF\` até revisão de engenharia, fiscal/Protheus, QA, segurança e dono do produto. \`NO_PRODUCTION_GO\` até os testes efetivos. Não foi feito nenhum teste funcional de software nesta revisão.
