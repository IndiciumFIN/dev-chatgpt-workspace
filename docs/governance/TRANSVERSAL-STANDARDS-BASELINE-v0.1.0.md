# Matriz transversal de referenciais — CKO · v0.1.0
**Data:** 2026-10-23 | **WO:** WO-GOV-TRANS-001 | **Status:** CANDIDATE_HOLD / NOT_ADMITTED

## Contexto já documentado
A política interna [CKO-POL-UT-001](../../docs/CKO-POL-UT-001.md) define: Fonte/Norma → Requisito → CKO-REG → CKO-MD/Reference Data → Contrato → Motor/Regra → Assurance → Release, e determina Master/Reference Data único para conceitos, unidades, população, terminologia, medicamentos, dispositivos, medidas e relações.
Já existem `contracts/cko-schemas/canonical_object.schema.json`, `source.schema.json`, `authority_binding.schema.json`, `field_definition.schema.json` e `registers/governance/find-register.v1.json`. **Existência física de schema não é implementação funcional.** O relatório histórico `docs/PARIDADE-CKO.md` indicava 0 implementados integralmente, 7 parciais, 8 declarados-mortos e 41 ausentes na camada de consumidores medida; requer medição nova antes de reaproveitar estes números como status atual.

## Separação de camadas e controle de precedência
- **REG/Referencial**: norma, lei, framework, autoridade, jurisdição, versão, licença, pinpoint, vigência.
- **MDM**: entidades canônicas com identificador estável, campos, definições, qualidade, owner/steward, lifecycle.
- **Reference Data**: unidades, locale, terminologias, tipos, code systems e domínios de valores versionados.
- **Lineage**: entidades, atividades, agentes, transformações, evidências de readback, hashes; nunca inferir precisão clínica do hash.
- **Policies e rules**: binding por campo e cláusula verificada, validador determinístico, WO, autoridade e decisão de admissão.
- **Kernel**: exige política aplicável, validador, evidência e decisão; não confundir `CANDIDATE` com `RELEASED`.
- **PMO**: acompanha a fila, não substitui registers nem decide admissibilidade.

## Inventário de referência inicial (metadados públicos, NÃO textos normativos integrais)
| Eixo | Referenciais e versões prioritários | Vínculos atuais a confrontar |
|---|---|---|
| Governança de dados e MDM | ISO 8000-51:2023, 8000-61:2016, 8000-100:2016, 8000-110:2021, 8000-115:2024 | source, authority_binding, canonical_object, field_definition, relation |
| Metadados e semântica | ISO/IEC 11179-1:2023, 11179-3:2023 + Amd 1:2026, 11179-31:2023 | canonical_object, field_definition, terminology, measurement |
| Qualidade de dados | ISO/IEC 25012:2008 | critérios mensuráveis por classe de objeto |
| Proveniência e gestão documental | W3C PROV-O 2013, ISO 15489-1:2016, ISO 23081-1:2017 | source, audit_evidence, relation, events |
| Segurança, privacidade, risco | ISO/IEC 27001:2022, 27701:2025, ISO 31000:2018 | risk_control, privacy, auditoria e segurança |
| Conformidade e IA | ISO 37301:2021, ISO/IEC 42001:2023, COBIT 2019 | work_order, agent, inference, release_gate |

As fontes e links oficiais por item constam em `registers/governance/transversal-standards-candidates.v1.json`. Também integram o programa COSO Controle Interno, COSO ERM, DAMA-DMBOK, LGPD e futuros requisitos ABNT/ISO mais específicos. **Não foram aqui considerados integralmente verificados**, portanto NÃO se criou registro de obrigação por cláusula nem se presumiu posse de normas protegidas.

## Como governar cada referência transversal
1. Cadastro da referência (ID, entidade emissora, jurisdição, edição/emendas, publicação, status, língua, direitos, URL/pinpoint, snapshot/hash, aplicabilidade e revisão).
2. Cadastro de domínio de incidência (REG, MDM, Reference Data, provenance, governance, agent, privacy etc.) e sua ligação aos schemas **já existentes**.
3. Triagem de acesso, direitos e versão vigente; fontes não disponibilizadas `HOLD_INPUT` e apenas metadados públicos referenciados.
4. Requisito atomizado com ligação de cláusula real `Source → Requirement → Contract field`; sem inventar texto de norma.
5. Validador determinístico, exceções justificadas, separação Maker/Checker/Auditor, evidências e teste negativo.
6. FIND formal e WO para gaps, decisão de Kernel; candidato rejeitado continua preservado e versionado.
7. Reavaliação após alteração de norma ou do esquema, com histórico preservado.

## Primeiros FINDs / pontos de retenção
- `FIND-TRANS-001`: inexistência anterior de matriz formal transversal com aplicabilidade, edição e bindings por domínio.
- `FIND-TRANS-002`: ausência de evidência de textos completos e verificação de cláusulas para normas pagas; **não reproduzir conteúdo protegido**.
- `FIND-TRANS-003`: cobertura/consumo runtime das 56 famílias de schema requer remedição e validação isolada; não equiparar arquivos declarativos a gates executáveis.
- `FIND-TRANS-004`: master data/reference data e process owners precisam de autoridade/precedência por tipo de campo, idempotência e tratamento de conflitos.

## Critério de aceite da WO
Confrontar os 18 metadados com fontes e direitos; incorporar os demais referenciais (COSO, COSO ERM, DAMA-DMBOK, LGPD, ISO/IEC 38505 etc.) após qualificação; registrar owners, schema binding por domínio e matriz de exigências verificáveis; executar gates; solicitar admissão **sem promover** conteúdos clínicos.
