# INSTRUÇÃO OBRIGATÓRIA PARA AGENTES — NORMAS LICENCIADAS E EVIDÊNCIA PROPORCIONAL

**ID:** CKO-AI-INS-LIC-001 · **Versão:** 1.0.0 · **Data de registro:** 2026-10-24
**Tipo:** instrução operacional de IA, **não é nova política normativa nem admissão Kernel**.
**Aplicação:** ChatGPT, Copilot, MiniMax, DeepSeek, extratores, revisores e orquestradores sempre que trabalhem com normas ISO, ABNT, ISACA, COSO, DAMA, terminologias protegidas, documentos oficiais ou outros referenciais de direitos controlados.
**Autoridade:** acordo operacional do proprietário, subordinado a contratos/políticas admitidos, regras de licenciamento, `docs/CKO-POL-UT-001.md` e emendas vigentes, e gates do Kernel.
**Estado:** instrução do repositório; a efetividade no executor externo depende de ser carregada e verificada antes de executar a tarefa.

## 0. LEITURA E VERIFICAÇÃO OBRIGATÓRIAS

Antes de afirmar que uma norma precisa ser comprada, que não é utilizável sem PDF integral, que está integralmente atomizada, ou que um requisito foi comprovado, **VERIFIQUE** a identidade, edição, situação de direitos, fonte e grau de evidência. Não invente cláusulas, transcrições, aplicabilidade ou conformidade. Distinga sempre: (a) documentação efetivamente inspecionada, (b) metadados oficiais, (c) conhecimento/inferência, (d) implementação técnica testada, (e) admissão do Kernel.

**O acordo do proprietário é: MÁXIMA UTILIZAÇÃO LEGÍTIMA DAS FONTES, MÍNIMA REPRODUÇÃO DE MATERIAL PROTEGIDO, RASTREABILIDADE INTEGRAL E NENHUMA CONFORMIDADE INVENTADA.**

## 1. EVIDÊNCIA PROPORCIONAL E0–E5

Atribua um nível à afirmação individual — não apenas ao documento inteiro — e registre fonte e limitação:

| Nível | Base admitida | Permitido | Não autoriza |
|---|---|---|---|
| E0 DISCOVERY | Catálogo, índice ou busca de descoberta | Criar candidato e trilha para qualificação | Afirmar requisito ou vigência |
| E1 OFFICIAL_METADATA | Emissor/catálogo oficial | Confirmar identificador, título, edição, status e metadados efetivamente publicados | Inventar texto de cláusula |
| E2 CORROBORATION | Fonte independente verificável | Confirmar metadados, relações e contexto identificável | Substituir a norma na afirmação de requisito obrigatório específico |
| E3 AUTHORIZED_TECHNICAL | Bibliotecas e documentações autorizadas, padrões abertos, especificações técnicas utilizáveis | Implementar/validar comportamento técnico de escopo demonstrado | Dizer que biblioteca ou teste comprova conformidade integral ISO/ABNT |
| E4 PUBLIC_AUTHORIZED | Texto oficial publicamente disponibilizado, dentro dos direitos aplicáveis | Extrair/atomizar/validar apenas o conteúdo permitido | Reproduzir além da autorização ou inferir cláusulas inacessíveis |
| E5 LICENSED_AUTHORIZED | Texto obtido com licença válida e acesso permitido | Analisar por cláusula dentro do escopo de licença, com limites de retenção/uso | Redistribuir norma, enviar a terceiros ou publicar texto protegido sem permissão |

**Níveis não são automaticamente cumulativos**: E3 não comprova requisitos E5; E1 suficiente para identidade não é suficiente para requisito técnico por cláusula. Metadado público não torna o texto integral livre.

## 2. CATEGORIAS DE DIREITOS E ATOS PERMITIDOS

Classifique cada fonte/trecho em: `PUBLIC_FULLTEXT`, `LICENSED_FULLTEXT`, `AUTHORIZED_EXTRACT`, `METADATA_ONLY`, `DERIVED_REQUIREMENT`, `PROHIBITED_COPY`. A classificação é uma hipótese controlada até prova de licença/autorização. Direito de leitura NÃO implica direito de copiar, treinar modelo, subir a API de terceiros ou republicar.

- Em E0–E2: capture somente metadados e relações demonstráveis; faça MDM/Reference Data e pesquisa técnica elegíveis sem simular texto normativo.
- Em E3: bibliotecas/documentação aberta são **evidência da implementação**, não evidência de conteúdo desconhecido da norma.
- Em E4/E5: atomize requisitos apenas com o escopo licenciado/permitido, usando paráfrase independente e locator sempre que cabível; **não** gere substituto da obra protegida, traduções extensas ou reprodução sistemática.
- Se licença/termos forem incertos: pare apenas a operação dependente desses direitos, marque `HOLD_LICENSE` ou `HOLD_LICENSED_FULL_TEXT_NOT_AVAILABLE`; não faça HOLD global automático de MDM.
- Nunca envie PDF ou texto licenciado a MiniMax, DeepSeek, Copilot, APIs, plugins ou qualquer provedor externo sem autorização explícita para esse uso; metadados públicos e tarefas redigidas/minimizadas podem seguir a política de proteção aplicável.
- Normas com licença não viram `PUBLIC_DOMAIN` por estarem acessíveis na internet. Fontes legais oficiais devem ser avaliadas separadamente quanto à natureza e à proteção de componentes acessórios.

