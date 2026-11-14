# B59 — Reconciliação de identidades, fontes e autoridades (14/11/2026)

**PMO mestre:** https://docs.google.com/spreadsheets/d/1vi129pgXWMZPFddxlMd5YemMEohumxqk714yCoGCVOg/edit. O `SOURCE_REGISTER` já possui 15 linhas (7 autoridades/plataformas e 8 fontes/candidatos M05). **Não criar um segundo SOURCE_REGISTER.** Os CSVs deste diretório são relatórios de conciliação e devem ser referenciados na coluna `Notas` do registro mestre.

## Resultado de três universos distintos

| Universo | Linhas | Escopo |
|---|---:|---|
| Google Sheets `SOURCE_REGISTER` | 15 | 7 registros genéricos + 8 M05 |
| SQLite M03 `sources` | 118 | fontes científicas e normativas do corpus recuperado |
| Supabase `cko_evidence.sources` | 157 | fontes do backend CE (inclui domínios de outros fluxos; não promover materiais de contabilidade) |

**Chaves:** 5 de 15 IDs do Sheets estão literalmente na tabela SQLite; nenhum dos 15 aparece literalmente em `cko_evidence.sources`. O cruzamento ampliado 118 IDs SQLite × 157 IDs Supabase também retornou **0 IDs idênticos**. Isso não é prova de inexistência da mesma obra; os namespaces divergem.

**URLs:** 118 URLs não vazias e únicas no SQLite. Foram confrontadas por hash da URL normalizada (esquema `http/https` e `www` ignorados, fragmentos/trailing-slash retirados e query mantida) com todas as 157 fontes Supabase. Resultado: **5 pares de URL**, correspondentes a 4 IDs de M03. São **três candidatos de mesma norma** (ANVISA RDC36, COFEN 736, Portaria 529) e **dois vínculos de escopo parcial** para o registro agregado da Lei 7498 e Decreto 94406; não homogeneizar scopes.

## O que não deve ser identificado automaticamente
- `SRC-BR-COFEN` não equivale à Resolução COFEN 736/2024: primeiro é a entidade reguladora, segundo é documento da entidade. M03 usa `AUTH-BR-COFEN` para autoridade.
- `SRC-BR-MS`, `SRC-BR-ANVISA`, `SRC-INT-WHO` possuem autoridades próprias no M03 (`AUTH-BR-MS`, `AUTH-BR-ANVISA`, `AUTH-WHO`); não podem ser fundidas a atos individuais.
- PubMed, BVS e SciELO são plataformas/índices, não equivalem à publicação de um artigo indexado.
- `SRC-BR-EXERCICIO-ENF` no SQLite agrega **Lei 7498/1986 e Decreto 94406/1987**, embora sua URL aponte à lei; duas linhas Supabase representam a lei separadamente. É relação parcial, não equivalência 1:1.
- As três fontes ELSO/ISHLT ainda são apenas candidatos de descoberta, sem snapshot/hash de texto e sem licença por item.

## Colisões **internas** do Supabase relacionadas ao CE
- Resolução COFEN 564/2017: dois IDs com mesma URL.
- Lei 7498/1986: dois IDs com mesma URL.
- Decreto 94406/1987: dois IDs com mesma URL.

Há também dois pares de URLs repetidas em domínios trabalhistas estrangeiros no mesmo backend; estes foram **excluídos deste fluxo de conteúdo de enfermagem**, não são parte deste cadastro de ação. Repetição de URL não implica automaticamente duplicata de objeto/apagamento.

## Gate para promoção
1. Confrontar `source_id`, tipo do objeto (autoridade/plataforma/fonte/documento), URL normalizada, título, versão, DOI, jurisdição e hash do snapshot/documento.
2. Classificar `EXACT_SAME_DOCUMENT`, `AUTHORITY_HAS_DOCUMENT`, `PLATFORM_INDEXES_DOCUMENT`, `PARTIAL_SCOPE`, `CANDIDATE`, `CONFLICT`.
3. Registrar decisão com fonte, data e justificativa; manter histórico e IDs físicos dos três ambientes.
4. Onde o match é comprovado, vincular por tabela de aliases/linhagem **já existente**, após revisar FKs/RLS e governança; não executar UPSERT em produção nesta onda.
5. Não promover direitos, licença, conteúdo clínico ou publicação com base apenas na igualdade de URL.

**Evidências complementares:** `SOURCE_REGISTER_ID_CROSSWALK.csv`, `M03_SUPABASE_OFFICIAL_URI_CANDIDATES.csv`, `SUPABASE_CE_DUPLICATE_URI_REVIEW.csv`, `B59_READ_ONLY_AUDIT.json`.

**Status:** revisão estruturada, candidato; B59 permanece `IN_PROGRESS`. Nenhuma migração, exclusão ou merge automático.
