---
document_id: WUTRIB-V1-ASSURANCE-FISCAL-001
version: 0.1.0
state: DRAFT_MINIMUM_FISCAL_CONTRACTS
review_date: 2026-11-08
baseline: 1.0.0-rc.0
approved_by: NONE
---

# Contratos fiscais e Protheus mínimos antes de congelar a V1

Este documento **não adiciona tributos, obrigações, integrações live nem módulos**. Ele restringe a semântica de três fontes já incluídas na V1 e descreve as perguntas que o contrato precisa responder. Tabelas de produto do fornecedor não são afirmação sobre tabelas físicas existentes no cliente; dependem de release, dicionário autorizado, parametrização e uso real.

## A. EFD ICMS/IPI v3.2.4 (contrato de subset)

**Fonte oficial:** [Guia Prático EFD 3.2.4 publicado pelo SPED](https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/efd-icms-ipi/manuais-e-documentos-tecnicos/guia-pratico-efd-versao-3-2-4.pdf/@@display-file/file), página 63, e [PVA versão 6.2.0](https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/publicacao-do-programa-efd-icms-ipi-versao-6-2.0) como validador de referência de escopo próprio.

| Dimensão/registro | Status candidato V1 | Pré-condição de implementação | Oráculo/negativo mínimo |
|---|---|---|---|
| \`0000\`, competência e COD_VER | REQUIRED_AS_SOURCE_CONTEXT | Versão do leiaute, data inicial/final, estabelecimento e perfil | Arquivo fora de edição/competência = BLOCKED, não PASS |
| Cadastro mestre/participante/produto (bloco 0 pertinente) | CONTRACT_ONLY_UNTIL_ENUMERATED | Códigos de participantes/produtos vinculados aos registros usados e escopo de origem | Chave sem cadastro ≠ cadastro inexistente no universo |
| \`C100\` modelo 55 | DESIGN_V1_TARGET | Campos e chave por \`IND_OPER, IND_EMIT, COD_MOD, COD_SIT, UF, perfil, competência\` | Faltante em EFD coberta = exceção de conciliação, não irregularidade automática |
| \`C190\` | DESIGN_V1_TARGET | Registro analítico aplicável conforme tipo/estado de documento | Reconciliar agrupamento analítico por documento, sem duplicar itens |
| \`C170\` | **CONDITIONAL_NOT_ALWAYS_PRESENT** | Exceções do Guia por emissão própria, documentos complementares, regime especial, registros C176/C177/C180/C181 e UF | Emissão própria sem C170 pode ser válida; não exigir correspondência XML:item universal |
| \`C195/C197, C101, C110/C120, C185/C186\` | CONDITIONAL_DEPENDING_ON_UF_AND_CONTEXT | Aprovação do escopo/UF/campo/regra | Ausência pode ser legítima segundo data e caso |
| Registros de encerramento/contagem (por bloco aplicável) | DESIGN_V1_TARGET | Validação de integridade, quantidade e fechamento de arquivo por contrato | Arquivo truncado não gera “EFD com 0 documentos” |

**Matriz de regras obrigatória antes da implementação:** \`{ruleId, guideEdition, COD_VER, competencyInterval, uf, profile, IND_OPER, IND_EMIT, COD_MOD, COD_SIT, record, field, condition, sourceClause, expected, severity, outcomeIfUnsupported, reviewer}\`. Não implementar \`if hasC100 && !hasC170 => error\` como regra universal.

## B. Protheus FISA170 × TES — tax source resolver por cenário

**Fontes TOTVS:** [tabelas do Configurador FISA170](https://centraldeatendimento.totvs.com/hc/pt-br/articles/35314721022103-Cross-Segmento-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Quais-tabelas-fazem-parte-do-Configurador-de-Tributos), [como identificar origem do cálculo e IDTRIB](https://centraldeatendimento.totvs.com/hc/pt-br/articles/35357410638231-CROSS-Segmentos-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Como-confirmar-se-os-impostos-est%C3%A3o-sendo-gerados-pelo-Configurador-de-Tributos-ou-TES), [exemplo híbrido](https://centraldeatendimento.totvs.com/hc/pt-br/articles/36312155068823-CROSS-Segmentos-TOTVS-Backoffice-Linha-Protheus-FIS-Como-configurar-o-cClasstrib-410-para-opera%C3%A7%C3%B5es-Isentas-no-fisa170-forma-Hibrida).

| Fonte/semântica | Papel no contrato V1 | Cuidados |
|---|---|---|
| \`SX2/SX3/SIX\` | Dicionário técnico, campos, índices, regras de compartilhamento | Não afirmar um campo físico no cliente sem snapshot de release autorizado |
| \`SF4 / MATA080 (TES)\` | Configuração legada, integração, tipologia de operação | A função dos campos muda com o ciclo de migração e o release |
| \`F20, F21–F26\` | Perfis tributários por produto, participante, operação e origem/destino | Entidade/filial/compartilhamento e validade por release |
| \`F27/F28/F2B\` | Regras de base, alíquota e tributação | Não derivar alíquota sem regra e vigência oficialmente admitidas |
| \`F2C/F2D/F2E/...F2N\` | De/para, tributos calculados, regras de apuração e objetos pertinentes | Apenas tabelas necessárias ao cenário, não exigir inventário completo em todo piloto |
| \`CIN/CIO/CIQ...CJ0–CJL\` | Fórmulas, classificações e escriturações conforme módulo e uso | Dicionário/chaves/versionamento a mapear, sem assumir que toda tabela participa do cálculo |
| \`SD1.D1_IDTRIB\` | Indicador informado pela TOTVS na entrada | Não inferir 1:1 entre nota e tributo sem granularidade confirmada |
| \`SD2.D2_IDTRIB\` | Indicador informado pela TOTVS na saída | Separar item/doc/evento/estabelecimento |
| \`SFT.FT_IDTRIB\` | Campo indicador no Livro Fiscal | Conciliação com lançamento e granularidade; EFD não é SFT diretamente |
| \`SF1/SF2/SF3/SC5/SC6\` | Fontes de contexto documental/comercial que o artigo diferencia de IDTRIB | Não procurar IDTRIB em campos que a TOTVS informa não o conterem |

### Algoritmo semântico proposto — nunca assinar como regra universal

1. \`org, filial, release, period, taxType, operation, documentId, itemId\` identificam o contexto.
2. Procurar snapshot de dicionário, perfil, configuração e origem de cálculo com suas versões; **se faltar, \`UNKNOWN_SOURCE\`/HOLD**.
3. \`IDTRIB\` pode sustentar hipótese de cálculo pelo Configurador segundo a TOTVS, mas deve ser interpretado pela operação, integração e campo correto. **Ausência não é prova automática de cálculo por TES** em snapshot incompleto.
4. Avaliar por tributo a combinação de TES, configuração vigente, perfil e eventual fallback quando não houver enquadramento de perfis. Um exemplo híbrido não prova que todas as operações sempre usam TES para ICMS e FISA170 para IBS/CBS.
5. Produzir \`TAX_SOURCE_CONFIRMED\` somente com trilha suficiente; caso contrário \`TAX_SOURCE_CANDIDATE\` / \`INSUFFICIENT_DATA\`. **Não recalcular imposto sem regra substantiva homologada.**
6. Guardar os documentos de configuração, tabelas e campos utilizados como referências/hashes verificáveis. Tratar release 12.1.2210/2510/2610 conforme capacidade oficialmente suportada e aplicação no cliente, não apenas versão textual.

## C. NF-e modelo 55 — validade e fato fiscal

- Proveniência: XML original, hash, fonte/canal, namespace/versão, chave de acesso, eventos e situação informada, data, estabelecimento/participante.
- \`XML_SCHEMA_VALID\` não implica assinatura fiscal válida; \`DOCUMENT_AUTHORIZED\` exige fonte de autorização e evidência correspondente (indisponível para fixture puramente sintética).
- Campos numéricos como decimal exato; chave de 44 dígitos como string e DV checado por oráculo independente.
- Um documento pode aparecer em diversas fontes, inclusive EFD e ERP, com granulações/temporalidades diferentes; nunca comparar totais de linhas após expansão N:M sem preservar lado e unidade.

## D. Três roteiros de valor V1 candidatos (todos NOT_RUN)

| ID | Procedimento | Cobre | Aceite de desenho |
|---|---|---|---|
| PROC-V1-01 | NF-e modelo 55 XML × EFD ICMS/IPI | Chave/status/competência, C100+C190 e C170 condicional | Ao menos uma NF-e própria válida sem C170 não gera falso erro; documento ausente identifica falta **no universo disponível**, não inexistência |
| PROC-V1-02 | NF-e × Protheus snapshot TES/FISA170 | Chaves e status, tax source IDTRIB se comprovado, perfil e release | Resultados de fonte de cálculo ficam CONFIRMED/CANDIDATE/UNKNOWN com proveniência; sem inferência a partir de campo ausente |
| PROC-V1-03 | EFD × Protheus × evidência/trabalho | Documentos por período, cobertura por lado, duplicidade, N:M, export e revisão | Somatório não duplica, incompletude bloqueia e workpaper reabre/reexecuta com mesmo hash semântico |

**Decisão pendente do dono fiscal:** se a expressão “auditor fiscal V1” for usada comercialmente com sentido de **validação tributária substantiva**, é necessário aprovar ao menos um procedimento jurídico de tributação contextualizado e testado separadamente; caso contrário apresentar-se estritamente como “auditor técnico de cruzamentos fiscais em piloto”.

## E. O que NÃO mudou

Todos os demais DF-e, ERP live, motor tributário completo, RTC material, créditos, DARF, retificação, IA, Bloco K completo e orquestração continuam pós-V1. Os 22 módulos permanecem **13 mínimos, 5 limitados, 4 posteriores**, mas a semântica do subset e dos critérios de aceite será proposta em revisão do escopo \`rc.1\`, não silenciosamente alterada nesta PR.

**Status:** apenas contratos candidatos; no tests executed, no runtime/DDL/API/UI changed, no fiscal approval.
