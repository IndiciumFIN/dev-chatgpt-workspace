# WU-TRIB — Sistema de documentação e homologação v1.0 (CANDIDATO)

**Escopo:** controle de documentos, registros e evidências do ciclo integral do WU-TRIB. **WO de planejamento documental:** WUTRIB-WO-PLAN-018 (a registrar/conciliar com SOT). **Origem:** GitHub, branch isolada `wutrib/docs-governance-20261108`. **Produção:** NO-GO. **Estado do pacote:** DRAFT — a existência dos modelos não comprova execução, homologação ou aceite.

## Por onde começar

1. [Política de gestão documental](POLITICA_GESTAO_DOCUMENTAL.md): identificadores, versionamento, revisão, aprovação, segregação, retenção e audit trail.
2. [Mapa normativo](FONTES_E_NORMAS.md): referências verificadas e aplicabilidade, sem reprodução dos textos protegidos.
3. [Plano diretor do ciclo](PLANO_MESTRE_DO_CICLO.md): portas de admissão da WO e governança do planejamento à descontinuação.
4. [Matriz de responsabilidade](RACI_E_SEGREGACAO.md): elaboradores, revisores, aprovadores e independência.
5. [Registro canônico](registro-documental.v1.json): inventário de documentos exigidos para o escopo, quem é responsável, quando é requerido, o que falta e vínculos com o legado.
6. [Modelos individuais](artefatos/): um documento independente por assunto, com objetivo, entradas, conteúdo mínimo, critérios de aceite, evidências exigidas e estado **TEMPLATE**.
7. [Verificação documental](../../../scripts/check-wutrib-docs.mjs): contrato de integridade e cobertura do inventário, distinto dos testes da aplicação.

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
