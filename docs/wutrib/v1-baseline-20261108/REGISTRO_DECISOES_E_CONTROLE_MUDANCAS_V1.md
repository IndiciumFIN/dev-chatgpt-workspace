---
document_id: WUTRIB-V1-RFC-001
version: 1.0.0-rc.0
state: PROPOSED_FREEZE_PENDING_SIGNOFF
date: 2026-11-08
wo_lineage: WUTRIB-WO-PLAN-018
author_role: PRODUCT_ARCHITECTURE
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
---

# Registro de decisões ADR/RFC — congelamento candidato do escopo V1

**Estado:** as decisões abaixo são propostas verificáveis de arquitetura, não aprovações assinadas nem funcionalidades implantadas.

### DEC-V1-001 — posicionamento
WU-TRIB V1 é auditoria fiscal preventiva e explicável, não sistema de entrega de obrigações, consultoria automática nem retificador. Saídas são apontamentos/achados sujeitos à revisão.

### DEC-V1-002 — módulos mínimos (13)
EXP-001 Extractor; 002 Profiler; 003 Normalizer; 004 Join; 005 Filter; 006 MasterData mínimo sintético; 008 Duplicates/Gaps; 010 Error/Exception; 013 MultiSource Reconciliation; 014 Layout Validator em escopo expressamente suportado; 019 Investigation Queue (anomalia opcional); 020 Evidence/Workpapers; 022 Dashboards. **Ainda sem prova de implementação/homologação da V1.**

### DEC-V1-003 — módulos de funcionamento limitado (5)
EXP-007 Sampling (seleção dirigida; estatística só com método formal); 009 Stratification (agregações exatas); 011 Anomaly (sinais determinísticos sem IA); 012 Temporal (delta observado/config/business, sem afirmar mudança legal); 015 Parameter Inspector (TES/FISA170 em snapshots). Não podem aparecer como operacionais ou certificados enquanto gates próprios estiverem pendentes.

### DEC-V1-004 — módulos posteriores à V1 (4)
EXP-016 What-if substantivo; 017 candidatos de crédito; 018 Accounting/Stock Tie-Out multilateral; 021 Composer/scheduler. Recursos adicionais de mercado, como retificação, DARF, guias, transmissão, OCR, IA fiscal e POC empresarial, permanecem no roadmap.

### DEC-V1-005 — fontes do piloto
NF-e modelo 55 XML sintético com XSD/versão selecionados; subconjunto explícito da EFD ICMS/IPI por COD_VER/perfil; dicionários SX2/SX3/SIX e TES/FISA170 somente por snapshots sintéticos ou autorizados. Não prometer compatibilidade com todo SPED, todas as UFs ou todas as releases.

### DEC-V1-006 — RTC 2026–2033
IBS/CBS/IS são categorias modeladas desde a V1, mas o cálculo e determinação nacional ficam fora do escopo sem corpus legal específico e aprovação fiscal.

### DEC-V1-007 — arquitetura
Cinco ledgers **lógicos** separados: fatos, fontes normativas, operações, evidências e ações humanas. Não forçar microservices, Kafka, lakehouse ou cinco bancos físicos em um primeiro release.

### DEC-V1-008 — integridade
Ingestão original imutável, deduplicação com proveniência, decimal exato, proteção contra joins N:M infladores, códigos como strings, estados de dado desconhecido distintos de zero.

### DEC-V1-009 — qualidade dos auditores
Os scripts antigos têm cobertura estrutural limitada. Admitir um validador futuro requer oráculo independente, testes negativos, mutation, falhas induzidas, medição de falsos negativos e revisão humana.

### DEC-V1-010 — aprovação automática rejeitada
O ramo de aprovação automática sem divergência do segundo relatório é **rejeitado** para conformidade fiscal, transmissão, retificação, compensação ou parecer. Somente correspondência técnica delimitada pode ser automática, sem assinar aceites.

### DEC-V1-011 — dados reais
A sugestão de POC com três períodos reais é **fase posterior condicionada**, não requisito do piloto sintético. Dados empresariais exigem finalidade, autorização, base/contratos, segregação, LGPD e E2E autenticado.

### DEC-V1-012 — evidência e retenção
Preservar bytes originais, digests reais, lineage, fontes, regra/versão, cálculos, limitações e decisão. Retenção por obrigação/tributo/contexto, não presumir prazo único universal.

### DEC-V1-013 — qualidade do produto
OWASP ASVS 5, ISO 29119/25010/25019, WCAG 2.2 AA, ISO 9241, SCI ISO 21031 onde cabível. Citação de norma não equivale a certificação.

### DEC-V1-014 — benchmark
Aprender categorias funcionais de ONESOURCE, Sovos, Systax, Synchro, Avalara, Qive, Kolossus, IDEA/ACL etc., mas não copiar telas, regras fechadas nem atribuir eficácia a números comerciais de regras.

### DEC-V1-015 — custo e prazo
Nenhum Gantt hipotético de 2027 nem preços/limites publicados por concorrentes se tornam compromisso de entrega. Primeiro admissão do escopo e medição de capacidade.

### DEC-V1-016 — catálogo legado
O arquivo v0.1 contém 21 linhas com campos deslocados por chamada posicional; o novo catálogo corrigiu a interpretação dos campos e dependências, preservando o original como evidência. Sem assinatura da revisão semântica, a correção é **candidata**, não certificada.

### DEC-V1-017 — separação CE/WU-TRIB
Não compartilhar dados, segredos, corpus clínico, publicação ou autorizações com Calculadoras de Enfermagem. Compartilhar somente padrões gerais por contrato e owner separado.

### DEC-V1-018 — mudança de baseline
Após assinatura do escopo: qualquer alteração inicia WO/tarefa/FIND vinculado, análise de impacto em RCM/RTM/UX/testes/fontes/segurança, mudança versionada, revisão e nova baseline. Versões 1.0.0-rc.X são candidatas. 1.0.0 de **escopo** só com sign-off; o release executável e a autorização de produção têm gate independente.

### DEC-V1-019 — mudança e produção
PR Draft, CI verde, documentação publicada ou merge não são aprovação fiscal. Nenhum script de auditoria, dado real, migration, alteração de aplicativo ou Vercel deploy autorizado por este documento.

### DEC-V1-020 — significado de “pedra na V1”
Congelar por candidato: problema, 13 mínimos, 5 limitados, 4 pós-V1, cinco ledgers, fontes/perímetros, contratos, vocabulário, riscos, qualidade e gates. Não congelar como correto o conteúdo de regras sem fonte, dados do ERP não obtidos, performance não medida, testes não executados, datas de implantação ou aceite humano inexistente.

**Resultado:** 20 decisões documentadas para revisão, sem assinatura nominal, sem testes operacionais e sem homologação.
