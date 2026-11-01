# CE — Wave 1: auditoria, pacote executável e staging isolado

Registro de 01/11/2026. Este ramo arquiva as evidências e o pacote executável sem alterar o código ativo nem conceder autorização para execução.

## Fontes e integridade
- `CE_WAVE1_FULLTREE_26_BRANCHES_20261101.json` e `.md`: matriz histórica de 26 branches na data da auditoria. Após a criação deste ramo o universo passou a incluir também esta branch de evidências.
- `CE_WAVE1_RECONCILIACAO_ESTRUTURAL_20261101.json` e `.md`: reconciliação da camada estrutural.
- `executable-package/CE_APLICACAO_CANDIDATA_v0.6.4.zip`: pacote original, 63.005 bytes, SHA-256 `5b1c83586d4241e3f0f43a32c06aebd6e9934c289556f2a7302c61e5394634f7`, Git blob SHA `b712fc4c0c6e002880e0ff55d400662781a496b4`.
- `executable-package/`: instalador `apply_patch.py`, manifesto, hashes, README e estado do gate para inspeção.
- `staged-source/`: os **35 arquivos completos** do manifesto em caminhos relativos preservados sob prefixo de arquivo; estes caminhos **não são** os caminhos ativos do app.
- `PENDING_UPLOADS_v0.6.4.json`: 28 arquivos ainda ausentes no destino ativo e 7 que requerem substituição, com hashes dos originais.

## Estado de autoridade
- `main` no momento da auditoria: `e9f7fe66075ebe5d7346072dc3a1b4934678c6de`, **não alterada** por esta entrega.
- `integration/structural-overlay-20261101`: `081c61ac6c6ea674934d1cad3c310e96476fc9a1`, **não alterada** por esta entrega.
- `KERNEL_ADMISSION_NOT_VERIFIED`; `HOLD_HUMAN`; a aplicação `--apply` foi deliberadamente bloqueada.
- **Somente arquivos de auditoria:** a existência de scripts em `staged-source/` ou `executable-package/` não autoriza execução, DDL, merge, publicação ou sobreposição de arquivos canônicos.
- Local: integridade dos 35 arquivos validada; 37/37 testes PASS. CI integral do repositório e integração com o Kernel não concluídas.
- Issue de governança #25; PR de integração #30. Ambas permanecem sujeitas aos gates existentes.

Esta branch é um ponto de recuperação e revisão, não uma nova autoridade canônica. O ZIP deve ser extraído e o instalador executado **somente** em checkout isolado e após admissão assinada/verificável do Kernel para o escopo exato.
