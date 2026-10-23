# Como usar este repositório

Três passos. É isso.

```bash
npm ci
npm run dev          # http://localhost:8080
```

Para publicar (build estático, 52 rotas materializadas):

```bash
npm run build:spa
```

## O que tem dentro

| Pasta | O que é |
|---|---|
| `src/` | o site. `src/routes/` tem as rotas, `src/components/` os componentes, `src/lib/` a lógica |
| `public/` | acervo de imagens (AVIF), marca, PWA |
| `scripts/` | os gates e auditores. É aqui que a regra mora |
| `contracts/` | invariantes de runtime + os pacotes CKO vendorizados |
| `registers/` | evidência histórica e decisões (não é código) |
| `audit/` `audit-run/` `audit-evidence/` | o registro das execuções |
| `docs/` | `PENDENCIAS.md` (54 itens) e `PARIDADE-CKO.md` |

## Branches

```
main                o que está publicado
dev/bibliotecas     onde o trabalho acontece
```

Uma branch por frente: `feat/utc-024-formula`, `feat/utc-051-rotas`.

## Os gates

Rodam todos com `npm test` (200 testes) e `node scripts/audit-execution-gates.mjs` (12 gates).

Três merecem explicação, porque são os que impedem o tipo de erro que já aconteceu aqui:

```bash
node scripts/check-generated-fresh.mjs    # os artefatos gerados batem com o código?
node scripts/check-cko-packages.mjs       # os pacotes CKO estão íntegros?
node scripts/check-contract-coverage.mjs  # toda entidade tem contrato, e todo contrato tem entidade?
```

**`check-generated-fresh`** regenera os contratos e compara com o que está no disco. Sem ele, o contrato fica desatualizado em silêncio — e o gate de cobertura passa verde porque lê o arquivo velho. Já aconteceu: a ferramenta de Exames Laboratoriais estava no catálogo e invisível no contrato.

**`check-cko-packages`** confere cada arquivo dos pacotes CKO contra o SHA256 que o próprio pacote declara. Os pacotes sem checksum próprio têm um manifesto fixado em `registers/governance/cko-package-manifest.v1.json`.

**`check-contract-coverage`** exige que toda entidade tenha contrato e que todo contrato cite entidade real. Ele não aceita o próprio artefato gerado como consumidor.

## Ao commitar

O git conta a **mudança**; os `registers/` contam a **decisão**. Os dois são necessários — então o commit aponta para o register:

```
feat(ferramentas): Exames Laboratoriais com 149 exames da base publicada

Traz a base real (149 exames, 21 categorias) extraida da pagina do site,
com faixa geral e faixa por sexo.

Candidata: fica fora do indice ate a homologacao humana. 7 HOLDs declarados.

Refs: UTC-024, UTC-028, UTC-053, UTC-056
```

## Regras que não se negociam

- **Login e assinatura continuam desligados.** `VITE_AUTH_ENABLED=false`. Não religar sem autorização explícita.
- **O banco está desligado.** `DB_ENABLED` é `false as const` e `getSql()`/`getPglite()` rejeitam de propósito.
- **Conteúdo clínico não se inventa.** Se não tem fonte declarada, fica como candidata fora do índice.
- **A Aldrete é candidata.** Sete HOLDs, fora do sitemap, com `noindex`.
- **`md_gate` está fechado.** Nada vai a `RELEASED` até ele abrir.

## Estado da auditoria 2026-10-23

Consulte `docs/AUDITORIA-RELEASE-2026-10-23.md` antes de publicar. Este ZIP possui branch local `dev/bibliotecas` e nao possui `origin` remoto. Nao execute push contra uma `main` remota divergente.

`vercel.json` prepara `npm run build:spa`, mas o build completo e os testes E2E ainda precisam ser reproduzidos no ambiente de CI. Nao confunda arquivos HTML do mesmo shell com SEO prerenderizado por rota. Login e banco permanecem desabilitados por politica; conferir tambem as variaveis do runtime remoto.
