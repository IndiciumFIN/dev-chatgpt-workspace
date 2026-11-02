# Proveniência da fonte

De onde veio cada texto que o site publica, e como se prova.

## A fonte

| Item | Valor |
|---|---|
| Repositório | `github.com/kauesp0007/calculadoras-de-enfermagem` |
| Commit | `fc608936deb2fee96e6deaad5f3ea6e1c7e0d6da` |
| Data do commit | 2026-10-26T10:03:44-03:00 |
| Clone local | `/workspace/fase1/repo-origem` |
| Arquivos | 14.379 |
| HTML | 8.376 |
| Licença declarada no repositório | ver `LICENSE` no clone |

O clone foi feito do repositório público, uma vez, sem repetição de download.
O hash de cada página está no catálogo (`artifacts/fonte/catalogo.json`); o
sha256 do arquivo HTML é a chave: o mesmo conteúdo sempre produz a mesma
chave, e a chave liga a página do clone ao JSON linearizado.

## O catálogo

| Artefato | Onde | O que é |
|---|---|---|
| índice | `artifacts/fonte/catalogo.json` | uma linha por página: arquivo, papel, idioma, bytes, sha256, título, kicker, lead, nº de seções, metadados |
| páginas | `/workspace/fase1/catalogo-fonte/paginas/<sha256>.json` | a página linearizada: metadados completos, seções com o corpo inteiro, formulários, texto corrido |
| manifesto | `/workspace/fase1/catalogo-fonte/indice.json` | o mesmo índice, fora do repositório |

O catálogo é **derivado** (`scripts/extrair-catalogo-fonte.mjs`), não escrito à
mão. Rodar de novo sobre o mesmo clone produz o mesmo arquivo.

## O que o extrator garante (e o que não garante)

**Garante:**

- nada é truncado e nenhuma frase é cortada: o texto é literal, do começo ao
  fim do elemento;
- os metadados são completos: `title`, `description`, `keywords`, `author`,
  `robots`, `canonical`, todos os `og:*`, todos os `twitter:*`, `lang`, o
  kicker, o lead e as seções com o corpo;
- o idioma é separado: o que está em `<span lang="en">` dentro de uma página
  pt-BR vai para o campo em inglês, e o resto fica em português — a fonte é
  bilíngue no mesmo arquivo;
- o corpo inteiro é preservado, inclusive tabelas (viram linhas separadas por
  ` | `) e listas.

**Não garante (e por quê):**

- a estrutura semântica do design da origem não sobrevive: o extrator
  reconhece cabeçalho, parágrafo, item de lista e tabela, e ignora a
  hierarquia de `div`s. Para o banco, o que importa é o texto e a ordem;
- páginas com conteúdo dentro de JavaScript (as ferramentas interativas) têm
  o esqueleto, não o estado em tempo real. Os instrumentos têm extração
  própria (`scripts/extrair-instrumentos.mjs`).

## Regras de captura herdadas (e como foram respeitadas)

1. **Respeitar `robots.txt` e sinais de conteúdo.** O repositório clonado é
   do próprio autor do site; o `robots.txt` da origem foi lido e a captura
   fica no escopo público do site.
2. **No máximo 1 requisição por segundo por host.** A clonagem é local (um
   `git clone`); não houve rastreamento do site ao vivo. Houve, sim, uma
   auditoria de produção que precisou ler o script anti-bot antes de medir
   qualquer coisa — o registro está em `docs/normativos/requisitos.md`.
3. **Não repetir download de fonte já preservada.** Nenhum arquivo da origem
   foi buscado duas vezes: o clone é a preservação, e o catálogo é derivado
   dele.
4. **ISO, ABNT, ISACA e IFRS: só metadado.** Onde aparece, aparece como
   referência (identificação, título, edição), nunca com o texto integral
   copiado. O texto de norma só entra por atomização, com trecho literal e
   hash — a porta é `src/core/governance/kernel.ts` e a policy OPA em
   `contracts/cko-governance/opa/kernel_admission.rego`.
5. **Faixa clínica nunca inventada.** A faixa de escore e a evidência clínica
   só entram se a fonte as trouxer literalmente. Onde a fonte não traz, o
   valor é o marcador `DERBY` e o portão exige que o instrumento declare a
   versão e a evidência (`source_tool.version`, `.evidence`, `.band_from`).

## Como a proveniência chega ao texto publicado

Cada `update` da migration `0042_recuperar_fonte.sql` carrega, no comentário,
o arquivo de origem, o sha256, a seção de origem e o motivo da
correspondência. O portão `scripts/auditar-fonte.mjs` confere, para cada
seção recuperada:

1. o corpo no banco é **idêntico** ao texto do catálogo (caractere a
   caractere, com o espaço normalizado);
2. a migration cita o sha256 do arquivo de origem;
3. nenhuma pendência ficou sem nome;
4. nenhum gancho `PENDENTE` sobrou no banco inteiro.

Assim, "de onde veio este texto" tem resposta em uma linha de comando, e não
na memória de quem fez a extração.
