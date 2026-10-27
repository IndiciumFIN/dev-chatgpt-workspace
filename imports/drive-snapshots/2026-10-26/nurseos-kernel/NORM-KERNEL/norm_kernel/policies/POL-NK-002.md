# POL-NK-002 — Ordem de Serviço do Kernel (v1.0.1)

**Status:** Active · **Severity:** blocking · **Enforcement point:** kernel (runtime + registro ServiceOrder)
**Aprovado por:** Leivis Lima · **Data:** 2026-09-29 · **Anexo normativo vigente:** field_norms.json v1.1.0
**Pin do anexo (POL-NK-001 v1.0.3):** sha256:3b921bb5f8736a399f2d26a5f35951d0ffe9af764de9c8468b2f1d5575749ff6

## Enunciado

O KERNEL é o único escritor dos registros NK. Nenhum agente, humano ou pipeline
escreve diretamente; toda escrita nasce de uma ORDEM DE SERVIÇO (OS) aceita pelo
kernel. O kernel não é autoridade máxima — é o GUARDIÃO dos metamodelos aprovados
em política; ele nunca decide contra a política, apenas a executa.

## Cláusulas

- **C1 Escrita única.** Só o kernel cria/atualiza registros NK (NormSource,
  NormDocument, NormAtom, DictionaryTerm, ExtractionRun, ServiceOrder). Escrita
  direta fora da OS = quarentena pelo intake guard (workflows NK Guard). Evidências
  e políticas são escritas por atos de política documentados (fora do escopo da OS).
- **C2 Ordem de serviço obrigatória.** Toda escrita requer OS com: solicitante,
  registro-alvo, rascunho, id solicitado (opcional). Sem OS, não há escrita.
- **C3 IDs centralizados e assinados.** O kernel gera/confere o id COM O ACEITE da
  OS: id vai ao registro E ao artefato. O artefato recebe assinatura pessoal do
  kernel (sha256 do conteúdo canônico + os_id), preenchida pelo kernel no aceite,
  registrada no ServiceOrder.
- **C4 Status é do kernel.** Só o kernel altera status, exclusivamente via OS de
  transição, e somente se o artefato atende às especificações exigidas (Anexo I).
  Criação sempre nasce em `draft`; runs são fatos imutáveis (única saída: quarantined).
- **C5 Validadores aprovados em política.** O kernel executa apenas os validadores
  do Anexo II, nas versões aprovadas. Validador não listado não roda.
- **C6 Pré-consulta ao metamodelo; recusa registrada.** Antes de abrir um registro,
  o kernel consulta o anexo pinado e as políticas aprovadas; conteúdo fora do
  metamodelo/enum/composição/arestas = RECUSA REGISTRADA no ServiceOrder com
  motivos — o kernel nunca aceita criar deliberadamente algo fora do metamodelo.
- **C7 Orquestração.** O kernel orquestra o pipeline E-P-A-C-V-G-P: extração,
  parse, atomização, canonização, validação, governança e publicação. Toda
  publicação só após gates aprovados.

## Anexo I — Máquinas de estado (C4)

Toda criação via OS nasce em `draft` em todos os registros (exceto ExtractionRun, fato imutável nascido `passed`/`blocked`/`partial`).

| Registro | Transições permitidas |
|----------|----------------------|
| NormAtom | draft→review_pending/quarantined; review_pending→valid/draft/quarantined; valid→revoked/superseded/quarantined; quarantined→draft |
| NormDocument | draft→review_pending/valid/quarantined; review_pending→valid/draft/quarantined; valid→revoked/superseded/quarantined; quarantined→draft |
| NormSource | draft→active/pending_license/quarantined; active→suspended/revoked/quarantined; pending_license→active/quarantined; suspended→active/quarantined; quarantined→draft |
| DictionaryTerm | draft→active/quarantined; active→deprecated/superseded/quarantined; quarantined→draft |
| ExtractionRun | passed/blocked/partial→quarantined (fatos imutáveis) |

`fixture` e estados terminais só saem para quarantined. Qualquer transição fora
desta tabela = recusa registrada.

## Anexo II — Validadores aprovados (C5)

| Validador | Versão | Papel |
|-----------|--------|-------|
| normKernelIntake (guard) | v0.1.0 | validação estrutural + conteúdo + arestas; quarentena |
| normKernelOrder (kernel) | v0.1.0 | pré-consulta ao metamodelo, OS, ids, assinatura, transições |
| normKernelMetaAudit | v0.1.0 | conformidade metamodelo↔conteúdo vivo |
| normKernelPublishGate | v0.1.0 | excelência nativa da página gerada |
| Pipeline gates G1–G7 | norm-kernel-pipeline-v0.3.0 | reconstrução, cobertura, elos, field_norms+pin, ISO 8000, conformidade de valor, camadas normativas |

## Anexo III — Camadas normativas por campo (vínculo com POL-NK-001 v1.0.2)

Nenhum campo tem UMA norma só: cada campo tem norma primária (de maior impacto)
+ 6 camadas transversais obrigatórias (metamodelo, schema, validadores,
vinculação, contratos, ISO 8000) + camadas específicas onde aplicável (SEO,
acessibilidade, design system, engines, contratos, i18n, render, runtime) —
declaradas no anexo v1.1.0, verificadas pelo gate G7.

field_norms_sha256: sha256:17530e3c282741cb2aca72c8e2d44a10a92f550d44176031fd6626407566b0a3
annex_pin_reference: POL-NK-001 v1.0.2 (mesma autoria de política; qualquer divergência = DRIFT)


## v1.1 — Exceção de nascimento para runs (2026-09-29, diretriz 'nada contraditório')

**C4-exceção:** `ExtractionRun` é SAÍDA de instrumento do kernel (pipeline
assinado): nasce TERMINAL. A OS de criação declara o resultado do run
(`passed|blocked|partial`); `draft` não existe no universo de status de run
(anexo v1.3.0) — nascimento em draft seria contradição. Correção aplicada:
registros NK-RUN-0005/0006 criados fora do protocolo foram removidos e
recriados via OS (NK-OS-0024/0025), com o resultado declarado.
