---
document_id: WUTRIB-V1-DECISION-001
version: 1.0.0-rc.0
state: SCOPE_BASELINE_CANDIDATE
date: 2026-11-08
scope: WU-TRIB_ONLY
authority_wo_lineage: WUTRIB-WO-PLAN-018
owner_role: PRODUCT_OWNER
reviewers_required: FISCAL_PROTHEUS_QA_SECURITY_GOVERNANCE
approved_by: NONE
approved_at: NONE
release_approved: false
---

# WU-TRIB — parecer crítico e decisão de escopo da V1

## Status de decisão

**V1 é a versão funcional que estamos DEFININDO**, não uma ferramenta aprovada/implantada. Este arquivo propõe congelar requisitos e arquitetura após revisão; o sign-off e a implementação ainda dependem de aprovação humana, WO executiva admitida, testes, validação de fiscais e segurança. A branch/PR é Draft; nenhum engine, script, teste operacional, Supabase ou Vercel será alterado por esta análise.

**Perímetro:** somente WU-TRIB. Não atualizar ou inferir estado das Calculadoras de Enfermagem; as referências compartilhadas sobre qualidade, documentação e métodos podem ser adaptadas por projeto sob governança própria.

## Fontes que sustentam a decisão

- **R1:** `deep-research-report.md`, SHA-256 dos bytes recebidos `fc38704df21b5a48c93c0e4be021eabb1579371b9c9e8bdd5bfdad3fce6ad1b7` (347 linhas). Força: desenho de regra temporal, tax facts, integridade, evidências, processamento, análise de risco e cinco ledgers.
- **R2:** `deep-research-report (1).md`, SHA-256 `83e824534bee172b625e9ad336f884f0e63a23268c9c725a812a8cb462b7aabe` (225 linhas). Força: comparação mais ampla de fornecedores, compliance operacional, segurança, benchmark e seleção tecnológica.
- **GitHub anterior:** v0.1 com 22 módulos, v0.2 com 17 documentos/68 testes futuros, PR #47 com 55 referências/62 assuntos/30 riscos residuais. Essas contagens são inventário/documentação, **não** software homologado.
- **Evidência externa:** [Receita — marcos RTC](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/legislacao/principais-marcos-regulatorios), [cronograma de DF-e](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/reforma-tributaria-do-consumo/orientacoes-da-reforma-tributaria/cronograma), [Guia EFD 3.2.4](https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/nova-versao-do-guia-pratico-da-efd-icms-ipi-2), [PVA 6.2.0](https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/publicacao-do-programa-efd-icms-ipi-versao-6-2.0); benchmark por fontes primárias dos fornecedores conforme a matriz.

**Limite:** as citações `turn...` embutidas nos relatórios não foram transportadas automaticamente como fontes verificadas. Só os URLs oficiais consultados independentemente e citados nesta baseline sustentam as afirmações confirmadas. Demais números/afirmações de marketing ficam `VENDOR_CLAIM_NOT_INDEPENDENTLY_TESTED`.

## Convergências e divergências entre os relatórios

| Área | R1 | R2 | Decisão para V1 |
|---|---|---|---|
| Posicionamento | Plataforma de auditoria assistida com regra temporal e evidências | Esteira de compliance, tax engine, gestão documental e auditoria | **Auditoria fiscal preventiva/explicável**, não software de entrega de obrigações |
| Fundação | Fatos × regras × cálculos × evidências × ações humanas | Documento→ERP→regra→cross-check→workflow | Adotar **cinco ledgers lógicos independentes** com acesso/versão/trilha |
| Motor tributário | Reperformance determinística versionada | Tax engine completo com apuração/obrigações | V1 admite **somente verificações técnicas e cruzamentos delimitados**; reperformance material depende de corpus fiscal validado por caso |
| Origens | NF-e/CT-e, EFD, ERP, importações e PDFs | Diversos DF-e, EFD, ECD/ECF/Reinf/DCTFWeb/eSocial | V1 mínimo: **NF-e modelo 55, EFD ICMS/IPI e snapshots Protheus sintéticos/arquivos**; demais no contrato de expansão |
| ERP | TOTVS/SAP/Oracle conforme autorização | Tax stack enterprise multi-ERP | V1 foca **Protheus/TES/FISA170 híbrido por release**, sem integração live |
| Mercado | Kolossus/ASIS/Sovos/Thomson/Systax e analíticos | Soma Avalara, Qive, ROIT/Dootax e consultorias | Classificar por **família de função**, não copiar UI nem prometer paridade |
| Anomalias | Adicionar depois de dados/regra confiáveis | Valor agregado de analytics/IA | V1: somente análise descritiva e tipos de desvio; ML/IA ficam fora |
| Aprovação | Humana para correção/retificação/parecer | Diagrama contém “Aprovação automática” sem divergência | **Rejeitar aprovação automática como conformidade fiscal**; permitir apenas match técnico com prova e escopo |
| Prova de conceito | Sintética com golden cases | Sugere três períodos de dados reais | **V1 sintética primeiro**; dados reais somente em fase posterior com contrato, autorização, LGPD e testes de isolamento |
| Cronograma | Gráfico de Gantt com datas/tempos hipotéticos | RFP e POC por fornecedor | Nenhuma data de Gantt vira compromisso de entrega; gates e dependências prevalecem |
| Conformidade | Temporalidade, NF-e/EFD e Reforma RTC | Legislação, tributos e obrigações multi-jurisdição | Catálogo extensível no dia 1; regras substantivas só após corpus oficial, edição e aprovação |
| Segurança | Tenant, encryption, logs, storage imutável | ISO27001/SOC/SSO/MFA e privacy | Requisitos desde arquitetura, implementação enterprise bloqueada até E2E real |

