# W08 — Reconciliação com Supabase Calculadoras-Smart
Status: READ_ONLY_VERIFIED / NO_DDL_APPLIED / KERNEL_WO_HOLD

## Descoberta importante
No projeto `pgsybzggewhinaniybiy`, o schema `ce_platform` já contém:
- `domains` (45 registros)
- `object_types` (55)
- `canonical_objects` (207)
- `content_documents`, `content_blocks`, `media_assets`
- `capabilities`, `object_relations`, `source_mappings`
- `output_profiles`, `output_format_adapters`

Pesquisa indicativa por nomes `vila|kids|infantil` retornou zero correspondências em domains, object_types e canonical_objects. Isto **não comprova** ausência de equivalência semântica sob outros identificadores.

## Reavaliação
Não promover `0002_vila_canonical_full_candidate.sql` como banco próprio de 22 tabelas: duplicaria capacidades já presentes em ce_platform. `0001`, `0002` e `0003` continuam candidatas em HOLD, registradas como alternativas históricas. Preferir novo namespace lógico (domínio e tipos de objeto) dentro de ce_platform, com tabelas adicionais somente para atributos específicos não suportados por contratos existentes.

## Crosswalk funcional
- Fontes/lineage: ce_platform.source_mappings + source_ref nos objetos.
- Objetos: ce_platform.canonical_objects + object_types/domains.
- Conteúdos e traduções: content_documents/content_blocks + locale; testar estratégia de múltiplos idiomas e versões antes de ampliar.
- Imagens/personagens/cenas: media_assets + object_relations; não presumir identidade de personagem sem inventário.
- Capacidades: capabilities + object_capability_bindings.
- Outputs: output_profiles e output_format_adapters.
- Jogos, mecânicas e passos: lacuna a validar contra `ce_platform` completo antes de criar tabelas.
- Publicação: estado em canonical_objects + regras Kernel e evidências qualificadas; estado não substitui aprovação criptográfica.

## GATEs pendentes
1. Kernel: `HOLD_HUMAN`, `NOT_SUBMITTED`. Ordem de serviço precisa de admissão canônica.
2. Inventariar constraints, RLS e triggers efetivos dos objetos existentes.
3. Mapear relações, formatos de revisão, engines de interação e itens históricos com IDs reais.
4. Construir migração incremental e idempotente apenas após crosswalk de campos e regras.
5. Validar em transação descartável, sem criar dados infantis, perfis ou eventos identificáveis.

## Evidências da consulta
Consulta read-only `information_schema.tables/columns`, contagem de registros de domains/object_types/canonical_objects. Nenhuma SQL DDL ou DML executada.
