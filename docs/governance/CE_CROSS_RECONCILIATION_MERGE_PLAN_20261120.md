# CE/CKO/NCOS — protocolo de reconciliação cruzada e merge controlado

Data: 20/11/2026. Versão CE.CROSS.v1. Destino único de escrita Git: IndiciumFIN/dev-chatgpt-workspace, branch main.

**Estado atual: infraestrutura do cross implementada; extração e reconciliação completas de todas as fontes ainda não realizadas.** Este plano trata exclusivamente de reconciliação, deduplicação e merge de deltas existentes, não de novas funcionalidades nem aprovação clínica.

## Decisão de ferramentas

- Python 3.10+ como motor determinístico de inventário e comparação N-vias; reutilizar scripts/ce-legacy-reconcile.py para preservação histórica imutável.
- JavaScript/Node como suíte independente de testes adversariais e gate do CI: scripts/ce-cross-reconcile.test.mjs chama scripts/ce-cross-reconcile.py e exige rejeição de cenários de divergência.
- Supabase continua banco operacional. Conexão para censo é somente leitura; migrations e dados remotos só podem ser alterados com autorização e gate próprios.
- Google Drive é fonte de documentos e metadados, não código-fonte executável nem autoridade clínica automática. Acesso e direitos devem ser registrados por objeto.

## Passos e critérios de saída

| Etapa | Entrada | Entrega verificável | Gate |
|---|---|---|---|
| 1. Censo GitHub | Repositórios, PRs e todas as branches CE relevantes; fixar SHA e parentesco | Snapshot por branch e repositório, com cursor de paginação exaurido | Não assumir completude com uma página de resultados |
| 2. Censo Supabase | Schemas, tabelas, views, RLS, grants, funções, chaves, migrations, cadastros governados | Snapshot de metadados e hashes de projeções permitidas | Nunca exportar dados pessoais/segredos para o Git |
| 3. Censo Drive | Pastas, IDs, pais, MIME, modifiedTime, revision, tamanho, permissão e hashes, quando permitidos | Snapshot de documentos com prova de varredura completa | Falta de acesso ou metadados vira HOLD |
| 4. Canonicalização | Objetos das três fontes, fonte+ref e classe | Mapa de canonical_key explícito, versão, origem, direitos, formato e hash SHA-256 | Não inferir equivalência por nome de arquivo |
| 5. Cross N-vias | Snapshots fixados | Relatório GitHub↔branches, GitHub↔Supabase, GitHub↔Drive, Supabase↔Drive e demais pares | Confrontar todos os pares, sem voto por maioria |
| 6. Classificação | Deltas detectados | SAME_BYTES / SAME_SEMANTIC / SOURCE_ONLY / CONFLICT / MISSING / RIGHTS_HOLD por item | Conflitos, hashes ausentes ou fonte incompleta não passam |
| 7. Lotes de merge | Apenas deltas aprovados | Work order de até 25 alterações, teste, risco, ref original, rollback | Prévia sem escrita e separação por domínio |
| 8. Integração main | Commit base verificado, dados reconciliados | Commit pequeno, log de CI, mudança e confronto com baseline | Não criar branches; não dar force-push |
| 9. Validação pós-merge | Main atual + snapshots frescos | Cross repetido e evidências por objeto | CI no SHA exato e zero perda de artefatos |
| 10. Fechamento do universo | Inventário com escopo, IDs e cursor fechado | Relatório final de cobertura e exceções documentadas | 100% dos objetos do universo declarado classificados; conflitos zero ou HOLD explícito |

## Contrato único de snapshot

A unidade é um JSON por **fonte imutável**, incluindo cada branch como fonte distinta. Requer source_id, source_kind (github/supabase/drive), snapshot_ref, complete, cursor_exhausted e records. Cada record exige canonical_key, record_ref, artifact_class, rights_state; opcionalmente content_sha256, semantic_sha256, git_blob_sha e expected_source_ids.

- content_sha256: hash dos bytes originais; não confundir com Git blob SHA-1 ou modifiedTime de arquivo.
- semantic_sha256: hash de projeção canônica versionada, com normalização definida **e independente**. Não usar o hash de um conteúdo bruto heterogêneo (SQL vs documento vs código) como prova semântica.
- expected_source_ids: fontes nas quais o objeto deve obrigatoriamente existir para aquela comparação; concordância sobre o conjunto esperado é exigida.
- complete e cursor_exhausted: declarações do coletor; devem ser comprovadas por logs de contagem, paginação, IDs de revisão e readback. Não servem como prova independente sem esses anexos.
- rights_state: sem evidência independente de licença/direitos, manter UNKNOWN e HOLD.
- Os exemplos são sintéticos e **nunca** representam inventários reais.

## Execução

    python3 scripts/ce-cross-reconcile.py --input /snapshots/github-main.json --input /snapshots/github-branch-A.json --input /snapshots/supabase.json --input /snapshots/drive.json --output /reports/cross.json --strict
    node --test scripts/ce-cross-reconcile.test.mjs

O comando faz **somente leitura das entradas** e **escrita local do relatório**. Retorna 2 em --strict se há fontes ausentes, cursores não fechados, conflitos ou objetos não reconciliados. Relatório CROSS_OK_NOT_RELEASE significa que a comparação dos metadados declarados passou, **não** que algo foi mesclado, executado, aprovado clinicamente ou publicado.

## Política obrigatória para todos os agentes e automações deste ecossistema

Cada WO/commit/relatório deve registrar: universo e fontes efetivamente consultados, SHA/revisão, cobertura por fonte, pares de cross realizados, exceções, links de evidência, plano de correção, teste negativo, CI por commit e decisão. É proibido reportar **merge completo** com somente um repositório, supor que 96,6% da preservação histórica é conclusão global ou ignorar fontes inacessíveis. Se faltarem recursos, prosseguir em etapas seguras com HOLD documentado e sem promover os itens incertos. Este protocolo não modifica a autorização de produção clínica, direitos, segurança ou RLS.

**Limitação desta versão:** o reconciliador valida a estrutura dos snapshots, calcula pares e compara hashes fornecidos. Não extrai automaticamente arquivos de Drive/Supabase nem comprova independentemente que as projeções semânticas estão corretas; essas são entregas das etapas 1–4. O gate não deve ser ligado a inventários sintéticos para declarar conclusão.
