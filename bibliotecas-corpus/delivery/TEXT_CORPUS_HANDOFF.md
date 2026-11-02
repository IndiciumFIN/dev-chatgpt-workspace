# BIB-01 — Corpus textual originado nas bibliotecas existentes

Conteúdo recuperado de 4 contratos canônicos **já presentes**, sem invenção de texto: Anatomia/Fisiologia, Seringa, Curativos e Ferimentos. O corpus contém **783 ocorrências textuais** classificadas como 539 candidatas a conteúdo, 41 referências de recursos e 203 strings estruturais.

Cada átomo conserva `sourceFile`, `sourcePointer`, `moduleId`, valor literal e estado `HOLD_HUMAN`. O ID `BIB01-LOCAL-...` é apenas identificador de rastreio, **não** canônico.

**Importante:** Curativos e Ferimentos foram mantidos separados, sem inferir qual imagem corresponde a qual conteúdo. Termos clínicos/regulatórios precisam de fontes e direitos antes da publicação.

Rodar `node bibliotecas-corpus/scripts/extract-library-text.mjs` para verificação; `--write` só cria arquivo ausente, sem sobrescrever divergências. Este corpus não altera app nem banco.
