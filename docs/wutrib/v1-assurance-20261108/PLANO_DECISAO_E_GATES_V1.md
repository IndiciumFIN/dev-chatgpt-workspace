---
document_id: WUTRIB-V1-ASSURANCE-DECISION-001
version: 0.1.0
state: DRAFT_PRE_FREEZE_DECISION
baseline: 1.0.0-rc.0
date: 2026-11-08
approved_by: NONE
approved_at: NONE
---

# Parecer de decisão: o que corrigir antes do freeze formal e o que testar depois

**Resultado:** V1.0.0-rc.0 é um planejamento **conceitualmente alinhado**, porém sua admissão como baseline formal de escopo carece de contratos e critérios verificáveis. Não se recomenda novo módulo por reflexo de benchmark; reforçar o núcleo e fechar um vertical slice fiscal auditável. A evidência de empresas concorrentes é declaratória, não resultado medido por nós.

## Gate A — aprovar ESCOPO V1 (somente documentos; nunca software)

**Focar correção sem programar:**
- [ ] A1. Assinar recorte de registros e condições **EFD ICMS/IPI** por COD_VER/UF/perfil/competência, incluindo C100/C190 e C170 condicional, cancelamento, exceções e status NOT_SUPPORTED. Gap 001/003.
- [ ] A2. Assinar matriz **Protheus SX2/SX3/SIX, TES/SF4, FISA170 Fxx/Cxx, SD1/SD2/SFT IDTRIB**, tax source/fallback por tributo/release/estabelecimento e autorização de snapshot. Gap 002/026.
- [ ] A3. Definir 3 procedimentos de ponta a ponta com input/output/evidência, incluindo caso negativo e “sem divergência identificada” só no universo coberto. Gap 004/011.
- [ ] A4. Definir modelo temporal, dicionário de qualidade ISO 25012, regras/edições oficiais e zero conversão insegura de decimal/código. Gap 005/006/016.
- [ ] A5. Definir test strategy ISO 29119 com casos, fixtures/goldens independentes, orçamento de mutações, critérios de risco e papéis, sem alegar execução agora. Gap 007/012.
- [ ] A6. Definir nove características ISO25010 e seus SLIs/aceites por contexto; UX, WCAG, custo/SCI, resiliência e segurança com metas a aprovar antes da medição. Gap 008/013/014/015.
- [ ] A7. Completar RCM/RTM, templates realmente exigidos, versões de fonte, preservação de origem, owner, risco e policy de mudança ISO10007/12207/15289, com revisões humanas. Gap 010/019/022.
- [ ] A8. Explicitar o destino dos **5 módulos limitados**, inclusive amostragem/score, e corrigir no contrato o requisito de dependência de origem tributária em FISA170. Gap 017/018/020.
- [ ] A9. Assinaturas de Product Owner, Fiscal/Protheus, Dados/Arquitetura, QA, Segurança/Privacidade conforme a aplicação; congelar commit identificável, não só o número da versão.

**O escopo V1 permanece 13+5+4**, salvo decisão humana sobre nova classificação. Ao cumprir Gate A, poderá existir V1.0.0 de **escopo**. Não transferir status a produto, código ou produção.

## Gate B — AUTORIZAR IMPLEMENTAÇÃO (WO executiva)

- Autorizar dados sintéticos, branch/runtime separados de CE, especificações admitidas e oráculos;
- Instalar semântica fiscal por fonte/edição; não liberar norma sem corpus e reviewer;
- Programar com engenharia segura, versionamento, fixtures, CI, isolamento e logging, um procedimento por vez;
- Mapear evidência de testes e origem das regras aos IDs WO/RCM/RTM;
- Para integrações ERP/DF-e reais, exigir autorização adicional de acesso, segurança e dados pessoais; não utilizar acesso real por implicação de aprovação do escopo.

## Gate C — HOMOLOGAR PILOTO E PRODUÇÃO (outro ato)

- Reexecutar 30 grupos de teste em casos reais de engenharia, incluindo os **68 casos anteriores** pertinentes, com oráculos independentes;
- Homologar Auth nominal/tenant, uploads e edge, RLS, SAST/DAST, dependências, assinaturas e segregação;
- Testar WCAG-EM, tarefas UAT, stress/capacidade máxima, SCI quando mensurável e backup/restore;
- Resolver ou aceitar formalmente riscos residuais permitidos e obter GO/NO-GO com alçada, deploy controlado e rollback;
- Antes de qualquer uso fiscal empresarial, verificar regra/corpus, vigência, licença e revisão profissional do cenário, além da capacidade real.

## Cinco conclusões de adequação empresarial

1. **Arquiteta-se o núcleo certo**: fatos, normas, cálculos, evidências e decisões separadas, alinhado à rastreabilidade observada em plataformas e exigências de avaliação técnica.
2. **O subconjunto fiscal é impreciso**: C170 por emissão, contextos EFD e a origem do imposto FISA170/IDTRIB precisam ser definidos antes da assinatura do recorte.
3. **A ausência de regra substantiva é um limite de produto, não falha escondida**: chamar “auditor técnico de cruzamentos fiscais V1” até que um procedimento fiscal de fundamento jurídico tenha sido formalmente admitido/testado.
4. **Quantidade de módulos, regras ou templates não mede maturidade**: critérios por requisito e evidência por teste devem governar a decisão.
5. **Ninguém homologou a V1 nesta comparação**: não houve execução de código, testes de capacidade, UAT, legal signoff, merge ou deploy.

## Distinção do grau de prova

- **VERIFICADO**: os arquivos da PR48 contêm referências, decisões, 22 módulos e 30 grupos NOT_RUN; fontes públicas de ISO, SPED, TOTVS e fornecedores declaram o escopo citado.
- **INFERÊNCIA TÉCNICA**: a necessidade de matrizes de contrato/critério e o impacto de lacunas prováveis no desenho da V1.
- **NÃO VERIFICADO**: eficácia real de motores, cobertura tributária completa, performance, segurança operacional, versões de ERP do cliente, comportamento de concorrentes sob teste padronizado e efeito de normas licenciadas integralmente.
- **HOLD_HUMAN**: aplicabilidade fiscal/jurídica, seleção de regras substantivas, acesso a snapshots e assinatura de baseline.

**Decisão proposta:** \`DESIGN_REVIEW_PASS_WITH_CRITICAL_GAPS\`; \`SCOPE_FREEZE_HOLD\`; \`PRODUCTION_NO_GO\`. Nenhum desses rótulos substitui sign-off humano.
