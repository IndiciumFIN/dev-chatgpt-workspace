# Pendências — Research + Participation Candidate v0.1.0

**Branch candidata:** `feat/research-participation-layer-20261026`  
**Base oficial para diff:** `main`  
**Estado técnico:** VALIDATED_CANDIDATE  
**Estado de governança:** HOLD_HUMAN  
**Kernel admission:** NOT_SUBMITTED  
**Pendência global estimada:** **12%**

> Este arquivo registra somente pendências desta frente. Ele não substitui `docs/PENDENCIAS.md`, que é gerado automaticamente para o projeto global.

## P0 — bloqueios para promoção canônica

### P0.1 — Admissão formal pelo Kernel
- **Estado:** HOLD_HUMAN
- **Falta:** submeter `WO-RES-PART-001` ao fluxo oficial de admissão.
- **Regra:** não converter autorização do proprietário em `ADMITTED`.
- **Evidência atual:** `registers/governance/candidates/WO-RES-PART-001.json`.
- **Critério de fechamento:** evidência de admissão válida, policy set resolvido, manifest/validator aceitos e estado persistido pelo mecanismo autorizado.

### P0.2 — Revisão humana da frente candidata
- **Estado:** PENDING_HUMAN_REVIEW
- **Falta:** revisão do dono e, quando aplicável, especialista de pesquisa/ética/LGPD.
- **Escopo mínimo:** linguagem, experiência, limites do produto, campos coletados, disclaimers, estados da participação e interpretação dos relatórios.
- **Critério de fechamento:** aprovação humana registrada com responsável, data e evidência.

### P0.3 — Verificação de aplicabilidade normativa
- **Estado:** APPLICABILITY_REVIEW_REQUIRED
- **Falta:** concluir a aplicabilidade de Lei 14.874/2024, LGPD e demais normas/regras que incidam conforme o uso concreto.
- **Regra:** a presença de uma referência não significa aplicabilidade integral.
- **Critério de fechamento:** authority binding/evidence refs qualificados para cada requisito promovido.

## P1 — pré-release candidato controlado

### P1.1 — Preview/deployment candidato isolado
- **Estado:** NOT_DEPLOYED
- **Falta:** disponibilizar preview isolado da branch para revisão.
- **Restrição:** não apontar domínio oficial/produção nem banco remoto oficial.
- **Critério de fechamento:** URL candidata, evidência do commit implantado e smoke browser no ambiente.

### P1.2 — Revisão visual humana
- **Estado:** BROWSER_QA_PASS / HUMAN_VISUAL_REVIEW_PENDING
- **Já coberto:** Chromium real em 360/768/1024/1440, sem overflow e sem runtime errors.
- **Falta:** revisão visual humana de hierarquia, densidade, consistência com DS, textos e comportamento responsivo.
- **Critério de fechamento:** aceite visual explícito ou FINDs documentados.

### P1.3 — Acessibilidade completa
- **Estado:** BASIC_BROWSER_A11Y_PASS
- **Já coberto:** nomes acessíveis, teclado básico e alvos primários >=44 px.
- **Falta:** auditoria WCAG completa, contraste, landmarks, ordem de foco, estados de erro, zoom/reflow e leitor de tela.
- **Critério de fechamento:** relatório de acessibilidade e correção dos FINDs aplicáveis.

### P1.4 — Privacidade e segurança operacional
- **Estado:** DATA_MINIMIZED_CANDIDATE
- **Já coberto:** sem campos de nome/e-mail/CPF/telefone/paciente/leito; bloqueio de padrões evidentes; banco local efêmero.
- **Falta:** política de retenção, abuso/spam, rate limiting, moderação, threat model e decisão sobre RIPD/DPIA quando aplicável.
- **Critério de fechamento:** controles aprovados e testes negativos correspondentes.

## P2 — decisões antes de produção

### P2.1 — Persistência de produção
- **Estado:** DECISION_REQUIRED
- **Atual:** PGLite local e efêmero.
- **Falta:** decidir se haverá persistência servidor e, se houver, criar ambiente candidato separado com autenticação/políticas/RLS/logs/backup conforme governança.
- **Regra:** não reutilizar automaticamente o banco oficial.

### P2.2 — Moderação e integridade participativa
- **Estado:** PARTIAL
- **Falta:** política de moderação, duplicidade, abuso, automação/bots, contestação e trilha de decisão.
- **Critério de fechamento:** estados, responsáveis, rules/policy-as-code e evidências testáveis.

### P2.3 — Representatividade, viés e interpretação
- **Estado:** PARTIAL
- **Já coberto:** interface declara que resultados são descritivos e não probabilísticos.
- **Falta:** métricas de cobertura/representação, avisos por baixa amostra, análise de viés e regras para impedir extrapolações indevidas.
- **Critério de fechamento:** representação meter e regras de interpretação aprovadas/testadas.

### P2.4 — Encaminhamento para canais oficiais
- **Estado:** NOT_CONNECTED
- **Falta:** definir integrações/links oficiais por jurisdição e evidência de protocolo/recebimento quando houver.
- **Regra:** nunca usar estado equivalente a “aceito pelo Cofen/Coren” sem prova oficial.
- **Critério de fechamento:** contrato de encaminhamento + evidence binding.

### P2.5 — Internacionalização
- **Estado:** PT_BR_CANDIDATE
- **Falta:** decidir quais partes são universais e quais são específicas de Brasil/Cofen antes de materializar outros locales.
- **Critério de fechamento:** contratos de locale/jurisdição e conteúdo traduzido sem transportar autoridade brasileira para outros países.

## Evidência técnica concluída

- `audit:research-candidate` — PASS.
- TypeScript/typecheck — PASS.
- suíte de testes — PASS.
- build SPA — PASS.
- E2E Chromium — PASS.
- rota candidata `noindex, nofollow` — PASS.
- persistência local do Studio — PASS.
- bloqueio de identificadores óbvios — PASS.
- escuta cidadã — PASS.
- proposta + reação — PASS.
- consenso — PASS.
- teclado — PASS.
- 360 / 768 / 1024 / 1440 sem overflow — PASS.
- erros JavaScript de runtime — 0.

## O que NÃO está pendente nesta wave

Não reabrir sem novo FIND:
- Research Hub;
- navegação/rota candidata;
- 9 schemas candidatos;
- registry candidato;
- migration PGLite local;
- Studio;
- instrumentos;
- ética/LGPD/COI como checklist candidato;
- fontes/evidências;
- equipe/skills;
- riscos/impacto;
- escuta;
- propostas/cocriação;
- consenso;
- devolutiva;
- relatório;
- gate dedicado;
- E2E/browser evidence.

## Regra de promoção

A branch pode ser considerada **tecnicamente validada como candidata**, mas permanece proibida de ser descrita como canônica, homologada, oficial ou aprovada enquanto qualquer P0 estiver aberto.
