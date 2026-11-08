# WU-TRIB | Auditoria estrutural, semântica, técnica e de capacidade — 08/11/2026

**Natureza:** auditoria de diagnóstico READ_ONLY dos ambientes funcionais e medições sintéticas em GitHub Actions. **Revisão:** AUD-017 v1.0. **Status:** achados técnicos, sem homologação fiscal, de segurança, acessibilidade ou capacidade máxima. **WO:** WUTRIB-WO-PLAN-017 (planejamento). **Classificação:** evidência observada (FATO), dedução técnica (INFERÊNCIA), limitação conhecida (HOLD) e recomendação (AÇÃO).

## Escopo, fontes e rastreabilidade

- Escopo de código: IndiciumFIN/dev-chatgpt-workspace, base congelada b7dfb188492c3158fe3f7197c982f95b1ddf2384, branch audit-only wutrib/audit-integral-20261108. Os testes do motor importam diretamente src/audit.js sem modificar a candidata; sem merge na main.
- Banco: projeto Supabase SOT-10-09-2026 ref hcqukuotfwflmebjygam, somente esquema privado wutrib e metadados catalogais. Nenhuma carga no banco, nem alteração de seus dados de negócio nesta auditoria.
- Vercel: projeto wutrib-auditor-web-piloto prj_4zZyQbGjECksrY1ZM1sqn33Th4VE. Produção pública permanece na v0.3; preview v0.4.2 dpl_3yGmVxYAX8k7UQkdBMLDjRi4P1VF READY, target=null e sem segredos configurados. HTTP da API fail-closed 503 no gate.
- Testes funcionais 65/65 Node (candidata) e 16 checks Chromium desktop/mobile (auditoria). A execução real da UI autorizada por Supabase Auth, serviço HTTP autenticado e dados corporativos NÃO foi testada.
- Benchmarks sem conexão externa: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42494850708 e https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42495435692 .
- UX e axe WCAG: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42495435546 . O teste varre seis telas em dois viewports. Axe automatiza apenas parte da WCAG.
- Referências públicas: SPED Guia Prático EFD ICMS/IPI 3.2.4 (10/09/2026) https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/nova-versao-do-guia-pratico-da-efd-icms-ipi-2 ; TOTVS FISA170 catálogo de tabelas https://centraldeatendimento.totvs.com/hc/pt-br/articles/35314721022103-Cross-Segmento-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Quais-tabelas-fazem-parte-do-Configurador-de-Tributos ; FISA170 híbrido https://centraldeatendimento.totvs.com/hc/pt-br/articles/36312155068823-CROSS-Segmentos-TOTVS-Backoffice-Linha-Protheus-FIS-Como-configurar-o-cClasstrib-410-para-opera%C3%A7%C3%B5es-Isentas-no-fisa170-forma-Hibrida ; WCAG 2.2 https://www.w3.org/TR/WCAG22/ .

## 1. Banco estrutural — inventário efetivamente existente

**FATO:** pg_catalog do esquema wutrib retorna **41 tabelas, 333 colunas, 66 FKs, 107 CHECKs, 128 índices, 41/41 RLS habilitado, 0 políticas RLS**, tamanho físico total ~3.272 KiB incluindo índices. RLS sem políticas restringe acesso direto neste desenho privado; NÃO é uma política de autorização por usuário para um futuro cliente. As APIs públicas wutrib_demo_* têm EXECUTE negado a anon/authenticated; sete RPCs públicas e duas funções privadas inspecionadas, todas SECURITY INVOKER, com permissões service_role restritas às novas rotas segmentadas ou ao gate.

**Subconjuntos conceituais (41 tabelas):**

