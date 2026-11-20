# Dev ChatGPT Workspace — contrato canônico de consolidação

**Decisão do proprietário: 19/11/2026.** **Destino único de versionamento de código, contratos, documentação, planos, evidências e governança dos ambientes e projetos autorizados:** [IndiciumFIN/dev-chatgpt-workspace](https://github.com/IndiciumFIN/dev-chatgpt-workspace), branch **main**. Esta decisão substitui a arquitetura anterior de duas mains canônicas para CE/CKO/NCOS.

> STATUS: DECISÃO REGISTRADA / MIGRAÇÃO OPERACIONAL PENDENTE. A existência deste contrato não prova que outros repositórios, aplicações, bancos, deploys ou conteúdos já tenham sido integrados, testados, homologados ou publicados.

## Alcance e fronteiras

- O Workspace é o **repositório canônico único** de código-fonte e gerenciamento de mudanças. Calculadoras de Enfermagem, CKO, NCOS, Simulados, Vila do Cuidado, Research Hub, Currículos, Conteúdo Educacional, Carreira/Portal Jovem, Internacionalização e respectivos serviços e agentes devem ser reconciliados e absorvidos modularmente nele, conforme direitos, dependências e gates.
- Outros projetos do proprietário que utilizem o Workspace, como WU-TRIB, permanecem **isolados por domínio**, dados, identidade, controles, fontes e design system. É proibido misturar informação tributária/contábil ao conteúdo de enfermagem.
- O Supabase **Calculadoras-Smart** (ref pgsybzggewhinaniybiy) permanece como **banco operacional** do ecossistema de enfermagem. Versionar no Workspace seus contratos, inventários, manifests e migrations aprovadas. Dados de produção, segredos, PHI ou credenciais **não** são migrados para o Git. Não criar outro banco, branch de banco, schema concorrente ou ambiente de produção por conveniência.
- GitHub Actions, Vercel, Google Drive e serviços externos continuam sendo ambientes de execução/armazenamento separados fisicamente, com configuração/contratos/lineage controlados neste repositório. A designação como repositório canônico não os 'move' fisicamente nem autoriza deploy.
- Repositórios anteriores são **fontes históricas/candidatas**: manter acessíveis e imutáveis até reconciliação, aceite, verificação de completude e definição explícita de arquivamento. Não excluir nem mudar sua main automaticamente.

## Regra operacional: nenhuma branch nova

- **Não criar novas branches, PRs baseadas em branches novas, repositórios, forks ou projetos Supabase** para esta migração. Priorizar commits pequenos e verificáveis em Workspace@main, com SHA e testes; reutilizar PRs/branches já existentes apenas para absorver seu conteúdo por diff, sem torná-las novas autoridades.
- Não dar push/merge forçado em repositórios de origem. Respeitar o ruleset ativo na main de IndiciumFIN/calculadorasdeenfermagem (PR + Gate Agregador), sem bypass. O Workspace@main estava sem proteção ativa na consulta de 19/11: isso não equivale a permissão para contornar testes ou aprovações.
- Antes de cada commit: conferir HEAD, impacto de workflows/deploy, árvore, hashes e estado dos testes; nunca sobrescrever mudança concorrente. Após cada commit: conferir SHA, checks e contrato funcional; registrar reversão via commit e, após aceite, tag/release.
- Não tratar um commit em main como liberação clínica, editorial, jurídica, de segurança, LGPD ou produção.

## Linhagens e checkpoints de origem (inventário, não integração)

| Origem | SHA main verificado em 19/11/2026 | Situação para migração |
|---|---|---|
| IndiciumFIN/dev-chatgpt-workspace | dacfaa6bc29fd213ffc4d63998b4dd669d10854b | Base canônica anterior a esta decisão; há PRs de conteúdo, segurança e integração ainda abertas |
| IndiciumFIN/calculadorasdeenfermagem | e0f62491b104f4a97c6025a6393cabc2e7ada30e | Fonte CE/CKO/NCOS; extrair deltas e evidências, preservar ruleset |
| IndiciumFIN/leaf-lilac-bamboo-craft | b8c25f38029dd6aa69b0965e336af5933c2da231 | Fonte de recuperação; CI reprovado por 6 erros TS na rota do blog, não promover integralmente |
| IndiciumFIN/raven-beam-lion-lagoon | 87218a63ae43f2c31210a41e54400ceb73543710 | Ancestral direto do Leaf; deduplicar por blob SHA antes da importação |
| IndiciumFIN/calculadorasdeenfermagem-backup-20261031 | e0f62491b104f4a97c6025a6393cabc2e7ada30e | Backup a preservar sem exclusão |
| IndiciumFIN/ce-bibliotecas-dev | fa70e9e5395f7344349555274795dc39fec8072a | Fonte auxiliar privada; verificar direitos, hashes e diferenças |

Supabase Calculadoras-Smart: **255 migrations remotas distintas**, **320** canonical_objects, **111** clinical_tools e **0** linhas em ce_platform.clinical_evidence_bindings na consulta de 19/11. As duas SQL legadas do Leaf não constam no histórico remoto e permanecem sem autorização de execução. Medidas de cada snapshot são escopadas e não equivalem a aprovação clínica.

## Destino lógico, sem refatoração prematura da raiz

- **apps/**: experiências públicas e administrativas por produto; cada aplicação com domínio, versão, design system e gates próprios (ex.: calculadoras, simulados, vila, carreira).
- **packages/**: contratos, CKO, NCOS/Kernel, validadores, parsers, terminologias, componentes reutilizáveis, conteúdo atômico e geradores.
- **infra/**: definição de ambientes, CI, Vercel e migrations Supabase versionadas por projeto, após reconciliação com o histórico remoto.
- **docs/governance/**, **registers/**, **audit-evidence/** e **tests/**: planos, WO/FIND, decisões, fontes, direitos, QA e evidências.
- Estes caminhos são **destinos de arquitetura propostos**; a app atualmente na raiz continua intacta até haver testes de regressão e migração por arquivo/módulo. Não criar arquivos em duplicidade apenas para cumprir uma árvore idealizada.

## Programa de migração — um módulo por vez

1. **Censo e reconciliação:** mapear repositório/branch/ref, SHA de árvore e blob, licença, classificação de dados, owners, arquivos e dependências; marcar DUPLICATE, SOURCE_ONLY, MIGRATE, REJECTED ou HOLD por objeto. Priorizar delta real, não contagem de branches.
2. **Baseline controlada:** comparar cada fonte com Workspace@main e registrar WORK_ORDER, origem/hash, destino, risco, teste, mudança e decisão. Preservar conteúdo histórico divergente quando houver risco de redução editorial ou perda de autoria/licença.
3. **Recuperação técnica:** sanar primeiro typecheck, imports, parsers, validadores, integridade, OPA/Kernel, autenticação e gates; integrar no Workspace em lotes pequenos; CI e testes adversariais por SHA.
4. **Corpus e produção educacional em paralelo:** currículos das 65 especialidades e 80 subáreas, mercado/vagas verificadas, fontes normativas licenciadas, atomização/proveniência, conteúdos do básico ao avançado, questões, flashcards, casos e simulados. Permitir estados candidatos; não permitir autopromoção ou publicação clínica.
5. **Supabase sem duplicação:** cruzar PK/FK, versões, RLS/grants, views, contratos e evidências com o banco existente; preparar apenas migrations incrementais comprovadas. Não copiar as 96 migrations locais de runner próprio para supabase_migrations. Testes isolados, reexecução idempotente, restore/rollback, análise de segurança, aprovação específica e readback antes de qualquer DDL/DML remoto.
6. **Vercel/UX/I18N:** validar build real, preview, E2E, WCAG, perf, SEO, PWA e 19 idiomas por módulo. Registrar projeto e domínio de execução, sem assumir deploy por existência do workflow.
7. **Admissão e encerramento:** revisão independente clínica, jurídica, segurança e editorial; registrar PASS/FAIL/HOLD por componente; release/tag por módulo aprovado; somente então decidir arquivamento das fontes históricas sem apagar seu histórico.

## Evidência obrigatória em cada checkpoint

Referência de origem (repo, branch, SHA e caminho), fingerprint de conteúdo, deduplicação, evidência primária, licença/rights, mudança no Workspace (commit SHA), testes executados e não executados, baseline e delta, risco, responsável, estado (PASS/FAIL/HOLD), vínculo com issue/WO, próximo passo e, quando aplicável, ação de rollback. Não inventar percentuais globais; usar numerador e denominador de cada camada.

## Precedência e restrições preexistentes

- Esta autorização explícita do proprietário permite **planejar e executar reconciliações entre repositórios** dentro do escopo CE/CKO/NCOS que antigos artefatos de backup restringiam até autorização posterior. Ela **não** aprova automaticamente cada merge, migration remota, publicação, exclusão, uso de material licenciado ou decisão clínica. Os invariantes de segurança e preservação do AGENTS.project.md permanecem aplicáveis ao baseline histórico; não o reescrever silenciosamente.
- Preservar a cadeia existente intake → plano/decisão → protótipo → desenvolvimento → teste → auditoria/evidência → revisão humana → liberação autorizada, bem como WO, política ativa, metamodelo/dicionários, Kernel, manifesto, evidência, preview e gate.
- No histórico do Workspace há colisões entre famílias locais de migration e linhas do banco remoto, e PRs em HOLD. Nunca fazer merge em massa ou tratar presença de arquivo, teste sintético verde ou SQL versionado como funcionalidade/homologação.

## Registro de execução

- **19/11/2026: DECIDIDO** — alterar a arquitetura para uma única fonte canônica GitHub: Workspace@main; não criar branches novas. Migração operacional ainda **NÃO CONCLUÍDA**.
- Fonte de controle complementar: issue #33 do próprio Workspace, com checkpoints posteriores por SHA; o EPIC CKO #74 do repositório de origem fica como referência histórica até sua transferência/reconciliação, não como autoridade concorrente.

### Checkpoint de intake ZIP Grok — 19/11/2026

- Fonte única: anexo `SM6sLe7ewvFk234t-grok-workspace.zip`, SHA-256 `aaec35a5bc21d8f24f61446f413f11a2084c1b28e67806bdb44d038bd127d853`, 137 entradas / **102 arquivos**, 4.041.259 bytes compactados. O ZIP é material de origem e não deve entrar no repositório nem no deploy.
- Inventário versionado **102/102 (100% de classificação)**: `registers/governance/grok-workspace-intake.v1.json` contém hashes completos por arquivo e dez classes de decisão. Isto é uma cobertura de **intake**, não de implantação.
- **7/102 documentos (6,9%)** migrados byte a byte: `.grok/skills/og/SKILL.md` e seis referências; **1/102 (1,0%)** configuração não secreta reconciliada, mantendo `VITE_AUTH_ENABLED=false` no preview ao invés do `deploy.database=true` conflitante no ZIP; **2/102 (2,0%)** logs/status excluídos de forma definitiva.
- **92/102 (90,2%)** fontes candidatas ou em HOLD específico, detalhadas no inventário: documentação da plataforma 6, skills de auth/UX 13, material de jogos/plataforma 34, skills opcionais de jogo com licenças indicadas 25, arte/brand 9, fontes 3, serviços externos Neon/xAI 2. Não confundir candidato com rejeitado; não ativar orientações externas como normas CE.
- Gate de CI: `scripts/check-grok-workspace-intake.py` e sete testes adversariais `scripts/check-grok-workspace-intake.test.py`, chamados no workflow `.github/workflows/verify-bibliotecas.yml` **antes** da simulação de exclusões Vercel e de `npm ci`. O gate falha se hashes dos restaurados mudarem, se aparecer arquivo `.grok` não inventariado ou se as configurações canônicas forem sobrescritas.
- Auditoria local offline com o ZIP original: **102/102 SHA-256 verificados, PASS**; `--release-gate` permanece **HOLD** por 92 objetos ainda sem aceitação. O CI verifica a **integridade da base admitida**, não certifica 100% de conclusão da migração operacional nem garante que mudanças futuras nunca tenham falhas.
- Próximas ondas: W1 revisar os 19 arquivos de plataforma/auth/UX e importar apenas os compatíveis; W2 avaliar licença, propriedade e relevância dos 12 itens de arte/fontes; W3 revisar 59 recursos de jogos, em especial os três módulos MIT com LICENSE/SOURCE; W4 manter Neon/xAI isolados e sem credenciais; W5 conferir build E2E, regressão, direitos e liberação humana. Cada item tem SHA, destino, teste e decisão próprios.
