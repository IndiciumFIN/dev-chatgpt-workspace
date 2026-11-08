# Planejamento dos validadores WU-TRIB — v0.3.0

**Estado:** DRAFT, sem execução nem aprovação. **WO:** WUTRIB-WO-PLAN-018. **Vinculação:** plano documental existente e PR Draft específica.

Este pacote é a estratégia de verificação de domínio, risco, controle e evidência. Sua existência NÃO prova eficácia de qualquer validador, conformidade COSO/COBIT, aderência fiscal nem autorização para auditar arquivos ou organizações reais.

## Documentos

- [Plano diretor v0.3.0](../PLANO_AUDITORIA_COM_VALIDADORES.md): arquitetura de camadas, decisões de autoridade, 28 validadores e gates.
- [Catálogo de 28 validadores](CATALOGO_VALIDADORES.v0.3.json): IDs, owners, fontes, controle COSO/COBIT, evidência e estado PLANNED.
- [Matriz COSO, COBIT, IIA e IA](MATRIZ_COSO_COBIT_IA_v03.md): vínculos propostos, dependentes de verificação por especialista.
- [Protocolo de meta-validação](PROTOCOLO_META_VALIDACAO.md): independência do oráculo, defeitos injetados, amostragem, tolerâncias e gates.
- [Contrato JSON de resultado](CONTRATO_RESULTADO_VALIDADOR.v0.3.schema.json): formatos de resultado e proibição explícita de aprovação fiscal por máquina.
- [Registro normativo canônico](../referencias-normativas.v1.json): 37 referências por edição/URL/aplicabilidade pendente; textos oficiais protegidos não foram copiados.

## O que está efetivamente implementado

**Somente documentos de planejamento.** Os sete agentes determinísticos pré-existentes não foram modificados nem recertificados. Os VAL-001 a VAL-028 ainda não são programas. Quatro deles são condicionais ao uso real de IA; não existe prova de um sistema IA em operação nesta etapa.

## Completar antes de implementar

1. Revisão de escopo e importância com áreas Fiscal, Protheus, Risco, Governança, Segurança e Qualidade.
2. Validação humana da vinculação COSO/COBIT, inclusive permissão/licença de material protegido.
3. Resolução de fontes e corpora oficiais por vigência e release; determinismo e controle de mutações.
4. Atualização do catálogo principal: D051 lógica, D052 métodos, D053 amostragem, D054 matriz método-controle-evidência estão propostos, não cadastrados nos 50 modelos.
5. Deliberação de metas de eficácia dos validadores, falsos negativos, cobertura, risco residual e alçadas.
6. Autorização formal e separada de ambientes/dados antes de qualquer futura execução.

**No merge, no production, no fiscal sign-off.**
