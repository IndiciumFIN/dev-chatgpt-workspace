# Workspace exclusivo ChatGPT — contrato de operacao

**Destino de escrita unico:** `IndiciumFIN/dev-chatgpt-workspace`. Repositorio privado.

Este repositório será o espaço de trabalho para frentes autorizadas pelo usuário, **não** uma autorização geral para modificar outros repositórios, branches ou ambientes. Nenhuma integração automática de produção é habilitada por essa designação.

## Organização e limites

- O estado inicial da raiz é a importação integral do pacote auditado `branch-bibliotecas` (projeto Calculadoras de Enfermagem). É uma **baseline operacional candidata**, não uma homologação e não um design system para outros projetos.
- Novas frentes não podem herdar componentes, cores, tokens ou contratos de outra marca por conveniência. Antes de desenvolver, cada projeto terá escopo, fontes e design system identificados.
- Novos artefatos de outros projetos deverão ser organizados em pastas específicas, com documentação de escopo e lineage. Reestruturação da raiz requer plano e testes para não quebrar o build.
- Processo de execução: intake → plano/decisão → protótipo → desenvolvimento → testes → auditoria/evidências → homologação humana → liberação autorizada.
- Nada é homologado apenas porque o gate retorna verde. Achados recebem ID, causa, remediação, evidência, dono e estado; falhas e dependências ausentes permanecem bloqueantes para release.
- LLMs/agentes não recebem poder discricionário para mudar políticas, promover conteúdo clínico, criar branches, fazer deploy ou habilitar DB/auth.
- **Sem criação de branches remotas**, `--force`, merge automático, alteração de `main` de outros repositórios ou publicação externa sem autorização e gates. A única `main` alvo da importação inicial é a deste workspace, atualmente vazia.
- Nenhum segredo deve entrar no Git: variáveis sensíveis ficam fora do código e das evidências.

## Início

Consulte `COMO-USAR.md`, `docs/AUDITORIA-RELEASE-2026-10-23.md` e `docs/WORKSPACE-HANDOFF-2026-10-23.md` antes do primeiro deploy. O script `tools/publicar-workspace.ps1` faz o push inicial com proteção contra remoto não vazio; a conexão de ChatGPT atual não permite enviar arquivos locais em lote pelo GitHub.
