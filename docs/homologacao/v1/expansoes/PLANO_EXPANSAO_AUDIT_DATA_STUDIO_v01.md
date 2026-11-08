---
document_id: WUTRIB-DOC-EXP-002
version: 0.1.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: PRODUCT_ARCHITECTURE
reviewer_role: FISCAL_SPECIALIST_AND_INTERNAL_AUDIT
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Estratégia de expansão — Audit Data Studio e Fiscal Audit Library

**Natureza:** DOCUMENTO DE EXPANSÃO, para estudo futuro. **Versão:** 0.1.0. **Execução, alteração de aplicação, banco, CI e deploy:** NÃO AUTORIZADAS. **Trilha:** WU-TRIB exclusivamente, independente de Calculadoras de Enfermagem. **Baselines:** WO-018 e plano de validadores v0.3.0; os 28 validadores são também planejamento, não software concluído.

## 1. Visão de produto e princípios

O WU-TRIB deve evoluir de uma demonstração XML×C100 para uma plataforma modular de análise, revisão e evidências fiscais. Não imitar interface e código dos concorrentes: aproveitar problemas profissionais identificados e criar interação própria, respeitando o Design System atual, acessibilidade e usabilidade.

**Três superfícies operacionais planejadas:**
1. **Audit Data Studio** — operação reutilizável sobre dados de qualquer origem autorizada: Extract → Profile → Normalize → Join → Select → Sample → Exceptions/Anomalies → Evidence.
2. **Fiscal Audit Library** — procedures por obrigação, exercício, UF, filial, tributo, regra, regime e release do ERP: EFD, NF-e, TES/FISA170, SPED e conciliações cruzadas.
3. **Audit Governance & Review** — WO, RCM, evidências, papel de trabalho, decisão técnica por pessoa habilitada, sign-off, trilha de mudanças, scheduler e reporting.

Essas superfícies são uma organização funcional, não uma ordem obrigatória em todas as jornadas. Um usuário pode começar por um procedimento fiscal já configurado ou montar um plano analítico do zero.

