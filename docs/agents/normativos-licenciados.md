# Instrução para IA — normas licenciadas e evidências sem nomenclatura concorrente

**ID preexistente:** CKO-AI-INS-LIC-001 · **Revisão:** 1.1.0 · **Data:** 2026-10-24
**Natureza:** instrução operacional para agentes; não constitui norma ISO, política aprovada, certificação, admissão Kernel nem nova taxonomia.
**Aplicação:** ChatGPT, Copilot, MiniMax, DeepSeek e qualquer executor que **efetivamente carregue** esta instrução ao trabalhar com fontes normativas e referenciais de uso restrito.
**Precedência:** direitos aplicáveis; políticas e contratos canônicos admitidos; invariantes em `AGENTS.project.md`; gates Kernel. Divergências geram FIND, nunca substituição silenciosa.

## 1. Proibição de siglas e níveis improvisados

**Não inventar novos códigos, escalas, siglas, estados ou enums para classificar evidências, normas, direitos, risco ou implementação.** Antes de usar uma classificação, localizar seu contrato, namespace, versão e definição canônica; apresentar o termo por extenso na primeira menção, com o identificador somente se já for oficial do projeto.

A revisão anterior apresentou `E0–E5` como uma classificação de acesso a normas licenciadas. **Isso não é uma classificação ISO e não deve ser usado como vocabulário canônico transversal**: rótulos semelhantes já foram usados no programa com sentidos diferentes. Manter o histórico da revisão 1.0.0, mas **não aplicar nem migrar** esses rótulos como estados de `source`, `audit_evidence`, `authority_binding` ou como gatilhos de política. Se um contrato aprovado realmente usa tais níveis em outro domínio, obedecer exclusivamente à definição e ao namespace daquele contrato, sem reinterpretá-los.

É proibido renomear esta escala para outra escala artificial (por exemplo, `M1`, `L1` ou `G1`). Se a taxonomia existente for insuficiente: registrar gap/FIND, com mudança de esquema somente pelo procedimento de governança.

## 2. Quatro perguntas diferentes — não são níveis nem estados equivalentes

Avaliar e registrar **separadamente**, conforme os campos canônicos existentes:

1. **Qual é a fonte?** Emissor, natureza, identificação, título, edição/emenda, jurisdição, situação de vigência e `locator` verificável. Fonte primária, catálogo, documento público, biblioteca técnica ou relato de terceiro não são automaticamente intercambiáveis.
2. **Que material de fato foi consultado?** Apenas metadados oficiais, confirmação independente, documentação técnica de implementação, texto normativo público autorizado, ou texto integral acessado sob licença. Descrever em linguagem natural e vincular snapshot/evidência; **não transformar essas descrições em enum novo**.
3. **Quais direitos existem para o uso proposto?** Leitura, extração, armazenamento, uso interno, redistribuição e compartilhamento com modelo/API externa são atos distintos. Verificar licença e autorizações específicas; ausência de comprovação mantém a operação dependente em HOLD.
4. **O que a evidência comprova?** Identidade e edição; relação técnica; requisito localizado na cláusula; conformidade de implementação em teste; ou verificação de homologação. Nenhum desses resultados comprova automaticamente os demais.

**Regra invariável:** metadados oficiais não demonstram conteúdo de cláusula; biblioteca técnica não comprova aderência integral a ISO; norma citada não significa certificação; hash atesta integridade dos bytes comparados, não a correção do conteúdo.

## 3. Uso proporcional de normas protegidas

- **Pode continuar**: descoberta e conferência de metadados públicos oficiais; inventário de fontes; pesquisa técnica em especificações abertas; testes de bibliotecas autorizadas; organização de Master Data/Reference Data e contratos quando sustentados por evidência suficiente.
- **Exige texto ou prova específica**: para alegar requisito de cláusula, confirmar que a cláusula foi efetivamente consultada por via autorizada e registrar edição, pinpoint e limitação; não deduzir requisitos de sumário ou de analogia com bibliotecas.
- **Exige licença/autorização específica**: reprodução, redistribuição, extração sistemática de obra protegida, publicação, envio a provedores externos e outros atos licenciados. Acesso ao texto para leitura não equivale a autorização para esses atos.
- **Em ausência de licença ou texto**: documentar exatamente o requisito afetado e bloquear **somente a operação dependente**. Não bloquear indiscriminadamente catalogação, dados mestres e trabalhos independentes legítimos.
- **Jamais** pedir compra de PDF por reflexo, inventar cláusula para contornar acesso, criar um substituto extenso de obra protegida ou transferir material restrito a outro agente sem autorização.

