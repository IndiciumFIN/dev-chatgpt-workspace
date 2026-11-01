# Avaliação das linhagens — onde está o ganho e o que é portável

**Pergunta do dono:** avaliar as outras branches e ver onde se pode ganhar benefícios — portar, não reinventar.

**Método:** tudo que está aqui é medido por `node scripts/avaliar-linhagens.mjs`, que grava `artifacts/branches/avaliacao.json`. Nada foi digitado à mão. Contagens de linha vêm de `git grep -c` (linhas de verdade, não bytes); contagem de arquivos vem de `git ls-tree`; commits, de `git rev-list --count`.

**HEAD da medição:** `feat/projection-unica-f0-suite-real` · commit `0d7f725` · 19 commits nesta branch · 551 arquivos.

---

## 1. As duas linhagens

O repositório tem **duas linhagens sem ancestral comum**. Isso não é uma divergência de estilo: são raízes diferentes.

| Branch | Commits | Arquivos | Linhas | Ancestral comum com o HEAD |
|---|---:|---:|---:|---|
| `preview/central-comando-20261026` | 290 | 1.835 | 502.891 | **nenhum** |
| `implementation-governed-ecosystem` | 73 | 1.792 | 495.689 | **nenhum** |
| `fix/shell-consolidation` | 72 | 1.760 | 493.011 | **nenhum** |
| `main` | 75 | 1.760 | 494.951 | **nenhum** |
| `archivamento` | 71 | 1.760 | 494.934 | **nenhum** |
| `planning` | 71 | 1.760 | 494.934 | **nenhum** |
| `audit-hardening-2026-10-24` | 67 | 1.733 | 494.120 | **nenhum** |
| `grook_10_26` | 2 | 305 | 376.480 | o mesmo |
| `feat/projection-unica-f0-suite-real` (HEAD) | 19 | 551 | 738.392 | o mesmo |

Duas leituras honestas desse quadro:

- **O HEAD tem mais linhas que a linhagem maior** — mas a diferença é quase toda `artifacts/fonte/catalogo.json` (10,9 MB gerado) e os demais artefatos de portão. Em código, a linhagem B é maior; em evidência gerada, o HEAD é maior.
- **A linhagem B não é "o futuro" do app**: é uma plataforma de governança (contratos CKO, registros, evidência) construída sobre um esquema de banco (`cko_orch`, `cko_validation`, `cko_evidence`) que **não existe** no schema do app vivo.

## 2. Inventário por frente (linhagem B, `preview/central-comando-20261026`)

| Frente | Arquivos | Linhas | O que é |
|---|---:|---:|---|
| Contratos CKO | 729 | 192.172 | esquemas JSON (`contracts/cko-schemas/*.json`) e OPA |
| Evidência e auditoria | 139 | 143.724 | `audit-evidence/`, auditorias SQL somente-leitura |
| Registros | 179 | 20.054 | `registers/` — o estado congelado da plataforma |
| CI e automação | 11 | 632 | workflows que já rodam a linhagem B |
| Importação em lote | 15 | 2.126 | bulk import + reconciliação |
| Ferramentas clínicas | 12 | 2.049 | fórmulas (só gotejamento e IMC) |
| Núcleo de governança | 32 | 2.126 | `src/core/**` — kernel fail-closed |
| Migrations candidatas | 9 | 834 | `migrations/candidates/*.sql` |
| SEO e rotas | 29 | 1.429 | navegação, auditoria de links |
| Doutrina e políticas | 27 | 1.321 | `docs/governance/**` — 25 normas com SHA-256 |
| Área administrativa | 11 | 1.179 | registro de módulos + 9 componentes |

## 3. Portabilidade dos 59 scripts que o HEAD não tem

Critério **medido**, não opinado (`artifacts/branches/avaliacao.json` → `portabilidade`):

- **direto** — todo import relativo do script resolve dentro da árvore do HEAD;
- **adaptação** — importa algo que só existe na outra linhagem (a lista do que falta está no artefato);
- **esquema da outra linhagem** — lê `cko_*`, `registers/`, `contracts/`, ou é SQL somente-leitura contra esse esquema.

| Veredito | Quantos |
|---|---:|
| portam direto (imports resolvem aqui) | 35 |
| exigem adaptação (importam algo que não existe aqui) | 5 |
| pertencem ao esquema da outra linhagem (não portam como SQL) | 19 |