- Governança/inventário (7): project_registry; legacy_snapshots; legacy_objects; project_documents; work_orders; wo_tasks; activity_log.
- Origens/ingestão/documentos (8): business_entities; source_systems; source_contracts; ingest_jobs; ingest_artifacts; fiscal_documents; fiscal_document_items; fiscal_tax_lines.
- Regras/normas/controles (7): normative_sources; audit_rules; audit_rule_versions; audit_rule_sources; business_processes; process_controls; control_test_results.
- Auditorias/evidências/grafo de rastreio (13): audit_runs; audit_run_inputs; audit_run_rule_versions; audit_run_events; audit_findings; investigations; review_decisions; audit_report_artifacts; finding_documents; finding_evidence; finding_trace_nodes; trace_nodes; trace_edges.
- Sandbox (6): demo_casefiles; demo_operator_rate_limits; demo_organizations_v1; demo_org_memberships_v1; demo_org_casefiles_v1; demo_org_audit_events_v1.

**Dados efetivamente verificados:** normative_sources=0; audit_rules=0; audit_rule_versions=0; audit_rule_sources=0; source_contracts=0; ingest_jobs=0; fiscal_documents=0; fiscal_document_items=0; fiscal_tax_lines=0; audit_runs=0; audit_findings=0; trace_nodes=0; trace_edges=0; business_entities=0; business_processes=0; process_controls=0. source_systems=3, todos CANDIDATE (NF-e XML, EFD ICMS/IPI e futura integração TOTVS); project_documents=14, todos DRAFT; work_orders=17; demo_casefiles=1 sintético legado; organizações e dossiês organizacionais novos=0. project_registry: PLANNING, rules_mode ADVISORY, isolation PRIVATE_SCHEMA.

**Separação importante:** legacy_objects=1.135 entradas de inventário histórico, principalmente colunas/índices/funções do SOT e da aplicação legada. Esses registros NÃO são 1.135 dicionários clínicos/fiscais validados nem dados operacionais WU-TRIB.

**Desempenho do banco:** Security Advisor informa INFO rls_enabled_no_policy (deliberado para privacidade) e WARN auth_leaked_password_protection (precisa revisão antes de autenticar usuários reais). Performance Advisor: 4 FKs sem índice cobridor: demo_casefiles_project_code_fkey, demo_casefiles_wo_code_fkey, demo_org_audit_events_v1_casefile_id_fkey, demo_org_casefiles_v1_org_code_actor_id_fkey. Outros 63 índices apontados como não utilizados; não eliminar sem tráfego significativo e EXPLAIN. Não houve stress test no PostgreSQL nem benchmark de concorrência de RPC, pois o ambiente não está autorizado para carga não sintética.

## 2. Metamodelos, dicionários e contratos

**FATO:** há um modelo relacional de origem, documento, item, imposto, regra, norma, WO, execução, finding, evidência e rastreabilidade. Isso é uma fundação útil. Entretanto, os registries normativo e de regras estão vazios; na árvore da branch auditada não foram encontrados pacotes formais de dicionário semântico, esquema JSON/SHACL/OWL, ontologia tributária, catálogo de campos Protheus ou mecanismo de resolução de vigência versão-referência. Materiais fora desta branch/SOT não foram examinados; não concluir ausência no ecossistema global.

**AÇÃO:** formalizar metamodelo versionado que relacione Entity → LegalEntity/Branch → SourceSystem → SourceContract → Artifact → Document → FiscalItem/TaxLine → RuleVersion → NormativeSource → Finding → Evidence → Investigation → WO → Decision → Release. Criar dicionários versionados por chave de negócio, código oficial, tipo, unidade monetária, escala decimal, natureza, nulidade, proveniência, vigência, transformações, direitos/licenças, classificação LGPD e testes. Definir JSON Schema para eventos e saídas; contratos de compatibilidade e migração; resolver regras por data de fato gerador, vigência e release do ERP, não por versão mais recente.

**FATO externo:** SPED divulgou Guia Prático EFD ICMS/IPI 3.2.4 em setembro/2026. A TOTVS lista, para FISA170, tabelas como F20 a F29 e outras do configurador; há orientação específica para modo híbrido TES + IBS/CBS no configurador. Nada disso está atualmente codificado como dicionário verificado ou regra executável WU-TRIB. Fontes externas são referências de requisitos; nenhuma conclusão tributária foi inferida delas.

## 3. Lógica fiscal e motor de cruzamento

