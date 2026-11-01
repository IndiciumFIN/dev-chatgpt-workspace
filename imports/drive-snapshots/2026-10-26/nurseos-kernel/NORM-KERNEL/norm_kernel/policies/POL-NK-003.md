# POL-NK-003 — Capacidades, Invariantes e Emendas Estruturais (v1.0.0)

**Status:** Active · **Severity:** blocking · **Enforcement point:** kernel + deploy gate
**Aprovado por:** Leivis Lima (diretriz 2026-09-29) · **Guardião do registro de capacidades:** KERNEL (único)
**Anexo normativo:** field_norms.json v1.2.0 — pin sha256:3b921bb5f8736a399f2d26a5f35951d0ffe9af764de9c8468b2f1d5575749ff6 (POL-NK-001 v1.0.4)
**Registro de capacidades:** capabilities.json v1.0.0 — pin sha256:3f1b771a429b91c4842731bdfbf6b10e6ed18aad775147623811c2a7bbf41180

## Enunciado

Ainda que não saibamos tudo que LLMs e agentes FARÃO, já sabemos o que NÃO PODEM
FAZER. Capacidades são declaradas por ator (default-DENY); invariantes negativos
(INV-001..012) valem para qualquer ator não-humano, presente ou futuro. O KERNEL
é o único responsável por guardar e fazer valer este registro.

## Cláusulas

- **C1 Capacidades declaradas (default-deny).** Todo ator (kernel, humano,
  superagente, agente, LLM) tem capacidades explícitas em capabilities.json,
  pinado nesta política. O que não está declarado é PROIBIDO. LLM: leitura e
  rascunho apenas (INV-011).
- **C2 Kernel único guardião.** Somente o kernel mantém o registro de
  capacidades, valida OS, versiona, arquiva e move artefatos. Nenhum outro ator
  — inclusive o superagente — tem essas capacidades.
- **C3 Campos bloqueantes.** Todos os campos normados dos 5 registros NK são
  bloqueantes: ids, status, checksums, evidence_id, canon_refs, pins, versões.
  Alteração sem OS aceita que a cubra = **deploy RECUSADO**.
- **C4 Versionamento é do kernel.** O campo version é bloqueado; bump de versão
  só por OS do kernel (INV-003).
- **C5 Arquivar/mover é do kernel.** Nenhum agente arquiva ou move artefatos,
  registros ou templates (INV-004).
- **C6 Excluir é humano.** Nenhuma OS de exclusão existe nem é aceita; exclusão
  de registros é ato HUMANO com evidência (INV-005). O deploy gate recusa
  qualquer registro removido da linha de base.
- **C7 Deploy gate.** Antes de qualquer deploy/publicação, o gate compara os
  campos bloqueantes contra a linha de base assinada (EV-NK-0006): diff sem OS
  aceita que o cubra → REFUSED. Alteração silenciosa por humano ou agente em
  campo bloqueante também é recusada até ato de política.
- **C8 Emenda constitucional (mudança estrutural).** Criar/alterar itens em
  metamodelos, registros estruturais ou templates que geram outros artefatos
  exige: (1) o superagente notifica o humano; (2) **OS validada primeiro pelo
  kernel** (estrutura da emenda: matriz de impactos completa — entidades,
  campos, gates, validadores, render, migração, re-pin, rollback); (3) documento
  de Emenda (NK-EMENDA-NNNN, checksum); (4) **segunda aprovação HUMANA**. O
  kernel NÃO aplica emenda sem aprovação humana registrada (INV-006, INV-012).
  Ninguém — nem o kernel — move metamodelos, registros ou templates sem
  aprovação humana.
- **C9 Auto-aprovação proibida.** Nenhum ator valida e aprova a própria
  mudança: kernel valida, humano aprova (INV-007).

## Emenda histórica

- **NK-EMENDA-0001** (aprovada por diretriz do Leivis, 2026-09-29): criação da
  POL-NK-003, capabilities.json, deploy gate, order_kind "amendment" e
  entity_name "metamodel" no anexo (re-pin v1.0.4). Human approval: mensagem
  original do Leivis desta conversa.
- **NK-EMENDA-0002** (PENDING — aguarda Leivis): fonte única de enums
  (gerador TS a partir do anexo pinado). Kernel validou estrutura da emenda
  (OS NK-OS-0008); NADA foi aplicado até aprovação humana.

## Invariantes

INV-001..INV-012 declarados em capabilities.json — violação de qualquer um é
falha crítica bloqueante.

capabilities_sha256: sha256:3f1b771a429b91c4842731bdfbf6b10e6ed18aad775147623811c2a7bbf41180
field_norms_sha256: sha256:17530e3c282741cb2aca72c8e2d44a10a92f550d44176031fd6626407566b0a3

## Semântica de evidência das recusas (clarificação v1.0.1)

O journal de recusas é o registro de ENFORCEMENT: ainda não sabemos tudo que
atores tentarão (C1), mas toda tentativa fora do metamodelo fica registrada
verbatim — o tipo solicitado ('delete', requester LLM etc.) vive no
ServiceOrder recusado como EVIDÊNCIA. Conformidade de enum (order_kind) e o
INV-011 (requester) aplicam-se a ordens ACEITAS: aceitar tipo proibido ou
solicitação de LLM é a violação real. Recusa sem motivos ou sem assinatura é
violation. Provas no journal: NK-OS-0009 (delete → INV-005), NK-OS-0010 (LLM →
INV-011) — ambas recusadas, registradas, nada executado.
