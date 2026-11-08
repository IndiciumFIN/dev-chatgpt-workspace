---
document_id: WUTRIB-DOC-RACI-001
version: 0.1.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: PMO
reviewer_role: INFORMATION_SECURITY
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Matriz RACI e segregação de funções — proposta

Não há nomeação de pessoas reais ou autorização implícita neste documento. Papéis abaixo são **alçadas a designar e aprovar**. A mesma pessoa pode executar atividades distintas somente se a política de segregação e independência permitir; não poderá elaborar e ser a única autoridade que homologa seu próprio controle crítico.

| Atividade | PMO/WO | Produto/Negócio | QA | Arquitetura/Dados | Segurança/Privacidade | Fiscal/Protheus | Operações |
|---|---|---|---|---|---|---|---|
| Abrir WO/escopo | R | A | C | C | C | C | I |
| Requisitos e RCM | R | A | C | C | C | C | I |
| Dicionários, APIs e desenho | C | C | C | R/A técnico | C | R fiscal | I |
| Plano e desenho de testes | C | C | R/A técnico | C | C | C | C |
| Executar testes e preservar evidências | I | C | R | R técnico | R segurança | R fiscal | R infra |
| Revisar resultados independentes | C | A negócio | R | C | A segurança | A fiscal | A operação |
| Avaliar acessibilidade | I | C | R | C | C | C | I |
| Avaliar sustentabilidade | C | A metas | R | R | C | I | R |
| Go/No-Go | R secretariado | A | C | C | Veto crítico | Veto fiscal | Veto infra |
| Deploy, rollback e suporte | I | A mudança | C | C | C | C | R |
| Arquivar e expurgar | R cadastro | A decisão | C | C | A privacidade | C | R execução |

Legenda: `R` responsável pela execução; `A` autoridade de aceite; `C` consultado; `I` informado; `Veto` impede promoção sem tratamento/decisão competente. Múltiplos A são **aprovações independentes por domínio**, não difusão de responsabilidade.

## Atribuições a confirmar
- `owner_user_id`: PENDENTE
- `business_signatory`: PENDENTE
- `fiscal_reviewer`: PENDENTE
- `security_reviewer`: PENDENTE
- `operations_owner`: PENDENTE
- `qa_lead`: PENDENTE
- `privacy_controller`: PENDENTE

## Evidência de aprovação
Requer identidade autenticada, alçada, instante, IP/ambiente quando aplicável, artifact ID/versão, hash do documento, motivo, condições, riscos aceitos e exclusões. Nunca incluir aqui um nome ou assinatura inventados.

**Estado:** CANDIDATO — submetido a homologação organizacional.