**Escopo implementado:** src/audit.js faz parse parcial de infNFe XML e registros C100 EFD, chave de 44 dígitos, totais com arredondamento a duas casas, comparação determinística de chaves e diferença de valores com tolerância de R$ 0,01. Agrupa duplicidade, ausência e diferença. Bloqueia XML com DTD/ENTITY, limite de 2 MiB por XML e 4 MiB por TXT, entradas incompletas e advertências estruturais. Findings sempre fiscalConformity NOT_EVALUATED e causeStatus HYPOTHESIS_NOT_CONFIRMED. Há 65 testes Node e seis agentes de verificação; gates estáticos verificam presença de padrões, não equivalência fiscal.

**Limitações constatadas:** sem XSD oficial NF-e, sem dígito verificador da chave, sem vincular período de EFD ao XML, sem validar layout/registros EFD de encerramento ou integridade oficial, sem situação/retificação/eventos da NF-e, sem mapeamentos CFOP/CST/CSOSN/TES/FISA170/IBS/CBS por versão, sem conectores operacionais Protheus. O comparador é de estrutura e valores, não auditor tributário.
**Consistência de achados:** órfão C100 duplicado produz dois achados (DUPLICATE + MISSING_XML) por chave, comportamento coberto intencionalmente por teste. A interface deve agrupar evidências por chave para não confundir quantidade de eventos com quantidade de documentos divergentes. 
**Determinismo:** achados usam ID por chave completa, porém o identificador de execução LOCAL-Date.now e generatedAt variam mesmo com arquivos idênticos; ainda faltam hash de entrada e versão de contrato/regra para replay auditável.
**Segurança de ingestão:** browser usa DOMParser local, sem persistência. Conteúdo empresarial real está proibido. Futuros conectores deverão criar trilha de custódia e validação por versão do layout.

## 4. Segurança, autorização e operação

**FATO positivo:** preview v0.4.2 exige feature flag, token JWT verificado remotamente por Supabase Auth, organização ACTIVE, membership aprovado/ativo, papéis VIEWER/INVESTIGATOR, limite de 30 operações/minuto por ator-organização, dossiê sintético restrito e RPCs SECURITY INVOKER com service_role; permissões de RPC legadas sem escopo foram revogadas. Dados novos não são expostos diretamente a anon/authenticated. Sem segredos instalados no projeto Vercel e sem acesso HTTP autorizado em execução.
**HOLDs:** zero usuários e organizações aprovados; sem MFA/SSO/SLA de revogação demonstrados; WAF e mitigação de chamadas anônimas não verificados; retenção e rotação não homologadas; sem teste E2E HTTP autenticado, sem análise de picos/carga de auth, sem auditoria de exclusão e expurgo. O uso de service_role exige controles fortes de servidor.
**Risco de segregação:** coluna approved_by no vínculo é UUID e evidência textual; não foi verificada FK com aprovador nem regra que impeça autoaprovação ou assegure que ele tenha alçada. Não foi comprovado abuso no sistema atual desabilitado; isso é um risco de processo/implementação a fechar antes de ativar.
**Isolamento:** Vercel está em projeto próprio. GitHub permanece como branch dentro de IndiciumFIN/dev-chatgpt-workspace, e não repositório verdadeiramente separado. A main CE não foi modificada nesta auditoria.

## 5. UI/UX, acessibilidade e usabilidade

**Sucessos evidenciados:** Chromium real no CI passou 16 checks (8 desktop + 8 mobile) de interações, triagem efêmera, exportações, ausência de overflow horizontal, tratamento de XML/TXT inválidos, troca de lote e ausência de erros de JS. O UI tem seis telas e controles de navegação, filtros, foco visível e estados de menu, mas esses marcadores não comprovam WCAG.
**Axe-core com WCAG 2.2 A/AA** em seis telas e dois viewports encontrou violações automáticas sérias de contraste em TODAS as telas:

| Tela | Desktop: elementos com falha | Mobile: elementos com falha |
|---|---:|---:|
| Visão geral | 29 | 16 |
| Importar | 18 | 5 |
| Auditoria | 28 | 15 |
| Achados | 27 | 14 |
| Fontes | 16 | 3 |
| Governança | 25 | 12 |

