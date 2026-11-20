# NORM-KERNEL — Stack, Governança e Valor para o C-Level (v1.0.0)

> Documento gerado sob OS; fonte canônica: registers/stack.json (NK-STACK-0001).
> Regime: Lei 9.610/1998 art. 8º (citação obrigatória); ISO 27001/42001 citadas
> sob KL-0004 (pending_contract, evidenciado); COBIT/ITIL/NIST AI RMF são
> CANDIDATOS de mercado, ainda não adotados — adoção exige fonte registrada (OS)
> + análise canônica (POL-NK-009).

## 1. Nossa stack (documentada, versionada, com ADRs)
| Camada | O quê | Versão | Por quê (ADR) |
|---|---|---|---|
| Plataforma | Base44 (SDK @0.8.31) | viva | sem infra própria, foco no produto (NK-ADR-0001) |
| Banco | Entidades Base44, schema JSON | anexo v1.4.0 pin 17530e3c | metamodelo pinado = drift detectável (NK-ADR-0004) |
| Funções | 5 funções Deno/TS (order/intake/metaAudit/deployGate/renderPage) | v0.5.1/v0.3.1/v0.2.1/v0.2.1/v0.1.2 | validação server-side como guardião |
| Hooks | 6 workflows CNCF SWF v1.0 (entidade→intake) | NK Guard | guard automático universal, PROVADO (F-0006) (NK-ADR-0005) |
| Instrumentos | Python 3.11: pipeline v0.7.2 (15 gates), check_links, materializer, atomizer | v0.7.2 | gates bloqueantes auditáveis |
| Front-end | GERADO do grafo (edição manual proibida) | alvo WCAG 2.2 AA + LH ≥ 95 | rastreabilidade campo→norma→tela (NK-ADR-0006) |
| Serialização | JCS RFC 8785 + sha256 (checksums, assinaturas, pins) | — | determinismo byte-a-byte (NK-ADR-0007) |

## 2. Como decidimos (ADRs NK-0001..0008, íntegra em registers/stack.json)
Toda decisão estrutural é um ADR com alternativa considerada, motivo e evidência.
A decisão-mãe: **a OS (ServiceOrder) é o único ID bloqueante** — nenhuma
mudança (código, dado, política, pin, front-end) existe sem uma OS assinada, e
toda mudança caminha por **Desenvolvimento → Teste → Homologação (humana) →
Deploy** (POL-NK-011). O kernel valida e assina; **nunca aprova**.

## 3. Valor por C-Level
- **CEO**: produto auditável de ponta a ponta; documentação COM evidência
  (cada não-aplicável tem motivo registrado) = ativo comercial e defesa
  reputacional; time-to-valor por fatia (Fase 0 concluída; Fase 1 em curso).
- **CIO**: policy as code — 11 políticas, 15 gates bloqueantes, 76+ OSes com
  assinatura; guard automático em cada hook; pins anti-drift no metamodelo;
  incidentes com protocolo 5W (F-0006: detectado e contido em segundos).
- **CFO**: audit trail assinado reduz custo de auditoria/certificação;
  recusas legítimas no journal = evidência de controle funcionando; licenças
  verificadas POR FONTE (KL) = risco legal reduzido; rollback testado com
  conteúdo restaurado por id novo (perda mínima); opex previsível (sem infra).
- **CISO**: quarentena automática, deploy gate com baseline, detecção de
  drift e tamper (drills provados), segregação kernel/humano.
- **COO**: processo DTH formal, backlog com fonte/método/OS, jobs rastreáveis.
- **CDO/DPO**: LGPD como cânone PENDENTE EVIDENCIADO — bloqueante antes de
  qualquer fatia com dados pessoais (NK-BL-0003).

## 4. Melhores práticas: adotadas vs candidatas
Adotadas e registradas no cânone (universals.json, 19 entradas): RFC 2119
(canon_complete), RFC 8785/JCS, ISO 8000 (por campo, com dimensão declarada),
WCAG 2.2, SemVer, CNCF SWF, JSON Schema, Lei 9.610, LGPD (pendente), IETF TLP,
ISO 27001 e 42001 (metadata_alternative — controles existentes mapeados;
análise integral exige licença, evidenciada).
Candidatas NÃO adotadas (exigem fonte via OS + análise canônica): COBIT 2019,
ITIL 4, NIST AI RMF.

## 5. Documentação pendente (honestidade declarada)
ver registers/stack.json → pending_documentation (6 itens, cada um com
justificativa e dono). Nada escondido: pendência é estado explícito e
auditável aqui.
