# POL-NK-004 — Materialização, Versionamento e Restauração (v1.0.0)

**Status:** Active · **Severity:** blocking · **Enforcement point:** kernel (materializer) + gate G8
**Aprovado por:** Leivis Lima (diretriz 2026-09-29) · **Instrumento do kernel:** materialization/materializer.py (INV-004)
**Gate:** G8-materialization (norm-kernel-pipeline v0.4.0)

## Enunciado

Artefato em draft NÃO materializa em pastas de produção: não impacta o projeto,
exceto pelo fato de o agente poder executar a atividade de construção. Só o
KERNEL move artefatos entre camadas, sempre sob OS aceita.

## Cláusulas

- **C1 Draft não materializa.** Artefato draft vive em `materialization/drafts/`.
  Zero impacto em produção, homologação ou versionamento. O agente pode
  construir, editar e preparar o artefato livremente nesta camada.
- **C2 Materialização por OS do kernel.** Nenhum artefato sai de drafts/ sem OS
  aceita (transição) cobrindo o registro a que pertence. Deploy acontece SOMENTE
  da camada `producao/`.
- **C3 Camadas de pasta (mover é do kernel, INV-004):** `drafts/` →
  `homologacao/` → `producao/` → `versionamento/` (camada de versionamento);
  `quarantena/` para bloqueados. `materializer.py` é o instrumento do kernel:
  recusa qualquer move sem OS correspondente.
- **C4 Versionamento = id NOVO vinculado.** Nova versão nasce com id sequencial
  novo + `version_of` apontando à versão anterior; inicia como draft (C1) e não
  impacta produção enquanto a anterior estiver publicada.
- **C5 Aprovação da nova versão.** Com OS aceita, a nova versão materializa em
  `homologacao/` (só impacta homologação); ao subir a `producao/`, o KERNEL move
  a versão anterior para `versionamento/` — o kernel move o outro artefato.
- **C6 Restauração (rollback).** Em caso de erro de deploy ou qualquer problema,
  restaura-se com NOVO código sequencial carregando o CONTEÚDO da versão
  anterior ao deploy errado (checksum do conteúdo deve conferir — G8). A versão
  ruim vai para `quarantena/` (move do kernel). Id nunca é reescrito nem
  reutilizado com conteúdo diferente.
- **C7 Gate G8.** Verifica: produção só com OS aceita de validação; nenhum draft
  fora de drafts/; cadeias `version_of` íntegras (versão anterior em
  versionamento/producao/quarantena); restauração carrega exatamente o conteúdo
  (checksum) da versão restaurada; manifest ↔ pastas coerentes.

## Fluxo provado (drill EV-NK-0007)

v1 NK-BUNDLE-0001 (drafts → OS-0012 → homologacao → OS-0013 → producao, deploy
possível) · v2 NK-BUNDLE-0002 (id novo, version_of=0001, nasce draft → OS-0015
homologacao → OS-0016 producao; kernel move v1 → versionamento) · deploy ruim
simulado em v2 → restauração NK-BUNDLE-0003 (id novo, conteúdo da v1,
restored_from=0001; v2 → quarantena; OS-0017/0018/0019 → producao).
