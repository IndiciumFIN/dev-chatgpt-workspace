# CE/CKO/NCOS — Norma de completude, não revisitação e aposentadoria controlada de branches

**Identificador:** CE.BRANCH.CLOSURE.v1  
**Aprovador de execução técnica:** regras do `WORKSPACE.md` — todas as mudanças em `IndiciumFIN/dev-chatgpt-workspace@main`; nenhuma branch nova.  
**Aplicável a:** CE, CKO, NCOS, Simulados, Vila do Cuidado, Research Hub, Carreira, conteúdo, currículos e internacionalização. WU-TRIB é domínio isolado.  
**Estabelecida em:** 20/11/2026.  
**Estado:** gate de registro e de vedação de falso encerramento; **nenhuma** das 48 branches CE/CKO/NCOS está selada na linha de base W2.  
**Registros:** `registers/governance/ce-branch-completion-20261120.v1.json`, `ce-cross-all-prs-20261120.v2.json`, `ce-cross-orphan-root-trees-20261120.v1.json`, `ce-cross-large-pr-roots-20261120.v1.json`.

## 1. Princípio inegociável

O propósito é **analisar a branch uma vez por revisão imutável, resolver todas as suas diferenças pertinentes e impedir reanálises desnecessárias**. Uma branch NÃO é concluída por ter sido listada, comparada parcialmente, preservada em `intake/`, rotulada `HOLD`, ter PR fechada, apresentar CI verde ou possuir o mesmo nome de um arquivo em `main`. Fechamento significa: todo seu conteúdo de interesse foi exaustivamente confrontado; cada item recebeu decisão justificada; não restam impactos sem destino; e os testes e os gates aplicáveis foram comprovados no SHA exato da `main`.

Cada execução deve distinguir estes níveis de evidência:

1. **CENSUSED**: branch e seu commit foram identificados — cobertura administrativa, não funcional.
2. **ROOT_TREE_SCANNED**: hashes das entradas de raiz foram comparados — somente prefixos comparados; não implica comparar todos os arquivos.
3. **PR_FILES_SCANNED**: páginas de arquivos alterados da PR foram coletadas integralmente e hashes conferidos contra a `main` — não inclui arquivos que a branch herdou nem equivale à reconciliação de árvore completa.
4. **FULL_DELTA_INVENTORIED**: diferenças de árvores Git completas, incluindo diretórios, renomes e exclusões, verificadas e contadas sem truncamento.
5. **TRIAGED**: todas as diferenças têm decisão por arquivo/objeto, direitos, origem, dependências, impacto, destino e vínculo com WO/FIND.
6. **INTEGRATED_OR_DISPOSED**: alterações aprovadas estão na `main` em commits verificáveis; conteúdos obsoletos/rejeitados estão preservados com fundamento; nada foi aplicado ao Supabase sem autorização.
7. **INDEPENDENTLY_VERIFIED**: recompilação, testes adversariais, integração, segurança, RLS, direitos, rastreabilidade clínica e controles editoriais (quando aplicáveis), CI no commit de integração e nova confrontação de conteúdo.
8. **SEALED (não revisitar)**: comprovado que todos os arquivos/objetos do SHA de origem estão classificados, conflitos abertos = 0, documentos de prova imutáveis e aprovador independente assinado; só então `no_revisit=true`.

**Regra de monotonicidade:** não voltar de SEALED para varredura recorrente por decisão informal ou mudança ordinária da `main`. Evitar também a criação de novas versões de um mesmo relatório sobre o mesmo SHA quando a evidência não mudou. Agrupar branches com commit idêntico para **reusar** evidências; nunca declarar duas fechadas se somente uma foi aprovada.

## 2. Universo e fronteiras

