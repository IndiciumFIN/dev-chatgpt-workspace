# WU-TRIB — Wave 04.4 | Correções verificadas, requisitos e benchmark de referência

**WO** WUTRIB-WO-PLAN-017. **Data** 2026-11-08. **Estado** CANDIDATE / sem homologação fiscal. **Escopo** branch wutrib/audit-integral-20261108 do IndiciumFIN/dev-chatgpt-workspace; Supabase SOT-10-09-2026 esquema privado wutrib; Vercel wutrib-auditor-web-piloto somente preview, sem promoção.

## 1. Entrega e provas executáveis

| Achado | Correção / controle | Evidência real | Estado |
|---|---|---|---|
| AUD-017-10 contraste | Revisão de design tokens e texto secundário, preto/cinza de contraste suficiente em superfícies claras e texto claro em destaque escuro | 12 combinações axe-core WCAG 2.2 A/AA, 0 violações automatizadas; Chromium desktop/mobile | PASS_AUTOMATED_ONLY, revisão manual HOLD |
| AUD-017-11 DOM massivo | Paginação 50 registros; total de resultados, página atual, estado das setas, navegação por teclado, filtros e exportação integral preservados | 35.000 C100→35.003 achados, 852 nós DOM (baseline 315.425), 50 linhas; browser 618 ms em uma execução | PASS em cenário sintético, performance real/HCD HOLD |
| AUD-017-12 FKs sem índice | Quatro índices B-tree aditivos no banco privado SOT, migration wutrib_demo_v043_fk_indexes_20261108, sem alterar registros | pg_indexes confirma 4/4; Performance Advisor deixou de apresentar unindexed_foreign_keys; sem drop de índices | PASS para cobertura de FK; sem benchmark DB de alto volume |
| AUD-017-05 metamodelo e dicionário | Subconjunto físico versionado com 23 entidades, 25 FKs confirmadas e 22 campos tipados (inclui numeric 20,6 e 16,8), sem inventar mapas SX3 | contracts/physical-metamodel.audit.v1.json, contracts/physical-field-dictionary.audit.v1.json, testes de coerência | PARTIAL: camada física sim; semântica normativa ainda HOLD |
| AUD-017-03 TOTVS FISA170 | Catálogo candidato com 14 tabelas e descrições oficiais | contracts/totvs-fisa170-table-registry.candidate.json, teste negativo que proíbe mapeamento falso | HOLD para ERP real e campos |
| Matriz de qualidade | 30 requisitos versionados ligados a fontes, evidência e status explícito | contracts/functional-requirements.v1.json e tests/functional-gates.test.mjs | 13 PASS, 1 PASS_AUTOMATED_ONLY, 3 PARTIAL, 13 HOLD |

**Último conjunto de CI antes do fechamento:** 
- GitHub Actions Node e agentes: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42497623700 — 84/84 testes e sete agentes determinísticos PASS;
- Chromium WCAG: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42497623739 — 0 violações automatizadas nas seis telas e dois viewports; 16 checks de regressão desktop/mobile;
- Browser capacity: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42497623572 — 50 rows em cada volume de 1k, 10k, 35k, navegação por teclado, exportação JSON de 1.003 achados apesar de 50 visíveis.
- Benchmark motor anterior para comparação: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42494850708 (até 120k entradas apenas em memória, não pelo UI).

**Cautela sobre benchmark:** 618 ms no teste mais recente e 1.033 ms na versão anterior são amostras de CI, não p95 de produção nem teste de carga concorrente. A memória JavaScript varia entre execuções e não constitui prova de redução de heap. A maior entrada web exercitada foi ~3,49 MiB/35k C100 com dez XML em memória no teste do motor, enquanto os três XML fictícios da UI permanecem. O teste não simula 10 arquivos XML de 2 MiB simultâneos.

## 2. Comparação de capacidades de plataformas maduras

**Comparação de padrões funcionais e controles, não reprodução de código ou afirmação de equivalência com fornecedores.**

| Capacidade de referência | Evidência de mercado | Estado WU-TRIB | Gate funcional |
|---|---|---|---|
| Reconciliação multiorigem de ERP, livros e emissão eletrônica | Thomson Reuters ONESOURCE apresenta reconciliação cruzada e explicação de variâncias | Somente XML local×C100; sem conector ERP nem razão contábil | REQ-025/026, HOLD |
| Explicações, provas, revisão humana e decisões reversíveis | ONESOURCE e documentação de activity log e de tasks | Achados e notas locais, sem sign-off individual nem reversão controlada | REQ-017/027/028, HOLD |
| Biblioteca de riscos/controles, planejamento, workpapers e remediação | ServiceNow Audit Management | Estrutura banco tem process_controls e WO; zero controles operacionais e zero audit_runs | REQ-019/027, PARTIAL |
| Registro completo de atividades (quem, o quê, por quê, quando) | OWASP ASVS V16 e ONESOURCE activity log | Tabela de eventos sintéticos READ/SAVE; sem inventário de retenção e decisões de usuário real | REQ-017, PARTIAL |
| Evidências suficientes/relevantes e testes auditáveis | IIA Global Internal Audit Standards em vigor desde 2025 | Testes e WO rastreados, porém fontes normativas e trilha fiscal sem população operacional | REQ-023/027/028, HOLD |
| Contraste, foco, teclado, experiência centrada no usuário | WCAG 2.2 e ISO 9241-11/210 | Axe passou automatizado, botões de página testados pelo teclado; sem entrevistas/usuários, leitura de tela nem zoom 200% | REQ-010 PASS_AUTOMATED_ONLY; REQ-011/030 HOLD |
| Formatos aceitos, limites, segurança dos uploads | OWASP ASVS 5.0 File Handling | 10 XML máx., 2 MiB cada, 4 MiB TXT, DTD bloqueado; XSD, DV e antivírus corporativo não homologados | REQ-002/003 PASS, REQ-024/025 HOLD |
| Tabelas e vigência no Configurador de Tributos híbrido | TOTVS FISA170 F20–F29 etc., e exemplo TES ICMS/PIS/COFINS + FISA170 IBS/CBS | 14 códigos em catálogo vendor-only sem SX3, sem vínculos com TES, sem cálculo nem aprovação | REQ-026, HOLD |

