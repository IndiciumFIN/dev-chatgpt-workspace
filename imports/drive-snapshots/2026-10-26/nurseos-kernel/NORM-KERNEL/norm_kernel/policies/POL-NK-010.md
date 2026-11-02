# POL-NK-010 — Cânone de Padrões Técnicos (v1.0.0)

**Aprovada por:** diretriz do Leivis (2026-09-29 14:45): "não é normativo, mas
é padrão técnico... a governança é muito mais abrangente... uma vez analisado
e com as nossas conclusões isso vira uma política formal e policy as code."

## C1 — Mesma máquina de cânone (POL-NK-009)
Padrões técnicos vivem NO MESMO registro canônico (registers/universals.json,
kind tech-*): fonte, licença, canon_status honesto, evidência, análise ponto
a ponto quando canon_complete. G13 estende a verificação estrutural a TODAS
as entradas (normativos + técnicos).

## C2 — Da análise à política formal
O destino de todo padrão analisado: conclusões → **política formal +
policy as code** (gate/instrumento). Padrão em uso real sem análise completa
fica `analysis_pending` com o uso vigente EVIDENCIADO (nunca escondido).

## C3 — Cobertura dos padrões em uso
Todo padrão técnico efetivamente usado pela plataforma (JSON Schema, SEO/
meta/OG, SemVer, PEP 8, TypeScript/Deno, design tokens, CNCF SWF, HTTP/REST)
tem registro com evidência do uso real. Padrão novo entra no mesmo processo:
OS → registro → análise → política.

## C4 — Débita declarada
Licenças permissivas de specs públicas (KL-0008) são verificadas POR
ESPECIFICAÇÃO no ato da atomização (cada spec tem a sua exata declarada).

state: Active; severity: blocking; enforcement: gate G13 (estrutura de todas
as entradas) + registro canônico único; transições de status via OS (C5/C6 da
POL-NK-009).
