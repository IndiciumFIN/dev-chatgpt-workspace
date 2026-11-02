# Preview e deploy controlados

## Regras

- preview só existe com manifesto aprovado
- deploy só existe com preview aprovado
- release só existe com evidência e manifesto validado
- qualquer falha em validadores bloqueia o passo seguinte
- rollback requer evidência do estado anterior e motivo

## Fluxo

1. planejamento
2. pilot
3. desenvolvimento
4. teste
5. produção
6. evidencia
7. preview
8. deploy
9. monitoramento
