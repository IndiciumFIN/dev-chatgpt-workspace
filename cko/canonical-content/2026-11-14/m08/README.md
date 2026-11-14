# M08 — Conteúdo canônico e atômico: lote 1 (14/11/2026)

**Foi produzido conteúdo, não só governança:** 34 claims normativos próprios, 34 knowledge atoms candidatos, três content masters (Processo de Enfermagem, Segurança do Paciente, Segurança Perioperatória), oito questões comentadas e dez flashcards. Os blocos são derivados de 33 átomos de evidência distintos localizados no SQLite M03 original. Dois claims (atribuições de diagnóstico e prescrição de enfermagem) vêm do mesmo art. 6º do COFEN.

## Onde estão os arquivos completos

**Pacote privado e íntegro:** [M08 v0.2 — Google Drive](https://drive.google.com/file/d/1cuXkb1bCg4lwtFtHL9B9aiANY1ioIhEk/view?usp=drivesdk) (SHA-256 `1663f80280684aa005aa58e029c1dabdeba3cd05fb8b15cefccb9abc5c9bfff4`). O ZIP contém:
- `ATOMIC_ASSERTION_EVIDENCE_BINDINGS.json`: texto autoral atomizado, claim/knowledge ID, URI da norma, documento, SHA documento, SHA do fragmento, locator, status e aplicabilidade contextual candidata;
- `CLAIM_CANDIDATES.schema-compatible.json` e `KNOWLEDGE_ATOMS_CANDIDATES.json`;
- `CONTENT_MASTERS_DRAFT.json` e três artigos Markdown com cada afirmação vinculada ao claim e fonte normativa;
- `QUIZ_DRAFT.json` (8 itens) e `FLASHCARDS_DRAFT.json` (10 itens);
- `CORPUS_EVIDENCE_ATOMS_28001_METADATA.csv`, `CORPUS_TOPIC_EVIDENCE_9102_CANDIDATES.csv` e `LEGACY_29_CLAIMS_HOLD_REVIEW.csv` — inventários completos de metadados, sem texto protegido;
- `MANIFEST.json`, relatórios QA e `CLAIM_EVIDENCE_CROSSWALK.csv`.

**GitHub guarda metadados estruturais do lote**, não replica o acervo íntegro nem autoriza publicação. `M08_CLAIM_EVIDENCE_REFERENCE_INDEX.json` preserva os 34 pares claim→átomo com os IDs originais, e `M08_MANIFEST.json` mantém contagens, fontes, hashes e local de armazenamento.

## Situação da esteira
- 118 fontes e 124 documentos no corpus M03; 28.001 fragmentos de texto extraídos em 21 fontes efetivamente atomizadas; 25.694 hashes distintos e 2.307 ocorrências adicionais com hash repetido.
- 9.102 topic↔evidence links são **candidatos**, distribuídos em 4.142 ativos, 1.670 condicionais por direitos e 3.290 bloqueados por direitos. Nenhum link automaticamente promove claim.
- 29 claims e 29 knowledge atoms históricos preservados, ainda não revalidados.
- 34 claims M08 estão `EVIDENCE_BOUND`, com revisão clínica/editorial/vigência **PENDING** e `publication_allowed=false`. `EVIDENCE_BOUND` significa vínculo a texto original comprovado, **não** endosso clínico.
- **Não aplicamos DDL, não criamos conteúdo no banco Supabase, não alteramos main e não publicamos artigos no site.** BLS/AHA e outras fontes com direitos restritos ficam fora deste lote.

## Próximos gates
1. Revisar validade/vigência da norma e suas eventuais alterações, por artigo; especialmente prazo de notificação (RDC art. 10).
2. Resolver duplicações sem apagar proveniência: trechos iguais por SHA podem pertencer a documentos/locators distintos.
3. Clínica/direitos/editorial de 34 itens; só então converter knowledge atoms para `ASSURED`.
4. Projeção única em artigo/quiz/flashcard/pocket guide, com revisão de aplicabilidade para Urgência, Cardiologia, Centro Cirúrgico/CME e Trilha de carreira.
5. Enfileirar lote seguinte nas fontes de Enfermagem do Trabalho; não inventar evidência para os 885 temas sem text span correspondente.
