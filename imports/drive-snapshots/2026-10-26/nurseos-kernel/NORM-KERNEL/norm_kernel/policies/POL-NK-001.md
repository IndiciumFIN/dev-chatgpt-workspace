# POL-NK-001 — Norma Granular por Campo e Pin do Anexo (v1.0.4)

**Status:** Active · **Severidade:** blocking · **Autor:** Leivis Lima · **Data:** 2026-09-29
**Enforcement point:** gate G4 (check_links.py) · **Aplica-se a:** NormSource, NormDocument, NormAtom, DictionaryTerm, ExtractionRun

Tudo segue da política — nada é infraestrutura solta. Este documento é o ato de
política que fundamenta o regime de campos do NORM-KERNEL. A hierarquia é:
norma vigente > ato de política humano (este) > kernel > serviços > agentes.

## Cláusulas

- **C1 — Registros como fonte única.** Os 5 registros são a única fonte de
  verdade dos seus objetos. Nenhum dado normativo vive fora de registro.
- **C2 — Norma granular por campo.** TODO campo de TODO registro tem norma
  granular + dimensão de qualidade ISO 8000 no anexo `field_norms.json`.
  Campo sem norma = campo órfão = gate bloqueado.
- **C3 — Aderência evidenciada.** O front-end exibe aderência por campo
  ("aderência evidenciada"); a norma fica no registro (details), não no texto.
- **C4 — Front-end gerado, nunca editado.** build_frontend.py gera do grafo
  verificado; mudar registro/artefato e regenerar.
- **C5 — Instrumentos da política.** check_links.py, pipeline.py e os gates são
  instrumentos DESTE ato; alterar o anexo sem novo ato de política = DRIFT e o
  gate bloqueia (padrão POL-026 v1.2 do NURSE-OS).
- **C6 — Universo desconhecido explícito.** Nenhum corte declara cobertura
  acima do que evidencia; desconhecido é listado (padrão POL-027).

## Pin do anexo normativo

field_norms_sha256: sha256:17530e3c282741cb2aca72c8e2d44a10a92f550d44176031fd6626407566b0a3

(Mudou o anexo? Novo ato de política com re-pin e annex_repin_note. Sem isso, DRIFT.)
## Re-pin v1.0.1 (ato de politica — 2026-09-29)

**Motivo:** diretriz do Leivis — declarar o que COMPÕE cada campo (se enum).
- C2 ampliada: cada campo tem agora declaracao de composicao (enum, padrao,
  faixa) no anexo — "conteudo interno dos campos correto e declarado".
- Novo gate G6 (conformidade de valor): registro cujo CONTEUDO viola a
  composicao declarada = BLOCKED (antes o gate so provava norma existente).
- "quarantined" entra nos enums de status: estado de bloqueio do intake guard
  (o kernel bloqueia artefato sem registro ou fora do metamodelo).
- EV-NK-0003/NK-RUN-0003: re-validacao com G6; derivação dos objetos imutáveis
  permanece EV-NK-0002 (cadeia historica preservada).

annex_repin_note: composicao/enum por campo + gate G6 + status quarantined
(novo pin aplicado na secao "Pin do anexo normativo" acima)
## Re-pin v1.0.2 (ato de politica — 2026-09-29)

**Motivo:** diretriz do Leivis — camadas normativas MULTIPOR CAMPO.
- Anexo v1.1.0: cada campo tem norma primaria (de maior impacto) + 6 camadas
  transversais obrigatorias (metamodelo, schema, validadores, vinculacao,
  contratos, iso8000) + camadas especificas onde aplicavel (seo, acessibilidade,
  design_system, engines, i18n, render, runtime).
- Novo registro ServiceOrder (ordem de servico do kernel, POL-NK-002): 15 campos
  normados — total do anexo agora 81 campos, 0 orfaos.
- Novo gate G7 (camadas normativas): campo sem as 6 camadas base = BLOCKED.
- Maquina de estados e validadores aprovados: ver POL-NK-002.

annex_repin_note: normative_layers multipor campo + ServiceOrder + gate G7
(novo pin aplicado na secao "Pin do anexo normativo" acima)
## Re-pin v1.0.3 (ato de politica — 2026-09-29)

**Motivo:** divergencia REAL capturada pelo proprio kernel nas provas da OS
(NK-OS-0001/NK-OS-0002): POL-NK-002 C4 exige que toda criacao nasce em `draft`,
mas os enums de status de NormDocument, DictionaryTerm e NormSource nao tinham
`draft`. O kernel-order recusou a criacao em vez de aceitar deliberadamente —
comportamento correto; a correcao é ato de politica documentado.
- Enums de status ganham `draft` como estado inicial (NormDocument, DictionaryTerm,
  NormSource; NormAtom e ServiceOrder ja tinham).
- Anexo v1.1.1. Ajuste concomitante: Anexo I da POL-NK-002 (NormSource ganha
  transicao draft) e intake guard (enums sincronizados).

annex_repin_note: draft como estado inicial nos enums de status (divergencia
capturada pelo kernel-order, OS-0001/0002)
## Re-pin v1.0.4 (ato de politica — 2026-09-29, diretriz Leivis / POL-NK-003)

- ServiceOrder.order_kind ganha "amendment" (emenda estrutural: kernel valida,
  humano aprova) e entity_name ganha "metamodel" (alvo de emendas).
- Anexo v1.2.0. Emendas subsequentes seguem POL-NK-003 C8: OS validada pelo
  kernel + documento de Emenda com matriz de impactos + segunda aprovação
  humana — ninguém move metamodelos, registros ou templates sem aprovação humana.

annex_repin_note: amendment/metamodel na OS (processo de emenda da POL-NK-003)


## Re-pin v1.0.5 — ato de política (2026-09-29)

Emendas **NK-EMENDA-0002** (fonte única de enums: guards derivam enums do
anexo pinado em runtime) e **NK-EMENDA-0003** (campos version_of/restored_from
em NormAtom e NormDocument) **APROVADAS por Leivis Lima** (diretriz
2026-09-29). Anexo v1.3.0, novo pin registrado em EV-NK-0008 e no
AgentPolicy POL-NK-001 v1.0.5. Baseline do deploy gate (EV-NK-0006) mantida:
campos novos são opcionais e ausentes da v1.2.0, sem efeito no diff.


## Re-pin v1.0.6 — ato de política (2026-09-29, 13:35)

**NK-EMENDA-0004 APLICADA** (OS-0034; aprovação humana: diretriz Leivis
13:35): seção `lifecycles` no anexo (birth + transitions por entidade,
como DADOS); kernel-order v0.5.0 deriva a máquina do anexo em runtime —
código não define comportamento. Codificação detectou e corrigiu
incoerência: transições `fixture` existiam no código para NormSource e
DictionaryTerm cujos enums não incluem fixture. G12 bloqueante (POL-NK-008).
