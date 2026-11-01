# Kernel de governança

## Definição

O kernel é o gate obrigatório da cadeia. Ele valida política, metamodelo, estado e
evidência antes de permitir a próxima etapa.

## Responsabilidades

- validar políticas
- validar estado
- validar manifesto
- validar hash
- registrar decisão
- impedir avanço em caso de falha
- produzir novo status

## Regras

- kernel é obrigatório
- kernel não publica diretamente
- kernel gera manifesto aprovado ou rejeita
- kernel usa fail-closed
