# BIB-01 — handoff para implementação (sem merge)
Base de trabalho: `staging/bibliotecas-corpus-20261026` originada da `main`.
**Solicitação para MiniMax:** consumir o registro `bibliotecas-corpus/manifest/wave-01.image-pages.v1.json`, incorporando as páginas em suas rotas estáticas/SSR conforme contrato já aprovado. **Não copiar** o HTML de revisão como interface de produção: ele é um artefato apenas para verificar a relação imagem↔página.
Critérios de aceite:
- 94/94 páginas alcançáveis diretamente por URL, HTML de verdade no deploy.
- Mesma identidade de asset e SHA original, sem criar novas imagens.
- HTML com tags semânticas, acessibilidade, alt revisado e noindex enquanto HOLD.
- URLs consistentes, sem duplicidade; dados por objeto com fonte e direitos verificados antes de publicar.
- Divergência `feridas-e-curativos` → `curativos`/`ferimentos` resolvida por classificação comprovada.
- Evidência: build, requests HTTP diretos, screenshots amostrais desktop/mobile e testes de acessibilidade.
**Não alterar** `src/components/templates/library-canonical.tsx`, `main`, `preview`, Supabase nem publicar automaticamente neste pacote.
