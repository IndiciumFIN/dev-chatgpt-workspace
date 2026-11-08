---
document_id: WUTRIB-DOC-POLICY-001
version: 0.1.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: PMO_DOCUMENT_CONTROL
reviewer_role: QUALITY_ASSURANCE
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Política de gestão documental e registros — proposta

## 1. Autoridade, alcance e princípios
A WO é o **objeto de autoridade do planejamento até o encerramento**; cada artefato tem ID e versão imutáveis, pertence a uma WO, descreve suas fontes e controla dependências. O Git registra a história técnica, porém um commit ou pipeline verde **não constitui assinatura**, nem uma aprovação fiscal. O processo deve privilegiar evidências verificáveis, revisão independente, menor privilégio, estabilidade de identificadores e não perda da história.

**Referências de orientação:** ISO/IEC/IEEE 12207:2026 (ciclo de vida), 15289:2019 (itens de informação), 29119-2/-3:2021 (testes e documentação), ISO 15489-1:2016 (gestão de registros), ISO 10007:2017 (configuração). As regras abaixo são política **proposta WU-TRIB**; nenhuma obrigação é atribuída automaticamente aos textos ISO não licenciados.

## 2. Identificação, taxonomia e documentos mínimos
Formato `WUTRIB-DOC-NNN`, conservado por toda a vida; `version` SemVer e `path` no registro. Cada documento contém: ID, título, tipo, fase, escopo, criticidade, WO, autor funcional, revisor, aprovador, status, versão, datas, dependências, fontes, edição/vigência, requisitos/controles/casos de teste, riscos, evidências, SHA e decisões. Campos desconhecidos devem ser marcados `PENDENTE`, nunca inferidos.

Tipos: POLÍTICA, PLANO, PROCEDIMENTO, ESPECIFICAÇÃO, MATRIZ, REGISTRO, RELATÓRIO, DECISÃO, EVIDÊNCIA. O conjunto aplicável é definido por risco, plataforma, legislação e escopo. Um item condicional somente pode virar N/A com fundamentação, escopo e aprovador identificável.

## 3. Status e regras
- `TEMPLATE`: estrutura criada; não representa conteúdo validado.
- `DRAFT`: conteúdo preenchido e associado a fontes verificáveis; sem aceite.
- `IN_REVIEW`: submetido a avaliador independente com checklist e comentário rastreado.
- `HOLD`: conteúdo insuficiente, conflito de fonte, evidência ausente ou bloqueio.
- `APPROVED`: parecer positivo e autorização humana distinta de autoria, versão e hash vinculados.
- `SUPERSEDED`: substituído por nova edição; mantém URL/commit e justificativa.
- `ARCHIVED`: preservado/expurgado sob política de retenção e obrigação legal documentada, sem destruição ad hoc.

`PASS` de teste é um atributo de EXECUÇÃO, não uma transição implícita de documento para APPROVED. `NO_GO` permanece quando há gate crítico FAIL/HOLD, risco inaceitável ou falta de evidência.

## 4. Versionamento e baseline
- `0.x.y` para documentos candidatos e drafts; após aprovação formal é possível emitir `1.0.0` com baseline imutável.
- `PATCH`: ortografia/metadados sem impacto em regra ou decisão; `MINOR`: amplia escopo/controle compatível; `MAJOR`: altera política, requisito, procedimento crítico, critério ou evidência a ponto de exigir nova aprovação e análise de impacto.
- Mudança depois de APPROVED gera nova versão (não sobregrava documento ou assinatura histórica); registra `supersedes`, motivos, diff, WO/CR, aprovadores e novas provas.
- `Git commit` identifica estado do repositório; `blob SHA` ou `SHA-256` identifica bytes de evidência; eles não são intercambiáveis. O SHA-256 só é exibido após computação real, nunca como hash fictício.
- A baseline de release fixa artefatos de documentação, requisitos e testes **por commit SHA imutável**, deployment ID e data/hora. Links a branch sem commit não bastam para aceitação final.
- Branch de planejamento sem merge autorizado; uso de PR Draft, revisão, status checks e proteção de branch na migração para repositório dedicado.

## 5. Rastreabilidade obrigatória
Cadeia: **WO → objetivo/escopo → requisito → risco → controle → teste → execução → evidência → achado → reteste → parecer → aprovação → release → observabilidade → encerramento**. O registrador rejeita documentos sem WO, ID, versão, fontes ou dependências aplicáveis. A matriz distingue `FATO`, `INFERÊNCIA`, `HIPÓTESE`, `CONFLITO`, `HOLD_HUMAN`.

## 6. Segregação de funções e autorização
Elaborador pode redigir e registrar prova; revisor técnico inspeciona conteúdo, integridade, rastreabilidade e cobertura; autoridade de negócio aprova aceitação; Segurança e Privacidade avaliam seus domínios; Operações aprova capacidade e rollback; responsável fiscal revisa regra e vigência. Ninguém autoaprova seu próprio documento. O conselho/cadeia não será presumido pelos nomes das contas; `approved_by` requer identidade verificável e alçada no ato, com carimbo temporal e versão/hashes assinados. Na ausência, HOLD.

## 7. Controle de fontes e licenças
Normativos oficiais por URL imutável quando disponível, identificação do emissor, edição, data de publicação, vigência e classificação de confiança; conflito entre fontes ou release TOTVS → HOLD_HUMAN. Não copiar integralmente ISO/IIA/TOTVS proprietários; catalogar metadados e sínteses originais, com direitos/reservas.

## 8. Retenção, confidencialidade e descarte
Definir classificação PUBLIC/INTERNAL/RESTRICTED; segredos, PII e documentos fiscais corporativos não entram no Git. Retenção e descarte devem considerar LGPD, obrigação legal, contrato e pedido do controlador. Logs e evidências com prazo, fundamento, titular da decisão, acesso mínimo, backup, integridade, revisão e legal hold; **nunca presumir 'guardar para sempre' para dados pessoais**. Scripts de teste sintético não constituem registro fiscal oficial.

## 9. Exceções, lacunas e auditoria
Pendência vira `FIND` vinculado à WO, com severidade P0/P1/P2, impacto, prazo, responsável, decisão e próximo gate. `N/A` exige justificativa formal; `HOLD` não é tratado como PASS; ruptura de baseline requer CR e reexecução dos testes impactados. Revisões periódicas e pós-incidente obrigam reavaliação de versões afetadas.

## 10. Controles de integridade propostos
Registro canônico com contagem e caminhos; verificador estático confere unicidade de IDs/versões, arquivos existentes, cabeçalhos, classificação, status e vínculos. Esse verificador não lê normas protegidas, não valida adequação fiscal, não julga risco e não assina homologação. Sua aprovação é necessária **mas insuficiente** para transição de documento.

## 11. Gatilhos de revisão
Mudança normativa/release ERP, alteração de tipo de dado, vulnerabilidade crítica, incidente, mudança de arquitetura/fornecedor, mudança de jornada UX, baseline de performance/sustentabilidade alterada, achado de auditoria, alteração de requisitos, expiração de autorização.

## 12. Aprovação desta política
**Estado atual DRAFT.** Assinatura do Dono do Produto, Segurança/Privacidade e Governança: **PENDENTES**. Nenhuma condição de produção é liberada por esta proposta.
