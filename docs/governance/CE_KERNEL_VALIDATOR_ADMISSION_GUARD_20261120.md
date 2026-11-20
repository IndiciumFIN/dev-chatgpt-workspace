# CE/NCOS — Kernel: barreira contra validação legada incondicional

Data: 20/11/2026. Repositório canônico: `IndiciumFIN/dev-chatgpt-workspace@main`.

## Alteração funcional implementada

O caminho real de admissão `src/lib/kernel-admit.ts`, que avalia ordens da tabela `kernel_order`, agora recebe **o identificador de cada validador** recuperado de `kernel_validator`, além do campo `passed`.

O Kernel rejeita todos os nove identificadores registrados no manifesto de riscos como validadores antigos de sucesso incondicional: CATMAT, CID-10, CID-11, CVX, revisão humana, LOINC, MeSH, NCM e schema. A comparação normaliza espaço e caixa. A regra devolve `reject: legacy-validator-untrusted:<id>`, mantém a ordem `rejeitada` e o manifesto em `rascunho` (sem aprovador), mesmo se houver assinatura de política válida, valor booleano `true` e aprovador distinto do solicitante.

Validações recebidas como string `"false"` ou outros valores truthy deixam de equivaler a `true` em `admit()`; somente booleano literal verdadeiro passa. O caminho de banco continua convertendo valores SQL booleanos com a rotina existente e não concede identidade por alegação do cliente.

## Evidências de teste

- `src/lib/kernel-admit.test.ts`: negativas para os nove IDs, case/whitespace, discrepância de quantidade/ID, string truthy; prova em PGlite de que `kernel_order` com validador `human_review_validator` marcado como `passed=true` permanece rejeitada com manifesto em `rascunho`. Teste positivo existente com `forma` permanece para detectar regressão indevida.
- `scripts/ce-legacy-functional-readiness.test.mjs`: conjunto de IDs bloqueados deve ser idêntico aos nove identificados no manifesto, e a consulta SQL/transferência de IDs na admissão devem continuar presentes.
- Não foi necessário importar ou executar nenhum módulo Python histórico.

## Limites e próxima rodada

Esta barreira é **defesa contra IDs legados específicos**, não prova de origem/autenticidade de qualquer outro validador. **0 dos 38 arquivos históricos** estão funcionalmente admitidos e as seis colisões de raiz seguem HOLD. A proteção não resolve automaticamente assinaturas de evidência clínica, licença, proveniência, validação dos termos de referência ou autorização externa.

Próxima etapa: definir registry de validação com identidade confiável e versão, implementar validadores determinísticos P0 em módulo independente (sem reusar os nove stubs), incluir teste de proveniência/evidência, e somente depois avaliar admissão com aprovação humana. SQL legado e interface Next.js permanecem isolados.
