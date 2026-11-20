# CE/NCOS — fronteira entre preservação e integração funcional (20/11/2026)

**Fonte:** `IndiciumFIN/calculadorasdeenfermagem@e0f62491b104f4a97c6025a6393cabc2e7ada30e`. **Destino:** `IndiciumFIN/dev-chatgpt-workspace@main`.

## Situação e denominadores

- **176/176 entradas históricas classificadas:** 150 arquivos arquivados como bytes históricos + 20 aliases deduplicados reversivelmente + 6 colisões canônicas não sobrescritas. **170/176 = 96,6% documentalmente tratados**, porém 6 colisões continuam em HOLD.
- Esta onda trata os **38 arquivos que estavam `PENDING_TRIAGE`**. Todos foram preservados sob `intake/legacy-ce/` e permanecem `admitted=false`. **0/38 componentes integrados funcionalmente**. Nenhum banco alterado, nenhum código histórico importado ou workflow ativado.
- O verificador Git exige mesmo SHA de objeto e tamanho byte-exato da origem, enquanto verificações SHA-256 já presentes para lotes anteriores continuam ativas. Os 38 desta onda usam SHA de blob Git e tamanho como prova do snapshot; o SHA-256 é opcional no esquema atual.

## Decisão por família

| Família | Objetos | Decisão | Critério de conclusão funcional |
|---|---:|---|---|
| CLI e Kernel | 9 | HOLD_RUNTIME_COMPATIBILITY | Corrigir imports, testes reais de erro/fail-closed, autoridade, isolamento e fluxo sem rede |
| Validadores e schemas | 15 | BLOCKED_PLACEHOLDERS | Corrigir 9 validadores de domínio que retornam `True, None` sempre, validar com casos adversariais e fontes |
| UI Next.js | 6 | HOLD_FRAMEWORK_MIGRATION | Portar por componente/rota para arquitetura Vite; E2E, i18n e acessibilidade |
| SQL de migrations | 2 | BLOCKED_PUBLIC_READ_POLICIES | Não aplicar; reconciliar schemas remotos, privilégios, RLS, rollback, idempotência e autorização |
| Autorizações WO legadas | 4 | BLOCKED_MALFORMED_JSON_AUTHORITY | Padding de comentários invalida JSON; registros `PREAUTHORIZED` históricos não têm força operacional |
| Outros (`.gitkeep`, `test.txt`) | 2 | ARCHIVE_ONLY | Sem artefato funcional a migrar |

### Invariantes

A pasta `intake/legacy-ce/` é **histórica e excluída do deploy pelo `.vercelignore`**. O material legado só pode ser reutilizado mediante seleção de código compatível, testes por função, verificação de segurança, licença e proveniência. Arquivamento não equivale a homolagação, correção do código ou promoção de objetos clínicos.

Ver catálogo machine-readable: `registers/governance/ce-legacy-functional-readiness-20261120.v1.json`.

### Próxima implementação funcional controlada

1. **Kernel / validadores** — atualizar o contrato de registro e rejeitar validadores placeholder; escrever suíte negativa para cada um, comparar política/rastro com contrato canônico, sem habilitar decisões clínicas.
2. **CLI e inventário Drive** — isolar funcionalidades read-only dos comandos de ingestão/escrita e reconciliar com serviços existentes; não duplicar pipeline nem publicador.
3. **Migrations** — inventário SQL e delta de schemas no banco atual, sem DDL remoto; registrar migrations candidatas somente após idempotência, revisão RLS e rollback.
4. **UI** — mapear componentes reutilizáveis da tela de Builder e descartar boilerplate Next incompatível.
5. **Gates finais** — CI por SHA, testes negativos, aprovação humana independente e `RELEASE_ELIGIBLE` por módulo.

**Resultado documental:** 96,6%. **Resultado funcional dos 38:** 0/38 admitidos. **Conclusão global CE/CKO/NCOS:** não aferível por esse denominador.
