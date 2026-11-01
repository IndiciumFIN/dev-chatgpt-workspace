# Backlog pendente — Research Hub / CKO
**Estado:** OPEN/FIND / HOLD. A atividade de consolidação foi encerrada, **não estes itens**.

## P0 — bloqueios
| ID | FIND / dependência | Critério de saída |
|---|---|---|
| GOV-001 | WO de Research ainda `NOT_SUBMITTED`; Issue #23 aguarda serviço Kernel/PMO | admissão real, política, validador, decisão, identidade, evidence e assinatura verificáveis; ou HOLD justificado |
| FIND-RES-XBR-001 | WO tem enum de `execution_status` inválido e campo `validation_evidence` extra | `work_order.schema.json` 2020-12 validado, recebimento em `audit_evidence`, manter HOLD até admissão |
| FIND-RES-XBR-002 | `useMemo` condicional dentro do módulo Relatório | correção de Rules of Hooks e E2E de alternância entre painéis |
| FIND-RES-XBR-003 | `localStorage` persiste texto livre científico sem política de retenção | minimização, rascunho efêmero e opção explícita/segura de exclusão de legado, revisão LGPD |
| FIND-RES-XBR-004 | Identificador de participante gerado pelo browser não é identidade nem anti-Sybil | isolamento fail-closed de laboratório, origem, abuso, rate limiting, moderação, revisão de consentimento conforme finalidade |
| FIND-RES-XBR-005 | Kernel corporativo/OPA privado não foram comprovados como autoridade de admissão | obter decisão pelo controle autorizado, não por scripts ou Issue GitHub |
| CI-001 | CI global da PR #19 falha: gate PMO exige `WO-ADM-001=PAUSED` mas registro/documento autorizam escopo local `IN_PROGRESS` | extrair correção seletiva PR #13 e CI global + Research no mesmo commit |
| HUMAN-001 | revisão humana e aplicabilidade Lei 14.874/2024, LGPD e regras éticas | evidência específica do caso de uso; sem aprovar pesquisa com seres humanos por checklist genérico |
| RELEASE-001 | PRs #13, #19 e #1 permanecem Draft/HOLD | critérios independentes de segurança, acesso, conteúdo e publicação, sem merge/deploy antecipado |

## P1 — integração, qualidade e controle
| ID | Pendência | Critério |
|---|---|---|
| FIND-RES-XBR-006 | 9 schemas candidatos sem ligação demonstrada MD → REG → source/evidence → research_method → graph constraints | crosswalk e bindings por objeto, sem segundo registro canônico |
| FIND-RES-XBR-007 | risco de colisão de sequência `migrations/0004_*` com branch idioma/consolidado-19 | reconciliar migrador e identificadores; sem DDL em banco oficial |
| FIND-RES-XBR-008 | branches com bases divergentes, diffs grandes e SHAs mutáveis | readback exato; montagem/seleção de alterações sem merge indiscriminado |
| FIND-RES-XBR-009 | CI candidato não cobre hooks, paridade WO, retenção, adversariais e WCAG completa | testes de contrato, segurança, a11y, navegador e CI global e específico no mesmo SHA |
| FIND-RES-GATE-019 | validador v0.1.8 aceitava caminhos inesperados com hashes corretos | aplicar verificador v0.1.9 à integração real e certificar paths/blobs; 16 testes sintéticos não bastam |
| PREVIEW-001 | preview da pesquisa no HEAD não comprovado; Vercel Free retornou limite de deployments diário | ambiente de revisão isolado, prova de commit implantado e smoke tests |
| VISUAL-001 | revisão humana do Design System e acessibilidade WCAG completa | 360/768/1024/1440, zoom/reflow, leitor de tela, contrastes, navegação teclado |
| PRIV-001 | retenção, DPIA/RIPD quando aplicável, threat model, persistência de produção | decisões de finalidade, base legal, RBAC, RLS, backups, exclusão e segregação |
| DATA-001 | PGLite temporário não é base persistente institucional | contrato de armazenamento e autorização antes de banco remoto |
| INTEGRATION-001 | patches locais v0.1.5 a v0.1.9 não foram executados sobre uma árvore completa | aplicar após WO e executar typecheck, lint, build, E2E, testes negativos, rollback |
| ARTIFACT-001 | ZIPs incrementais anteriores estão apenas na entrega local/conversa, não são blobs deste commit | upload separado se for exigida preservação byte-a-byte em Git; conferir SHA256 e licenças |

## P2 — capacidades e decisões de produto
- Moderação e contestação de conteúdo/propostas; integridade de votos e prevenção a bots.
- Viés, representatividade, baixa amostra e interpretação estatística responsável.
- Integrações para encaminhamento oficial com evidência de protocolo por jurisdição.
- Locales internacionais: não transportar indevidamente autoridade de Cofen/Coren para outros países.
- Desenvolvimento e homologação das capacidades ainda sem evidência: **16 totalmente não evidenciadas**, **7 com recursos reutilizáveis não vinculados**, além de complementar as **7 parciais**. Ver `CAPACIDADES-30.csv`.
- Normativos de pesquisa, fontes públicas/abertas e licenças: revisar aplicabilidade por modalidade de estudo; não pressupor aprovação CEP/CONEP.

## Sequência para retomar (não-executável enquanto HOLD)
**Kernel/PMO → WO válida → extrair reparo PMO PR #13 → integrar branch Research PR #19 em branch isolada aprovada → aplicar patches em fonte conferida → CI global e Research no mesmo SHA → revisão humana/regulatória/segurança → homologação e eventual publicação.**

**Tarefa concluída:** inventário/conciliação/handoff. **Itens acima NÃO concluídos.**
