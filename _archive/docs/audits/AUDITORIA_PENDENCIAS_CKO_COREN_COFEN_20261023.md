# Auditoria de pendências — CKO / COREN-COFEN (23/10/2026)

**Escopo auditado:** arquivo `CE_DOCS_COREN_COFEN_CANDIDATE_V1_20261023.zip` (35.554 bytes, SHA-256 `5d2485d7f983ece03cbf7d49bba4d6390fd399910070c6c46a6c0392c6a5c433`), e o checksum `CKO_WORKSPACE_FULL_ATOMICO_20261023.zip.sha256.txt`. **O ZIP CKO completo não foi recebido.**

**Método:** abertura integral do ZIP e CRC, parse de JSONL, recálculo de SHA-256 em arquivos declarados e textos dos quatro fragmentos, conciliação IDs de linhagem, leitura do gerador e cotejo pontual de ementas/lei em fontes oficiais. Não executei o `ce_generate.py`: depende de arquivos externos e de um caminho absoluto ausente. Não reexecutei OCR sem PDFs originais.

## Resultado físico
- ZIP: **18 entradas, CRC sem falhas**.
- **73 objetos JSONL** = 72 registros de domínio + 1 registro de relatório de validação. **Não significa 73 normas extraídas**.
- Fontes: 5; versões documentais: 8; aquisições: 4; extrações: 2; fragmentos: 4; átomos: 3; claims: 1; 30 edges; 8 evidências; 4 FINDs; 2 reconciliações; 1 WO; 1 validação.
- Manifesto interno: **15 de 16 itens conferem**; entrada autorreferente `manifest_ce_records.json` diverge em tamanho e hash. Também há **2 arquivos físicos fora desse manifesto**: `ce_generate.py` e `coren_cofen/evidence/analysis_support.md`.
- Quatro `text_sha256` de fragmentos conferem; nenhum PDF original está disponível para confrontar a fidelidade.
- Os 30 lineage edges apontam para IDs existentes, mas cobrem somente o piloto e não o acervo completo.

## Decisão de admissão
**HOLD**. Os schemas candidatos, anexos normativos originais e o ZIP CKO integral estão ausentes; há átomos falsamente nomeados/truncados, fundamento legal com inciso errado e OCR não revisado. O `PASS_WITH_FINDINGS` do pacote é uma declaração de validação estrutural, não aprovação material, clínica ou legal. Manter WO e G11/G12 bloqueados.

## Achados e trabalhos pendentes (fila sugerida)

