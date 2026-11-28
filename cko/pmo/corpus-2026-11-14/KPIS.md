# KPIs de execução (sem número inventado)

| Indicador | Fórmula | Alvo de gate |
|---|---|---|
| Cobertura de inventário | arquivos com IDs e hashes / arquivos no escopo | 100% ou HOLD explícito |
| Referências resolvidas | fontes com snapshot e versão / fontes priorizadas | 100% da onda para promover |
| Evidências rastreáveis | claims com link para trecho e source / claims elegíveis | 100% para promoção |
| Direitos liberados | artefatos com licenças por uso / artefatos candidatos à publicação | 100% dos publicados |
| Review clínico | claims aprovados / claims propostos | 100% dos publicados |
| Reuso confirmado | relações com aprovação clínica/ontológica / relações candidatas | evidência por relação |
| Conflitos abertos | conflitos críticos sem disposição | zero na entrega daquele módulo |
| CI gate | checks obrigatórios verdes / checks obrigatórios executados | 100% |
| Validação relacional | FKs válidas / FKs testadas | 100% |
| Progressão PMO | TASKs aceitas e fechadas / TASKs aplicáveis | não usar como prontidão clínica |

Estados operacionais úteis: `TODO`, `IN_PROGRESS`, `DONE_TECHNICAL`, `DRAFT_EDITORIAL`, `HOLD_HUMAN`, `WAITING_SOURCE`, `REJECTED`; não cadastrar novos enums no banco sem schema crosswalk.
