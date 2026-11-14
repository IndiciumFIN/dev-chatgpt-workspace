# Centro administrativo canônico — contrato de execução v0.1.0

## Decisão e escopo

Solicitação do proprietário (2026-10-23): **a área administrativa deve ser o ponto de controle e fonte da verdade dos dados governados e de sua experiência entregue ao usuário final.** O primeiro incremento é funcional, progressivo e seguro, mantendo o isolamento exigido por `AGENTS.project.md`.

**Estado do incremento:** implementação de UI administrativa / demonstração funcional browser-local, não homologação de autoridade remota, clínica ou multiusuário.

### Regra de autoridade sem ambiguidade

- **Fonte de verdade de edição deste incremento:** `local-publication-register.ts` no **navegador atual**, com slots de `draft` e `published`, revisões e eventos. Seus consumidores locais usam `local-canonical.ts`. Uma edição não altera critérios, fórmula, references ou campos clínicos.
- **Fontes de verdade estruturais existentes:** `src/lib/tools/catalog.ts`, `src/lib/template-catalog.ts`, `src/lib/template-contract.ts`, `src/lib/tools/contracts.ts`, design tokens globais. O painel deriva deles sem duplicar dados mestre.
- **Alvo arquitetural aprovado para desenho, NÃO implementado:** registro de autoridade persistente e multiusuário, contratos por domínio, segregação de papéis, ingestão e lineage, revisão clínica, emissão de versão assinada, publicação do content-pack e projeções públicas. Nenhum `localStorage` será chamado de fonte de verdade global.
- **Bloqueios mantidos:** `DB_ENABLED=false`, nenhuma chamada de gravação Supabase, sem mutação administrativa remota, sem captura de PHI, publicação local não é RELEASED e não supera `md_gate=CLOSED`.

## Jornada concreta do administrador

1. Abre `/admin`: encontra status da revisão, escopo e contexto explícito de isolamento; painel de indicadores dos registros **de fato presentes**, sem inventar cobertura.
2. Acessa **Conteúdos**: pesquisa e seleciona instrumento; edita título, descrição e flag editorial; vê mensagens de limite e validade em contexto; grava rascunho independente.
3. Consulta **Prévia público/assinante**: alterna projeção do rascunho versus publicada; a simulação informa que exibe apenas apresentação e aponta a rota real quando há publicação local.
4. Em **Templates** consulta o único catálogo do sistema, contrato e disponibilidade, sem criar template paralelo.
5. Em **Fontes e controle** verifica identificadores, referências e requisitos de revisão; o painel não insinua que existência de referência prove validação clínica.
6. Em **Publicação** exporta backup JSON, importa apenas como rascunho, acompanha revisões e publica **somente localmente**, após confirmação, nunca com edições pendentes.

## Regras de interface e integridade

- Navegação progressiva em 5 módulos; desktop com menu lateral, mobile com navegação horizontal de toque.
- CSS estritamente escopado em `.ce-admin`, usando **exclusivamente** os tokens de DS existentes (navy, ice, ink, line, canvas, paper, foco). Lucide do próprio projeto; componentes `PageHero` e `Breadcrumb` canônicos, controles min. 44px, foco existente, aria-live e mensagens sem dependência exclusiva de cor.
- Não criar nova coleção de templates, tokens, catálogo, schema CKO ou motor de publicação concorrente.
- Invalid/dirty/external-conflict devem falhar fechados. Importação arbitrária rejeitada por `validateWorkbench`; todas as publicações mantêm revisão otimista, sem promoção implícita de legado. Exportação apenas de metadados não sensíveis.
- Acesso protegido da Vercel com SSO é **controle de ambiente**, não autorização administrativa por ação. `/admin` continua demonstração local até contrato auth/roles/policies e backend aprovados.

## Execução e gates

| ID | Critério | Verificação objetiva |
|---|---|---|
| G-ADM-01 | Único console para `/admin` e `/oficina-local` | Import canônico único, sem UI duplicada |
| G-ADM-02 | Reuso de fontes canônicas | imports reais de tools, templateCatalogo, templateContracts |
| G-ADM-03 | Separação draft/published | scripts de publicação existentes e teste de regressão |
| G-ADM-04 | UX de navegação e edição | interface funcional, validação e preview por audiência |
| G-ADM-05 | Sem backend remoto | auditoria isolamento + inspeção de chamadas de rede |
| G-ADM-06 | Acessibilidade e responsividade | browser E2E/capturas desktop/mobile e axe; **PENDENTE** até execução em browser |
| G-ADM-07 | Homologação clínica | HOLD_HUMAN até revisão de fontes, direitos, regras e casos-ouro |
| G-ADM-08 | Fonte multiusuário definitiva | HOLD_HUMAN, requer decisão sobre persistência, RBAC e pipeline versionado |

## Plano de evolução (sem alegações de implementação)

1. **G0 — Design da autoridade**: contratos de `source`, `claim`, `rule`, `tool`, `template`, `component`, `policy`, `release`, `publication`, `revision` e `evidence`, com chaves, relações, owners e campos progressivos. Organizar planejamento → protótipo → desenvolvimento → testes → homologação.
2. **G1 — Console local (este incremento)**: UX final com prévia por público, edição editorial real e indicadores derivados das fontes disponíveis, sem interferir no banco.
3. **G2 — Fonte governada**: backend com migrações e RLS, perfis, auditoria com imutabilidade, transações/locks, hashes e evidências; depende de admissão/autorizações.
4. **G3 — Integração canônica**: aprovar versões de conteúdo via workflow, derivar conteúdo público/assinante/PDF/app por projeção, no schema repetido/manual.
5. **G4 — E2E/UI e segurança**: Playwright, testes de autorização negativos, acessibilidade e visual diff; em cloud.
6. **G5 — Homologação**: revisão e assinatura humana conforme criticidade, release gates sem bypass.

## FINDs e impedimentos permanentes

- `FIND-ADM-001`: UI local não é banco canônico multiusuário; não prometer sincronização/autoridade global.
- `FIND-ADM-002`: referência declarada não equivale a licença, binding, evidência e aprovação clínica.
- `FIND-ADM-003`: teste visual real e ações em navegador ainda não executadas para este incremento; não declarar homologação.
- `FIND-ADM-004`: autorização administrativa remota por função/usuário ainda não implementada; SSO da Vercel não resolve RBAC/RLS.
- `FIND-ADM-005`: catálogo de templates completo é leitura; campos normativos/CKO não editáveis até schemas, owners, validators e gates devidamente admitidos.

**Sem aprovação de migração de backend:** nenhuma ferramenta/LLM/agent deve escrever remotamente, criar objetos de autoridade ou publicar conteúdo clínico aprovado por inferência.
