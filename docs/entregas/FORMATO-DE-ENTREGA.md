# Formato de entrega — a ponte entre as duas frentes

**Status:** contrato de handoff. Válido para toda entrega desta rodada e para qualquer agente que trabalhar neste repositório depois.

## Por que isto existe

Este repositório tem **duas linhagens** que precisam se encontrar:

| Linhagem | Onde está | O que tem |
|---|---|---|
| **A — o app vivo** | `grook_10_26` | 102 tabelas, 22 módulos de admin, o site que roda |
| **B — a plataforma governada** | `main` / `archivamento` / `preview/central-comando-20261026` | kernel fail-closed, políticas OPA, doutrina em `docs/governance/`, a aquisição transversal com 25 documentos preservados e o **índice por artigo** |

As duas se descrevem em **linguagens diferentes**. Sem uma chave estável, "a mesma coisa" depende de interpretação — e aí nasce o conflito: um diz que átomo tem evidência, o outro diz que não há átomo; um diz que a norma está capturada, o outro diz que não foi homologada.

A chave que costura as duas já existe na linhagem B e é o `sourceCanonicalId` (ex.: `transversal-public.lei-12-965-2014.source`). Ele é o mesmo no snapshot, no índice por artigo, nos registros de fonte e no manifesto. **Toda entrega passa a declarar qual chave canônica ela toca** — e o encontro entre as frentes passa a ser uma junção por chave, não uma conversa.

## O registro de entrega (4 campos, obrigatórios)

Toda entrega escreve, no seu diretório, um arquivo `entrega.md` e um `entrega.json` com exatamente estes campos:

| Campo | O que é | Regra |
|---|---|---|
| `chave_canonica` | A identidade estável do que foi mexido | **Uma chave por linha tocada.** Se a entrega mexeu em 3 tabelas, são 3 chaves. Formato: `<tipo>:<id>` (ver vocabulário abaixo). Para norma/fonte, é o `sourceCanonicalId` **exato** da linhagem B. |
| `contrato_aplicado` | A regra/política/contrato que o trabalho honra | O `id` da `policy_rule`, o nome do schema (`contracts/cko-schemas/<x>.schema.json`), a cláusula da doutrina (`docs/governance/<arquivo>#<seção>`) ou o gate (`scripts/<x>.mjs`). **Tem que existir** — o verificador confere. |
| `evidencia_produzida` | O artefato que prova o trabalho | Caminho + o que se lê lá. Preferir algo **contável** (`12 átomos`, `102/102 labels`, `0 linhas`) a uma adjetivação. |
| `dependencia_a_revalidar` | O que precisa ser reconferido por quem vier depois | A pergunta que o próximo agente tem que responder para não herdar uma mentira. Se não houver dependência, escreva `nenhuma`. |

### Vocabulário de `chave_canonica`

```
tabela:<nome_da_tabela>              ex.: tabela:content_text
fonte:<sourceCanonicalId>            ex.: fonte:transversal-public.lei-12-965-2014.source
instrumento:<slug>                   ex.: instrumento:braden
rota:<caminho>                       ex.: rota:/ferramentas/$slug
politica:<package_id>/<rule_id>      ex.: politica:source/admitir
documento:<caminho>                  ex.: documento:docs/governance/06-kernel-governance.md
migration:<arquivo>                  ex.: migration:0036_indice_do_banco.sql
componente:<caminho>                 ex.: componente:src/components/admin/shell.tsx
atom:<sourceCanonicalId>#<pinpoint>  ex.: atom:transversal-public.lei-12-965-2014.source#Art. 3º
```

A chave **precisa** casar com o identificador que o outro lado já usa. Se a entrega cria uma chave nova, ela tem de explicar por que a existente não servia — em `dependencia_a_revalidar`.

## Modelo de `entrega.json`

```json
{
  "tarefa": "indice-banco",
  "chaves": [
    {
      "chave_canonica": "tabela:content_text",
      "contrato_aplicado": "contracts/cko-schemas/source.schema.json + scripts/audit-indice-banco.mjs",
      "evidencia_produzida": "migrations/0036_indice_do_banco.sql — 102/102 labels; gate passa e falha com --self-test",
      "dependencia_a_revalidar": "a tabela content_text ganhou a coluna label; a mesa de conteúdo da área admin precisa ler label em vez de usar o nome técnico"
    }
  ]
}
```

`entrega.md` é a mesma informação em prosa, com o **número** do resultado — é o que se lê.

## Onde isso é conferido

A tarefa **#9 (verificação final e integração)** é o **ponto formal de encontro**. Ela:

1. reúne o `entrega.json` de todas as tarefas;
2. monta o **registro por chave canônica** — a tabela que mostra, para cada chave, o que a linhagem A tem depois desta rodada e o que a linhagem B tinha antes, lado a lado;
3. marca as chaves onde os dois lados **discordam** (divergência) e as que **só existem de um lado** (órfã);
4. fecha em uma lista de **dependências a revalidar** — as perguntas que quem vier depois tem que responder.

Uma chave órfã ou divergente não é sucesso da tarefa, é o item que fica aberto na lista de dependências. Isso é intencional: a honestidade sobre o que não se encontrou vale mais que a aparência de completude.

## Regra para quem chega depois

Antes de mexer em qualquer chave que já aparece no registro: leia a linha dela. A coluna `dependencia_a_revalidar` é a pergunta que ficou aberta — responda antes de assumir que o estado é o que parece.
