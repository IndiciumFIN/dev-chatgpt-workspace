# POL-NK-006 — Nascimento Determinístico e Registro Bloqueante (v1.0.0)

**Status:** Active · **Severity:** blocking · **Aprovado por:** Leivis Lima (diretriz 2026-09-29)
**Gates:** G9 (registro universal), G10 (findings) · **Instrumentos:** pipeline.py (--os), build_artifact_register.py

## Enunciado

O agente (ou LLM) só faz o que está na OS. Tudo fora da OS é bloqueado. O
registro universal é BLOQUEANTE: a aprovação de uma OS pelo kernel atualiza
automaticamente TODAS as camadas no run governado — nada é atualizado à mão.

## Cláusulas

- **C1 IDs automáticos.** Todo id é gerado pelo KERNEL (sequências declaradas:
  NK-ATOM-NNNNNNN, NK-DOC-NNNNN, SRC-NNNN, DICT:namespace:slug derivado,
  NK-RUN-NNNN, NK-OS-NNNN, NK-FIND-NNNN, NK-BL-NNNN, NK-JOB-NNNN). `requested_id`
  só é honrado para seeds/fixtures/migração COM justificativa na OS; id
  inventado fora do padrão = recusa. Nenhum registro nasce sem OS aprovada
  (provado pelo deploy gate: registro novo sem OS → deploy RECUSADO).
- **C2 Sem OS, sem alteração.** Nenhuma alteração de artefato (arquivo,
  registro, manifest) sem OS que a cubra. Diff detectado (G9/G8/deploy gate)
  = RUN BLOQUEADO — não segue em frente, não publica, não materializa.
- **C3 Diff → finding automático.** Bloqueio por diff sem cobertura abre
  finding AUTOMATICAMENTE (registers/findings.json, POL-NK-007) com
  investigação formal. Não se "ajeita" artefato: investiga-se.
- **C4 OS aprovada atualiza todas as camadas.** No run governado
  (`pipeline.py --os NK-OS-NNNN`), o kernel re-registra o artifact_register,
  atualiza o manifest e assina a evidência — atomicamente. O re-registro
  manual NÃO existe; manual = violação (ver NK-FIND-0003).
- **C5 Reserva determinística de OS.** A OS que registra um run usa o próximo
  id da sequência; o pipeline referencia essa reserva no `--os` e no
  `last_os` do registro. A OS é completada com o resultado assinado
  imediatamente após o run; inconsistência OS↔run = finding de auditoria.
- **C6 Jobs de extração são OS.** Todo job (backlog → download → atomização)
  nasce do backlog (NK-BL-NNNN), ganha OS própria, registra tentativas
  (registers/extraction_jobs.json) e termina em run + documento + evidência
  rastreáveis ponta a ponta (ver source_playbook.md).
