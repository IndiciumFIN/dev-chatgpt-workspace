# CE / W2.6-G2/C1 — reconciliação clínica e segurança de admissão

**Task:** #115 · **Pai:** #106 · **Crosswalk pendente:** #116 · **Fase:** desenvolvimento, **sem liberação clínica**.
**Proprietário de release:** Cauê Zipfel (aprovação diferida) · **Coordenação:** Leivis Lima.

## Evidências Git fixadas

**Histórico:** `grook_10_26` @ `2eacacafd95c106e58a33372ee96bc6a6442439f` / tree `d8de6c9a983e9ad4ecb95fb5aec68bd2389d0b8b`.
**Main revisada:** `5eab78270291fb34fc7d76fb37752e31413b64cd` / tree `309432607b5dc5391f44b6cf310707f11d2b9e78`.
Os seis arquivos foram obtidos nos dois SHAs imutáveis, seus doze Git blob SHAs confrontados com o inventário #104. O ledger versionado `registers/governance/ce-w26-grook-clinical-c1-20261121.v1.json` documenta decisões, dependências, riscos residuais e rollback por objeto. Não foi importado nenhum dado pessoal, fórmula de terceiro, PDF protegido ou segredo.

## Matriz de decisões e limites

| Objeto | Disposição **somente DEV / código** | O que é realmente provado | O que permanece aberto |
|---|---|---|---|
| `src/components/tools/clinical-tool.tsx` | `SUPERSEDED_WITH_PROOF` | Formulário e DOCX passam a ser condicionados por recursos do contrato | Resultado clínico, validação da escala, revisão dos templates e acessibilidade |
| `src/lib/contract.ts` | `SUPERSEDED_WITH_PROOF` | Sitemap deixa de construir caminhos manualmente e usa `indexablePaths()` do Route Registry, incluindo regra para candidatos não indexáveis | Indexação real, canonical/hreflang completo, metadados clínicos |
| `src/lib/kernel-admit.test.ts` | `SUPERSEDED_WITH_PROOF` | Testes contra nove validadores legados que retornam `true` sem prova e contra a aprovação automática; usa PGlite descartável | Evidência de validator real, identidade de aprovador e banco operacional |
| `src/lib/kernel-admit.ts` | `SUPERSEDED_WITH_PROOF` | Rejeita resultados não booleanos; na entrada SQL verifica IDs de nove validadores legados e exige política assinada/segregação do autor | API pura `admit()` mantém `validatorIds` opcional; callers e provas em DB ainda exigem auditoria |
| `src/lib/template-contract.ts` | `SUPERSEDED_WITH_PROOF` | Regras de recursos/ações permanecem no contrato; `frame`/`note` passam ao catálogo por tela | Campos por tela, qualidade UI/UX e aceite de design system não aprovados |
| `src/lib/contract-index.generated.ts` | **`HOLD_CONTRACT_COMPLETENESS_AND_RIGHTS`** | Diferença quantitativa comprovada: 83 contratos de ferramenta histórica versus 5 publicados na main; 78 identificadores históricos não indexados | Completude de 76 além dos candidatos, links a fontes, direitos, validação clínica, compatibilidade de DB e publicação |

## Crosswalk integral dos 78 IDs históricos

O manifesto `registers/governance/ce-w26-grook-78-tools-crosswalk-20261121.v1.json` preserva os **78 IDs** ausentes do índice publicado, individualmente classificados: **2 candidatos no catálogo atual** (`aldrete`, `exames-laboratoriais`), **4 rótulos de possível escopo não clínico** (férias, adicional-noturno, horas-extras, rescisão; revisão de escopo, não exclusão) e **72 itens sem localização validada nas outras fontes**. Esses 72 podem estar em outros arquivos, branches, banco, Drive ou repositórios; não há prova de 72 perdas nem justificativa para reimportação em produção.

Dos cinco itens no catálogo atual — Braden, Morse, APGAR, gotejamento, IMC — a existência de contrato de código **não** é prova de validação da fórmula, licença, `release_gate`, aplicação clínica ou cobertura de especialidades. Cada item precisa de identidade versionada, campo/fórmula, população e parâmetros, fontes normativas, licença, testes vetoriais e gate de segurança.

## Fontes primárias e implicações normativas

- **<a href='https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/'>Resolução COFEN nº 736/2024 (oficial)</a>**: Processo de Enfermagem; arts. 2º–4º exigem suporte teórico, escalas/instrumentos validados e protocolos baseados em evidências para avaliação; arts. 6º–8º definem competências profissionais e registros. Revoga especialmente a Resolução 358/2009. Esta fonte **não** valida automaticamente as escalas aqui implementadas.
- **<a href='https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/produtos-para-a-saude/manuais/software-como-dispositivo-medico-perguntas-e-respostas'>ANVISA — RDC 657/2022 e FAQ de Software como Dispositivo Médico</a>**: verificar eventual enquadramento SaMD segundo uso pretendido/funcionalidade. A aplicabilidade concreta à plataforma permanece **não determinada**; não declarar regularização/isenção por inferência.

Estas normas oferecem critérios de avaliação; não constituem laudo de conformidade, parecer clínico, autorização de importação de fontes ou cessão de direitos.

## Gates automáticos

`scripts/ce-w26-grook-clinical-c1-verify.mjs` compara o inventário imutável **48/48** e os três ledgers anteriores, recusa SHA forjado, falsa baixa e mudança retroativa, confere os **78 IDs**, os dois HOLDs e flags de release. A nova suíte `scripts/ce-w26-grook-clinical-c1.test.mjs` testa as invariantes de contrato/rotas e **executa o arquivo `src/lib/kernel-admit.test.ts`** com Node strip-types e PGlite descartável; não confundir esse teste com PostgreSQL operacional remoto. Esse arquivo de teste TS não estava enumerado no comando original de `npm test` e agora recebe execução explícita pelo novo wrapper de CI.

Requerer `verify` e `ce-integration-gate` `completed/success` no SHA exato da PR; merge autorizado na `main` protegida e `verify` de push no SHA de merge. Se falhar, HOLD sem bypass. As diferenças de Kernel só podem ser declaradas **resolvidas em código DEV**, não admitidas clinicamente, mesmo após CI.

## Contadores e não encerramento das branches

Dos **48 objetos** inventariados para `grook_10_26`, este lote propõe **5 decisões de código DEV**, totalizando **20/48 (41,67%)** com as 15 anteriores. Permanecem **28/48 (58,33%) não resolvidos**: 1 OAuth issuer HOLD, 1 índice de catálogo HOLD, 16 runtime e 10 interface. Nenhuma branch histórica `SEALED`; a `grook_10_26` exige a resolução individual das 28 pendências e dependências antes de `DEV_RECONCILED`. A branch técnica pode apenas receber `DEV_RECONCILED_TECHNICAL_SCOPE` se sua árvore coincidir com a main, PR integrada e CI pós-merge PASS.

**Nenhuma escrita remota**, deploy, publicação clínica, apropriação de licença ou aprovação do proprietário foi executada. Rollback somente por PR auditável sem restaurar automaticamente validadores legados inseguro.
