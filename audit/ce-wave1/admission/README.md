# CE Wave 2 — pré-verificação de admissão do Kernel (CANDIDATE / HOLD)

**Não é um executor, não assina decisões, não instala o patch e nunca concede autorização.** Esta entrega apenas prepara o contrato para que o Kernel real verifique uma admissão de WO, vinculada ao SHA da branch, manifesto e arquivo ZIP.

## O que foi verificado

- Baseline GitHub: `IndiciumFIN/dev-chatgpt-workspace`, branch `integration/structural-overlay-20261101` (último HEAD observado antes da gravação do próprio pacote: `d118df555fcaf27c257f1f17dd63fcc347119104`). Não usar essa referência como HEAD futuro sem nova leitura remota.
- ZIP v0.6.4 SHA-256 `5b1c83586d4241e3f0f43a32c06aebd6e9934c289556f2a7302c61e5394634f7`.
- `PATCH_MANIFEST.json` SHA-256 `958d5a91229e9ee7b186787a2a28b64e98eeb7e05fe293bf2cb80397b99fd7d2`, 35 caminhos ativos propostos.
- A `main` e o banco não são alvos desta operação; revisar/admitir patch é diferente de aprovar conteúdo editorial ou release.

## Prova do bloqueio real

`src/core/kernel/kernel.ts` e `signer.ts` ainda são os módulos ativos e emitem pseudoassinaturas textuais. O v0.6.4 arquivado contém correções *candidatas* que devem ser aplicadas somente com executor confiável. O banco já contém registro de governança, mas não uma admissão assinada vinculada a esse SHA/manifesto. Nenhum segredo nem chave confiável está neste repositório.

## Pré-verificador

`verify-admission-preflight.mjs` compara SHA, identificadores, expiração, pacote, segregação e assinatura Ed25519, usando âncora confiável independente. Ele **não** aceita a âncora vinda do próprio pedido e a CLI atual não recebe chave de confiança, portanto sua saída é sempre HOLD e código 2; nenhum parâmetro `--apply` é aceito. Testes positivos usam exclusivamente uma chave efêmera gerada durante os testes e retornam `PRECHECK_OK_KERNEL_LOOKUP_REQUIRED`, **não** `ADMITTED`.

```sh
node --test audit/ce-wave1/admission/verify-admission-preflight.test.mjs
node audit/ce-wave1/admission/verify-admission-preflight.mjs audit/ce-wave1/admission/request.template.json # exit 2, esperado
```

## Decisões/evidências ainda necessárias

1. Criar/reutilizar FIND, TASK e WO válidas com a política e validações correspondentes; a existência de uma WO marcada `IN_PROGRESS` não é admissão.
2. Emitir, **por processo de Kernel confiável**, uma decisão assinada por identidade segregada, sob chave pública ancorada externamente, vinculando `expectedHead` atual, manifesto, pacotes e prazo.
3. Verificar no sistema de registro a decisão assinada e permissões para *apenas* escrita no branch candidato, com lease e hashes dos sete blobs de substituição.
4. Executar e comprovar testes e CI no novo commit. Promover à `main` exige decisão independente e proteção de branch.

`request.template.json` contém valores nulos deliberados para não simular FIND, TASK, política, aprovador ou decisão. **Não preencher automaticamente.**
