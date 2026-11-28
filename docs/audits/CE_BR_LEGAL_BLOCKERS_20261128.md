# CE / CKO / NCOS — matriz brasileira de aplicabilidade e bloqueios

Data: 28/11/2026. Baseline: `35aecf3874be93bfdcee8910c885a7feba8c27b6`. Revisão dirigida, não parecer jurídico, não certificação de conformidade. Não altera o protocolo de aposentadoria nem autoriza release.

## Decisão de escopo

Distinguir preservação lícita, DEV sintético, homologação, publicação, tratamento real, oferta comercial e aposentadoria técnica. O armazenamento em quarentena pública continua sendo reprodução; não constitui exceção geral. HOLD de operação não é HOLD de todo desenvolvimento. Para direitos não demonstrados, conservar somente metadados, hashes e referência lícita; evitar nova cópia, inclusive por IA.

## Matriz (14 frentes)

| ID | Objeto | Base legal | DEV | Gate de operação | Ação |
|---|---|---|---|---|---|
| BR-01 | Direitos autorais, conteúdo, TDM | Lei 9.610/1998 arts. 7-8, 29, 46, 47 | DEV_CONDITIONAL | HOLD_REPRODUCTION | Fatos, métodos e atos oficiais podem subsidiar redação própria. Citação proporcional com atribuição; nenhuma exceção geral de cópia integral ou TDM inferida. Quarentena pública não é autorização. Preservar metadados e hashes; validar direitos inclusive tradução e IA externa. |
| BR-02 | Software, autoria, dependências | Lei 9.609/1998 arts. 2, 4, 6, 9 | DEV_CONDITIONAL | HOLD_DISTRIBUTION_IF_UNLICENSED | Confirmar autoria, contratos, titularidade e licenças transitivas; SBOM. Registro no INPI não é requisito constitutivo da proteção. Não atribuir licença em nome do titular. |
| BR-03 | Dados pessoais e saúde | LGPD arts. 5, 6, 7, 11, 12, 18, 37, 46-49 | DEV_SYNTHETIC | HOLD_REAL_DATA | Dados efetivamente sintéticos, sem identificação real, para desenvolvimento. Pseudonimização não equivale a anonimização. Inventário, base legal, minimização, RBAC, RLS e testes negativos antes do tratamento real. Hipótese de pesquisa não se presume para empresa comercial. |
| BR-04 | IA externa e transferência internacional | LGPD arts. 11, 33-36; Res. ANPD 19/2024 | DEV_MOCK | HOLD_EXTERNAL_REAL_DATA | Mock e fontes autorizadas. Antes de enviar dados pessoais: base legal, papéis, finalidade, mecanismo de transferência aplicável, contratos, retenção, subprocessadores. Direitos autorais são gate separado; decisão automatizada art. 20 quando aplicável. |
| BR-05 | Incidentes, segredos e vulnerabilidades | LGPD arts. 46-48; Res. ANPD 15/2024 | DEV_REMEDIATE | HOLD_IF_EXPOSURE | Não presumir incidente pela mera falha CI. Investigar exposição, rotacionar credenciais reais, preservar evidência com acesso restrito. Comunicação de incidente com risco/dano relevante em três dias úteis, observadas regras específicas. Não duplicar segredo no Git. |
| BR-06 | Software com finalidade médica | RDC Anvisa 657/2022 e 751/2022; RDC 848/2024 quando aplicável | DEV_SYNTHETIC | HOLD_CLINICAL_MARKET_USE | Determinar finalidade pretendida por função, público, claims e risco. Não presumir isenção por disclaimer, uso educacional nominal ou gratuidade. Se SaMD, classificar e regularizar conforme regime aplicável, com segurança e desempenho demonstrados. |
| BR-07 | Exercício da enfermagem e Processo de Enfermagem | Lei 7.498/1986; Res. COFEN 736/2024 | DEV_SYNTHETIC | HOLD_CLINICAL_AUTONOMY | Ferramenta de apoio não substitui competências privativas do enfermeiro. Diagnóstico e prescrição de enfermagem sob responsabilidade profissional. Validar fórmulas, escalas, interpretação e rastreabilidade; não declarar aprovação COFEN inexistente. |
| BR-08 | Telessaúde e telenfermagem | Lei 14.510/2022; Res. COFEN 696/2022 com alterações | DEV_SIMULATION | HOLD_ACTUAL_CARE_IF_APPLICABLE | Avaliar se há serviço de cuidado remoto, não confundir biblioteca educacional com consulta. Quando aplicável, observar consentimento, sigilo, registros, profissionais habilitados e regras de atendimento. |
| BR-09 | Prontuário e retenção | Lei 13.787/2018 arts. 2-6; LGPD | DEV_SYNTHETIC | HOLD_REAL_RECORDS | Se houver prontuário, integridade, autenticidade, confidencialidade e retenção mínima legal de 20 anos desde último registro para eliminação. Não aplicar automaticamente a logs Git, estudos sintéticos ou toda telemetria. Classificar retenção por tipo de dado. |
| BR-10 | Acessibilidade digital | Lei 13.146/2015 art. 63 | DEV_IMPLEMENT | RELEASE_ACCESSIBILITY_GATE | Obrigação de acessibilidade conforme escopo legal. WCAG como referência técnica; níveis AA/AAA e Lighthouse são metas do projeto, não equivalentes automáticos a conformidade. Testes teclado, leitor de tela, contraste e formulários. |
| BR-11 | Internet, logs, cookies | Lei 12.965/2014 arts. 7, 10, 15; LGPD; guia ANPD cookies | DEV_IMPLEMENT | HOLD_NONCOMPLIANT_TRACKING | Logs de acesso à aplicação por seis meses quando art. 15 aplicável; não equivale a guardar dados clínicos. Configurar consentimento quando base aplicável, escolha real, revogação e minimização de analytics. Guia é orientação, não lei autônoma. |
| BR-12 | Assinaturas e consumidor | CDC arts. 6, 14, 31, 49; Decreto 7.962/2013 | DEV_IMPLEMENT | HOLD_COMMERCIAL_OFFER_IF_NONCOMPLIANT | Informações claras de preço/recorrência, cancelamento, atendimento, arrependimento quando aplicável e segurança; avisos não excluem responsabilidade legal. Teste de fluxo comercial antes de cobrança real. |
| BR-13 | Regulação geral de IA | PL 2338/2023: proposta em tramitação nas fontes consultadas | DEV_MONITOR | NOT_STATUTORY_GATE_BY_ITSELF | Não converter projeto de lei em lei vigente. Reavaliar tramitação antes do release. Aplicar legislação vigente já identificada e governança de IA proporcional. |
| BR-14 | Aposentadoria Git, CI, Vercel, dependências | Controles internos CE.BRANCH.RETIREMENT.v1; direitos/LGPD onde aplicáveis | DEV_RECONCILE | HOLD_DELETION_UNTIL_PROOF | Não há exigência legal genérica de manter branches ou obter homologação clínica para excluir refs redundantes. Provar retenção lícita, dependências, segurança, autorização e SHA; não confundir ausência de obrigação legal com autorização para descumprir norma interna. A dispensa de isolamento foi específica de merges DEV; não inferir dispensa de produção/retirement. |