## 4. Usar os contratos existentes, sem criar enum ou register paralelo

Verificar os schemas atuais antes de gravar:

- `contracts/cko-schemas/source.schema.json`: `source_type`, `title`, `authority`, `locator.uri`, `locator.pinpoint`, `rights`, `jurisdiction`, `retrieved_at`, `integrity.sha256`, `integrity.snapshot_ref` e, quando aplicável, edição e datas de eficácia conforme contrato.
- `contracts/cko-schemas/authority_binding.schema.json`: `field_path`, `requirement_id`, `source_ids`, `authority_class`, `validity`, `decision`, `validator_ids`, `evidence_bundle_ids`.
- `contracts/cko-schemas/audit_evidence.schema.json`: `artifact_ref`, `validator_id`, `test_case_id`, `result` (PASS/FAIL/HOLD), `run_at`, hashes, versão do executor, `limit_statement`.
- `contracts/cko-schemas/canonical_object.schema.json`: identidade canônica, versões e relações.

Os valores permitidos são **os do schema versionado efetivamente aplicado**, não os exemplos desta instrução. Não introduzir `evidence_level`, `rights_class`, `M1` ou qualquer campo/enum improvisado como se já existisse. Para metadados não contemplados, usar referência de evidência e abrir FIND de extensão antes de alterar o modelo.

Quando houver requisito normativo verificável, estruturar **Requisito + Localização da fonte + Evidência + Aplicabilidade**. A forma de armazenamento deve obedecer ao schema canônico já existente; esse conjunto é uma descrição de vínculo, não um novo contrato técnico.

## 5. Fluxo e separação de papéis

1. Checar identidade, edição, vigência, direitos, fonte e snapshot; conferir se registro já existe.
2. Preservar registros anteriores, conflitos e candidatos; não apagar histórico ou duplicar fonte de verdade.
3. Produzir somente afirmações sustentadas pelo conteúdo realmente acessado; atribuir limites à evidência.
4. Executar pesquisa técnica, Master Data e Reference Data elegíveis sem condicionar tudo a norma paga.
5. Vincular requisitos específicos apenas às cláusulas comprovadamente acessadas; sem prova, HOLD localizado.
6. Governar mudanças por FIND → política existente/ajuste proposto → validador → tarefa → WO → elegibilidade Kernel → execução isolada → testes → auditoria → promoção autorizada.
7. Respeitar **Maker ≠ Checker ≠ Auditor** e revisão humana para decisões clínicas, legais e de homologação.
8. Registrar conclusões, evidências de execução e bloqueios precisos; nunca afirmar conformidade ou admissão sem prova.

## 6. Verificação obrigatória antes de responder, delegar ou publicar

- Estou usando exclusivamente termos definidos em norma/contrato oficial do projeto? Expandi siglas na primeira ocorrência?
- Separei fonte, material consultado, direitos de uso e alcance da conclusão?
- Distingo identificação por metadados de comprovação de cláusula e de conformidade?
- Continuei atividades legítimas sem bloqueio geral por falta de texto integral?
- Bloqueei apenas ato dependente de licença, com motivo e evidência?
- Evitei transcrição protegida, distribuição ou envio externo sem permissão?
- Mantive schema, governança, versionamento, FINDs e decisões Kernel sem recriar estrutura concorrente?
- Relatei execução e status de modo verificável, sem percentuais, aprovações ou documentos inventados?

**Invariante:** utilizar legitimamente o máximo possível das fontes, reproduzir apenas o que for permitido, preservar rastreabilidade e nunca inventar conformidade, classificações ou autoridade.

**Limite de ativação:** esta instrução só alcança agente/runtime que realmente a carrega; não modifica automaticamente memórias ou instruções de outros chats.