| ID | Prioridade | Situação | Pendência | Próximo passo |
|---|---|---|---|---|
| `FIND-CKO-INPUT-001` | P0 | HOLD_INPUT | ZIP CKO integral não entregue | Localizar/fornecer o ZIP real por canal autorizado; conferir SHA-256 e estrutura antes de executar o diff. |
| `FND-COFEN-001` | P0 | OPEN_UNVERIFIED | 674 PDFs anteriores apontam para cartilha eleitoral | Reabrir pacote original não destrutivamente, verificar 674 hashes/tipo/primeiras páginas, bloquear promoção e reconstruir lote a partir de PDFs oficiais. |
| `FIND-CEPKG-001` | P0 | OPEN_CONFIRMED | Fundamentação da licença aponta inciso legal errado | Corrigir referência, política e vínculos derivados; revisar classificação do conteúdo acessório de terceiros sem promover direitos automaticamente. |
| `FIND-CEPKG-002` | P0 | OPEN_CONFIRMED | Átomo ementa 564 contém cabeçalho DOU | Localizar ato correto no DOU e no portal oficial; segmentar limites do documento e emitir novo átomo sob nova versão sem apagar original. |
| `FIND-CEPKG-003` | P0 | OPEN_CONFIRMED | Átomo/claim 545 truncados | Extrair ementa inteira com delimitação e revisão OCR; invalidar o claim derivado até reprocessamento. |
| `FIND-CEPKG-004` | P0 | OPEN_CONFIRMED | Manifesto interno não é autoconsistente | Retirar autorreferência do manifesto ou adotar manifesto externo assinado; reemitir hashes verificáveis e integrar teste ao CI. |
| `FIND-CEPKG-005` | P0 | HOLD_INPUT | Schemas CE candidatos ausentes do ZIP | Incluir schemas candidatos imutáveis e suas versões/hashes; executar validador independentemente no executor cloud. |
| `FND-COFEN-003` | P0 | HOLD_HUMAN | OCR Res. 545 não revisado | Separar método OCR_UNREVIEWED de revisão; revisar 4 páginas, confirmar página 3 e registrar double check independente. |
| `FND-COFEN-002` | P1 | OPEN_RECHECK | Rotas antigas do portal indisponíveis | Atualizar política de fallback por fonte; testar rota oficial HTML/PDF, DOU e Wayback em ordem documentada. |
| `FND-COFEN-004` | P1 | OPEN | Mapeamento Wayback/CDX parcial | Retomar coleta idempotente com controle de rate limit, checkpoints, deduplicação e fallback DOU. |
| `FIND-CEPKG-006` | P1 | HOLD_INPUT | Evidências físicas do acervo não incluídas | Disponibilizar fontes/evidências em pacotes separados com inventário; confirmar hashes contra metadados do piloto. |
| `FIND-CEPKG-007` | P1 | OPEN_CONFIRMED | Linhas de linhagem são apenas piloto parcial | Declarar escopo coverage pilot 2/674 e abrir reconciliação dos normativos não cobertos. |
| `FIND-CEPKG-008` | P1 | OPEN_CONFIRMED | Metadados cronológicos inconsistentes | Distinguir created_at do registro e observed_at/executed_at da atividade; documentar captura e event time sem retroagir eventos. |
| `FIND-CEPKG-009` | P1 | HOLD_EXTERNAL | Reconciliação Drive × local não reproduzida | Conferir IDs, revisões e hashes de ambos os locais, registrando URI/arquivo com evidência de leitura. |
| `FIND-CEPKG-010` | P1 | HOLD_INPUT | Contratos 16 candidatos × 22 históricos sem diff | Concluir inventário de 22 contratos, comparar campos, enum, versões e políticas; produzir decisão item a item. |
| `FIND-CEPKG-011` | P0 | HOLD_HUMAN | Gates de decisão/regras/publicação não admitidos | Manter conteúdo e artefatos como CANDIDATE; após correções, formar pacote de evidências, revisar políticas, admitir WO, validar e solicitar aprovação. |
| `FIND-CEPKG-012` | P1 | OPEN_CONFIRMED | Relatório de contagem tem escopo ambíguo | Separar records_validated, validation_report_count e zip_members; não usar 73/73 como execução independente. |

## Critérios e evidências detalhadas

### FIND-CKO-INPUT-001 — ZIP CKO integral não entregue
- **Prioridade/risco:** P0 / BLOCKER
- **Situação:** HOLD_INPUT
- **Evidência:** Foi anexado apenas o checksum 61f3bc0...; o arquivo CKO_WORKSPACE_FULL_ATOMICO_20261023.zip não está entre os arquivos recebidos.
- **Próxima ação:** Localizar/fornecer o ZIP real por canal autorizado; conferir SHA-256 e estrutura antes de executar o diff.
- **Aceite:** SHA-256 do ZIP real = 61f3bc0ae65267c118eba94eb44f380177462e47e25d0eaef9b1a4244a612d91; ZIP sem corrupção.
- **Executor:** Orquestrador
- **Origem:** Auditoria independente

