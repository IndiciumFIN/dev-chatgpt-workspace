# CE/CKO/NCOS — Reconciliação cruzada, onda W1 (20/11/2026)

**Baseline:** `IndiciumFIN/dev-chatgpt-workspace@a435e1521bfa309a7aad661c493de50f75c6e3ca`. **Resultado:** `HOLD_MULTISOURCE_SEMANTIC`. Fontes consultadas: GitHub, Supabase Calculadoras-Smart (somente leitura), Google Drive (duas contas). Nenhum dado pessoal, ID ou título de arquivo privado do Drive está neste repositório **público**.

## Evidência real de inventário

| Frente | Resultado comprovado | Limite |
|---|---|---|
| GitHub — branches | 63 branches (48 candidatas CE/CKO/NCOS, 1 main, 14 WU-TRIB isoladas); 35 PRs abertas | Inventário das branches do Workspace, não de todos os outros repositórios históricos |
| GitHub — comparação de PRs | 9 PRs prioritárias, 361 **ocorrências** de arquivo: 6 blobs iguais, 63 divergentes, 292 presentes apenas na branch | Não interpretar ocorrências como arquivos únicos; conteúdo divergente requer revisão |
| GitHub — dedup por SHA de commit | `archivamento` e `planning` têm SHA de commit idêntico | Não excluir branches sem verificar dependências e regra de retenção |
| Supabase — inventário | 36 schemas, 566 tabelas, 255 migrations, 320 objetos canônicos, 111 ferramentas clínicas, 0 registros em `ce_platform.clinical_evidence_bindings` | Existência estrutural não equivale à integração funcional |
| Piloto GitHub ↔ Supabase | Braden, Morse, APGAR, Gotejamento e IMC: 5/5 correspondências candidatas por slug; 5/5 `source_dossier_ref`, 0/5 `formula_ref` | Prova de candidato por identificador, não de equivalência semântica ou homologação |
| Drive-1 — escopo CKO | 496 documentos distintos observados em 5 páginas; 72 títulos repetidos candidatos | Cursor não exaurido; busca por palavra-chave, não censo integral |
| Drive-1 — pastas Enfermagem | 426 pastas observadas em 5 páginas; 35 títulos repetidos candidatos | Cursor não exaurido |
| Drive-2 — escopo CKO | 67 documentos em 1 página; 7 títulos repetidos candidatos | Cursor exaurido apenas **nesta consulta**, não em todo o Drive |
| Drive-2 — pastas Enfermagem | 29 pastas em 2 páginas | Cursor exaurido apenas nesta consulta |

Os resultados de pesquisa por nome no Drive confirmam documentos **candidatos** para as cinco ferramentas, mas não constituem igualdade de conteúdo, direitos ou versão. Não publique conteúdos/IDs de Drive no GitHub público.

## Classificação e controles

- `CROSS_OK_NOT_RELEASE` só pode ser emitido por comparação que passou, para o **escopo declarado**; sem todos os snapshots reais/cursos fechados e sem identidade/semântica comprovadas, manter HOLD.
- 9 PRs foram confrontadas com a `main` por SHA de blob, inclusive página 2 dos 115 arquivos da PR #52, para evitar truncamento.
- `source_only` é arquivo ausente na árvore atual; **não** é aprovação para mesclar. `divergent_blob` requer leitura de diff, testes e critérios de aceite; `same_blob` dispensa recópia, não valida licença.
- A fronteira de WU-TRIB permanece separada. Supabase, Drive e repositórios anteriores permanecem imutáveis.
- O inventário de origem CE de 176 arquivos continua válido como histórico próprio (170 tratados, 6 colisões); não somar seus percentuais às PRs deste relatório.

## Próxima onda W2

1. Completar paginação de Drive-1 e identificar raízes CE relevantes, mantendo metadados privados fora do Git público.
2. Comparar os 39 restantes das 48 branches CE/CKO/NCOS, além das nove PRs já selecionadas, com provas de delta por objeto (sem inventar correspondência por nome).
3. Revisar primeiro PR #72 (segurança), #71 (build/deploy), #70 (validação CKO), depois evidências/CKO e demais módulos; decisões `MERGE`, `REJECT`, `ALREADY_SATISFIED` ou `HOLD` por arquivo.
4. Executar lotes aprovados de até 25 alterações na main, verificar CI no SHA exato, repetir cross e preservar rollback.

**Estado de conclusão do merge global:** NÃO. **Estado do cross semântico GitHub × Supabase × Drive:** HOLD. Não alterar banco remoto ou promover material clínico automaticamente.