## Fontes oficiais consultadas

- BR-01: https://www.planalto.gov.br/ccivil_03/leis/l9610.htm
- BR-02: https://www.planalto.gov.br/ccivil_03/leis/l9609.htm
- BR-03: https://planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- BR-04: https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024
- BR-05: https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis
- BR-06: https://www.gov.br/anvisa/pt-br/acessoainformacao/perguntasfrequentes/produtosparasaude/conceitos-e-definicoes
- BR-07: https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/
- BR-08: https://www.cofen.gov.br/resolucao-cofen-no-696-2022/
- BR-09: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13787.htm
- BR-10: https://planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm
- BR-11: https://planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm
- BR-12: https://planalto.gov.br/ccivil_03/leis/l8078compilado.htm
- BR-13: https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2487262
- BR-14: https://www.planalto.gov.br/ccivil_03/leis/l9610.htm
- Anvisa SaMD: https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2022/software-como-dispositivo-medico-perguntas-e-respostas/
- Anvisa normas reconhecidas: https://www.gov.br/anvisa/pt-br/assuntos/produtosparasaude/lista-de-normas-tecnicas-reconhecidas
- Lei 7.498: https://www.planalto.gov.br/ccivil_03/leis/l7498.htm
- Lei 14.510: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14510.htm
- Decreto 7.962: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm
- Guia cookies: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais

## Encaminhamento

1. Prosseguir DEV sintético, testes de segurança, reimplementações e documentação de direitos. 2. Priorizar achados ativos Braden/Morse e conteúdo editorial da PR #140; não declarar autorização inexistente. 3. Mapear finalidade e classificação Anvisa por funcionalidade, fluxos LGPD e contratos de fornecedores. 4. Validar dependências e histórico para refs redundantes, sem condicionar a homologação funcional; preservar controles G00/G02 e norma interna. 5. Titular competente decide licença geral e permissões; responsável clínico valida finalidade e conteúdo; controlador decide bases legais e incidentes. Não presumir que a coordenação DEV detenha essas competências.

## Continuidade PR #67

48 divergências em árvores completas; 12 documentos técnicos triados e preparados em quarentena; 36 pendentes. Não houve auditoria integral de direitos ou histórico nem cópia do corpus bruto. Registro canônico: `registers/governance/ce-branch-live-cohort-20261121.v1.json`.
