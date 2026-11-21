# CKO / NCOS — Padrão de execução para normativos e conteúdo atômico

Versão 1.0.0-candidate, 14/11/2026. DRAFT / HOLD_SCHEMA / HOLD_SOURCE / HOLD_RIGHTS / HOLD_CLINICAL / NO_PUBLICATION.

## Fonte real e decisão dos oito ZIPs auditados

A auditoria somente leitura identificou cinco LibraryObjects de doenças (95 atributos: 80 declared e 15 API-verified, não clinicamente assegurados), seis objetos JSON clínicos com afirmações de Published/licença/revisor não verificadas externamente, trinta definições entities.zip com required vazio, dez NormAtoms de duas fixtures e doze canonical_objects candidatos no intake.

**Erro P0:** o contrato real canonical_object.schema.json v0.1.0 define provenance_refs como array de strings. Todos os 12 objetos do intake usam objetos nesse array; o validador anexado declarou falso PASS ao não testar elementos string. Manter HOLD_SCHEMA. Integridade de manifesto 20/20 não prova conformidade do schema. Zero clinical_claim_ids e field_binding_ids; 136 rótulos relationship_ids não são relações tipadas com target verificado.

As cinco fontes CKO-DIS originais não estavam no pacote de originais; os hashes de apenas sete fontes dos doze objetos puderam ser verificados contra fontes enviadas. Posologia e clinicalRules não devem ser executadas.

## Arquitetura de destino

CURRICULUM -> TOPIC -> NORM_SOURCE -> DOCUMENT_VERSION -> EVIDENCE_FRAGMENT -> NORM_ATOM / CLINICAL_CLAIM -> KNOWLEDGE_ATOM -> LIBRARY_OBJECT / CONTENT_MASTER -> RESOURCE -> PUBLICATION_VERSION.

Separar identidade, evidência, claim e conteúdo. Preservar o contrato real do repositório; para provenance_refs de tipo errado, conservar JSON original e hash, gerar sidecar tipado e refs string efetivamente resolvidas. Não flexibilizar o contrato para obter PASS. NormAtom representa disposição legal; ClinicalClaim representa proposição clínica; ambos exigem versão, locator, evidência, contexto e direitos.

## POP obrigatório para CADA norma — 18 etapas

00 Escopo do lote e FIND/WO; 01 SourceRegistry e autoridade oficial; 02 direitos por operação; 03 publicação primária e anexos; 04 vigência, emendas, revogações e jurisdição; 05 WO e autorização Kernel independente; 06 aquisição controlada + SHA original; 07 raw e texto derivado com hashes distintos; 08 parse capítulos/artigos/incisos/anexos; 09 coverage ledger classificado; 10 NormAtom candidato; 11 termos e relações com target real; 12 ClinicalClaim candidato por proposição; 13 conflito/temporalidade/impacto; 14 JSON Schema real, testes adversariais e consistência; 15 revisões humanas independentes por domínio; 16 KnowledgeAtom, ContentMaster e recursos educacionais; 17 release com gates, segurança, branch protection, rollback e observabilidade.

Não adquirir textos de licença pendente. Não declarar coverage total removendo material difícil. CI PASS é diagnóstico técnico, não autorização clínica, normativa nem de publicação.

## Produção de conteúdo

Recuperar M08/M09 completos na PR privada CE #39 e os drafts/currículos do workspace PR #66 e PMO #67–#68. Por tópico: dedupe e mapeamento para claims; objetivo/audiência; escrever texto educacional original; produzir caso fictício, quiz comentado, flashcard, checklist e guia; validar equivalência por especialidade, idioma, acessibilidade, direitos e revisão independente. Manter DRAFT_EDITORIAL enquanto HOLD. TOOL diferente de CONTENT: calculadoras e regras assistenciais exigem validação adicional.

Prioridades de normas a verificar na fonte oficial: COFEN 736/2024 e 754/2024; Anvisa RDC 36/2013 e RDC 15/2012; MTE NR-32. Links iniciais oficiais: cofen.gov.br, gov.br/anvisa, gov.br/trabalho-e-emprego. Não tratar o índice de referência como prova exaustiva de vigência ou direitos.

## Gates e entregas

Definir namespaces CKO-G00 a G11: escopo, fonte, direitos, integridade, schema, cobertura, referências, temporalidade, revisão clínica, editorial, segurança e release. Não confundir gates históricos do NORM-KERNEL com gates CE; eles precisam de mapeamento por versão.

Cada lote deve gerar source record, rights register, document version, extraction run, structure tree, coverage ledger, evidence fragments, norm atoms, claims, relations, conflicts, impacts, content masters e QA. Relatório exibe numeradores/denominadores separados: documentos, fragmentos, claims evidenciadas, claims aprovadas, conteúdos criados, revisados e publicados. Falha ou prova ausente = HOLD com FIND e owner. Nenhum conteúdo restrito, dado paciente, patch do ZIP, deploy, Supabase ou main é alterado por esta especificação.

## Estado

Documento operacional candidato. O pacote completo de documentação, matrizes CSV, templates JSON, sidecar schemas, execução local e testes está preservado em artefatos de entrega associados à auditoria de 14/11/2026; esta página conserva a diretriz técnica no GitHub. Nenhum recibo G6 humano foi emitido por esta revisão.