### FND-COFEN-001 — 674 PDFs anteriores apontam para cartilha eleitoral
- **Prioridade/risco:** P0 / CRITICAL
- **Situação:** OPEN_UNVERIFIED
- **Evidência:** O pacote relata que 674 PDFs da captura 10/10 teriam o mesmo SHA e são o banner Cartilha-Eleicoes-Gerais-V4.pdf; arquivos originais de 901 MB não incluídos.
- **Próxima ação:** Reabrir pacote original não destrutivamente, verificar 674 hashes/tipo/primeiras páginas, bloquear promoção e reconstruir lote a partir de PDFs oficiais.
- **Aceite:** 0 cartilhas entre documentos admitidos; 100% de objetos com PDF ou HOLD e hash verificado.
- **Executor:** Extrator documental + auditor
- **Origem:** FIND original do pacote

### FIND-CEPKG-001 — Fundamentação da licença aponta inciso legal errado
- **Prioridade/risco:** P0 / HIGH
- **Situação:** OPEN_CONFIRMED
- **Evidência:** analysis_support.md §1.1 e WO usam Lei 9.610/98 art. 8º I; textos de atos oficiais estão no art. 8º IV. Conferido em fonte legislativa oficial.
- **Próxima ação:** Corrigir referência, política e vínculos derivados; revisar classificação do conteúdo acessório de terceiros sem promover direitos automaticamente.
- **Aceite:** Políticas, claims e campos rights_status coerentes com art. 8º IV e exceções expressas.
- **Executor:** Governança normativa + revisor jurídico
- **Origem:** Auditoria independente + fonte oficial

### FIND-CEPKG-002 — Átomo ementa 564 contém cabeçalho DOU
- **Prioridade/risco:** P0 / HIGH
- **Situação:** OPEN_CONFIRMED
- **Evidência:** ATOM-RES564-2017-EMENTA inclui informações de autenticação e material de outras instituições em fragmento DOU; não começa pela ementa oficial.
- **Próxima ação:** Localizar ato correto no DOU e no portal oficial; segmentar limites do documento e emitir novo átomo sob nova versão sem apagar original.
- **Aceite:** Ementa transcrita corresponde a Res. 564/2017 e é comprovada por locator/página e comparação de texto.
- **Executor:** Extrator + revisão normativa
- **Origem:** Auditoria independente + COFEN oficial

### FIND-CEPKG-003 — Átomo/claim 545 truncados
- **Prioridade/risco:** P0 / HIGH
- **Situação:** OPEN_CONFIRMED
- **Evidência:** ATOM-RES545-2017-EMENTA contém "Atualiza a norma que dispõe sobre a forma de"; CLM-RES545-2017-SCOPE reproduz essa oração incompleta; fragmento origem tem ementa maior.
- **Próxima ação:** Extrair ementa inteira com delimitação e revisão OCR; invalidar o claim derivado até reprocessamento.
- **Aceite:** Claim de escopo coincide com ementa oficial, com fonte e range exatos, sem truncamento.
- **Executor:** Extrator + revisão normativa
- **Origem:** Auditoria independente

### FIND-CEPKG-004 — Manifesto interno não é autoconsistente
- **Prioridade/risco:** P0 / HIGH
- **Situação:** OPEN_CONFIRMED
- **Evidência:** Entrada manifest_ce_records.json: declara bytes=1915 e sha=f77209a0..., mas conteúdo no ZIP tem 2170 bytes e sha=6ba61b70...; as 15 outras entradas conferem. Além disso, ce_generate.py e coren_cofen/evidence/analysis_support.md estão fora do manifesto.
- **Próxima ação:** Retirar autorreferência do manifesto ou adotar manifesto externo assinado; reemitir hashes verificáveis e integrar teste ao CI.
- **Aceite:** 0 divergências para os 18 membros do ZIP, ou exclusões intencionais e justificadas em manifesto externo; sem autorreferência circular.
- **Executor:** Engenharia de integridade
- **Origem:** Auditoria independente

### FIND-CEPKG-005 — Schemas CE candidatos ausentes do ZIP
- **Prioridade/risco:** P0 / HIGH
- **Situação:** HOLD_INPUT
- **Evidência:** Os 16 arquivos .schema.json não foram embalados; o gerador depende de caminho absoluto /app/conversations/.../ce_schemas. Não foi possível reproduzir Draft 2020-12.
- **Próxima ação:** Incluir schemas candidatos imutáveis e suas versões/hashes; executar validador independentemente no executor cloud.
- **Aceite:** 72 registros de domínio, mais relatório, revalidados com os mesmos schemas e zero erros; relatórios com hashes.
- **Executor:** Validador de schemas
- **Origem:** Auditoria independente

