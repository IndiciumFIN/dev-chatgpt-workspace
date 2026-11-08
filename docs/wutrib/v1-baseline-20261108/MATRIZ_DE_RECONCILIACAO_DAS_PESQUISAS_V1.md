---
document_id: WUTRIB-V1-TRACE-001
version: 1.0.0-rc.0
state: DRAFT_SOURCE_RECONCILIATION
owner_role: PRODUCT_AND_NORMATIVE_GOVERNANCE
approved_by: NONE
---

# Reconciliação dos dois relatórios e destino de cada assunto para a V1

**R1:** `deep-research-report.md`, 347 linhas, SHA-256 no parecer de escopo. **R2:** `deep-research-report (1).md`, 225 linhas, SHA-256 no parecer. Este arquivo registra o destino de todos os macrotemas encontrados, inclusive tópicos explicitamente posteriores à V1. As citações `turn...` embutidas nos anexos NÃO são provas transportadas automaticamente para esta revisão; confirmações novas dependem de consulta ao emissor ou fornecedor.

| Tema/funcionalidade | Base dos relatórios | Destino | Justificativa e limite |
|---|---|---|---|
| Posicionamento fiscal | R1 resumo; R2 conclusão | V1 | Auditoria preventiva/explicável, sem emissão de obrigações |
| Cinco ledgers | R1 conclusão; R2 esteira | V1 | Fatos, normas, cálculos, evidências, ações humanas separados |
| NF-e modelo 55 | Ambos | V1 | XML sintético, XSD versão, chave/DV e eventos; sem conexão SEFAZ |
| NFC-e, CT-e | Ambos | POST | Contratos e oráculos específicos por documento |
| NFS-e, NFCom, NF3e, BP-e, MDF-e, DeRE, DUIMP | R1 RTC; R2 NFS-e | POST | Contratos e fontes oficiais/cronogramas distintos |
| EFD ICMS/IPI | Ambos | V1 | Subconjunto declarado COD_VER/perfil; sem promessa de SPED integral |
| EFD-Contribuições | Ambos | POST | Parser/corpus por competência a desenvolver |
| ECD/ECF | Ambos | POST | Contabilidade, IRPJ/CSLL e plano referencial |
| eSocial/Reinf/DCTFWeb/MIT | Ambos | POST | Retenções, obrigações e pagamento em módulo próprio |
| Protheus TES/FISA170 | Ambos; plano WU-TRIB | V1 | Snapshot sintético e SX2/SX3/SIX por release; sem live ERP |
| SAP, Oracle, Senior, Sankhya | R1 conectores; R2 ERP | POST | Interfaces futuras, não funcionais na V1 |
| e-CAC, SEFAZ, A1/A3 e assinaturas reais | Ambos | POST | Custódia de chave e autorização empresarial |
| OCR/PDF/NLP | R1 ingestão | POST | Auxiliar, nunca substituir XML original |
| Tax engine completo e reperformance | Ambos | POST | V1 tem contrato, casos fiscais somente se especificamente aprovados |
| IBS, CBS e IS | Ambos | V1 ARQUITETURA | Modelos independentes; sem cálculo nacional na V1 |
| NCM, CEST, CFOP, CST, cClassTrib, NBS etc. | Ambos | V1 LIMITADO | Dicionários e cadastros sintéticos; fontes nacionais/UF posteriores |
| Extrair, perfilar, normalizar | R1 pipeline; R2 ingestão | V1 | Manifesto, idempotência, schema, completude e hash |
| JOIN XML × EFD × ERP | Ambos | V1 | ANTI/SEMI/OUTER, cardinalidade, lineage, totais não inflados |
| Filtros e amostragem | R1 módulos; R2 analytics | V1 LIMITADO | Filtros e seleção; inferência estatística só com método homologado |
| Gaps, duplicidade, estratificação | R1 processamento; R2 analytics | V1 LIMITADO | Diagnóstico por contexto; não conclusão jurídica |
| Erros, exceções, riscos, casos | Ambos | V1 | Taxonomia, severidade, crítica, evidência e revisão |
| Anomalias estatísticas e IA | Ambos | V1 LIMITADO + POST | Sinais determinísticos somente; IA posterior |
| Comparação entre períodos | Ambos | V1 LIMITADO | Delta observado, configuração, mix e dado; lei requer fonte aprovada |
| Simulações What-if | Ambos | POST | Somente com regra e modelos validados em sandbox |
| Candidatos a créditos | Ambos | POST | Hipóteses jurídicas com revisão, nunca saldo certo |
| Bloco K, compras, estoque, GL | Ambos | POST | Reconciliador multilateral e contratos futuros |
| Composição visual e agendamento | R1 orquestração; R2 workflow | POST | Pipelines fixos rastreáveis primeiro |
| Dashboard, relatório e drilldown | Ambos | V1 | Conteúdo reconciliado, acesso à evidência, exportação integral |
| Logs, hashes e retenção | Ambos | V1 | Arquivo original, proveniência, regra e decisão |
| IAM/tenant e identidade | Ambos | GATE | Sem Auth empresarial e E2E, apenas demo sintética isolada |
| UX e WCAG | Planos WU-TRIB anteriores | GATE | Testes humanos WCAG 2.2 AA e ISO9241 |
| SCI e sustentabilidade | Planos anteriores | GATE | ISO21031, métricas e limites medidos/estimados |
| Carga, capacidade, recuperação | R1 arquitetura; R2 SLA | GATE | SLO, p95/99, memória, quotas, restore em ambiente autorizado |
| LGPD e incidente | Ambos | GATE | Dados mínimos, privacidade, retenção e avaliação ANPD |
| Benchmark fornecedores | Ambos | REFERÊNCIA | Marketing ≠ resultado empírico e certificação |
| POC três períodos reais | R2 recomenda | POST AUTORIZAÇÃO | V1 prova sintética; real só em fase autorizada |
| Aprovação automática | R2 fluxo | REJEITADO | Apenas matching técnico em escopo; não aprovação tributária |
| Datas Gantt, custos de concorrentes | R1 roadmap; R2 preços | NÃO CONGELAR | Estimativas não são compromissos e preços exigem reconfirmação |
| 28 validadores e 62 tópicos | Histórico PR44-47 | GATE | Qualificação e meta-validação independentes; outros domínios separados |

