# Registro de escrita — quem está mexendo em quê

**Motivo:** há mais de um agente trabalhando neste repositório ao mesmo tempo (esta rodada de specialization e outra IA que atua no mesmo projeto, do lado do dono). Dois agentes no mesmo arquivo não é colaboração, é sobrescrita.

**Árvore desta rodada:** `/workspace/workspace-repo` · branch `feat/projection-unica-f0-suite-real` · base `4c17fe7`

## Como este registro funciona

Cada tarefa tem **propriedade exclusiva** dos arquivos listados. Se você precisa de um arquivo que está na lista de outra tarefa: **não edite**. Escreva a necessidade no seu registro de entrega (`dependencia_a_revalidar`) e siga sem ele. A tarefa dona decide.

Arquivos **fora** de qualquer lista são de livre acesso — mas confira o `git status` antes, porque alguém pode estar em cima.

## Propriedade por tarefa

**Esta tabela só cita arquivos que existem na árvore.** O portão `scripts/auditar-registro.mjs` cobra isso a cada execução (na CI e local): referência que não existe, dois donos para o mesmo arquivo e número de migration reservado em colisão viram violação. O que ainda vai ser criado está na seção **Reservas**, abaixo — promessa declarada é dívida; promessa escondida é mentira.

| Tarefa | Arquivos que ela é dona |
|---|---|
| Índice do banco | `migrations/0036_indice_do_banco.sql` · `src/lib/banco/indice.ts` · `scripts/audit-indice-banco.mjs` · `scripts/audit-indice-banco.test.mjs` |
| Preenchimento DERBY | `migrations/0037_preencher_derby.sql` · `migrations/0041_passa_de_aprovacao.sql` · `scripts/preencher-derby.mjs` · `scripts/preencher-derby.test.mjs` |
| Processo de source | `src/core/**` · `contracts/cko-governance/**` · `src/lib/kernel-admit.ts` · `src/lib/intake.ts` · `src/lib/source.functions.ts` · `migrations/0038_processo_source.sql` · `scripts/audit-source.mjs` · `scripts/audit-source.test.mjs` |
| Doutrina e políticas (portada) | `docs/governance/**` · `docs/governance/README.md` · `docs/governance/README-ORIGEM.md` |
| Normas: confronto e captura | `audit-evidence/transversal-acquisition/**` · `docs/normativos/requisitos.md` · `docs/normativos/plano-de-captura.md` |
| Especificação das mesas novas | `docs/admin/especificacao-mesas-novas.md` |
| Área administrativa (admin-ux) | `src/components/admin/**` · `src/lib/admin-catalog.ts` · `src/lib/normative-desk.ts` |
| Catálogo da fonte | `scripts/extrair-catalogo-fonte.mjs` · `scripts/extrair-catalogo-fonte.test.mjs` · `artifacts/fonte/**` · `docs/fonte/PROVENIENCIA.md` |
| Recuperação da fonte | `scripts/auditar-fonte.mjs` · `scripts/auditar-fonte.test.mjs` · `migrations/0042_recuperar_fonte.sql` · `docs/fonte/CONFRONTO.md` |
| Registro e portões da CI | `scripts/auditar-registro.mjs` · `scripts/auditar-registro.test.mjs` · `.github/workflows/portoes.yml` |
| Avaliação das linhagens | `scripts/avaliar-linhagens.mjs` · `docs/branches/**` · `artifacts/branches/**` |
| **Dono (esta sessão)** | `docs/entregas/**` · o merge da base · a verificação final do dono · `scripts/status-projeto.mjs` · `scripts/medir-pendencias.mjs` · `docs/fonte/ONDE-MORA-O-CONTEUDO.md` · `src/lib/stored.functions.ts` · `migrations/0043_listas_viram_tabelas.sql` |

Cada tarefa também é dona do seu `deliverables/<tarefa>/entrega.md` e `deliverables/<tarefa>/entrega.json`.

## Reservas

Arquivos declarados que **ainda não existem**. Ninguém os produziu: a tarefa que os produziu foi interrompida (o motor do time morreu) ou nunca foi aberta. A reserva é a dívida à vista — quando o arquivo entrar, a linha sai daqui e entra na tabela de propriedade.

