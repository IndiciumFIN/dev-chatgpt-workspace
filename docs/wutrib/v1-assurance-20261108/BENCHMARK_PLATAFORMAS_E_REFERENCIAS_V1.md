---
document_id: WUTRIB-V1-ASSURANCE-MARKET-001
version: 0.1.0
state: DRAFT_VENDOR_CAPABILITY_COMPARISON
baseline: WUTRIB-V1-1.0.0-rc.0
approved_by: NONE
product_testing_performed: false
---

# Benchmark funcional da V1 versus plataformas similares e referências

**Método:** confronto entre capacidades divulgadas em páginas oficiais dos fornecedores (não auditoria independente), arquitetura alvo V1/PR48 e critérios de teste futuros. **Não há score percentual de paridade**, pois os fornecedores não foram instalados, testados sob a mesma massa nem comparados por número/edição real de regras; um número comercial de regras não é métrica de precisão.

## Matriz comparativa de função e aprendizado

| Plataforma e fonte primária | Capacidades documentadas pelo próprio fornecedor | V1 do WU-TRIB | Gap para o objetivo delimitado e decisão |
|---|---|---|---|
| [Thomson Reuters ONESOURCE Tax Analyser](https://www.thomsonreuters.com.br/pt/marketplace/onesourcetaxanalyser.html) | Auditorias SPED com fundamentação legal e identificação de inconsistências/créditos | Incidência do módulo validador 014 restringida à estrutura/crosscheck | **P0:** oferecer ao menos 1–3 procedimentos de referência com regra, vigência e interpretação formalmente aprovadas, ou chamar produto apenas “reconciliador técnico fiscal” |
| [Sovos Taxverify Cloud](https://sovos.com/pt-br/tributos/produtos/auditoria-digital-obrigacoes-taxverify-cloud/) | Cruza obrigações, atribui nota, classifica risco, apresenta base legal e evolução por períodos; afirma >6.000 regras | 30 grupos futuros e engine estrutural; scoring limitado | **P1:** criticidade transparente, causa, alçada e denominador de cobertura; não copiar nota A–F sem metodologia e sem caso validado |
| [e-Auditoria](https://www.e-auditoria.com.br/solucoes/para-auditar-arquivos/) | Distingue auditoria estrutural, cruzamentos, riscos, oportunidades e laudo; decisão técnica pelo contador | Classificador 010 e workflow 019; simulação/crédito deferidos | **P0:** distinguir classe de achado técnico, suspeita fiscal, risco, inconclusivo e explicação por fonte; não apresentar laudo fiscal automático |
| [Avalara — ciclo de compliance](https://www.avalara.com/br/pt/solucoes/solucao-de-conformidade-compliance.html) | Separa AvaTax, TaxDocs, Tax Compliance e Tax Central, integra ERPs e mantém versões legais; divulga >150 validações | Cinco ledgers lógicos, sem transmissão e apuração V1 | **ALINHADO** na separação de domínios; manter apuração/obrigações/transmissão fora de V1, como decisão consciente |
| [Systax APIs e Tax Validator](https://documentacao.systax.com.br/books/manual-do-tax-validator-reforma-tributaria/page/introducao) | Regras versionadas por cenário, motor independente, diferenças por tributo, tax validation | V1 inclui regras como entidades, sem cálculo substantivo geral | **P0:** contrato \`RuleApplicability\` e \`TaxSourceResolver\` completo; recálculo material apenas regras autorizadas |
| [TOTVS — FISA170](https://centraldeatendimento.totvs.com/hc/pt-br/articles/35357410638231-CROSS-Segmentos-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Como-confirmar-se-os-impostos-est%C3%A3o-sendo-gerados-pelo-Configurador-de-Tributos-ou-TES) | Dois motores legados/configurador, perfis de regras, IDTRIB em SD1/SD2/SFT e fallback contextual | Protheus é foco explícito da V1 | **P0:** matriz fiscal de origem por tributo/release/estabelecimento, inclusive falsos matches e casos sem IDTRIB; referenciar F20–F2N/Cxx |
| [Caseware IDEA](https://www.caseware.com/products/idea/) | Perfilamento, teste de população completa, gaps/duplicados, execução reproduzível, histórico, dashboards e agendamentos | Extrator, profiler, Join, gaps e evidências V1; scheduler pós-V1 | **P0:** replay semântico de toda operação e auditoria de linhagem, não apenas visualização de exceções; manter scheduler fora do lançamento |
| [Diligent ACL Analytics](https://www.diligent.com/gb/products/acl-analytics) | Analítica de populações, scripts, automação periódica, evidências, trilha de testes e investigação | Contratos/versionamento, revisão e workpapers ainda não executáveis | **P1:** biblioteca de procedimentos auditáveis, repetibilidade e rastreio por seleção, filtro, commit, fonte e evidência; automação recorrente depois |
| [Microsoft Power Query](https://learn.microsoft.com/en-us/power-query/merge-queries-overview) | INNER, OUTER, ANTI, várias colunas e fuzzy para texto | Join Studio 004 especifica 1:1, 1:N, N:M e tolerância | **ALINHADO**, mas adicionar oráculo de contagem por lado, preview de chave, estimativa de multiplicação e bloqueio de soma N:M, sem cópia da UI |
| [Qive](https://www.qive.com.br/) | Arquitetura de referência para captura/gestão de documentos e integrações de DF-e | V1 arquivo sintético, sem captura SEFAZ | **POST-V1** captura live por certificado/API e gestão empresarial; manter metadados e idempotência agora |
| [ASIS Kolossus Auditor](https://asisprojetos.com.br/) | Referência de UI/crosschecks informada pelo usuário, sem teste independente neste turno | Studio modular e fila de exceções própria | **P1:** apresentar navegação orientada a tarefas, drill-down, dados e evidências; não copiar visual/fluxos protegidos |
| [ROIT / Dootax / consultorias](https://www.e-auditoria.com.br/solucoes/) | Serviços/automação operacional discutidos nos relatórios R1/R2 | Execução assistida, sem integração financeiro/obrigação | **POST-V1** emissão, pagamentos, RPA de portais, BPO ou serviços profissionais |

## Separação de categorias — não exigir equivalência indevida

1. **Auditor fiscal digital**: verificação de estrutura/crosscheck e inconformidades investigáveis. Para ter valor fiscal real além de um protótipo, deve exibir a fonte/limite da regra e pelo menos um percurso de investigação end-to-end.
2. **Tax engine**: determinação tributária substantiva e manutenção de conteúdo. É outra categoria; a V1 não necessita cobrir 27 UFs, mas deve permitir tax rule versioning e direitos/licença de corpus.
3. **Compliance operacional**: emissão/retificação/guia, apuração e transmissão. Propositalmente posterior.
4. **Analytics**: Join, seleção, duplicatas, amostragem e explicabilidade. É núcleo do Studio, mas **não prova** correção fiscal.
5. **Governança de auditoria**: caso, evidência, alçada, revisão, reprocessamento, histórico e aceitação. É requisito de V1, não decoração.

## Padrões de excelência que devem ser observados ao testar o WU-TRIB

- **Repetibilidade:** execução retorna mesmo resultado semântico com o mesmo corpus, versão/inputs, parâmetros e método, preservando os envelopes de data e operação.
- **Cobertura transparente:** exibir registros/condições suportados e não suportados; “0 alertas” apenas no universo verificado, nunca em qualquer obrigação.
- **Drill-down reversível:** do KPI a origens, linha/documento, regra, método e parecer.
- **Exceções explicáveis:** distinguir erro estrutural, divergência cruzada, evento temporal, insuficiência de dados, hipótese e falha de serviço.
- **Operações de lote seguras:** filtros, seleções, exportação integral, decisão de criticidade, reabertura e logs; aprovações fiscais exigem alçada.
- **Interoperabilidade:** schema/API de dados/operador e formato exportável, sem lock-in a um ETL específico.

**Limitação:** cada plataforma descreve funções do produto/portfólio, não sua eficácia observada. Nem as APIs, telas, desempenho, licenças e versões de clientes foram objeto de teste. Benchmarks quantitativos só após massa representativa, critérios iguais e autorização.
