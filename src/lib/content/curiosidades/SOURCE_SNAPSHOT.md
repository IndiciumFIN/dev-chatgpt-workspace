# Curiosidades — snapshot governado para pre-visualização

- Fonte de dados: projeto Supabase **Calculadoras-Smart**; schema `ce_curiosidades_v1`; tabela `pages` e catálogo `sources`.
- Extração: 2026-10-26, read-only, nenhuma gravação no Supabase.
- Capturados: 87 slugs únicos, 108 fontes catalogadas.
- Situação da fonte: 44 BLOCKED_SOURCE; 43 NEEDS_REVIEW.
- Estado de publicação: **HOLD — não homologado, não indexar**. Nenhum registro `PUBLISHED`.
- Preservação: `content` integral da coluna `content_json`, identificadores e estado editorial; não derivar texto de fatos sem evidência.
- `pages/*.json` são cópias para renderização/diff, nunca fonte da verdade. Autoridade permanece no banco.
- G2 mídia/licenciamento, revisão de referências, revisão clínica/histórica, aprovação editorial e G6 integração real ficam pendentes. Não incorporar mídia cujo direito não esteja homologado.
- Design: manter os componentes e estilos compartilhados já existentes. Nenhum CSS ou DS paralelo.
- Escopo Git: apenas branch de desenvolvimento, sem merge automático para main.
