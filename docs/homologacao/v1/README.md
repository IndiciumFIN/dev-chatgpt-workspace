# WU-TRIB — Sistema de documentação e homologação v1.0 (CANDIDATO)

**Escopo:** controle de documentos, registros e evidências do ciclo integral do WU-TRIB. **WO de planejamento documental:** WUTRIB-WO-PLAN-018 (a registrar/conciliar com SOT). **Origem:** GitHub, branch isolada `wutrib/docs-governance-20261108`. **Produção:** NO-GO. **Estado do pacote:** DRAFT — a existência dos modelos não comprova execução, homologação ou aceite.

## Por onde começar

1. [Política de gestão documental](POLITICA_GESTAO_DOCUMENTAL.md): identificadores, versionamento, revisão, aprovação, segregação, retenção e audit trail.
2. [Mapa normativo](FONTES_E_NORMAS.md): referências verificadas e aplicabilidade, sem reprodução dos textos protegidos.
3. [Plano diretor do ciclo](PLANO_MESTRE_DO_CICLO.md): portas de admissão da WO e governança do planejamento à descontinuação.
4. [Matriz de responsabilidade](RACI_E_SEGREGACAO.md): elaboradores, revisores, aprovadores e independência.
5. [Mapa documental navegável](MAPA_DOCUMENTAL.md): lista de 50 artefatos por gate, responsáveis e lacunas.
6. [Baseline documental](BASELINE_DOCUMENTAL.md) e [histórico de alterações](REGISTRO_MUDANCAS.md): origem, hashes computados e revisões.
7. [Registro canônico](registro-documental.v1.json): inventário de documentos exigidos para o escopo, quem é responsável, quando é requerido, o que falta e vínculos com o legado.
8. [Modelos individuais](artefatos/): um documento independente por assunto, com objetivo, entradas, conteúdo mínimo, critérios de aceite, evidências exigidas e estado **TEMPLATE**.
9. [Verificação documental](../../../scripts/check-wutrib-docs.mjs): contrato de integridade e cobertura do inventário, distinto dos testes da aplicação.

## Fonte da verdade e limites