Os números por tela se sobrepõem porque cabeçalho/sidebar são compartilhados; NÃO somá-los como número de defeitos únicos. Exemplos aferidos: texto #888888 em #ffffff = 3,54:1; #999999 em #ffffff = 2,84:1; #a0a0a0 em branco = 2,61:1; breadcrumb #929292 em branco = 3,11:1; texto #aaaaaa em #f2f2f2 = 2,07:1. Para texto pequeno normal o mínimo AA é 4,5:1. Existem resultados inconclusivos adicionais a revisar manualmente. Não afirmar conformidade antes de corrigir, reexecutar axe e testar teclado/leitores de tela.
**Desenho funcional:** a UI continua no modo DEMONSTRATION_CLIENT_ONLY, com anotações temporárias e sem console Auth. No futuro, login e dossiê por organização requerem IA de navegação, feedback de erro, confirmação de persistência, foco e permissões sem confundir eventos locais com decisões aprovadas.
**Escalabilidade UX:** renderFindings recria uma linha de tabela para cada finding, sem paginação ou virtualização. Medições no CI real, com dados fictícios e interceptação local de rede:

| Registros EFD | Tempo de atualização UI (uma amostra) | Linhas de tabela | Nós DOM | Heap JS |
|---:|---:|---:|---:|---:|
| 1.000 | 65,80 ms | 1.003 | 9.425 | 3,8 MiB |
| 10.000 | 301,62 ms | 10.003 | 90.425 | 11,5 MiB |
| 35.000 | 1.032,61 ms | 35.003 | 315.425 | 38,1 MiB |

Há risco de responsividade em dispositivos modestos ou uso continuado, mas não foi constatado travamento nesse runner. Necessárias paginação/virtualização e processamento incremental/worker, com testes após refatoração.

## 6. Testes de capacidade isolados — Node 22.23.4

Arquivo 35k C100 tem 3.488.901 bytes, abaixo de 4 MiB. Para cada tamanho de EFD, cinco amostras em GitHub Actions com --max-old-space-size=384, --expose-gc. Todos os achados e matches foram conferidos; geração CSV e limites também foram testados. Médias não foram calculadas: tabela contém MEDIANAS, não p95 robusto.

| C100 | Parse EFD mediana | Cruzamento mediana | CSV mediana | Máx RSS nas amostras |
|---:|---:|---:|---:|---:|
| 1.000 | 1,67 ms | 1,52 ms | 2,90 ms | 60,1 MiB |
| 10.000 | 11,74 ms | 12,61 ms | 24,53 ms | 108,8 MiB |
| 35.000 | 44,81 ms | 31,12 ms | 86,95 ms | 172,3 MiB |

Teste extra **somente engine em memória**, FORA dos limites de upload da UI: 120.000 C100 + 10 XML, 119.990 achados, 10 matches, 189,86 ms, 182,7 MiB RSS, 105,9 MiB heap. Não representa o processamento de 120.000 registros EFD via arquivo público. **Capacidade máxima homologada: DESCONHECIDA.** O que foi demonstrado é um limite inferior de capacidade testada do motor em runner sintético, não throughput de usuários/capacidade de produção.

**Limites codificados do piloto atual:** até 10 arquivos XML por lote, máx. 2 MiB cada, e um TXT EFD de até 4 MiB. Os limites de entrada não são SLAs de performance. Não foram testados 10 XML de 2 MiB no navegador, uploads reais, carga simultânea, throughput PostgreSQL, p95/p99 com dezenas de usuários, memória em dispositivos de baixa capacidade ou planos Vercel/Supabase sob pressão. São HOLDs de capacidade, e jamais devem ser simulados contra produção sem janela e autorização.

## 7. Matriz de achados priorizados

A criticidade é para a META de piloto controlado e futura prontidão fiscal, não uma afirmação de incidente ativo. Todos os achados têm causa e evidência delimitada.

