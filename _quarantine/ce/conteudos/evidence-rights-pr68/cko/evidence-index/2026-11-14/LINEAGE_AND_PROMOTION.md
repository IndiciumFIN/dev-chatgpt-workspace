# Evidence Index: source → claim → conhecimento

Estado: **índices tecnicamente verificados; conteúdo clínico não homologado**.

Modelo já estabelecido no handoff canônico:

`CURRICULUM → TOPIC → SOURCE → DOCUMENT → EVIDENCE_ATOM → CLAIM → KNOWLEDGE_ATOM → CONTENT → PUBLICATION`

Relações: `SPECIALTY ↔ CONTENT / TOOL / LIBRARY` (many-to-many). `TOOL != CONTENT`, `LIBRARY` e `LIBRARY_ENTRY` objetos próprios, claim e knowledge atom com IDs/versionamento próprios.

## Checagens executadas na recuperação M03
- ZIP CRC íntegro para seis pacotes originais; dois hashes absolutos coincidiram com manifesto histórico.
- 213/213 elementos do foundation v1.7.7 e 205/205 do v1.7.6 conferidos.
- `PRAGMA integrity_check`: dois bancos SQLite sem falha.
- 13 verificações relacionais realizadas: 0 órfãos/duplicações/violação de bloqueio nos checks executados.
- 29 claims e 29 knowledge atoms herdados: **não reconsiderados nesta execução**.
- 9.102 candidatos de reuso: **não homologados**.

## Condição para promover um vínculo editorial
1. Confirmar IDs do tópico, especialidade, documento e versão.
2. Ter evidência localizável e verificável (trecho/página, hash, URL/DOI quando aplicável).
3. Reconciliar afirmação a fonte e determinar aplicabilidade clínica e jurisdição.
4. Permissão por operação (leitura, mineração, tradução, adaptação, redistribuição, comercial).
5. Revisão por responsável clínico sem conflito, e auditoria de segurança.
6. Projeção via contrato editorial existente, teste de fidelidade/HTML/PDF e assinatura.
7. Promover somente por gate admitido no Kernel e ação humana onde necessário.

A mera coocorrência de tema ou similaridade textual gera `DISCOVERY_CANDIDATE`. Não transformar prévia de conteúdo ou currículo em protocolo clínico.