- Fixar `repository`, `branch`, `source_commit_sha` (40 caracteres), `source_tree_sha` e `baseline_main_sha`; guardar snapshots e carimbo de captura.
- Enumerar repositórios históricos explicitamente autorizados como fontes imutáveis, inclusive `IndiciumFIN/calculadorasdeenfermagem`, `leaf-lilac-bamboo-craft`, `raven-beam-lion-lagoon`, backup e `ce-bibliotecas-dev`. Inventariar suas branches antes de declarar **ecossistema** completo. A métrica 48 refere-se somente às branches CE/CKO/NCOS do **Workspace**, não a todas as fontes possíveis.
- PRs e branches são objetos diferentes; a lista de arquivos modificados em uma PR é um **delta em relação à sua base histórica**, não o diff total da branch contra a `main` atual.
- Não misturar `wutrib/*`, contas contábeis ou dados de outros produtos ao conteúdo clínico. Uma branch fora de escopo é `OUT_OF_SCOPE`, não `SEALED`.
- Supabase Calculadoras-Smart é o banco operacional: cotejar objetos, migrations, PK/FK, índices, RLS, grants, fontes, direitos e vínculos de evidência; não pressupor que `formula_ref = null` prove a ausência de fórmula implementada em código.
- Google Drive inclui **duas conexões** e pode conter documentos privados. O Workspace é **público**: guardar nele apenas estatísticas e IDs internos de evidências sanitizados. Manter o inventário detalhado/bytes em armazenamento privado autorizado; não publicar conteúdo clínico restrito, IDs privados, títulos/nomes sensíveis, links autenticados, PHI, tokens ou dumps.
- Normativos oficiais têm prioridade de autoridade; revisão deve registrar vigência, revogação, licença de reprodução/TDM, data de acesso e fonte primária.

## 3. Extração íntegra e cross Python × JavaScript

### 3.1 GitHub: SHA da árvore é obrigatório

