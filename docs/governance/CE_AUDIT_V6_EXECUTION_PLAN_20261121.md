# CE / NCOS — Plano de execução verificável após Auditoria v6

**Data:** 21/11/2026 · **Versão:** `CE.AUDIT.V6.EXECUTION_PLAN.v1`  
**Controle canônico:** [Épico #90](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/90) · [32 ações históricas #103](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/103) · [PR #89](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/89)  
**Ledger máquina:** `registers/governance/ce-audit-v6-execution-ledger-20261121.v1.json`.  
**Checagem:** `node scripts/ce-audit-v6-execution-ledger.mjs` e testes adversariais `node --test scripts/ce-audit-v6-execution-ledger.test.mjs`.

## Fonte, integridade e limites

A auditoria recebida `INDICIUMFIN_AUDITORIA_V6_INCREMENTAL_20261121.zip` contém cinco arquivos funcionais (um parecer, changelog, diff, README e script Python) e um manifesto de integridade. **5/5 SHA-256 e bytes PASS**; o patch revertido reconstrói exatamente a v5 (SHA-256 `997b882014e40ba6b5bdc26633a287c6ec703da31789ee1437d765c6a5020087`). SHA-256 do parecer v6: `87e12b07ddc58ed451d898e5b497ab6b2d27c4bdc19f2d327e8baf5385c87a50`. O script auxiliar `git_branch_census_readonly_v6.py` tem SHA-256 `51eeaaa74419b65e914af0218aae0922ebd1576b8690267e3410afdc21044be3`; compilação e teste em Git **sintético** passaram (um arquivo novo, um divergente). **Não foi executado em repositórios reais.**

Por segurança, **não importar o ZIP bruto para o Workspace público**, nem publicar dados de pacientes, segredos, tokens, inventários detalhados de conteúdo privado, artefatos PII, arquivos de fontes clínicas com direitos incertos ou a íntegra do histórico de findings sensíveis. Guardar SHA, contagens e provas sanitizadas no repositório e materiais restritos no armazenamento autorizado.

O parecer v6 é snapshot, **não medição live contínua**. Capturou PR #89 com 37 arquivos no HEAD `3ee43044...`; após a oitava onda, observamos 40 arquivos no HEAD `dc721c80...`. Revalidar via API qualquer número dependente de HEAD, sem sobrescrever a baseline. `60%` de caminhos e `19 erros/104 avisos` de lint são números históricos não reexecutados nesta auditoria; `54.964` corresponde a ocorrências brutas de arquivos de quatro refs volumosas, não a objetos únicos.

### Contradição operacional corrigida nesta sessão

O relatório v6 informa que sua conexão não alcançava o banco canônico `Calculadoras-Smart`. Nesta sessão, **outra conexão Supabase autorizada conseguiu listar o projeto e 48 tabelas do schema `public` em somente leitura**. Isso resolve a indisponibilidade *desta consulta*, não demonstra o banco de produção, cobertura de RLS, direitos, ligações clínicas ou o schema completo. Manter [#100](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/100) e [#80](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/80) em `HOLD_RUNTIME_IDENTITY`. Não confundir com `simulados-para-enfermagem`, domínio distinto com tokens em Edge Functions reportados, ainda sem verificação independente aqui.

## Arquitetura do trabalho: issue → PR → SHA → verificação → fechamento

Uma atividade possui **ID estável**, issue, classificação, owner, executor, escopo, dependências, riscos, baseline e critério de aceite. O estado final exige:

1. **Issue/WO** específico, com o objeto e decisão; uma issue ser criada não é trabalho executado.
2. **PR temática**, diff paginado e HEAD/base SHA fixados, ou referência privada verificável a ação externa de rotação/revogação (não inventar PR para operação que não ocorreu no Git).
3. **Prova de execução**: check/run ID no SHA, inputs e outputs sanitizados, testes negativos, integridade por SHA e cobertura do universo.
4. **Aprovação independente** quando aplicável, distinta do autor. Leivis Lima é owner da decisão; isso não conta como revisão independente se for o autor por trás da conta `IndiciumFIN`.
5. **Integração segura** em `main` somente quando elegível; merge SHA e CI pós-merge no mesmo SHA, eventuais gates clínicos/DB/legal/segurança mantidos.
6. **Recuperação e encerramento**: rollback/retention, cross pós-integração, evidência por arquivo/objeto e revisão; `SEALED` apenas quando todos os requisitos da norma `CE.BRANCH.CLOSURE.v1` forem satisfeitos.

Estados de projeto: `PLANNED → IN_PROGRESS → HOLD_EVIDENCE/HOLD_HUMAN → PR_READY → CI_VERIFIED → MERGED_VERIFIED → SEALED` ou `REJECTED_WITH_PROOF`. **Nenhuma transição para `SEALED` ocorre apenas porque a PR passou no `verify`.**

## Índice completo de ações — 44/44 registradas

| Grupo de origem | Qtde. | Registro | Estado de execução |
|---|---:|---|---|
| v3/v4 — Anexo B `W0/W1/W2/W3/W4` | 24 | [Issue #103](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/103) e ledger | Histórico a comprovar |
| v5 — `V5-A25…V5-A32` | 8 | [Issue #103](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/103) e ledger | Histórico a comprovar |
| v6 — `V6-A01…V6-A12` | 12 | [Issues #91–#102](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/90) | 12/12 com issue própria; 0/12 certificadas como terminadas |
| **Total** | **44** | **100% dos IDs documentados** | **0 fechamentos homologados por este registro** |

A matriz histórica tem **12 ações ainda sem issue dedicada ou remapeamento final**; isso está quantificado no ledger e na #103. Uma associação transversal à issue nova não confirma cumprimento dos requisitos antigos. Não abrir dezenas de duplicatas antes de reconciliar a cobertura.

## Novo plano por dependências e marcos de prova

| Trilha | Prioridade | Ações | Prova antes de avançar |
|---|---|---|---|
| **S0 — estabilização documental/CI** | P1 | [A05 #95](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/95), [A11 #101](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/101) | PR #89 diffs reais, SHA exato, `verify`, regressões, separação owner/reviewer; nenhuma homologação falsa |
| **S1 — segurança G00** | P0 | [A01 #91](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/91), [A02 #92](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/92) | Cobertura de scan com output restrito; quando confirmado segredo, rotação/revogação no emissor; 401/403; nenhuma chave publicada |
| **S2 — build e preview** | P0 | [A06 #96](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/96) | Vercel Preview `READY` e smoke no SHA correto, sem deploy à produção |
| **S3 — inventário e automação** | P0/P1 | [A03 #93](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/93), [A07 #97](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/97), [A08 #98](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/98), [A09 #99](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/99) | Censo real de refs e blobs, dedupe por proveniência, agendamento na `main` com execução real; sem exclusão automática |
| **S4 — runtime H2 e qualidade** | P1 | [A10 #100](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/100), [A04 #94](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/94) | DB real identificado, RLS e linhagem de evidências; lint reexecutado com JSON, SSR/auth tests |
| **S5 — histórico, publicação seletiva e closure** | P1/P2 | [A12 #102](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/102), [#103](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/103) + W2.5 | Disposição por objeto, requisitos clínicos e direitos, reviewer legítimo, merge/testes em `main`, posterior `SEALED` comprovado |

A contenção de credenciais **não deve esperar S0/S2** quando houver confirmação de comprometimento; S0 e S1 são paralelizáveis. Cada bloco gera recibo por PR/issue e só altera o percentual por denominador e evidência. A nona onda P0 foi pré-triada, mas **não recebe status de concluída** enquanto G00 e a cadeia de execução forem incorporados à gestão de riscos.

## Caso histórico `audit-hardening-2026-10-24`

A matriz de fechamento `registers/governance/ce-w2-5-audit-hardening-closure-readiness-20261121.v1.json` documentou 1.733 arquivos de origem, 421 diferenças frente à baseline histórica, 282 mudanças apenas de modo Git e 139 divergências em bytes. **Não** é `SEALED`: faltam decisões semânticas, revisão humana independente, cross Drive/Supabase e integração. Não excluir a branch, não dizer que 92% dos bytes implicam 92% da conclusão.

## Itens que devem vir para decisão do proprietário na conversa

Formato obrigatório: **🟨 DECISÃO SUA — assunto, recomendação, alternativas, riscos e prazo/efeito**. Não exigir intervenção para tarefas técnicas ordinárias. Exemplos que podem depender do proprietário: seleção de revisor independente real, decisão sobre projeto Vercel canônico e publicação/visibilidade, aprovação de rotação em provedor externo, licença/direito clínico, autorização de operação remota com dados e mudança de ruleset que possa criar deadlock.

**Baseline de release:** `HOLD` até G00, Preview, runtime, autorização clínica e revisão independente aplicáveis. `main` intocada por esta documentação; esta PR continua candidata a merge, não uma execução homologada.
