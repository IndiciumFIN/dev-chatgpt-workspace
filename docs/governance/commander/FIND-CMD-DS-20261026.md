# FIND-CMD-DS-20261026 — Divergência de autoridade visual
**Situação:** CANDIDATE / HOLD_HUMAN. **Origem:** WO-DS-001, dependente de WO-E2E-001.
**Decisão do proprietário:** Commander e demais produtos devem consumir o DS oficial aprovado, em preto e branco, sem DS paralelo e sem misturar lógica funcional com estilo.
**Evidência versionada divergente:** `contracts/entities/design-tokens.v1.json` define `frozen:true`, `authority:src/lib/site-data.ts` e valores canônicos navy/sky/ink. A folha administrativa `src/styles/admin-console.css` é consumidora desses tokens. Não há evidência versionada suficiente para substituir silenciosamente o contrato inteiro por preto/branco.
**Risco:** promover o protótipo Manus ou alterar tokens no CSS administrativo criaria outra autoridade e propagaria divergências a componentes reutilizáveis.
**Controle implementado:** `scripts/check-commander-ds-boundary.mjs` é gate estrutural, não homologa a escolha cromática. Reporta explicitamente `DS_BLACK_WHITE_OWNER_DIRECTION_NOT_REFLECTED_IN_FROZEN_NAVY_CONTRACT` e `promotion:HOLD_HUMAN`.
**Critério de desbloqueio:** identificar artefato homologado e sua versão/hash; mapear tokens semânticos, temas, contrastes WCAG e exemplos de componentes; registrar decisão aprovada; ajustar gerador/contrato fonte, em vez de sobrescrever JSON gerado; comparar impactos no site e no Commander; testes visuais/E2E e auditoria independente.
**Cadeia de aprovação:** FIND → política/contrato → validador → WO → OPA → Kernel → execução isolada → testes → auditoria → promoção autorizada.
**Não realizado:** mudança cromática, autorização do Kernel, alteração do Supabase, merge, deploy.
