# CKO — Conteúdo Canônico Candidato (14/11/2026)

**CANDIDATE / HOLD_CLINICAL / HOLD_RIGHTS / NO_PUBLICATION**.

Este lote recupera dados curriculares derivados de Cardiologia (10 UCs, 300h), UC 08 fornecida em 14/11/2026, conflitos com as UCs 07/09, 14 correspondências temáticas interespecialidades, e dois rascunhos editoriais. CSVs são exportações parseadas das planilhas originais, não garantia de identidade byte a byte.

## Base histórica, somente como inventário
1.055 tópicos (170 U/E, 885 Trabalho), 118 fontes, 326 autoridades, 124 documentos, 28.001 átomos textuais, 80.261 referências brutas, 9.102 correspondências candidatas; nenhuma dessas contagens equivale a conteúdo clinicamente homologado.

**Não incluir** nesta branch pública os ZIPs/SQLite/PDF e textos com direitos pendentes. Originais ficam no Drive canônico; registrar hashes e localização controlada para futura recuperação com direitos. O fundamento v1.7.7 tem SHA-256 c3fd53517c6c329cc5398d09188401881c5533f6555b9575accc40a99b88a50f.

## Reuso
Preservar `TOOL != CONTENT`, `SPECIALTY many-to-many`, `LIBRARY` separada, e o fluxo `CURRICULUM → TOPIC → SOURCE → DOCUMENT → EVIDENCE_ATOM → CLAIM → KNOWLEDGE_ATOM → CONTENT → PUBLICATION`. Similaridade lexical gera apenas candidato; cruzar com IDs, licenças e trechos originais.

## Branches existentes para reconciliar, sem cherry-pick automático
- `work/editorial-canonical-learning-20261026`: contratos e diagnóstico editorial DB-first;
- `import/drive-cko-nurseos-20261026`: registros importados;
- `staging/bibliotecas-corpus-20261026`: bibliotecas históricas;
- `canonical/foundation-20261101`: PR #36 em DRAFT com grande diff;
- `audit/ce-wave1-evidence-20261101`: retrospectiva.

## Bloqueios
UC08 possui 8/8 eixos textuais idênticos à UC07 e nome da UC09; validação institucional necessária. Faltam ligações prova-por-afirmação, direitos específicos e revisão clínica. Nada desta branch é autorizado para publicação ou uso assistencial.
