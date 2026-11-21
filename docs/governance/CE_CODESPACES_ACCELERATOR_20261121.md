# CE / NCOS — executar no GitHub Codespaces

Esta rotina esta na branch candidata da PR #89, sem merge para main.

1. No repositorio IndiciumFIN/dev-chatgpt-workspace, selecione a branch ci/ce-gate-main-isolated-20261121.
2. Clique em Code > Codespaces > Create codespace on selected branch.
3. Abra o terminal e execute: bash scripts/ce-codespaces-run.sh
4. Confira os arquivos em ~/ce-relatorios: CE_RELATORIO.md, CE_RESUMO.json, CE_P0_FILA_100.json, CE_EVIDENCIAS.json.

O script confere os seis manifestos Git historicos com SHA, reconhece 359 objetos P0 distintos e exporta os 100 primeiros para triagem. Preserva 0 aprovacoes humanas, 0 SEALED e status HOLD. O mesmo processo roda no workflow GitHub Actions CE Codespaces accelerator - cloud audit, que pode publicar artefato privado.

A execucao Codespaces precisa ser iniciada no terminal pelo operador; a conexao ChatGPT/GitHub atual nao tem acesso ao terminal Codespaces. GitHub Actions e um runner descartavel, nao e um Codespace. Nunca execute migration, deploy, merge, segredo ou publish a partir deste comando.

Para exportacao de todos os 359 itens use o pacote Windows de processamento local ou amplie a fila apos verificar o contrato do reconciliador; a fila atual e limitada a 100 por seguranca de memoria/avaliacao. Nao confunda triagem automatica com parecer clinico, licenciamento, cross Supabase/Drive e homologacao.
