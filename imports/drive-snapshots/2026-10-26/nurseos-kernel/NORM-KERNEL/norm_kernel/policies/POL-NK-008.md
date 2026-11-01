# POL-NK-008 — Codificação no Metamodelo, Documentação de Processos e Ledger de Tasks (v1.0.0)

**Status:** Active · **Severity:** blocking · **Aprovado por:** Leivis Lima (diretriz 2026-09-29 13:35; EMENDA-0004/OS-0034)
**Gate:** G12-lifecycles-tasks · **Documentação de processos:** docs/processes.md

## Enunciado

Tudo tem codificação no metamodelo e registro. Processo novo nasce com
documentação e OS de governança própria, rastreado até a produção. O kernel
registra CADA task no register E no artefato — referência cruzada, bloqueante.

## Cláusulas

- **C1 Processo novo = documento + OS de governança + rastreio.** Todo
  processo que ainda não existe nasce com documentação (entrada, saída,
  arestas, OS que o opera, gates que o cobrem, registro) em
  `docs/processes.md`, com OS de governança NOVA referenciando-o, e
  rastreamento até a produção (camadas do materializador, POL-NK-004).
  Processo sem documentação = artefato solto (POL-NK-005) → bloqueio.
- **C2 Codificação no metamodelo.** Todo comportamento — máquinas de estado
  (lifecycles: birth + transitions), enums, sequências de id — vive no ANEXO
  PINADO como dados; o código DERIVA em runtime e nunca define. Drift
  código×anexo = G12 bloqueia. (A codificação já corrigiu incoerência real:
  fixture em lifecycles de entidades cujo enum não o previa.)
- **C3 Ledger de tasks com referência cruzada (bloqueante).** A CADA task, o
  kernel registra em AMBOS: no register (`registers/kernel_tasks.json`:
  os_id ↔ run_id ↔ evidence_id ↔ artefatos alterados ↔ timestamp) e no
  artefato (o registro governado carrega evidence_id/OS refs). Task sem
  entrada no ledger = G12 bloqueia o run.
- **C4 Nada sem register.** Reforço de POL-NK-005: arquivo, função, processo,
  protocolo, dependência — tudo registrado com checksum, norma e
  template_fields. O ledger e a documentação de processos são artefatos
  registrados.
- **C5 Documentação é versionada como código.** docs/processes.md segue o
  regime integral: OS para mudar, registro com checksum, re-registro
  automático no run com --os.