Fontes conferidas em 08/11/2026:
- SPED Guia Prático 3.2.4: https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/nova-versao-do-guia-pratico-da-efd-icms-ipi-2
- Receita Federal PVA EFD ICMS/IPI 6.2.0: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/download/sped/efdi
- Portal NF-e MOC 7.0: https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx/listaConteudo.aspx?tipoConteudo=ndIjl+iEFdE%3D
- TOTVS FISA170 tables: https://centraldeatendimento.totvs.com/hc/pt-br/articles/35314721022103-Cross-Segmento-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Quais-tabelas-fazem-parte-do-Configurador-de-Tributos
- TOTVS FISA170 modo híbrido: https://centraldeatendimento.totvs.com/hc/pt-br/articles/36312155068823-CROSS-Segmentos-TOTVS-Backoffice-Linha-Protheus-FIS-Como-configurar-o-cClasstrib-410-para-opera%C3%A7%C3%B5es-Isentas-no-fisa170-forma-Hibrida
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- OWASP ASVS v5.0: https://asvs.owasp.org/
- IIA GIAS: https://www.theiia.org/en/content/standards/complete-global-internal-audit-standards/
- ISO 9241-11: https://www.iso.org/standard/63500.html
- ISO 9241-210: https://www.iso.org/standard/77520.html
- ServiceNow issues/remediation: https://www.servicenow.com/docs/r/zurich/governance-risk-compliance/audit-management/issues-audit.html
- Thomson Reuters three-way reconciliation: https://tax.thomsonreuters.com/en/products/onesource-indirect-compliance-ai/features
- Thomson Reuters comprehensive activity log: https://www.thomsonreuters.com/en-us/help/onesource-indirect-tax/sales-and-use-tax/cocounsel/comprehensive-activity-log

**Critério de qualidade:** fonte de fornecedor descreve capacidades do fornecedor em seu próprio produto; não constitui exigência legal nem prova de que todas as capacidades estejam implementadas na WU-TRIB. Texto de normas ISO integra corpus editorial por metadados públicos; o texto integral é protegido. Nenhuma regra oficial foi aprovada ou importada automaticamente para execução.

## 3. Limitação de publicação do preview

Na tentativa de publicar o frontend corrigido e testado no projeto Vercel **wutrib-auditor-web-piloto**, a API de deployment devolveu HTTP **402 api-deployments-free-per-day (more than 100)**, com recovery de recurso do plano. Não houve novo deployment, não há URL do frontend corrigido a compartilhar e a versão pública v0.3 continua intacta. CLI Vercel não está instalado no ambiente conectado, e usar outra conta/projeto para contornar o limite violaria o isolamento desejado.

**Gate externo:** HOLD_VERCEL_QUOTA. Verificar limite/permissões no Vercel antes de publicar novo preview. A ausência de deploy não invalida resultados do Chromium isolado, mas impede homologação por navegador externo contra o novo artefato real.

## 4. Segurança operacional, retenção e segregação

- 4 FKs com índices agora têm cobertura. Performance Advisor não retornou mais aviso de FKs descobertas; alertas de índices sem uso observado aumentaram em quatro devido a novos índices e ausência de carga representativa. Não remover sem EXPLAIN.
- SQL de índices só criou B-tree no wutrib privado, com um dossiê legado sintético e nenhuma organização ativa. Zero documentos fiscais reais carregados. RLS permanece intacto.
- API v0.4.2 desabilitada, sem secrets em Vercel, sem autenticação de operador real, sem rate-limit anônimo na borda nem prova de proteção de sessões. E2E autenticado e carga real de banco seguem HOLD.
- Evidência de auditoria e gestão de acesso a logs devem ser protegidas; não há demonstração de retenção definida, política de deleção, SIEM e uma pessoa habilitada para aceite fiscal.
- Testes aprovados são exclusivamente desenvolvimento e piloto sintético. Não inferir conformidade NF-e, EFD ou TES FISA170.

## 5. Próximos gates objetivos

1. **Visual:** revisão manual WCAG 2.2 AA, 200% zoom, leitor de tela, tarefas com usuários e dispositivo de baixa memória; preservar provas do novo contraste.
2. **Processamento:** testar 10 XMLs até 2 MiB de modo controlado, CSV/JSON volumosos, cancelamento, corrida de seleção, memória por 30 minutos e p95 de trabalho real; após as melhorias, manter regressão de paginação.
3. **Segurança:** WAF/limites anônimos, expiração e revogação de JWT, administrador aprovador com segregação, retenção, logs e políticas organizacionais com prova real; executar API E2E somente com usuário e sandbox aprovado.
4. **Fisco:** corpus SPED MOC/PVA e releases TOTVS por vigência com hash, dicionário, regras e testes oficiais; revisão humana por especialista.
5. **Publicação:** GitHub privado independente, branch protegida, Vercel preview após resolução do limite, testes externos, mudança autorizada e rollback.

**Estado final:** 30 gates internos = 13 PASS, 1 PASS_AUTOMATED_ONLY, 3 PARTIAL, 13 HOLD. A auditoria de correção reduz problemas de UX e de índices; não altera os cinco grandes blocos restantes do piloto nem aprova uso fiscal.