**Limite honesto desse critério:** "import resolve" não é "funciona". O primeiro uso de cada script portado tem que passar pelo portão correspondente (índice, DERBY, source, registro, fonte) antes de contar como portado. O critério serve para **ordenar** o trabalho, não para declarar vitória.

## 4. Veredito por peça

| Peça | Veredito | Por quê |
|---|---|---|
| Doutrina (`docs/governance/**`, 25 normas com SHA-256) | **portar já** | é texto com hash; não depende de schema. Já está no HEAD (`docs/governance/`), com o README original preservado em `README-ORIGEM.md` |
| CI (`.github/workflows/**`) | **portar já** | é a parte que faltava: o repositório **não tinha** workflow nenhum. Agora tem `portoes.yml` com os 5 portões, suíte, tipagem e build |
| OPA + kernel fail-closed (`src/core/**`, `contracts/cko-governance/`) | **já portado** | a 0038 trouxeram o kernel, a aprovação independente e o OPA deny-by-default, com o portão `audit-source.mjs` (20/20) |
| Registro de módulos do admin (`admin-module-registry.ts`) | **portar com adaptação** | o próprio arquivo se declara *"não representa tabelas, rotas ou capacidades já homologadas"* — é catálogo de intenção, não de capacidade. Só vale se cada módulo apontar para código que existe |
| Componentes do admin (9 arquivos) | **portar com adaptação** | precisam ser reescritos no design system do site (`src/styles.css` `@theme`) e no schema atual |
| Importação em lote + reconciliação | **portar com adaptação** | a API autenticada de reconciliação é item P0 do dono; aqui ela não existe |
| `migrations/candidates/*.sql` (5 arquivos) | **não portar como SQL** | dependem de `cko_orch`/`cko_validation`/`cko_evidence`; a regra tem que virar código no schema do app (é o que a 0038 e a 0039 fazem) |
| `contracts/cko-schemas/**` (57 esquemas) | **não portar ainda** | 192 mil linhas de contratos para um schema que o app não usa. Só vale depois que a 0039 (políticas como dado) existir |
| `registers/**` (179 arquivos, 20 mil linhas) | **não portar ainda** | é o estado congelado da plataforma B; portar sem a plataforma é copiar peso |
| `audit-evidence/**` (139 arquivos, 143 mil linhas) | **selecivo** | a camada de aquisição transversal de normas **já foi** reescrita no HEAD (`audit-evidence/transversal-acquisition/`, 79/79 blobs conferidos) |
| `src/lib/tools/formulas.ts` | **não portar** | tem só gotejamento e IMC: **os limiares clínicos não estão lá**. Eles estão no JS inline da origem, e recuperar limiar de um instrumento sem fonte é inventar faixa |
| `docs/governance/` + README da plataforma | **portar já** | o README original está preservado em `docs/governance/README-ORIGEM.md` |

## 5. Ordem recomendada

1. **Contrato do PMO verificável** — `scripts/auditar-registro.mjs` + registro verdadeiro. *Feito neste ciclo.*
2. **CI que roda de verdade** — `portoes.yml` com os 5 portões, suíte, tipagem e build. *Feito neste ciclo.*
3. **Prova dentro do repo** — as 7 páginas-fonte da recuperação (212 KB) em `mappings/provas-fonte/`, para que o portão da fonte funcione na CI sem depender de `/workspace`. *Feito neste ciclo.*
4. **Área admin sobre a DS do site** — portar o registro de módulos e os 9 componentes, reescritos no `@theme` do app, e publicar os 5 instrumentos que hoje dão 404.
5. **Importação em lote e reconciliação autenticada** — item P0 do dono; o schema `cko_*` não vem junto, então a regra vira código no schema do app.
6. **Limiares clínicos** — extrair do JS inline da origem; publicar a faixa literal, nunca estimada.
7. **Contratos e registros da plataforma B** — só depois que 4 e 5 existirem; antes disso é 212 mil linhas sem consumidor.

## 6. O que esta avaliação **não** prova

- **Não mede o quanto a linhagem B funciona.** A avaliação é estática: contagem de arquivos, linhas, imports e ancestrais. Rodar a plataforma B exigiria o schema `cko_*` e um PostgreSQL isolado, que não existem aqui.
- **Não mede completude funcional.** Um arquivo portado cujo import resolve ainda pode divergir de contrato; só o portão correspondente decide.
- **Não mede a linhagem B como produto.** Se a decisão for descartar o app vivo e ficar só com a plataforma B, esta avaliação muda de sinal: o ganho vira "não reimplementar" e a perda vira "reescrever o site".
