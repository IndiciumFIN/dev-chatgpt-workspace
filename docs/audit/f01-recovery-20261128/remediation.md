# F01 — matriz de remediação candidata
Nenhuma linha é autorização de mudança. Status inicial HOLD. Reutilizar contratos existentes e preservar histórico.

| Frente | Ação candidata | Impacto horizontal | Impacto vertical | Impacto transversal | Evidência de saída |
|---|---|---|---|---|---|
| Identidade de camadas | Confirmar consumidores de layer_uuid e object_uuid; não igualar | 44 camadas | catálogo, MD, FK | APIs, Kernel | referências tipadas e testes |
| UUID legado | Avaliar compatibilidade e exceção versionada antes de qualquer troca | tipos afetados | identidade, versões, aliases | integrações, auditoria | inventário de consumidores e decisão |
| LABOR_TOOL | Recuperar política; preservar WK existentes | ferramentas trabalhistas | tipo, entidade, ID | MD, validação | contrato autorizado e testes positivo/negativo |
| DEVICE_COHORT | Recuperar política antes de nova admissão | dispositivos | tipo, entidade, ID | MD, validação | contrato autorizado e testes positivo/negativo |
| Linhagem | Preservar hashes originais; reconciliar atestações e conteúdo | objetos afetados | versão, predecessor, evidência | publicação, assurance | hashes reproduzidos e decisão |
| Auditoria | Resolver autoridade semântica das referências compartilhadas | camadas afetadas | lente, execução, resultado | CAAT/IPE | vínculo tipado, resultado e evidência |
| Pipeline | Localizar engines e validadores existentes; não duplicar | 44 camadas | 24 etapas | Kernel, CAAT/IPE | bindings comprovados e teste |
| Holds MD | Resolver cada restrição dentro do escopo declarado | domínios afetados | campo, objeto, controle | governança normativa | autoridade e prova de fechamento |
| Documentação | Reconstruir baseline após reconciliação | 44 camadas | 31 seções | governança, operação | manifesto e rastreabilidade reversa |

Não executar migration, alterar UUID, encerrar hold, promover branch ou iniciar F02 com base nesta matriz. 