## Não negociáveis da V1

1. **Cinco registros lógicos independentes:** fatos fiscais; fontes/regras normativas; execuções de cálculos/verificações; evidências e hashes; decisões/revisões humanas. “Ledger” não implica blockchain e não obriga cinco bancos físicos.
2. **Rastreabilidade bidirecional:** WO→requisito→RCM→origem→regra/vigência→resultado→exceção→revisão; reverso do relatório até os bytes do arquivo e algoritmo exatos.
3. **Versionamento temporal e jurisdicional:** `valid_from/valid_to` e `recorded_at/superseded_at` separados. Não aplicar a regra atual a períodos anteriores.
4. **Fonte imutável e ingestão idempotente:** hash de bytes reais, duplicação de artefatos entre canais não cria três documentos fiscais, contagem/lotes/rejeitos explícitos.
5. **Chaves/decimais corretos:** 44 dígitos e CNPJs como strings, dinheiro com decimal exato, hierarquia documento/item preservada, junções com cardinalidade mensurada, não inflar totais N:M.
6. **Status distintos:** `PASS_TECHNICAL`, `FAIL_TECHNICAL`, `BLOCKED`, `ERROR`, `NOT_RUN`, `INCONCLUSIVE`; julgamento fiscal e termo de aceite humanos, separados.
7. **Não tratar ausência de divergência como autorização:** o motor pode afirmar apenas “nenhuma exceção identificada no conjunto de checks executados sobre a população coberta”.
8. **Regra fiscal só publica com fontes oficiais aplicáveis, exemplos independentes e revisão por tributo/UF/regime/release**; inconclusivo é HOLD e não não conformidade.
9. **Segurança e LGPD:** segregação empresarial/filial, permissão por papel, proteção de credenciais, privacidade, retenção, trilha auditável. Banco de demonstração permanece sintético e fail-closed.
10. **Qualidade de liberação:** testes funcionais, meta-testes negativos, segurança, a11y manual, UX, capacidade, recuperação, sustentabilidade, UAT, critérios Go/No-Go e rollback antes de produção.
11. **Separação de produção e auditoria:** não permitir que o mesmo cálculo autodeclare sua exatidão com autoaprovação.
12. **Sem cópia do design de terceiros:** interface do WU-TRIB própria e consistente, centrada em tarefas de auditor, dados e evidências, sem cards decorativos não funcionais.

## Decisão de versão: escopo firme, não integralidade do mercado

O [catálogo corrigido V1](CATALOGO_FUNCIONAL_V1_CORRIGIDO.json) lista **12 módulos mínimos**, **6 módulos de contrato/funcionamento limitado condicionado a gate** e **4 explicitamente posteriores à V1**. A classificação é proposta e precisa de owner; não define aprovação de feature nem percentual implementado.

**Fontes para a V1 técnica:** NF-e modelo 55 XML sintético com schema identificado e validado; EFD ICMS/IPI em subconjunto de registros suportados explicitado por COD_VER/Guia; dados sintéticos e snapshots autorizados de dicionário/ERP Protheus. Não afirmar capacidade fiscal para todos os blocos SPED, todas as UFs, NFS-e, CT-e, eSocial ou motor IBS/CBS completo apenas porque existe estrutura extensível.

**Reforma tributária:** núcleo de dados e contrato suportam `IBS/CBS/IS` como entidades/tributos distintos, com classificação e vigência, mas a V1 não terá **cálculo ou certificação substantiva universal**. A linha de produto pós-V1 tratará RTC por fonte/competência e documentação técnica oficial.

## O que significa “pedra na V1”

- **Congelar nesta candidata:** identidade, problema, módulos e contratos mínimos, tipos/status, exclusões, fontes, estados, gates e critérios de mudança.
- **Não congelar como correto:** thresholds numéricos sem teste, coverage fiscal ainda desconhecido, números comerciais de concorrentes, datas de implantação, status READY/APPROVED, evidências de testes não feitos.
- **Depois da revisão:** aprovação da **baseline de escopo** pelo dono do produto e especialistas por domínio. Esse ato **não** homologa um software.
- **Mudanças subsequentes:** necessidade nova → FIND/GAP ou solicitação vinculada à WO → análise de impacto em contratos/RCM/testes → revisão versionada → aprovação → nova baseline. Não alterar a V1 silenciosamente.

## Parecer atual

**Apto a revisão formal do escopo V1:** SIM, após correção de um erro de catalogação (21 módulos tinham campos deslocados; reparação v1 em arquivo novo, com origem preservada). **Apto a execução, piloto empresarial ou produção:** NÃO. Os riscos residuais da PR #47 e os gates de homologação permanecem HOLD.

**Situação:** `SCOPE_FREEZE_CANDIDATE / NO_SIGNOFF / NO_DEPLOY / NO_FISCAL_HOMOLOGATION`.
