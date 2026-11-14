# CKO — recibo de sincronização Git M08 e M09 (14/11/2026)

A pergunta "todas as alterações estão no Git?" foi resolvida com **aplicação efetiva no repositório CE privado**:

- Destino: [IndiciumFIN/calculadorasdeenfermagem, PR #39 (DRAFT)](https://github.com/IndiciumFIN/calculadorasdeenfermagem/pull/39), branch `feat/cko-m08-m09-corpus-atomic-20261114`.
- Dois ZIPs originais completos versionados **como blobs Git**, sem apenas redirecionamento ao Drive: M08 **18 arquivos**, SHA `1663f80280684aa005aa58e029c1dabdeba3cd05fb8b15cefccb9abc5c9bfff4`; M09 **16 arquivos**, SHA `f0abd0869df21d09b9e78d8557f6c2e31ed2cafeae21c32a4912071df8739860`. Total **34 arquivos internos**, em dois pacotes Git.
- Snapshot de **104 linhas** dos cadastros M08/M09 do PMO mestre (source/document/evidence/claim/content/change/conflict/HOLD/program), agora versionado na branch privada, comparando 46 IDs de claim e 43 de átomos contra a branch editorial.
- `GIT_SYNC_MANIFEST.json`, `README.md`, `validate-atomic-content.py` e workflow de CI no repositório privado.
- CI [run #43579697365](https://github.com/IndiciumFIN/calculadorasdeenfermagem/actions/runs/43579697365): **PASS** com reconciliação de ZIPs, fonte↔documento↔fragmento, IDs e flags de HOLD.
- `dev-chatgpt-workspace` PRs #66/#67/#68: permanecem como **branches de trabalho e rastreabilidade**, não a localização privada de textos. Atualizar os metadados para apontar ao PR CE.

**Exclusões documentadas:** SQLite original contendo textos externos e direitos restritos, documentos integrais de terceiros, credenciais e quaisquer dados pessoais **não** foram copiados ao Git. Permanem no corpus/Drive privado com SHA/IDs. A existência do pacote autoral em Git **não aprova** publicação clínica.

**Gates ainda em aberto:** vigência normativa por artigo, direitos por operação, revisão clínica/editorial e aprovação de publicação. A `main` do CE, o Supabase e os arquivos do Drive permanecem intactos.

Este recibo encerra a **sincronização de arquivos M08/M09 e snapshot operacional**. Não certifica que toda a história de outras branches/repos/projetos esteja reconciliada. O PMO segue com suas 59 atividades e os 29 claims legados em HOLD.
