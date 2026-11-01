# CE Wave 5 — proposta de reconciliação somente leitura

**Status `HOLD_HUMAN / PREVIEW_ONLY`.** A fonte de verdade permanece `registers/governance/main-migration-scope.v1.json` no GitHub. Este utilitário **não** altera esse arquivo. Os resultados locais não são admissão do Kernel, revisão independente, autorização de implantação, aprovação clínica ou autorização de merge.

## Entradas ancoradas

- Repositório: `IndiciumFIN/dev-chatgpt-workspace`
- `main`: `e9f7fe66075ebe5d7346072dc3a1b4934678c6de`
- SHA do blob original do registro: `04358511cdc2fe3ef08fa7007c8b7b88c47fdbb4`
- 27 refs verificadas no GitHub em 2026-11-01; listadas em `wave5-pinned-heads.readonly.json`.
- Inventário completo: 26 origens; 19 divergentes, 3 à frente, 2 atrás e 2 sem ancestral comum. A comparação da API não é evidência exaustiva de caminhos/blobs; o processamento local com Git completo realiza essa contagem.

## Execução em Codespaces (sem alterar GitHub)

No terminal de um checkout **limpo e completo** do repositório, primeiro inspecione o estado da sessão e busque os refs (o comando não cria commits nem altera o servidor):

```bash
git status --short
git fetch --no-tags --prune origin '+refs/heads/*:refs/remotes/origin/*'
node --test /caminho/ce-wave5/reconcile-main-scope-preview.test.mjs
node /caminho/ce-wave5/reconcile-main-scope-preview.mjs "$PWD" \
  /caminho/ce-wave5/wave5-pinned-heads.readonly.json \
  /tmp/ce-wave5-reconciliacao-proposta
```

Substitua `/caminho/ce-wave5` pelo local em que descompactar este pacote. A pasta de saída `/tmp/ce-wave5-reconciliacao-proposta` precisa **não existir** e estar fora do checkout Git.

**Resultados previstos:** `main-migration-scope.v1.candidate.json` (proposta integral baseada no registro original) e `reconciliation-wave5.readonly-report.json` (alterações propostas, referências e bloqueios). Ambos são apenas material de revisão. O código falha fechado se SHA de qualquer branch mudar, se faltar branch, se o registro original tiver drift, se o checkout estiver sujo ou se a saída estiver dentro dele. Não aceita `--apply`, `--commit`, `--push` nem `--merge`.

## Pontos a homologar antes de implementar

1. Confirmar na fonte canônica os três registros adicionais, suas categorias e a reclassificação dos 23 registros existentes sem apagar metadados, histórico, PR, WO, gates ou FINDs.
2. Inspecionar as divergências semânticas entre branches, migrações e contratos; tratar os dois históricos sem ancestral por mapeamento de blobs/semântica, sem merge forçado.
3. Verificar o controle de admissão efetivo do Kernel (WO, FIND, TASK, política, validadores, escopo exato do HEAD, chave confiável, assinatura e segregação). Este utilitário NÃO valida admissão.
4. Só após admissão assinada e revisão independente, autorizar operação separada de alteração no branch candidato, com CI/testes; depois avaliar proteção e promoção da `main` em gate independente.

**Importante:** não rodamos o utilitário contra um checkout integral real do repositório nesta sessão: executamos somente os 12 testes locais da lógica de proposta e o teste de rejeição de `--apply`. Assim, os arquivos locais são um **instrumento de reconciliação**, não um `PASS` de produção.
