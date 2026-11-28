# M04 — Reuso canônico por IDs já existentes

**Fonte lida:** 10 UCs de Cardiologia (51 módulos atualmente detalhados, 295 tópicos detalhados; UC08 consta como 8 eixos e 0 módulos, portanto 30h ainda não desdobradas) e SQLite canônico v1.0.0 recuperado da extração v1.7.7. Os 58 módulos e 326 tópicos da versão anterior não são atuais após a retificação da UC08.

## Materialização controlada
- 17 **relações RELATED_TO** entre IDs reais do currículo e IDs reais dos temas. **Nenhuma equivalência exata ou relação DERIVED_FROM** foi inferida.
- 12 temas históricos utilizados como referências no índice, **não** substituem os 1.055 temas do corpus canônico.
- 3 recursos educacionais em `HOLD_HUMAN`, objeto compatível com o schema `contracts/cko-schemas/learning_resource.schema.json`.
- Todos os registros de relação compatíveis com `contracts/cko-schemas/relation.schema.json` no escopo dos campos usados; validação estrutural executada em memória, não é prova de CI do GitHub.
- O template referencia `TPL-ARTICLE-001@0.2.0` já existente em `contracts/cko-editorial/profiles/article.json` e no `template_registry.json`.

## Restrições probatórias
- Números de 'evidence_candidate_links' são **linhas de recuperação lexical**, não átomos comprovando a nova relação e não claims homologados.
- `DEFAULT_ACTIVE` é status de candidato de extração, **não** licença ampla de redistribuição.
- Alguns temas possuem somente evidências `LICENSE_QUARANTINED` ou `HUMAN_REFERENCE_ONLY`, inclusive SBV. Conteúdo clinicamente detalhado fica bloqueado.
- Temas de Enfermagem do Trabalho (OH) não possuem átomos na tabela `evidence_topic_candidates` neste snapshot; status `PENDING_EVIDENCE_ATOMIZATION`.
- A UC08 continua com colisão 8/8 eixos com UC07 e título coincidente com UC09; sem aprovação institucional.
- `source_claim_ids=[]`: nenhum recurso foi vinculado a claim homologado. Não publicar, não expor como protocolo, não alimentar cálculo clínico.
- A relação semântica `related` descreve **possível uso curricular contextual**. Não é equivalência de conteúdo médico, segurança ou normativa.

## Próximo gate obrigatório
Verificar os documentos e trechos por tópico, direitos por uso, versão/autoridade, reviewer clínico; somente após isso criar `claim` suportada, knowledge atom e projeção publicada. A materialização de ID não equivale à homologação clínica.
