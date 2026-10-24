# Aquisição transversal — execução controlada de textos oficiais (candidato)

Escopo exclusivo: `IndiciumFIN/dev-chatgpt-workspace`; entradas em `registers/governance/transversal-standards-candidates.v1.json`, sem mudanças em outras bases.

**Executor:** `scripts/acquire-transversal-public.py`, em workflow `.github/workflows/acquire-transversal-public.yml`. Toda execução lê somente o catálogo versionado do próprio repositório. Arquivos extraídos e manifesto são guardados como artefato de GitHub Actions por 30 dias: **não são registro canônico persistente**; para preservação, reconciliar e guardar em destino aprovado, sem autorizar promoção clínica.

- Para leis/decretos hospedados no Planalto: tentar obter HTML integral do ato, verificar título/identidade, guardar HTML de origem + texto UTF-8 não revisado e SHA-256 de ambos.
- Para ISO/ABNT/ISACA/IFRS: não copiar texto integral, guardar somente metadados e o motivo de retenção. Ausência de texto não bloqueia trabalho técnico independente permitido.
- Para W3C/OPA/eMAG/ANPD: nesta fase metadata-only (há URLs genéricas ou termos de distribuição distintos); resolver página direta e direitos de retenção antes de acrescentar aquisição.
- Documentos com falha de rede, resposta não-HTML, incompatibilidade de identificação ou redirecionamento não permitido recebem `HOLD` explícito, sem status de download falso.
- O extrator **não** cria `requirement`, `claim`, atomização validada, status de vigência, conformidade, decisão Kernel ou publicação.
- O gate comprova hashes dos arquivos que foram efetivamente baixados e enviados ao artefato; não prova exatidão da interpretação, completude jurídica nem atualização legislativa.
- Sem segredos, sem commits/push automáticos, sem outros repositórios e sem envio dos textos para provedores de IA.


### Complemento de localização de fontes (24/10/2026)
As resoluções ANPD 15, 18 e 19/2024 passam a usar URLs diretas verificadas nos sites oficiais da ANPD e do Ministério da Justiça e Segurança Pública. Os links genéricos anteriores foram preservados no registro. O executor aceita esses dois domínios oficiais sem buscar em repositórios de terceiros. Atenção: a Resolução 19 foi objeto de retificação em 2025, e o cotejo com a edição do Diário Oficial permanece obrigatório. O arquivo extraído não comprova vigência, completude de anexos ou revisão do regulamento.