### Invariantes obrigatórias
- Leitura das fontes originais preferencialmente **somente leitura**, com hash e snapshot, sem editar arquivo SPED/ERP no ingresso.
- O mesmo dataset com os mesmos contratos, regras e parâmetros deve produzir o mesmo resultado semântico, independentemente de UI, timestamp ou executor.
- Conclusão de controle e conclusão fiscal são distintas: \`fiscalConformity=NOT_EVALUATED\` até parecer autorizado, e \`approved_by\` nunca preenchido por script.
- A ausência de norma, snapshot, mapeamento, credencial, população ou critérios gera BLOCKED/HOLD; **nunca PASS com resultado vazio**.
- Toda operação exige contexto de organização, CNPJ/filial, período, competência, leiaute, origem e autorização; nenhuma junção entre empresas por padrão.
- Faixas de importação, cardinalidade de join, custo da operação, duplicatas e exclusões precisam ser visíveis antes da execução.
- Operações preparatórias não se confundem com **regras legais** nem com autorização de aproveitar créditos, retificar obrigação ou publicar laudo.

## 2. Arquitetura candidata (sem tecnologia imposta)

\`\`\`text
WO / Risk / Scope / Environment authorization
               │
Source Registry ├─> Authorized Extractor → Immutable Artifacts → Profile / Quality Gate
               │                                               │
Field Dictionary ─> Typed Normalizer / Master Data Snapshots ──┤
                                                               ▼
                   Join + Match + Select / Filter + Sample + Stratify
                                                               │
           ┌───────────────────────────────────────────────────┴──────────────────┐
           ▼                                                                      ▼
   Deterministic analytical engines                                  Fiscal rule/library engines
   Error/Gap/Duplicate/Anomaly/Trend                             Layout, ERP, Tax, Temporal Rules
           └───────────────────────────────────────────────────┬──────────────────┘
                                                               ▼
                          Evidence Graph + Casefile + Risk + Human Review
                                                               │
                                           Reporting / Audit Procedures / Observability
\`\`\`

**Contratos transversais:** idempotência, schema versionado, provenance, data classifications, RCM/WO traceability, timestamps separadamente do digest semântico, access control, resource budgeting, decimal precision, accessibility and sustainability. O metamodelo físico é um insumo; ele não fornece sozinho semântica de negócio.

## 3. Funcionalidades prioritárias detalhadas

### 3.1 Extractor — coleta, integridade e dados mestres (EXP-001)

**Objetivo:** transformar dados autorizados em cópias imutáveis e tipadas para análise. **Origens candidatas:** XML NF-e, EFD ICMS/IPI, CSV/XLSX, razão contábil, relatórios ERP, snapshots autorizados de SX2/SX3/SIX, SF1/SF2/SF3/SFT/SF4/FISA170, master data SA1/SA2/SB1 e outros correlatos; cada origem exige contrato e verificação de escopo.

**Processo futuro:** identidade do cliente/filial → perfil de dados → tipo de fonte → permissão de captura → validação de estrutura → manifestação de contagem/bytes/hash → snapshot → perfilamento → quarentena de dados incompletos ou sem versão. O extractor não deve inferir um campo de ERP pela mera semelhança de nome.

**Falhas previstas:** arquivos faltantes, layout misto, encoding inválido, dados parcialmente carregados, delimitadores, repetição de arquivos, dados fora do período, alteração de colunas, indisponibilidade de origem ou assinatura inválida.

### 3.2 Join Studio — cruzamentos sem perda de confiabilidade (EXP-004)

Suportar em versões futuras: **INNER, LEFT, RIGHT, FULL, LEFT/RIGHT ANTI, SEMI**, chaves compostas, joins temporais por vigência e múltiplas entradas para procedimentos específicos. A documentação do Microsoft Power Query confirma tipos de junção e seleção de chaves; isso é referência conceitual, não fonte de código.

**Antes do join:** tipo/normalização das chaves, percentual de nulos, número de distintas, cardinalidade esperada (1:1, 1:N, N:M), cobertura, exclusões e estimativa de linhas resultantes. Para números fiscais, o valor e sua natureza econômica devem permanecer em campos controlados; **somar valores de um N:M sem regra de alocação é proibido por padrão**.

**Depois do join:** reconciliação de contagens, anti-joins de órfãos, múltiplos matches, totais por lado, preservação de IDs de linha, fonte e campo, tempo e custo. Fuzzy matching pode gerar sugestão de identidade, mas **não** uma correspondência fiscal automática homologada.

**Exemplo candidato:** NF-e XML → EFD C100/C170 → SFT/SF1/SF2 → razão contábil, com diferenças por data, filial e exceções de cancelamento/retificação tratadas em regra própria. O significado do lançamento em cada tabela deve vir do contrato ERP validado.

### 3.3 Selection Builder — não confundir filtro com amostragem (EXP-005 e EXP-007)

Três operações conceitualmente independentes: (a) **filtros analíticos** por campo, faixa, período, chave, nulidade e condição composta; (b) **seleção dirigida por risco**, por exemplo alto valor, alteração de regra ou documento fora da sequência; (c) **amostra estatística**, conforme população, método, semente, probabilidade/estratos e oráculo. Uma seleção dirigida não deve sustentar inferência estatística à população sem método apropriado.

**Métodos candidatos:** análise integral 100%, seleção por valor/risco, aleatória simples, sistemática, estratificada, intervalos monetários/MUS e unidades específicas. Especificar tamanho/limites e avaliar risco amostral e não amostral. A NBC TA 530 é uma referência metodológica para auditoria independente e sua aplicação à revisão fiscal privada requer justificativa profissional.

### 3.4 Error / Exception Engine (EXP-010)

Não concentrar todas as ocorrências no mesmo status “Erro”. A ontologia de eventos proposta contém:
- **SOURCE_ERROR** — arquivo, bytes, codec, truncamento, origem indisponível;
- **STRUCTURE_ERROR** — schema, campo, tipo, linha obrigatória, relacionamento;
- **DATA_QUALITY_ISSUE** — duplicidade, campo faltante, cadastro incoerente, drift;
- **ARITHMETIC_MISMATCH** — total/base/cálculo divergente com oráculo comprovado;
- **CROSS_SOURCE_EXCEPTION** — documento em uma origem e ausente em outra;
- **TEMPORAL_CHANGE_CANDIDATE** — variação de classificação/alíquota/parâmetro entre períodos;
- **RULE_CONFLICT_OR_MISSING_SOURCE** — norma/vigência/versão ambígua, deve BLOQUEAR inferência fiscal;
- **ANOMALY_SIGNAL** — padrão incomum, sem confirmação de irregularidade;
- **AUTHORIZED_EXCEPTION** — exceção explicada com origem e revisor;
- **ENGINE_ERROR** — falha de execução, permissão, timeout ou recursos.

Cada evento possui objeto afetado, fonte, id de regra, período, campo, valor esperado/observado se houver, severidade proposta, fundamentação, reprodutibilidade, status de causa (confirmada/suspeita/não conhecida), impacto e revisão. Ausência de arquivo não equivale a arquivo sem registros.

### 3.5 Anomaly Identification Engine (EXP-011)

Começar por métodos explicáveis: IQR, desvio absoluto mediano, comparação a pares de mesma UF/regime/CFOP/NCM, sazonalidade e mudanças abruptas. Possível avaliação posterior de ML com consentimento e governança ISO/IEC 42001/NIST AI RMF quando IA estiver de fato incorporada.

**Sinais potenciais:** alíquota efetiva excepcional, grupo de produtos com NCM irregular em relação a pares, spike de ajustes de débito/crédito, documentos de valores repetidos, lançamentos fora do horário normal, sequências incomuns, crescimento de itens sem XML, salto de montantes após alteração de TES.

**Nunca deduzir ilegalidade de score.** O diagnóstico deve explicar variável, base comparável, intervalo, fórmula, fonte, volume observado, cobertura e limitações. A revisão humana realimenta métricas de falsos positivos e altera thresholds somente via mudança versionada.

### 3.6 Temporal Tax Intelligence — variação entre competências (EXP-012/015)

Não basta comparar “alíquota do mês A com B”: podem ter mudado **mix de produtos, natureza de operação, base de cálculo, regime tributário, regras por UF, descontos, retornos, câmbio, parâmetro ERP, vigência de norma ou qualidade do arquivo**.

A comparação deverá oferecer no mínimo:
- **DELTA_OBSERVED** — diferença medida de valor, taxa, código ou configuração entre snapshots.
- **DELTA_SOURCE** — mudança na documentação/versão fiscal externa, comprovada por origem e data.
- **DELTA_CONFIG** — mudança capturada em parâmetros SX6/SF4/FISA170/release ERP autorizado.
- **DELTA_BUSINESS** — alteração operacional (preço, volume, produto, destino, mix).
- **DELTA_DATAQUALITY** — diferença decorrente de cobertura, duplicidade, erro de dimensão ou fonte.
- **DELTA_UNEXPLAINED** — diferença não atribuível com evidência suficiente.

Regra de negócio: a plataforma só pode exibir “mudança legislativa confirmada” quando (i) a fonte normativa aplicável for validada e versionada, (ii) o evento e o contribuinte forem abrangidos, e (iii) houver revisão fiscal humana. Do contrário, usar “mudança observada de tributação/configuração — causa a investigar”. Por padrão, \`fiscalConformity=NOT_EVALUATED\`.

## 4. Família de rotinas analíticas complementares

As 22 capacidades estão no [catálogo](CATALOGO_MOTORES_ANALITICOS.v01.json). Além dos módulos detalhados acima: perfil de dados, normalização, master data, duplicidades e gaps, estratificação, materialidade, conciliação multiorigem e contábil/estoque, inspeção de parâmetros, validação de leiautes/regras, simulação controlada de hipóteses, oportunidades de crédito como **candidatos**, workpapers, fila de investigação, agendamento e relatórios.

Toda rotinização deve permitir inspeção de entradas/saídas e persistir a cadeia de transformação por ID de operação, versão, regra, dados, fonte, tempo, hash e responsável. A exportação não pode limitar o conjunto de dados ao que está visível na página.

## 5. Jornada de usuário futura — sem copiar UI de fornecedor

**Caminho A — investigação livre:** escolher fontes e versão → prévia de perfis/cobertura → selecionar operação (join, extractor, filter...) → simular cardinalidade e custo → validar parâmetros → executar em sandbox autorizado → explorar exceções → criar papel de trabalho e revisão.

**Caminho B — procedimento fiscal guiado:** selecionar obrigação/tribo/UF/período → apresentar regras oficiais aplicáveis e restrições → conferir fontes obrigatórias → executar o procedimento validado → agrupar achados por risco/chave → revisar causas, soluções e evidências → emitir parecer com assinatura humana.

**Caminho C — monitoramento:** selecionar rotina previamente homologada → janela e fontes → diferença entre períodos → notificação de exceção e tendência → abrir investigação → reprocessar controladamente com nova baseline.

**Experiência mínima para todos os caminhos:** breadcrumbs, filtros e tabelas acessíveis, paginação/virtualização, busca, explicações em contexto, estados de carga/erro/sem dados diferenciados, salvamento de rascunhos, seleção em massa com confirmação e relatórios legíveis. Manter as cores, tipografia e hierarquia do design system aprovado; nenhuma interface nova é desenhada/implantada nesta fase.

## 6. Requisitos de contratos por módulo

Cada engine, antes de implementação, deve ter schema versionado e metamodelo:
- \`engine_id\`, \`engine_version\`, \`contract_version\`, \`wo_id\`, \`procedure_id\` e \`run_id\`;
- \`organization_id\`, \`source_artifact_id\`, \`snapshot_id\`, \`period\`, \`erp_release\`, \`normative_version\` quando aplicáveis;
- entradas tipadas, \`input_hash\`, domínio de permissão, classificação LGPD, política de retenção e limite de processamento;
- parâmetros e transformação, cardinalidade esperada, oráculo, thresholds, estado \`PASS|FAIL|BLOCKED|ERROR|NOT_RUN\`;
- saída com linhas afetadas, origens, validações, falhas, métricas, trilha, \`fiscalConformity=NOT_EVALUATED\`, sem autoaprovação;
- consumidores autorizados, compatibilidade retroativa, idempotência, timeout, cancelamento e \`replay\` com ambiente/metadados congelados.

O desenvolvimento futuro deve reusar o plano de validadores v0.3.0, inclusive seus testes positivos, negativos, metamórficos e independência de oráculos. Engine de operação não precisa ser outro validador distinto se seu contrato for uma função de transformação; a validação da transformação é uma tarefa separada. Não duplicar engines em nomes diferentes por cada conciliação fiscal.

## 7. Plano de pesquisa empírica futura

Antes de priorizar implementação, verificar com usuários reais:
- quais análises são mais frequentes e têm maior custo de trabalho manual;
- quais arquivos/exportações o Protheus pode oferecer por release e com que restrições;
- cardinalidades e chaves reais dos cruzamentos, inclusive compartilhamento de tabelas;
- problemas de reconciliação entre documentos, estoque, ERP e contabilidade;
- quais variações de tributo são classificadas como erro, mudança legítima ou pendência;
- métricas de adequação funcional, eficácia/eficiência/satisfação, qualidade das evidências e tempo por execução.

**Não prometer 'milhares de regras' como objetivo.** Preferir poucas rotinas de alto risco plenamente testadas a um catálogo volumoso sem fontes, vigência e controles.

## 8. Sequência de expansão proposta (gates futuros)

| Onda | Escopo | Saída de planejamento | Bloqueio para execução |
|---|---|---|---|
| EXP-0 | Catálogo e benchmark | Hipóteses e priorização de 22 capacidades | Aprovar escopo, evitar sobreposição com 28 validadores |
| EXP-1 | Contratos, fontes, metamodelo e master data | Modelo de dados e entradas suportadas, corpus | Sem mapeamento real, não habilitar ERP |
| EXP-2 | Extrator, Profile, Normalizer, Join e Filter | Studio de dados fundamental, testes de integridade | Oráculos e isolamento, dados sintéticos |
| EXP-3 | Amostragem, duplicidade, exceção, anomalias | Biblioteca analítica explicável | Independência do método e teste de falsos positivos/negativos |
| EXP-4 | Comparação temporal e fiscais por vigência | Alterações de parâmetro/norma/negócio separadas | Fontes normativas, ERP/UF, revisão fiscal |
| EXP-5 | Composição, evidência e relatórios | Fluxos auditáveis e UX consistente | UAT, WCAG manual e controle por função |
| EXP-6 | Conformidade/segurança/capacidade | Parecer e decisões Go/No-Go | Aprovação humana, sem execução automática |

Não constituem uma promessa de cronograma ou custo. Falhas de dados, origem ou autoridade normativa exigem HOLD, não aceleração de release.

## 9. Decisão documental e exclusões explícitas

**Status atual:** DRAFT / WORKSCOPE PROPOSAL. Nenhum dos 22 módulos foi criado, testado, integrado ou implantado pelo presente documento. Os 50 templates previamente registrados, o plano de 28 validadores, a WO-018 e as versões em Vercel/Supabase permanecem inalterados em termos funcionais. A proposta pode ser revisada sem mutações na ferramenta.

**Próxima decisão futura:** homologar catálogo de capacidades, dependências, drivers de custo, prioridade por risco e contratos antes de abrir tarefas de engenharia. Esta proposta não permite alterações em produção, uso fiscal real ou processamento de dados da empresa.
