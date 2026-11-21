# CE / CKO / NCOS — avaliação normativa e benchmark de excelência
**Data da revisão:** 20/11/2026 · **Categoria:** auditoria candidata, não homologação clínica, jurídica ou regulatória.
**Âmbito:** `IndiciumFIN/dev-chatgpt-workspace`, PRs #72, #77, #78, #32 e issues #28, #33, #56, #58–#70, #79–#81.
**Base canônica observada:** `main@f3390cb134db09195cf3c78a7db2b896ec304d6e`.
**Protocolo:** fonte oficial primária → aplicabilidade → artefato/controle → teste adversarial → evidência → aceite independente. Não transportar textos integrais de plataformas proprietárias.

## 1. Normativos e referências técnicas — aplicabilidade sem alegar certificação

| Referência e status verificado | Aplicabilidade | Requisito operacional que faltava / verificação objetiva |
| --- | --- | --- |
| **Cofen Res. 736/2024**, arts. 2–8 e 14; 358/2009 revogada [oficial](https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/) | Exercício profissional; obrigatório no processo de enfermagem aplicável | PE em cinco etapas: avaliação, diagnóstico, planejamento, implementação, evolução. Diagnóstico e prescrição são privativos do enfermeiro. Conteúdo normativo exige status vigente, pinpoint, revisão profissional e bloqueio de sugestão que pareça ato privativo automatizado. |
| **Cofen Res. 743/2024** revoga **543/2017** [oficial](https://www.cofen.gov.br/resolucao-cofen-no-743-de-12-de-marco-de-2024/); **Parecer Normativo Cofen 1/2024** [oficial](https://www.cofen.gov.br/parecer-normativo-no-1-2024-cofen/) | Dimensionamento e planejamento da força de trabalho | Revalidar fórmulas de dimensionamento antes de release; não aplicar regra revogada nem confundir parâmetros referenciais com obrigação rígida de contratação. Arquivo candidato não representa cálculo aprovado. |
| **Lei 7.498/1986 e Dec. 94.406/1987**, citados pela Res. 736/2024 | Competência profissional | Workflow distingue educação e apoio ao cálculo de prescrição/diagnóstico; exige profissional responsável e limites explícitos. |
| **Anvisa RDC 657/2022**, em conjunto com RDC 751/2022 quando aplicável [oficial](https://anvisalegis.datalegis.net/action/UrlPublicasAction.php?acao=abrirAtoPublico&cod_menu=9434&cod_modulo=310&num_ato=00000657&seq_ato=000&sgl_orgao=RDC%2FDC%2FANVISA%2FMS&sgl_tipo=RDC&vlr_ano=2022) | **CONDICIONAL**: depende da finalidade médica pretendida e do enquadramento SaMD; não presumir que todas calculadoras educativas sejam dispositivos médicos | Elaborar matriz *intended use* por ferramenta, decisão regulatória fundamentada, versão e registro quando aplicável; consultar classificação Anvisa se ambígua. |
| **ISO 14971:2019** [oficial](https://www.iso.org/standard/72704.html), **IEC 62304:2006+A1:2015** [IEC](https://webstore.iec.ch/en/publication/22794) (ciclo de software médico) | Referências de engenharia especialmente relevantes se houver SaMD | Hazard log por escore, erro de unidade, modo de falha, requisito/mitigação/teste, rastreabilidade e monitoramento. Não alegar conformidade sem implementação e avaliação independente. |
| **ISO/IEC 25010:2023** [oficial](https://www.iso.org/standard/78176.html) | Benchmark de qualidade, não certificação demonstrada | Cobrir confiabilidade, integridade funcional, performance, usabilidade, segurança e manutenibilidade por testes/telemetria e limites de aceitação. |
| **OWASP ASVS 5.0.0** [oficial](https://asvs.owasp.org/) | Padrão de verificação de aplicação Web | Controle server-side RBAC, autenticação real, autorização por objeto, gestão de segredos, falha fechada, validação de entrada/saída e evidência de testes negativos. Não usar rótulo ASVS PASS sem mapa de requisitos e resultados. |
| **NIST SP 800-218 SSDF 1.1 final** [oficial](https://csrc.nist.gov/pubs/sp/800/218/final); 1.2 é rascunho inicial [NIST](https://csrc.nist.gov/pubs/sp/800/218/r1/ipd) | Referência SDLC seguro | CI imutável, revisão, provenance, segurança de dependências, gestão de vulnerabilidades/segredos; evitar usar rascunho como obrigação definitiva. |
| **WCAG 2.2 AA** [oficial](https://www.w3.org/TR/WCAG22/) | Benchmark de acessibilidade; exigências legais locais devem ser avaliadas por jurisdição/contexto | Foco visível, navegação por teclado, rótulos, erros/estado, reflow/zoom, alvo de toque e testes com leitor de tela em fluxos reais; sem declarar conformidade por teste estático. |
| **LGPD Lei 13.709/2018** [oficial](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) | Aplicável a dados pessoais, com salvaguardas reforçadas quando dados de saúde identificáveis | Mapear coleta/transmissão/armazenamento/exportação de dados de pacientes, consentimento/base legal adequada, finalidade, retenção, direitos, controle de acesso, logs e incidente. Nada de PHI em Actions/artifacts públicos. |

## 2. Benchmark de excelência — técnicas observáveis, sem copiar conteúdo

| Plataforma pública | Prática observada / evidência | Lacuna CE | Critério de aceite CE |
| --- | --- | --- | --- |
| **BMJ Best Practice** [evidências](https://bestpractice.bmj.com/info/us/our-evidence-approach/) e [catálogo](https://bestpractice.bmj.com/calculators) | Evidências transparentes, avaliação editorial humana, expertise e contexto do paciente; catálogo de calculadoras por indicação | Referência textual por ferramenta existe, porém revisão de claims/cortes, direitos, edição e validade por jurisdição não está homologada | Cada fórmula/corte: fonte primária, pinpoint, data, versão, aplicabilidade, teste de limite, 2 revisões e decisão formal de publicação |
| **MDCalc** [sobre](https://www.mdcalc.com/about-us) e [calculator](https://www.mdcalc.com/calc/48/corrected-qt-interval-qtc) | Organização de scores, contexto de evidência, informações sobre criadores/uso; não é endosso de equivalência de fórmulas | Distinguir resultado de interpretação e próxima conduta; preservar origem/autoria e limites | Saída não inventa valor, mostra unidade/precisão, fonte, limitações e indicação adequada |
| **UpToDate** [política editorial](https://www.uptodate.com/home/editorial-policy) | Revisão editorial em camadas, referências e atualização da literatura | Gate de atualização de fonte e revisão independente ainda não comprovado | Revisão temporal com versão; conflito entre normas/edições gera FIND, nunca substituição silenciosa nem `RELEASED` |

## 3. Achados por risco — fonte do Git e remediação

| ID | Prioridade | Evidência identificada | Correção candidata / critério de conclusão |
| --- | --- | --- | --- |
| NORM-01 | P0 | `FF-009` de `fun-facts.seed.ts` estava `RELEASED` e atribuía SAE à Res. 543/2017 | PR #78: art. 4º/6º da Res. 736/2024, status `HOLD_HUMAN`, direitos `HOLD`; reabrir somente após validação editorial, pinpoints e direitos |
| NORM-02 | P0 | Curiosidade de prescrição, importação de corpus `BLOCKED_SOURCE`, ainda cita 358/2009 | **Preservar snapshot/sha256 histórico**, não reescrever conteúdo de origem; gerar revisão derivada somente após fonte/pinpoint/direitos. Teste impede liberação desse arquivo como `RELEASED` |
| NORM-04 | P0 | A rota pública `/curiosidades` oferecia checkbox `Só publicados` que, desmarcado, listava objetos `CANDIDATE`/`HOLD_HUMAN`, inclusive FF-009 | PR #78: remove toggle público, impõe `f.status === "RELEASED"` incondicional e smoke Chromium; UI pública não constitui console de curadoria. Conteúdo candidato permanece no pacote de código até revisão de arquitetura, portanto não é garantia de confidencialidade do bundle. |
| NORM-03 | P0 | `dimensionamento` e `dimensionamento-cofen` são nomes históricos, não funcionalidades ativas homologadas | Crosswalk com Parecer 1/2024; nenhuma fórmula baseada só na 543/2017 pode obter release |
| CLIN-01 | P0 | `evaluateScale` somava respostas não pertencentes às opções válidas | PR #78: validação de escolhas, `NaN`/`Infinity`, escala vazia e faixa ausente; 6 testes adversariais |
| CLIN-02 | P0 | `evaluateFormula` podia mascarar saída inexistente com `0` | PR #78: outputs obrigatórios e `bandFrom` devem ser finitos/existentes, sem fallback artificial |
| CLIN-03 | P1 | IMC em `catalog.ts` tinha lacunas numéricas `18.49→18.5`, `24.99→25` etc. | PR #78: continuidade das fronteiras, decisão da faixa superior em limites iguais, testes para valores extremos |
| CLIN-04 | P0 | Candidato Aldrete tem corte 8 em fonte comparada, histórico em produção 9; divergência já registrada | Manter fora do índice, confrontar edição da escala, parecer CFM e protocolos, com parecer clínico independente |
| DB-01 | P0 | `source_tool.published DEFAULT true` na migração 0002; inserts históricos explícitos true na 0022/0023 | PR #72: migração nova 0059 default false e testes; **não** muda inserts explícitos; reconciliar admissões e publicações existentes antes de qualquer importação |
| DB-02 | P0 | Backend operacional não identificado; Neon conectado sem tabelas, 0 env vars nos projetos Vercel consultados | PR #72: guard recusa PGlite efêmero em Vercel sem DATABASE_URL; issue #80 mantém mapeamento, backup, migrações e smoke read-only em aberto |
| SEC-01 | P0 | Primeiro visitante podia ser auto-promovido `admin` | PR #72: subscriber padrão, testes de concorrência e CI PASS; prova com sessões OAuth reais e procedimento de provisionamento ainda pendentes |
| SEC-02 | P0 | Credencial OAuth histórica possivelmente vazada e RBAC real não homologado | Issue #28/#79; revogar no emissor, rotacionar, confirmar callback e 401/403 por usuário com evidências sem credenciais nos logs |
| DEP-01 | P0 | Vercel `STATIC_BUILD_NO_OUT_DIR` + limite de builds | PR #77, validar preset Nitro/SSR e outputs, preview READY mesmo SHA sem tentar deploy repetidamente |
| CROSS-01 | P0 | PR #32: 486=469 iguais+17 diferentes; 0/17 semanticamente aprovados, 0/48 SEALED | PR #78: CI Git, scorecard e E2E local; comparação semântica independente e fechamento continuam HOLD |
| DATA-01 | P0 | Supabase: schemas compartilhados, funções `cko_governance` e RLS; não é conexão operacional comprovada | Issue #80: avaliar por role e schema, não criar policies em massa, manter READ_ONLY |
| UX-01 | P1 | Telas Vila ainda incluem placeholders; não há homologação de i18n/WCAG 2.2 AA para todas as rotas | Matriz de jornadas desktop/mobile/teclado/leitor de tela, impedir aprovação por screenshot/grep |
| PROV-01 | P0 | CKP/CKO e corpus: direitos, versão, pinpoint, falsos PASS e licença a comprovar | Issues #58–#70, #69: artefato com SHA ≠ evidência clínica; validação independente obrigatória |

## 4. Contrato mínimo de admissão de ferramenta / norma

Para cada ferramenta, exigir **sem exceção antes de release**:
1. ID e versão da ferramenta, finalidade pretendida (educativa ou assistencial) e população aplicável/exclusões.
2. Enquadramento regulatório documentado (incluindo decisão motivada de não-SaMD, se for o caso), dono responsável e jurisdição.
3. Fórmula, unidades, precisão, limites e interpretação com fonte primária identificada por artigo/página/tabela, data, edição e licença/direitos.
4. Casos de teste independentes positivos, negativos, extremos, arredondamento, `NaN`, `Infinity`, omissão, corrupção de valor, mutações de credencial e resultados não numéricos.
5. Análise de perigos `hazard → causa → efeito → mitigação → teste → risco residual`, revisada por responsável clínico.
6. Parecer clínico e jurídico/regulatório aplicável, com autor, competência, data, rastreabilidade e versão; nenhuma assinatura sintética.
7. Liberação por ambiente e SHA, rollback, observabilidade sem dados identificáveis e revisão periódica da vigência das fontes.

**Separações obrigatórias:** `COMPARE_MATCH` não é `FUNCTIONAL_EQUIVALENCE`; CI PASS não é `CLINICALLY_APPROVED`; `CANDIDATE` não é `RELEASED`; norma indexada não é norma licenciada; ISO citada não equivale a certificação. Até evidência independente, `HOLD_HUMAN` permanece para publicação — investigação, CI, correção técnica e produção editorial candidata seguem normalmente.

## 5. Medição e próximas entregas
- **Índice estrito verificado:** G01/10 = 10%; G02..G10 ainda HOLD. Esse percentual mede gates de homologação, **não** software implementado.
- **Git:** 48/48 branches inventariadas; PR32 17/17 pares identificados e 0/17 resoluções semânticas aprovadas; 0/48 encerradas.
- **Próxima onda 1:** CI das alterações `CLIN`/`NORM` no PR78 + revisão independente, não liberar FF-009.
- **Próxima onda 2:** consolidar #72, #77 sem contornar Vercel/banco/OAuth; não auto-merge.
- **Próxima onda 3:** revisar ferramentas por risco e confirmar `intended use` antes de qualquer publicação; priorizar Aldrete e dimensionamento.
- **Próxima onda 4:** corpus + fontes + direitos + RLS + interfaces e a11y com evidências e scorecard.

**Natureza do documento:** mapeamento independente de fontes públicas e Git, não certificação regulatória, parecer jurídico, validação clínica nem aprovação de uso assistencial.
