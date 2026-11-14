# Como Executar a Atomização Localmente (NK-PROGRAM-ATOM-0001)

Cada job em registers/atomization_jobs.json segue o MESMO fluxo. Você executa no seu ambiente local (HTTPS).

## Fluxo por job
1. **Aquisição**: `python3 tools/fetch_source.py <url-do-job> --source <SRC> --license <KL>` — salva raw/ + manifest com sha256.
2. **Verificação**: confira a licença real do material (POL-NK-010 C4) e a citação (Lei 9.610 art. 8º). Se exigir OCR: converta (pdftotext/tesseract), salve o raw original E o texto extraído no manifest (proveniência dupla).
3. **Atomização**: para cada proposição, copie `templates/NK-ATOM-DRAFT.template.json`, preencha TODOS os campos (1 átomo = 1 proposição; verbatim_text = texto ÍNTEGRO; modality conforme RFC 2119; plain_language para H3).
4. **Checksum**: serialize cada átomo com JCS (RFC 8785) e calcule sha256 (use norm_kernel/jcs.py se tiver o repositório local; senão: ordenar chaves, sem espaços, UTF-8, sha256).
5. **Cobertura**: nada fica solto — cada item do documento que NÃO gerar átomo recebe não-aplicável EVIDENCIADO com motivo (POL-NK-009 C2). O coverage_percent do run = átomos+cotação sobre o total de itens.
6. **Submissão**: abra UMA OS de desenvolvimento por job (kind dev do DTH): registros de NormDocument/NormAtom em status DRAFT via o kernel; ExtractionRun pelo template.
7. **Homologação**: pipeline 100% PASS + sua revisão humana + OS de transição draft→active; então o universal correspondente transita para canon_complete (POL-NK-009 C6).

## Requisitos
python3 (stdlib); pdftotext ou tesseract apenas para jobs marcados ocr:true; acesso HTTPS às fontes públicas.

## Regras inegociáveis
Sem proveniência o kernel bloqueia (G3). Sem checksum JCS não é átomo. Sem licença verificada não publica. O draft é SEU playground; o active é ato com sua assinatura.
