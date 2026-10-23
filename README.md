# ChatGPT Workspace — preparação para importação

Este é o repositório **privado e exclusivo** para o trabalho do ChatGPT.

## Status
**Preparado para a importação inicial; o projeto integral ainda não foi publicado.** O código e os cinco commits originais estão no arquivo `WORKSPACE-chatgpt-IMPORTACAO-2026-10-23.zip` disponibilizado no ChatGPT.

## Importação pelo navegador, sem instalações no Windows

1. Abra a aba **Code → Codespaces** deste repositório e crie um Codespace.
2. No Explorer do Codespace, carregue o ZIP original de 40,9 MB.
3. No terminal integrado do Codespace, execute:

```bash
bash tools/importar-codespaces.sh WORKSPACE-chatgpt-IMPORTACAO-2026-10-23.zip
```

O importador confere o SHA-256 do ZIP, a identidade do repositório, a existência dos cinco commits e a ausência de alterações concorrentes. Ele cria um commit de integração com **dois pais**: o commit de inicialização deste repositório e o HEAD original do pacote. Assim o push para a `main` é **fast-forward**, preserva o histórico original e não exige `--force` nem criação de branches.

**Atenção:** até o script informar `IMPORTAÇÃO CONCLUÍDA`, o repositório contém apenas o mecanismo de preparação e não deve ser considerado homologado. O Codespaces poderá consumir cota ou gerar custo conforme seu plano.

## Restrições
- Não editar outros repositórios.
- Não criar branches adicionais.
- Não publicar na Vercel antes do build e dos testes.
- Não enviar credenciais, `.env` ou dados pessoais ao repositório.