## Empresas e soluções — mapa de referência (não ranking)

| Família | Exemplos cobertos pelos relatórios | Capacidade a aprender | Restrição |
|---|---|---|---|
| Auditoria e cruzamentos | ONESOURCE Tax Analyser, Sovos Taxverify, ASIS/Kolossus, SPED-AUDIT, e-Auditoria, Fiscal Analítica, Doutor SPED, Sorted, MeuAuditor | Crítica fundamentada, SPED/XML, exceções e evolução | Alegações comerciais, sem teste empírico |
| Tax determination e obrigações | Systax, ONESOURCE Tax One, Avalara AvaTax/Tax Compliance, Sovos Taxrules/Taxfiscal, Synchro | Vigência, manutenção de regras, cálculo, entregas | Não confundir auditoria com emissor fiscal |
| Documentos e captura | Qive, Avalara TaxDocs, Systax DFE | Deduplicação, captura, reconciliação XML/ERP | Disponibilidade por contrato/integração |
| Operação e serviços | ROIT, Dootax, EY, Deloitte, KPMG, PwC | RPA, pagamento, BPO, processos e evidência | Serviço profissional não é software pronto |
| Analytics generalista | Caseware IDEA, Diligent ACL, Power Query, Alteryx | JOIN, extração, amostra, reexecução | Operação de dados ≠ acerto fiscal |
| Risco e IA | MindBridge e ferramentas de IA tributária | Sinais, investigação e explicação | Não declarar fraude, débito ou crédito sem prova |

### Verificações públicas pontuais, não certificação
- [Thomson Reuters ONESOURCE Tax Analyser](https://www.thomsonreuters.com.br/pt/tax-accounting/onesource-mastersaf/produtos/mastersaf-tax-analyser.html) confirma a divulgação de auditoria SPED, riscos, base legal e histórico.
- [Sovos Taxverify Cloud](https://sovos.com/pt-br/tributos/produtos/auditoria-digital-obrigacoes-taxverify-cloud/) divulga mais de 6.000 regras; **quantidade declarada**, não prova independente de eficácia.
- [Avalara Compliance](https://www.avalara.com/br/pt/solucoes/solucao-de-conformidade-compliance.html) divide TaxDocs, AvaTax e Tax Compliance; divulga mais de 150 validações, não teste independente.
- [Receita RTC](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/legislacao/principais-marcos-regulatorios) é fonte legal primária, separada do benchmark.

### Continuidade com o planejamento anterior
O [catálogo corrigido de 22 módulos](CATALOGO_FUNCIONAL_V1_CORRIGIDO.json) preserva cada ID WUTRIB-EXP-001..022, classificado como 13 mínimos, 5 limitados e 4 posteriores. O registro original v0.1 permanece com **21 entradas cujos campos foram deslocados**, como achado formal; não deve alimentar geração de código ou decisões de prioridade. Os 62 tópicos multidomínio/55 fontes da PR #47 permanecem rastreáveis, mas **não integram o escopo de execução fiscal V1** quando são clínicos, genéricos ou posteriores.

**Conclusão:** 39 temas tratados explicitamente e nenhum eliminado silenciosamente. Destino documental não constitui estado de implementação ou conformidade.
