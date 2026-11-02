# POL-NK-005 — Registro Universal: Nada Nasce Solto (v1.0.0)

**Status:** Active · **Severity:** blocking · **Aprovado por:** Leivis Lima (diretriz 2026-09-29)
**Gate:** G9-universal-registration (pipeline v0.5.0) · **Instrumento:** registers/build_artifact_register.py

## Enunciado

Nada nasce solto. Todo artefato — arquivo, função, metamodelo, estrutura do
site, dependência, protocolo, asset — nasce REGISTRADO, com norma (sintética
ou granular), campos de template declarados e qualidade de excelência.

## Cláusulas

- **C1 Universalidade.** Todo artefato tem registro no
  `registers/artifact_register.json` com id (`NK-ART-*`), checksum sha256,
  norma vinculada e camada. Artefato fora do registro = gate bloqueado.
- **C2 Campos de template declarados.** Todo registro declara
  `template_fields` — a estrutura do artefato é conhecida antes do conteúdo.
- **C3 Norma sintética ou granular.** Cada artefato carrega norma sintética
  (política de origem + cláusula) ou granular (anexo field_norms pinado).
- **C4 Nada contraditório.** G9 bloqueia: ids duplicados, checksum divergente
  do registrado, registro sem norma, ciclos em cadeias de versão.
- **C5 Alteração determinística com ambientes.** Toda OS declara exatamente o
  que muda; o deploy gate recusa diff fora do coberto (nenhum campo adjacente
  é tocado); a mudança roda em TESTE (gates do pipeline), materializa em
  HOMOLOGAÇÃO e só sobe a PRODUÇÃO após PASS (POL-NK-004 camadas).
- **C6 Comunicação entre agentes via kernel.** Todo agente fala com o kernel
  EXCLUSIVAMENTE por OS (ServiceOrder com assinatura sha256 do kernel). Sem
  canal lateral; kernel é o único escritor dos registros. O Protocolo OS v1 é
  artefato registrado (template: os_id, requester, order_kind, entity_name,
  decision, signature, validators_run, evidence_id, refusal_reasons).
- **C7 Dependências pinadas.** Toda dependência externa declarada com versão:
  `@base44/sdk@0.8.31` (funções TS), stdlib Python (scripts), zero não-pinado.
  O `dependency_register` é o package.json governado deste projeto.
- **C8 Estrutura do site registrada.** Página e seções (header, nav, fontes,
  documentos, átomos, dicionário, ordens, runs/evidências, aderência, footer)
  são artefatos registrados com template_fields; front-end continua GERADO
  (POL-NK-001 C4), nunca editado.
