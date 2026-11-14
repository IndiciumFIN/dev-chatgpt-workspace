# Bibliotecas — corpus e materialização isolada (BIB-01)
Branch: `staging/bibliotecas-corpus-20261026`. Origem: `main` em `97684528ae2cfe1a2899e8caa53fbac4b45184ef`.

**Estado: CANDIDATE_ONLY / HOLD_HUMAN / NOT_DEPLOYED.** Este pacote não publica conteúdo clínico nem substitui os contratos do CKO. Nenhuma alteração na branch da MiniMax.

## Primeira onda de dados
- Anatomia: **14** imagens no manifesto; associação candidata a `cko.library.anatomia-fisiologia`.
- Seringas e Agulhas: **31** imagens; associação candidata a `cko.library.seringa-referencia`.
- Feridas e Curativos: **49** imagens; associação ambígua a `cko.library.curativos` e `cko.library.ferimentos`. Exige decisão de classificação baseada em fonte.
- Total **94/94 URLs de páginas HTML de revisão**, geradas em `delivery/review-html/bibliotecas/<biblioteca>/<imagem>/index.html`.
- Títulos existentes: **85/94**; **9/94** sem título editorial (permanecem pendentes). Original AVIF e SHA-256 referenciados, sem duplicar arquivos.

## Regra essencial
**Uma imagem = uma página HTML revisável**, não um `LibraryObject` automaticamente. A rota e os metadados são candidatos; `robots=noindex,nofollow`, autorização de publicação e direitos continuam HOLD. O material gerado neste diretório **não está ligado ao build Vercel ou ao sitemap**.

## Fontes existentes (não copiar)
- `src/content/bibliotecas-drive-manifest.json` e `src/content/bibliotecas-labels.pt-BR.json`.
- `public/bibliotecas/assets/**` — AVIF físicos.
- `contracts/cko-bibliotecas/entities/libraries/**`, `bindings/content/**`, `bindings/composition/**`, `bindings/assets/**`, `bindings/provenance/**`.
- `src/components/templates/library-canonical.tsx` — propriedade da integração; não foi alterado.

## Reproduzir
```sh
node bibliotecas-corpus/scripts/build-object-pages.mjs
node bibliotecas-corpus/scripts/build-object-pages.mjs --write
```
A opção `--write` cria apenas HTMLs internos de revisão; se já existem com conteúdo divergente, o script **falha sem sobrescrever**. A importação real no site depende de PR separado e gates.

## Pendências para integrar (não promover automaticamente)
1. Revisar títulos, direitos, licença, semântica e conteúdo; 9 títulos ausentes.
2. Resolver o crosswalk entre as bibliotecas visuais e o cadastro canônico (feridas/curativos não é vínculo 1:1 demonstrado).
3. Associar conteúdo de fontes e claims *por objeto*; conteúdo da página-mãe não prova associação individual.
4. Validar geração de HTML por URL no deployment, incluindo links diretos, imagens, mobile/a11y e fallback.
5. Suprimir publicação/SEO até aprovação independente; no build da MiniMax usar contratos e manifestos, sem copiar 94 templates de código.

## Revisão
`manifest/wave-01.image-pages.v1.json` registra cada página, origem e gates. `validation/BIB-01-baseline.json` registra auditoria determinística da preparação, **não** equivale a E2E ou homologação.