| ID | Prioridade | Natureza | Constatação verificável | Ação e gate |
|---|---|---|---|---|
| AUD-017-01 | P0 | Lacuna | normative_sources, audit_rules e audit_rule_versions vazios | Carregar corpus oficial com hash, versão, vigência, regras rastreáveis e aprovação humana |
| AUD-017-02 | P0 | Lacuna | Leitor parcial C100/XML, sem XSD, chave DV, leiaute EFD completo ou validação fiscal | Homologar parser e testes por versão SPED/NF-e |
| AUD-017-03 | P0 | Lacuna | TOTVS Protheus e TES/FISA170 apenas planejados, sem mapping ou snapshot | Modelo híbrido por release, tabela/campo, vigência, testes controlados |
| AUD-017-04 | P0 | Lacuna | source_contracts, ingest_jobs e fiscal_documents = 0 | Contratos tipados, ingestão autorizada e provas de cadeia de custódia |
| AUD-017-05 | P1 | Estrutural | Nenhum pacote formal de metamodelo/dicionário auditável identificado na branch WU-TRIB | JSON Schema/ontologia/dicionário e compatibilidade de contratos |
| AUD-017-06 | P1 | Cobertura | trace_nodes/edges, audit_runs/findings em zero; trilha integral não exercitada | Testes de linhagem fonte→regra→achado→evidência→WO |
| AUD-017-07 | P1 | Segurança/fluxo | API real sem operador/organização; v0.4.2 bloqueada por flag e secrets | Provisionamento, E2E Auth, autorização por empresa e testes de revogação |
| AUD-017-08 | P1 | Governança | Código ainda no Git repo compartilhado; v0.4.2 é preview apenas | GitHub privado próprio, políticas de branch, CI/deploy próprios |
| AUD-017-09 | P1 | Segurança | WAF/MFA/retention não homologados; aviso de senha comprometida no Supabase | Controles operacionais e política aprovada antes de secrets |
| AUD-017-10 | P1 | Defeito comprovado | Axe aponta falhas sérias de contraste em 12 varreduras da UI | Correção CSS tokens, reexecutar WCAG A/AA e inspeção manual |
| AUD-017-11 | P1 | Risco de escala | 35k C100 produziram 315.425 nós DOM, sem virtualização | Paginação/virtualização, filtros incrementais e comparação de memória/latência |
| AUD-017-12 | P1 | Desempenho banco | Quatro FKs sem índice de cobertura (Advisor) | Migration indexada após revisão de EXPLAIN e autorização |
| AUD-017-13 | P1 | Lacuna de evidência | Sem stress PostgreSQL, múltiplas sessões HTTP ou p95/p99 confiáveis | Plano de carga isolado, quotas, SLO, teste autorizado por ondas |
| AUD-017-14 | P1 | Autorização/SoD | approved_by/evidence textual sem comprovação de alçada nem segregação | Revisão nominal, FK/serviço de aprovação e anti-self-approval |
| AUD-017-15 | P2 | Rastreabilidade | runId LOCAL-Date.now muda por execução; falta hash canônico de entradas | Run ID de negócio + hash, versões e replay auditável |
| AUD-017-16 | P2 | Governança editorial | 14 docs DRAFT; README 0.2.1, arquitetura 0.1, UI 0.3, API 0.4.2 | Manifest/ADR/release notes canônicos, sem alterar fatos históricos |
| AUD-017-17 | P2 | Experiência | Console empresarial autenticado e testes de UX com usuários ainda ausentes | Design e homologação HCD, autenticação e tarefas assistidas |
| AUD-017-18 | P2 | Interpretação | DUP C100 órfão causa duas evidências/achados por mesma chave por design | Agrupar evento/ocorrência e explicitar métricas de chaves distintas |

**Observação:** os 63 índices sem uso observado não são classificados como defeito nem devem ser removidos enquanto o banco não tiver carga real. O aviso INFO sem policy não equivale a vazamento; não se devem criar policies públicas genericamente.

## 8. Plano de ação e gates

### Wave A — Alta prioridade, sem tocar produção
- Resolver AUD-017-10 (contraste) com design tokens e varredura das 12 combinações; screenshots a 200% zoom/teclado e leitores de tela em amostragem.
- Resolver AUD-017-11 (virtualização de achados) preservando filtros, posição, seleção, acessibilidade e exportação de todos os dados.
- Preparar migration REVIEW_ONLY para quatro índices de FKs e revisão de alçadas; não aplicar sem revisão de impacto.