## 3. CONTRATO MÍNIMO DE REGISTRO / ATOMIZAÇÃO

Para cada referência e requisito aplicável, grave vínculos ao contrato existente de `source`, `authority_binding`, `canonical_object`, `field_definition`, `audit_evidence` e `find/work_order`. Não crie schemas paralelos. Campos exigíveis conforme pertinência:
`reference_id`, `issuer`, `edition`, `amendment`, `title`, `official_uri`, `locator/pinpoint` (somente se comprovado), `jurisdiction`, `effective_from/until`, `rights_class`, `license_scope`, `evidence_level`, `accessed_at`, `snapshot_ref`, `sha256`, `requirement_id`, `paraphrase_or_technical_mapping`, `applicability`, `field_path`, `validator_ref`, `reproducible_test_ref`, `human_review`, `decision`, `blocking_reason`, `kernel_admission`.

Se o dado não foi comprovado, use `UNKNOWN` / `NOT_VERIFIED` / `HOLD` de acordo com schema admitido; **não preencha por inferência**. IDs e enums desta instrução são semânticos; adaptar somente mediante schema canônico vigente, nunca introduzir enum novo silenciosamente.

## 4. ORDEM DE EXECUÇÃO E ATIVIDADES ELEGÍVEIS

1. Descobrir e qualificar fonte, edição, localização, disponibilidade, direitos e classe de evidência.
2. Verificar se registro já existe; preservar identidade, precedência, versões e histórico. Candidato é preservado, não promove nem apaga o canônico.
3. Executar trabalho elegível de metadados, MDM, Reference Data, dicionário, tipos, integridade, governança e testes técnicos sustentados por E1–E3.
4. Para exigências textuais, vincular cláusula e evidência verificadas em E4/E5 conforme direitos; sem acesso, HOLD **somente no requisito dependente do texto**.
5. Estabelecer `Source → Requirement → CKO-REG → CKO-MD → contrato → validador → evidência`, mantendo `Maker ≠ Checker ≠ Auditor`.
6. Antes de alterar estado canônico, respeitar FIND → política existente (ou proposta de ajuste) → validador → tarefa → WO → admissão Kernel → execução isolada → testes → auditoria → promoção autorizada.
7. Reportar o que foi realizado, não realizado, direitos não verificados, fontes, testes e próximos passos. Nunca trocar `metadata captured` por `normative requirement verified`, `passed tests` por `certified compliance` ou `candidate registered` por `Kernel admitted`.

## 5. REGRAS DE BLOCK / FAIL-CLOSED

**Bloqueie** reprodução vedada, distribuição/licença não comprovada, envio externo sem autorização, transcrição inventada, revisão clínica/regulatória automática, mutação em produção fora do escopo, auto-homologação e promoção sem Kernel. **Não bloqueie indiscriminadamente** cadastro de metadados oficiais ou implementação técnica independente legítima por falta de PDF integral.

Não compre ou solicite que o usuário adquira normas como resposta reflexa. Só informe a necessidade de licença quando requisito específico comprovadamente depender de acesso adicional; descreva também o trabalho que segue possível com E0–E3.

## 6. PRÉ-RESPOSTA — CHECKLIST OBRIGATÓRIO

Antes de responder, produzir documento, script, register, WO, FIND ou commit sobre normas licenciadas, confirme internamente:

- [ ] Reconheci o acordo E0–E5, a distinção licença/metadados/requisito e a classificação de direitos?
- [ ] Respondi com o formato **Requirement + Locator + Evidence + Applicability** quando se tratar de requisito?
- [ ] Separei o que a fonte diz do que foi inferido ou testado tecnicamente?
- [ ] Mantive operações E0–E3 elegíveis sem exigir PDF integral?
- [ ] Apliquei HOLD somente à dependência inacessível e identifiquei o motivo?
- [ ] Verifiquei origem, edição, licença, datas, evidências e versões antes de alegar status?
- [ ] Não reproduzi, enviei a terceiros ou publiquei conteúdo licenciado sem permissão?
- [ ] Reusei registers/schemas/políticas existentes, sem criar fonte paralela?
- [ ] Mantive candidato e FIND preservados, sem declaração falsa de admissão/homologação?
- [ ] Apontei evidências executadas e pendências sem inflar completude?

Se qualquer item falhar, **corrija a resposta/artefato ou declare HOLD/NOT_VERIFIED** antes de prosseguir.

## 7. LEMBRETE DE ATIVAÇÃO

Esta instrução só se aplica operacionalmente quando carregada pelo agente ou vinculada a seu runtime. Não alegue que editar o GitHub modifica a memória ou as instruções de sistema de todas as conversas ChatGPT. Preserve a mesma instrução em próximos handoffs e nas configurações dos demais agentes, sujeita à autorização do proprietário.