1. Buscar todas as páginas da coleção de branches e PRs até não haver cursor/página adicional; registrar a lista completa e SHA.
2. Para cada commit de branch, obter a árvore raiz, enumerar todas as subárvores **recursivamente por componente**. Verificar `truncated=false`; se uma árvore enorme ultrapassar o limite do endpoint, subdividir por subárvore/lotear. Não aceitar uma resposta truncada.
3. Construir a união de paths `source ∪ main`, separando `SOURCE_ONLY`, `CANONICAL_ONLY`, `EXACT_BLOB`, `DIVERGENT_BLOB`, `TYPE_CHANGED`, `DELETED`, `RENAMED_CANDIDATE`, `SYMLINK`, `LFS_POINTER` e `SUBMODULE`.
4. Hash SHA-1 do objeto Git comprova identidade **dos bytes versionados nesse Git**; SHA-256 é o padrão neutro para cruzar fontes de Git/Drive/SQL. Não comparar hashes de metadados ou ETags do Drive como se fossem SHA-256 de conteúdo.
5. Comparar semanticamente arquivos de configuração `package.json`, `tsconfig`, workflows, Next.js vs Vite/TanStack, migrations e rotas, preservando os invariantes ativos. Não fazer overwrite cego da raiz.
6. Tratar PRs [#32](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/32) e [#36](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/36) por árvores fragmentadas: possuem respectivamente 13.770 e 13.550 arquivos declarados como alterados. As primeiras 500 entradas não são cobertura integral. Uma análise de raiz não fecha esses 27.320 itens.
7. Para qualquer SHA de commit duplicado, como `archivamento`/`planning`, analisar uma única vez os bytes idênticos, preservar os dois nomes no índice e exigir que a decisão do grupo esteja selada antes dos aliases.

### 3.2 Supabase: cross de estrutura e contratos, sem escritura remota

- Inventariar nomes lógicos, tipos e colunas, constraints, PK/FK, índices, funções, triggers, views, políticas RLS, grants, migrations aplicadas e seus hashes, catálogos clínicos e IDs relacionados.
- Classificar cada objeto SQL como `EXISTS_MATCHING`, `MISSING_IN_DB`, `DB_ONLY`, `CONTRACT_DRIFT`, `SECURITY_DRIFT`, `RIGHTS_HOLD` ou `UNMAPPED`.
- Fazer SQL `SELECT` apenas no projeto autorizado. Toda migration requer teste Postgres isolado, revisão da diferença efetiva, segurança e plano de reversão; não executar `DDL/DML` no Supabase por inferência de uma branch.
- Não gravar valores de pacientes ou outros dados pessoais no repositório. Se requer hash de registros, calcular sobre projeção pública/não sensível conforme política explícita.

### 3.3 Drive: documentos, versionamento e direitos

- Inventariar raízes CE/CKO/NCOS, todas as pastas descendentes e arquivos com paginação até exaurir; registrar total, erros, indisponibilidade, IDs, parent IDs e revision para comparação **em local privado**.
- `título` e `tamanho` idênticos são somente candidatos. Hash real de conteúdo permitido deve ser calculado sobre o export ou arquivo exato, com versão e MIME; arquivos nativos precisam de formato de export explicitamente documentado.
- Verificar se os PDFs/documentos contêm prova de origem, copyright, licença, norma vigente, faculdade de citação e uso permitido. Não inferir direitos só por estar no Drive.
- Em repositório público registrar apenas contagens e `evidence_manifest_sha256`, nunca caminhos/nomes privados, IDs ou conteúdos de Drive. Falta de acesso = `HOLD`.

### 3.4 Normalização e qualidade

- Python (ex.: `scripts/ce-cross-reconcile.py`) normaliza snapshots, gera hashes e faz confrontos N-vias; JavaScript/Node executa testes negativos, valida contadores e bloqueia falsas aprovações no CI.
- `canonical_key` deve ser derivado de dicionário e decisão versionados. Compartilhar slug sem mesmo contrato de versão, fórmula, população, fonte e escopo **não basta** para afirmar que dois objetos são iguais.
- Qualquer fonte/cursor faltante ou conflito sem destino impede conclusão global. Conteúdo em `intake/` é arquivo histórico e não componente funcional admitido.

## 4. Matriz decisória obrigatória por item

Para cada diferença registrar: `work_order_id`, `source_repo`, `source_branch`, `source_commit_sha`, `source_path`, `source_git_blob_sha`, `normalized_sha256`, `canonical_key`, `artifact_class`, `main_baseline_sha`, `supabase_ref` (quando houver), `drive_private_evidence_ref` (não publicável), `normative_ref`, `rights_state`, `risk_class`, `relationship`, `decision`, `destination_path`, `commit_sha`, `test_ids`, `ci_run_url`, `reviewer`, `review_date`, `rollback_ref`.

Decisões permitidas por objeto:
- **INTEGRATED_VERIFIED:** conteúdo adequado incorporado à `main` e testado.
- **EXACT_IN_CANONICAL:** conteúdo já existe com identidade comprovada e não exige recópia.
- **SUPERSEDED_WITH_PROOF:** versão anterior possui sucessora com mapa/hashes e teste, sem perda.
- **REJECTED_WITH_PROVENANCE:** conteúdo recusado por incompatibilidade, segurança, licença ou obsolescência; motivo documentado, preservando prova.
- **ARCHIVED_INERT_WITH_PROOF:** apenas valor histórico, sem execução, e evidência de que a omissão funcional foi deliberada e autorizada.

Para itens clínicos, a ausência de evidência normativa ou licenciamento deve permanecer `HOLD` e impedir promoção; outros itens independentes podem prosseguir. Uma branch com um único item `HOLD` não pode ser SEALED.

## 5. Invariantes de CI e prova de completude

A implementação `scripts/ce-branch-closure.py` verifica em `--require-closed`: todos os 48 registros CE/CKO/NCOS com `SEALED`, nenhuma fonte perdida, contadores coerentes, SHA fixado, comprovantes e política fail-closed.

**Não confundir** `python3 scripts/ce-branch-closure.py` (validar um registro parcialmente aberto) com `python3 scripts/ce-branch-closure.py --require-closed` (exigir conclusão integral, que deve FALHAR enquanto há branches abertas).

Para cada `SEALED`, os requisitos mínimos são:
- SHA do commit original e SHA da árvore original fixados e reconciliados com o próprio registro.
- Manifesto exaustivo de delta, `source_file_count == classified_file_count`, número de arquivos não analisados = 0, conflitos abertos = 0; hashes SHA-256 dos três artefatos de prova.
- SHA de integração `main_integration_sha` igual ao SHA coberto por CI `ci_verified_sha` e resultado do CI arquivado com URL; resultados de testes reproduzíveis e diff pós-integração.
- Gates documentados de licença/direitos, segurança, execução/regressão, segurança clínica, correspondência Supabase e Drive. Se `NOT_APPLICABLE_WITH_PROOF`, explicar e provar inaplicabilidade; ausência não equivale a N/A.
- `approval.owner`, `approval.reviewer` independente e `review_ref` verificável, com política para conflito de interesses.
- Um `duplicate_ref` só pode fechar depois da branch canônica do grupo, e SHA de origem deve ser o mesmo.
- `no_revisit = true` somente junto com `closure_status = SEALED` e decisão de terminalidade válida; nenhum script/agente pode escrever diretamente esse estado sem passar pelo gate.

O gate automatiza consistência formal do registro; **não prova sozinho** a autenticidade de links externos ou a independência real do avaliador. Essas evidências precisam ser verificadas em auditoria.

## 6. Regra objetiva de não revisitação

Quando `SEALED`, substituir a reanálise repetida por leitura do ledger e comparação barata do SHA de origem. **Não reread da árvore nem repesquisa no Drive/Supabase por rotina**. Uma decisão só pode reabrir por evento objetivo e versionado:
1. SHA/árvore do branch mudou, houve force-push ou rewrite;
2. Surgiu evidência nova, primária e material que contradiz a disposição, licença ou fonte;
3. Um teste de regressão ou segurança passou a falhar no módulo integrado;
4. Normativo/fonte primária mudou de vigência ou direitos mudaram para conteúdo vinculado;
5. Foi detectada perda, corrompimento de hash ou referência incorreta na `main`;
6. Recebida decisão explícita, auditável, de revisão, contendo `reason`, `trigger_ref` e `reopened_by`.

Mudanças não relacionadas em `main` não invalidam a origem selada; devem ser auditadas no delta da mudança nova. Um evento 1–6 cria nova **versão de revisão** (mantendo registro antigo, sem sobrescrever), reabrindo **somente** itens afetados. Branches não apagadas após `SEALED`: exclusão exige autorização expressa, prova de recuperabilidade, dependências e retenção. Não fechar PRs automaticamente.

## 7. Próximos passos exclusivos da reconciliação

1. **W2.1:** completar `PR_FILES_INCOMPLETE_API_LIMIT` em #32/#36 mediante varredura das subárvores; seus diretórios de raiz já possuem mapa de diferenças.
2. **W2.2:** expandir `ROOT_TREE_SCANNED` das 23 branches sem PR para diff por arquivo, em lotes agrupados por SHA para evitar repetição.
3. **W2.3:** classificar os deltas de PRs prioritárias #72 (segurança), #71 (build), #70 (validador), #75 (quarentena), #74 (contratos) e as demais; não copiar versões antigas sem revisão semântica.
4. **W2.4:** concluir Drive-1, relacionar documentos com campos normativos e direitos, e verificar inventário Supabase versus contratos sem alterar o banco.
5. **W2.5:** aplicar somente lotes independentes aprovados na main (máximo 25 mudanças), CI no SHA exato, prova de rollback e cross novamente.
6. **W2.6:** selar cada origem uma única vez com registro auditado; registrar `closed_at`, `source_sha`, evidências, decisão e revisão independente. Replicar o protocolo nas demais origens, sem encerrar o ecossistema antes do censo de todas as fontes.

**Percentuais são sempre por denominador:** 48/48 branches CE listadas e com algum cross; 23/25 PRs com listagem integral de arquivos; 23/23 branches órfãs com comparação apenas de raiz; 0/48 branches formalmente SEALED; merge global ainda pendente. Os números não se somam como um percentual global.
