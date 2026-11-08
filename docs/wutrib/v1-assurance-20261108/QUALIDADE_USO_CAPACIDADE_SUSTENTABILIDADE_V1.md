---
document_id: WUTRIB-V1-ASSURANCE-QUAL-001
version: 0.1.0
state: DRAFT_QUALITY_MEASURES
baseline: 1.0.0-rc.0
approved_by: NONE
---

# Qualidade ISO/IEC 25010:2023, qualidade em uso e dimensionamento da V1

**Fonte primária de edição/estrutura:** [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) (nove características), [ISO/IEC 25019:2023](https://www.iso.org/standard/78177.html) e [ISO/IEC 25040:2024](https://www.iso.org/standard/83467.html). O mapeamento abaixo é desenho de avaliação **proposto**, não transcrição de requisitos do texto completo nem avaliação executada.

## Nove atributos da ISO 25010:2023 aplicados ao WU-TRIB

| Característica | Exemplo de requisito mensurável candidato | Indicador/prova futura | Estado |
|---|---|---|---|
| Adequação funcional (functional suitability) | Extrator, Join, exceção e Workpaper produzem outputs corretos, inclusive em negativos e limites | Taxa de casos de prova independentes, por função/obrigação, cobertura de registros suportados | SEM_MEDIÇÃO |
| Eficiência de desempenho | Evitar explosão N:M, não ultrapassar orçamento por carga e não ocultar cortes de lote | Latência p50/p95/p99, throughput, RSS, CPU, arquivos/volume, tempo de exportação, erro sob stress | SEM_MEDIÇÃO |
| Compatibilidade | Importar leiautes versionados e exportar relatórios reproduzíveis, sem afetar outra aplicação | Matriz XSD/COD_VER/release/Firefox-Chrome-Edge/mobile/API; dados e schemas | SEM_MEDIÇÃO |
| Capacidade de interação (interaction capability) | Usuário compreende cobertura, status, limitações, filtros e diferenças, inclusive com leitores de tela | UAT por tarefa, taxa de erro, tempo, compreensibilidade, WCAG e satisfação | SEM_MEDIÇÃO |
| Confiabilidade (reliability) | Falha parcial não publica relatório concluído, idempotência mantém resultado em replay, restauração preserva evidência | Retries, recovery, RTO/RPO, idempotência, corruption/no-data versus empty-valid | SEM_MEDIÇÃO |
| Segurança (security) | Nenhuma ação/consulta fora de escopo org/filial/papel; credenciais e logs protegidos | ASVS 5, E2E Auth, RLS com testes negativos, secrets, proteção de upload/download e auditoria de acessos | SEM_MEDIÇÃO |
| Manutenibilidade (maintainability) | Regra/contrato versionado pode ser alterado com impacto rastreável e regressão independente | Dependency graph, mutation, análise de cobertura, ciclo change/rollback, traceability | SEM_MEDIÇÃO |
| Flexibilidade (flexibility) | Novos leiautes/regras são adicionados sem reescrever fatos históricos e sem quebra do consumidor | Versões backward-compatible, migração reversível, validação de schema/contract e novas origens | SEM_MEDIÇÃO |
| Segurança operacional (safety) | Falha, falta de norma, divergência de dicionário ou score incerto não gera decisão fiscal automática | Gatilhos BLOCKED/INCONCLUSIVE, simulação de falha, veto humano, zero auto-signoff fiscal | SEM_MEDIÇÃO |

**Atenção:** a edição 2023 substituiu classificações/denominações da estrutura de 2011. Para qualquer certificação/alegação de aderência ao padrão, consultar o texto completo licenciado e o esquema de medidas antes da avaliação.

## Qualidade em uso — ISO 25019:2023 e ergonomia

O contexto de uso deve ser explicitado: analista fiscal operacional, especialista tributário, especialista Protheus, gerente/revisor, QA e segurança, cada um com objetivo e alçada. A aprovação de uma interface por ser bonita não prova que o usuário consiga investigar a divergência corretamente.

Jornadas mínimas futuras com evidência observacional:
1. Importar um XML sintético e distinguir arquivo válido, incompleto e sem dados.
2. Importar EFD e interpretar corretamente ausência legítima de C170 em NF-e própria.
3. Criar join XML × EFD × ERP e identificar N:M antes de agregar.
4. Identificar a origem de cálculo tributário TES versus FISA170 em snapshot sintético documentado.
5. Distinguir erro técnico, exceção, hipótese fiscal e resultado inconclusivo.
6. Gerar pacote probatório, revisá-lo, exportá-lo por inteiro e reabri-lo sem apagar histórico.

Para avaliação de usabilidade e acessibilidade utilizar [ISO 9241-210:2019](https://www.iso.org/standard/77520.html), [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) e [WCAG-EM 2.0](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/), com revisão humana e tecnologias assistivas, além de ferramentas automatizadas.

## Capacidade máxima de processamento: plano e não número inventado

**Dimensões do teste:** tamanho de arquivo/bytes; registros físicos vs documentos/itens; usuários simultâneos; grau de concorrência; tipos de join; multiplicidade por chave; complexidade de filtro; exportações totais; número de origens; duração da retenção e recuperação. Separar o tempo de parse, normalização, join, agregação, storage, dashboard e download.

**Três regimes futuros:** carga nominal representativa, pico acordado com owner e stress/ruptura com cancelamento/quarentena segura. Medir p50/p95/p99, vazão, memória máxima, CPU, I/O, erros e retomada; comparar metas definidas **antes** dos ensaios. Um N:M de 1000×1000 pares potenciais deve ser estimado/bloqueado antes de executar, salvo orçamento e operação expressamente autorizados.

**Só depois de medições autorizadas** será possível definir capacidade máxima em unidade e contexto, por exemplo arquivos por lote e tamanho máximo por arquivo; dados sintéticos para benchmark, nunca carga destrutiva em SOT/produção.

## Sustentabilidade digital — SCI, metodologia

[ISO/IEC 21031:2024](https://www.iso.org/standard/86612.html) fornece metodologia de cálculo de intensidade. Proposta de unidade funcional: **1.000 documentos processados e auditados com evidência preservada**, especificando duração, CPU/energia, fator de carbono operacional e emissões incorporadas quando disponíveis, locais/infraestrutura e limites. Registros sem dados de energia ou fator confiável devem ser \`NOT_MEASURED\`, não \`PASS_ZERO_CARBON\`.

## Plano de avaliação e saídas exigidas

Por cada característica e cenário: \`requirementId, caseId, sourceVersion, environment, loadProfile, method, measurementUnit, expectedAcceptance, measuredResult, evidenceId, evaluator, limitations, residualRisk\`. O relatório de encerramento deve separar atributos com evidência de sucesso, falhas corrigidas/retestadas e o que não pôde ser medido. A aprovação é do dono do produto com revisão independente de QA, Segurança, Fiscal e Operações conforme escopo.

**Status de toda a matriz:** NOT_RUN, sem metas numéricas aprovadas, sem dados empresariais.