### FND-COFEN-003 — OCR Res. 545 não revisado
- **Prioridade/risco:** P0 / HIGH
- **Situação:** HOLD_HUMAN
- **Evidência:** Três fragmentos 545 (páginas 1,2,4) estão HOLD e páginas_total=4; método OCR_REVIEWED embora FND registre sem revisão humana; PAGE_EMPTY_OCR:3.
- **Próxima ação:** Separar método OCR_UNREVIEWED de revisão; revisar 4 páginas, confirmar página 3 e registrar double check independente.
- **Aceite:** Texto integral e páginas/itens reconciliados e aprovação humana vinculada antes de VERBATIM.
- **Executor:** Extrator + revisor humano
- **Origem:** FIND original do pacote

### FND-COFEN-002 — Rotas antigas do portal indisponíveis
- **Prioridade/risco:** P1 / HIGH
- **Situação:** OPEN_RECHECK
- **Evidência:** Pacote relata erro no template de /advices/... e API content vazio; porém páginas oficiais alternativas de Res. 545 e 564 estão acessíveis por URLs de resoluções.
- **Próxima ação:** Atualizar política de fallback por fonte; testar rota oficial HTML/PDF, DOU e Wayback em ordem documentada.
- **Aceite:** Matriz por norma com fontes válidas; ausência de body não é confundida com ausência da norma.
- **Executor:** Agente de aquisição
- **Origem:** FIND original, rechecagem web

### FND-COFEN-004 — Mapeamento Wayback/CDX parcial
- **Prioridade/risco:** P1 / MEDIUM
- **Situação:** OPEN
- **Evidência:** Pacote relata 1.335 URLs no chunk 1/5 e falhas 503/504; nenhuma lista CDX original incluída.
- **Próxima ação:** Retomar coleta idempotente com controle de rate limit, checkpoints, deduplicação e fallback DOU.
- **Aceite:** Manifesto de cobertura por norma, URLs originais, snapshots, faltantes e retries reproduzíveis.
- **Executor:** Agente de aquisição
- **Origem:** FIND original do pacote

### FIND-CEPKG-006 — Evidências físicas do acervo não incluídas
- **Prioridade/risco:** P1 / HIGH
- **Situação:** HOLD_INPUT
- **Evidência:** O ZIP tem 35.554 bytes; referencia PDFs 545 e 564, ZIP 901 MB, índices, logs, CDX e sidecars, mas não contém esses bytes.
- **Próxima ação:** Disponibilizar fontes/evidências em pacotes separados com inventário; confirmar hashes contra metadados do piloto.
- **Aceite:** Readback do arquivo de origem correspondente a cada hash/locator crítico.
- **Executor:** Ingestor + auditor
- **Origem:** Auditoria independente

### FIND-CEPKG-007 — Linhas de linhagem são apenas piloto parcial
- **Prioridade/risco:** P1 / MEDIUM
- **Situação:** OPEN_CONFIRMED
- **Evidência:** Há 30 edges válidos por IDs para 2 normas e 3 átomos, não para as 674 resoluções alvo; relatório usa expressão "cadeia completa" no escopo piloto.
- **Próxima ação:** Declarar escopo coverage pilot 2/674 e abrir reconciliação dos normativos não cobertos.
- **Aceite:** Matriz REQUIRED x PRESENT x VALIDATED x PASS por resolução e artefato.
- **Executor:** Validador lineage
- **Origem:** Auditoria independente