| Tarefa | Arquivo reservado | Por quê |
|---|---|---|
| Doutrina e políticas | `docs/CKO-POL-UT-001.md` | a política como texto estruturado não foi traduzida para o esquema do app |
| Doutrina e políticas | `agents/normativos-licenciados.md` | o catálogo de agentes normativos depende dos contratos `cko-schemas` (linhagem B) |
| Doutrina e políticas | `contracts/cko-schemas/**` | os esquemas JSON da outra linhagem não foram portados; dependem de `cko_orch`/`cko_evidence` |
| Normas: atomização | `migrations/0040_atomos.sql` | a atomização normativa está reservada, não feita |
| Normas: atomização | `scripts/capturar-normas.mjs` | o capturador de normas não foi escrito (o número 0040 continua livre) |
| Normas: atomização | `scripts/capturar-normas.test.mjs` | o teste do capturador não foi escrito: o capturador nem existe |
| Normas: atomização | `docs/normativos/atomizacao.md` | o método de atomização não foi escrito; a 0038 já cria as tabelas do átomo |
| Área administrativa (admin-ux) | `src/lib/admin/**` | a área admin do app é `src/components/admin/**`; não existe `src/lib/admin/**` |
| Verificação final | `docs/entregas/REGISTRO-POR-CHAVE.md` | o registro por chave é a entrega do #9 |
| Verificação final | `docs/entregas/REGISTRO-POR-CHAVE.json` | a versão legível por máquina do registro por chave, no #9 |
| Verificação final | `deliverables/verificacao-final/**` | a pasta da entrega do #9: suíte, build, portões e rotas em um relatório |

## Reserva de número de migration

As migrations são sequenciais e **nunca** se edita uma que já entrou. A reserva desta rodada:

```
0035  canonical_gaps          (já existia — do dono, commit eb2d479)
0036  indice_do_banco         (índice do banco)
0037  preencher_derby         (preenchimento DERBY)
0038  processo_source         (processo de source)
0039  politicas               (políticas como dado)
0040  atomos                  (atomização normativa)
0041  passa_de_aprovacao      (dono — fecha os rascunhos das tabelas de
                               aprovação depois das migrations da rodada)
0042  recuperar_fonte         (recuperação do conteúdo que existia no site
                               de origem — 0041 é a última da fila da rodada
                               anterior, 0042 abre a da recuperação)
0043  listas_viram_tabelas    (normaliza as três listas em text[] que a
                               0038 deixou para tabelas filhas)
```

A 0041 é do dono e é a última da fila de propósito: ela fecha a fila de rascunhos das tabelas de aprovação (`business_rule`, `data_specification`, `governance_item`, `ai_control`) depois que todo mundo criou o que tinha que criar. Ela **não** toca `kernel_atom`, `kernel_claim`, `policy_package` nem `policy_rule` — a admissão de átomo é ato do kernel, e o pacote de política é do worker de doutrina.

Se você precisa de uma migration e o número está tomado, **não pegue o próximo** — peça um número novo ao dono. Duas migrations com o mesmo nome é o tipo de defeito que só aparece em produção.

## Regras de coexistência

1. **Um arquivo, um dono.** Se o seu escopo e o de outro se cruzam, o escopo mais específico vence e o outro descreve a necessidade.
2. **Nada de `git checkout`/`branch`/`commit`/`push`/`stash`/`reset`** durante a rodada. A árvore é compartilhada: trocar de branch debaixo dos outros quebra o trabalho de todo mundo. O dono commita e publica.
3. **`npm test` e `npm run build` são do dono no fim** (a suíte leva ~4,5 min e os outros agentes estão lendo a árvore). Cada agente roda o seu escopo: `node --test scripts/<seu>.test.mjs`, `npx tsc --noEmit`.
4. **Números de conversa são medidos, não opinados.** Toda afirmação de contagem vem de uma query ou de um comando, com a saída colada.
5. **Quem encontra um defeito no escopo de outro não conserta**: anota, com arquivo, linha e o número, e deixa a decisão para o dono. O dono é quem arbitra escopo.

## Para quem chega depois (inclusive a outra IA)

1. Leia `docs/entregas/FORMATO-DE-ENTREGA.md` — o contrato de handoff.
2. Leia `docs/entregas/REGISTRO-POR-CHAVE.md` — o que foi mexido, sob qual chave, com qual contrato, e **qual pergunta ficou aberta**.
3. Antes de tocar numa chave, responda a pergunta que está na coluna `dependencia_a_revalidar` dela. Se a resposta não vier do estado atual do repositório, a chave mudou de forma e o registro precisa ser atualizado.
4. Se você mexer numa chave que já tem dono, **não sobrescreva**: acrescente a dependência nova ao registro e deixe a trilha.