### Wave B — Semântica e estrutura
- Registrar fontes oficiais SPED/TOTVS por edição/vigência, hashes e procedência. Criar dicionários/protocolos e esquemas versionados, com negativas para versão errada e ambiguidade.
- Formar RCM do processo fiscal; vincular regras a fontes, entidade e vigência, sem permitir taxConformity APPROVED sem evidência e revisão.

### Wave C — Piloto autenticado e capacidade
- Criar repositório WU-TRIB totalmente independente, CI; aprovar operador e organização; implantar console; configurar acesso seguro e testar POST/GET na prévia.
- Criar ambiente de carga sintética autorizado de banco/API, sem service_role em cliente e sem tráfego em produção; testar resiliência, concurrency, p95/p99, rotas de falha, revogação e limites.

### Wave D — Segurança/homologação
- Parecer por agente de segurança/release e aprovador humano; somente depois promover o piloto sintético.
- Homologação de TES/FISA170, dados reais, regras tributárias e layouts oficiais permanecem ciclo e WO SEPARADOS, não são liberados por esta auditoria.

## Parecer

**ESTRUTURA DE BANCO: EXISTENTE, com lacunas operacionais.**
**MOTOR SINTÉTICO: FUNCIONAL nos testes controlados, não fiscalmente homologado.**
**UX: REPROVADA quanto ao contraste WCAG automatizado; demais controles requerem testes humanos.**
**CAPACIDADE: limite de teste alcançado sem falha no CI, capacidade máxima global NÃO ESTABELECIDA.**
**SEGURANÇA: candidato fail-closed, não pronto para usuários empresariais.**
**PARECER GLOBAL: HOLD para homologação, produção fiscal e habilitação da API.**

Nenhum desses achados representa evidência de falha no aplicativo Calculadoras de Enfermagem. O parecer cobre WU-TRIB na branch e no esquema indicados; não pretende representar exame exaustivo de todos os registros do SOT legado ou dos sistemas TOTVS da empresa.


---

## Adendo pós-auditoria — Wave 04.4 (08/11/2026)

Este adendo NÃO altera retroativamente as constatações da auditoria original. As evidências de remediação estão em docs/WAVE_044_REMEDIATION_EVIDENCE.md, no catálogo de 30 gates e nos workflows versionados.

- AUD-017-10: contraste corrigido na branch audit-only; varredura automática axe-core de 12 combinações de tela/viewport, **zero violações automatizadas**. Revisão manual WCAG, zoom e leitor de tela continuam HOLD.
- AUD-017-11: paginação de 50 achados preservando contagem, filtros, exportação de JSON com 1.003 findings e comandos de teclado; 35.000 C100 mantêm 852 nós DOM em Chromium. Capacidade máxima e testes em hardware modesto continuam HOLD.
- AUD-017-12: migration wutrib_demo_v043_fk_indexes_20261108 aplicada no Supabase SOT; quatro índices confirmados no catálogo; o Performance Advisor deixou de listar chaves estrangeiras sem índice. Sem benchmark de banco real.
- AUD-017-05: foram criados subconjunto físico de metamodelo (23 entidades, 25 FK) e dicionário de campo (22 campos, incluindo numeric(20,6) e numeric(16,8)); semântica legal, normativa e Protheus continuam NÃO VERIFICADAS.
- Catálogo TOTVS: 14 códigos vendor-only; nenhum mapa SX3 nem vínculo com TES homologado.
- Pipeline Node e sete agentes: **84/84 testes PASS** em execução verificada; matrizes normativas mantêm todos os gates fiscais em HOLD.
- Publicação externa dos CSS/UI corrigidos: **HOLD_VERCEL_QUOTA**, POST /v13/deployments retornou HTTP 402 api-deployments-free-per-day. Nenhum novo deployment ocorreu, e a versão pública v0.3 não mudou.

**Parecer pós-correção:** houve melhorias verificáveis na engenharia e na UX; a homologação fiscal e a autorização de produção permanecem bloqueadas. Não confundir 0 violações automatizadas de axe com certificação WCAG completa.