### FIND-CEPKG-008 — Metadados cronológicos inconsistentes
- **Prioridade/risco:** P1 / MEDIUM
- **Situação:** OPEN_CONFIRMED
- **Evidência:** created_at uniforme 03:45:43-03; acquisitions Wayback 05:30/06:10 e runs iniciados após created_at; tipos de instante não separados.
- **Próxima ação:** Distinguir created_at do registro e observed_at/executed_at da atividade; documentar captura e event time sem retroagir eventos.
- **Aceite:** Linhas de eventos ordenáveis, tipos de relógio separados e cronologia auditável.
- **Executor:** Governança PROV
- **Origem:** Auditoria independente

### FIND-CEPKG-009 — Reconciliação Drive × local não reproduzida
- **Prioridade/risco:** P1 / MEDIUM
- **Situação:** HOLD_EXTERNAL
- **Evidência:** 2 registros dizem IDENTICAL com hashes declarados; os ZIPs de referência e comprovantes de Drive não estão incluídos no pacote.
- **Próxima ação:** Conferir IDs, revisões e hashes de ambos os locais, registrando URI/arquivo com evidência de leitura.
- **Aceite:** Hashes local e Drive confirmados na mesma execução; divergências relatadas.
- **Executor:** Auditor de armazenamento
- **Origem:** Auditoria independente

### FIND-CEPKG-010 — Contratos 16 candidatos × 22 históricos sem diff
- **Prioridade/risco:** P1 / MEDIUM
- **Situação:** HOLD_INPUT
- **Evidência:** README exige reconciliação contra 22 contratos históricos antes de política, validador, WO e admissão; arquivos não estão anexos.
- **Próxima ação:** Concluir inventário de 22 contratos, comparar campos, enum, versões e políticas; produzir decisão item a item.
- **Aceite:** Crosswalk assinado sem substituir contratos homologados por candidatos.
- **Executor:** Governança de contratos
- **Origem:** README do pacote

### FIND-CEPKG-011 — Gates de decisão/regras/publicação não admitidos
- **Prioridade/risco:** P0 / BLOCKER
- **Situação:** HOLD_HUMAN
- **Evidência:** Schemas decision, executable_rule, publication não emitidos; G11 consumo e G12 homologação pendentes; WO admission_state=NOT_REQUESTED.
- **Próxima ação:** Manter conteúdo e artefatos como CANDIDATE; após correções, formar pacote de evidências, revisar políticas, admitir WO, validar e solicitar aprovação.
- **Aceite:** Nenhum conteúdo clínico/normativo publicado sem cadeia de aprovação e revisão de direitos.
- **Executor:** Dono do produto + revisores competentes
- **Origem:** README e WO do pacote

### FIND-CEPKG-012 — Relatório de contagem tem escopo ambíguo
- **Prioridade/risco:** P1 / MEDIUM
- **Situação:** OPEN_CONFIRMED
- **Evidência:** README informa 73/73 registros conformes, manifesto registra records_ok=72; os 13 JSONL de domínio somam 72 e validation_report acrescenta 1.
- **Próxima ação:** Separar records_validated, validation_report_count e zip_members; não usar 73/73 como execução independente.
- **Aceite:** Indicadores calculados automaticamente e com denominadores definidos.
- **Executor:** PMO/validador
- **Origem:** Auditoria independente

## Referências de verificação externa (não contidas no ZIP)
- Lei 9.610/1998, art. 8º, inciso IV (textos de atos oficiais): https://www2.camara.leg.br/legin/fed/lei/1998/lei-9610-19-fevereiro-1998-365399-normaatualizada-pl.html
- COFEN Resolução 545/2017: https://www.cofen.gov.br/?p=52030
- COFEN Resolução 564/2017: https://www.cofen.gov.br/resolucao-cofen-no-5642017/

## Regras de transição ao PMO oficial
Este relatório propõe FINDs/atividades e **não altera o repositório principal**. Conciliar com WOs e FINDs já existentes, evitar duplicações, preservar a evidência antiga e manter a ordem da fila. Novos itens vão ao final do backlog conforme a política do projeto; bloqueios de segurança/homologação prevalecem. Sem promoção, exclusão, substituição de material original ou homologação automática.