- **GitHub:** conteúdo editorial, documentos, versões, schemas, evidências sanitizadas e histórico de commits; **Supabase SOT:** índice administrativo da WO, metadados e links (não segunda versão concorrente do conteúdo).
- **Vercel:** artefatos/deployments e logs de release, não fonte de documentos homologados.
- **Normas:** referência externa por edição, URL e data; não armazenar conteúdo integral de normas proprietárias, senhas, chaves, documentos fiscais verdadeiros, dados de pessoas ou da empresa.
- **Baseline preservada:** docs/ARCHITECTURE.md, docs/WOS.md, docs/AUDITORIA_INTEGRAL_WUTRIB_20261108.md, docs/WAVE_044_REMEDIATION_EVIDENCE.md e contracts/*.json. Não serão reescritos retroativamente.
- A documentação do **piloto sintético** e da futura **solução fiscal corporativa** compartilha o método, mas possuem gates e aceites próprios.

## O que significa cobertura documental

`DOCUMENTED_TEMPLATE` = arquivo cadastrado e íntegro. `EVIDENCE_COLLECTED` = resultados e provas existentes. `APPROVED` = aprovação humana registrada com alçada e assinatura verificável. **Não são equivalentes.**

Este pacote inaugura os modelos e registra os gaps. Ele **não** afirma que 100% dos documentos estão preenchidos, revisados ou aprovados, nem que foi conduzida homologação.

## Próximo uso

Preencher cada artefato com dados verificáveis e referenciar os IDs na RTM e na WO. Aplicar o checklist de admissão antes de mudar `TEMPLATE` para `DRAFT`, nunca por importação automática. Conforme os gates avançam, obter revisão técnica independente e sign-off.


## Extensão em revisão — validadores e metodologias

[Plano diretor de validadores v0.3.0](PLANO_AUDITORIA_COM_VALIDADORES.md) e [índice do pacote especializado](validadores/README.md) têm status **DRAFT** e são associados à WO-018. O registro documental v0.2.0 vincula seis arquivos desse pacote sem transformá-los nos 50 modelos homologados. Quatro modelos adicionais D051–D054 estão **propostos e ainda não criados**. As referências normativas foram ampliadas para 37 metadados canônicos, sem afirmação de acesso licenciado integral.


## Extensão documental — Audit Data Studio e funcionalidades fiscais

A [expansão funcional v0.1.0](expansoes/README.md) reúne benchmark de soluções externas, 22 motores candidatos, join/extractor/seleção/amostragem/erros/anomalias, comparação tributária por período e 33 cenários de validação **futura**. A extensão está no registro canônico documental v0.3.0 vinculada à WO-018, sem criar funcionalidades, alterar o DS, testar aplicações, modificar bancos ou publicar releases. Os 50 templates documentais preexistentes permanecem inalterados. **DRAFT / NO-EXECUTION.**

## Nova revisão documental de módulos analíticos

O [aprofundamento v0.2.0](expansoes/v02/README.md) está vinculado ao registro canônico **0.4.0**, preservando 50 modelos originais, os 28 validadores candidatos e a expansão funcional v0.1.0. São **17 peças documentais de proposta**, 68 testes futuros ainda `NOT_RUN` e 14 riscos/controles candidatos. Nenhuma aprovação ou modificação de software está implícita.

## Revisão normativa multidomínio (08/11/2026)

[Índice de avaliação pré-implantação](../../governanca-multidominio/revisao-20261108/README.md) · [Parecer e correções](../../governanca-multidominio/revisao-20261108/PARECER_PRE_IMPLANTACAO_v01.md) · [Qualificação dos validadores](../../governanca-multidominio/revisao-20261108/PLANO_REQUALIFICACAO_VALIDADORES_v01.md).

O registro documental v0.5.0 referencia **9 peças de revisão**, **55 fontes catalogadas**, **62 tópicos**, **30 riscos residuais** e **13 candidatos de validação clínica** (não implementados). Preserva **50 templates**, 28 validadores WU-TRIB e expansão funcional v0.2. Sem auditoria de código clínico, sem execução dos auditores, sem alterações na aplicação e sem autorização de produção.

## WU-TRIB — definição congelável da V1 (candidata)

[Índice do pacote V1 1.0.0-rc.0](../../wutrib/v1-baseline-20261108/README.md) · [Parecer dos dois relatórios](../../wutrib/v1-baseline-20261108/PARECER_E_DECISAO_ESCOPO_V1.md) · [Catálogo corrigido 22 módulos](../../wutrib/v1-baseline-20261108/CATALOGO_FUNCIONAL_V1_CORRIGIDO.json) · [Checklist do freeze](../../wutrib/v1-baseline-20261108/CHECKLIST_FECHAMENTO_ESCOPO_V1.md).

O registro canônico documental **v0.6.0** vincula 10 documentos candidatos da V1. Foram identificados **21 registros com campos deslocados** no catálogo antigo e criada uma versão corrigida preservando a original. Distribuição proposta: 13 módulos mínimos, 5 limitados e 4 posteriores; 30 suítes de teste **NOT_RUN**, 7 gates **não aprovados**, 27 fontes selecionadas e 20 decisões de escopo em revisão. **Sem assinatura, auditoria, execução de validadores, migração, merge ou deploy.**

## Avaliação independente da baseline WU-TRIB V1 — 08/11/2026

[Índice da revisão normativa e benchmark](../../wutrib/v1-assurance-20261108/README.md) · [Normas e aplicabilidade](../../wutrib/v1-assurance-20261108/PARECER_NORMATIVO_APLICABILIDADE_V1.md) · [Plataformas e referências](../../wutrib/v1-assurance-20261108/BENCHMARK_PLATAFORMAS_E_REFERENCIAS_V1.md) · [Contratos fiscais EFD/TOTVS](../../wutrib/v1-assurance-20261108/CONTRATOS_MINIMOS_EFD_NFE_PROTHEUS_V1.md) · [26 gaps em revisão](../../wutrib/v1-assurance-20261108/MATRIZ_LACUNAS_E_CORRECOES_V1.json).

O registro documental **0.7.0** acrescenta oito artefatos de revisão **sem alterar a especificação 1.0.0-rc.0**: 19 referências metodológicas/regulatórias comparadas, 12 grupos de fornecedores/produtos, 26 lacunas documentais propostas (16 P0 / 10 P1) e 17 bloqueios de freeze propostos. Todas as evidências de teste continuam NOT_RUN, nenhuma aprovação foi registrada, nenhuma aplicação ou banco mudou.
