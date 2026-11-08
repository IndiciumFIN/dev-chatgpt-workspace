---
document_id: CROSS-DOC-ARCH-001
version: 0.1.0
status: DRAFT
wo_lineage: WUTRIB-WO-PLAN-018
owner_role: SYSTEM_ARCHITECTURE
reviewer_role: DOMAIN_SPECIALISTS_SECURITY_QA
approver_role: AUTHORIZED_DOMAIN_OWNERS
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Arquitetura e gates pré-implementação — engines, dados, qualidade e domínios

## Princípio

Há **uma linguagem comum de governança** (WO/RCM/RTM/fonte/evidência/revisão), não um motor de interpretação comum a todas as áreas. Regras fiscais, clínicas e educacionais requerem contratos e validações independentes. O GitHub registra o plano; a aprovação humana, por competência e escopo, é indispensável.

## 1. Estrutura alvo sem implantação

```text
      POLÍTICA + WO + RCM/RTM + VERSÃO DE FONTES + DECISÃO HUMANA
                               │
                    REGISTRO DE CONTRATOS
                               │
           ┌───────────────────┴───────────────────┐
           │                                       │
      WU-TRIB (FISCAL)                    CALCULADORAS (CLÍNICO/EDU)
      Isolamento próprio                  Isolamento próprio
           │                                       │
      EFD/XML/Protheus                     COFEN/ANVISA/literatura
           │                                       │
      Snapshot Fiscal                      Versão de escala/protocolo
           │                                       │
      Extract / Join / Select              Cálculo / Escala / Conteúdo
           │                                       │
      Fiscal Layout Oracle                 Clinical Oracle independente
           │                                       │
      Anomalia / risco                     Limites/alertas/uso pretendido
           │                                       │
      Achado NÃO HOMOLOGADO                Resultado NÃO substitui clínico
           └───────────────────┬───────────────────┘
                               │
               EVIDÊNCIA + META-TESTE INDEPENDENTE
                               │
                    REVISÃO / SIGN-OFF HUMANO
```

Não compartilhar bancos, credenciais, documentos empresariais, corpus clínicos sensíveis, regras ou versões de release sob alegação de reutilização. Métodos abstratos de validação podem ser reaproveitados via bibliotecas com contratos e testes independentes por domínio.

## 2. WU-TRIB: papéis dos engines que precisam ser avaliados antes de desenvolver

| Engine futuro | Fonte e contrato indispensáveis | Validação específica | Risco P0 |
|---|---|---|---|
| SPED/EFD | Guia, Ato COTEPE, COD_VER, perfil, data e blocos aplicáveis | Estrutura por registro, cruzamentos, totais, exigibilidade | aceitar guia/leiaute inválido |
| NF-e/XML | MOC, NTs, pacote XSD por edição, eventos e chave/DV | schema, status de documento, rejeições e relações | validar contra edição errada |
| Protheus | release, dicionário SX2/SX3/SIX e snapshots autorizados de TES/FISA170/SFx | correspondência física/semântica, origem do imposto, compartilhamento | inferência fiscal falsa em modo híbrido |
| Fonte e perfilamento | bytes/hashes originais, autorização por organização/filial | completude, integridade, tipos, duplicatas, quarentena | fonte incompleta marcada íntegra |
| Join/reconciliação | contrato das chaves, unidade, cardinalidade, tolerância e datas | N:M, contagens, totais por lado, anti-joins, revogações | inflação silenciosa de totais |
| Seleção e amostragem | frame, seed, método, estratos e exclusões | replay, amostragem dirigida vs probabilística, inferência permitida | projeção indevida |
| Erro e risco | código, causa, confiança, severidade, impacto e revisão | falha ≠ exceção ≠ anomalia ≠ irregularidade | concluir infração por score |
| Anomalia | coorte, baseline, método, quantis e rotulagem | FP/FN, drift, comparabilidade e explicabilidade | sinal não comprovado usado como parecer |
| Comparação temporal | duas linhas temporais, cenário, fonte legal, configuração ERP, mix | diferencia DELTA_SOURCE/CONFIG/BUSINESS/DATAQUALITY | alterar passado e vigência |
| Workpaper | corrida, linha, fonte, hash, crítica, revisão e alçada | replay e aprovação separada | evidência não reproduzível |

**28 validadores** do catálogo v0.3.0 são candidatos de inspeção/qualificação; **22 módulos** da expansão v0.1.0 são motores/recursos do produto. Os 68 testes v0.2.0 são roteiros ainda `NOT_RUN`. Nenhuma desses números constitui escopo de cobertura aprovado.

## 3. Calculadoras de Enfermagem: dimensões a planejar separadamente

| Família | Oráculo futuro | Gate específico |
|---|---|---|
| Cálculos de medicamentos/gotejamento/insulina/heparina | fórmula de fonte original, unidade, limites, caso clínico sintético, arredondamento, exceções, impossibilidade de entrada | SAFE_DOSING |
| Escalas Braden, Glasgow, Aldrete, APGAR, MEEM etc. | versão da escala/adaptação, população indicada, faixas, pontos e limitações, direitos | VALIDATED_SCALE |
| Processo de Enfermagem e terminologias | COFEN 736/2024, protocolo, versão de NANDA/NIC/NOC/CIPE e autorização editorial | CLINICAL_PROFESSIONAL_REVIEW |
| Conteúdo científico e educacional, quiz, flashcards e simulados | fonte primária e data, autoria e licença, resposta e distratores revisados, corrigenda editorial | EDUCATIONAL_EVIDENCE |
| Interfaces e acessibilidade | WCAG 2.2/ABNT 17225, fórmulas acessíveis, avisos de erro, teclado/leitor, linguagem adequada | HUMAN_UX_A11Y |
| Dados pessoais e eventual SaMD | finalidade declarada, privacidade, ANPD e RDC 657/2022 por funcionalidade | REGULATORY_CLASSIFICATION |

A **existência** de ferramenta clínica, índice de escore ou conteúdo educacional não comprova adequação clínica, registro sanitário ou necessidade universal de SaMD. A classificação deve ser fundamentada no uso pretendido e funcionalidade.

## 4. Qualidade, segurança e sustentabilidade — controles transversais

| Dimensão | Fonte | Meta de documentação |
|---|---|---|
| Produto e qualidade em uso | ISO 25010:2023 e 25019:2023 | Definir perfil de usuários, propriedades mensuráveis e satisfação em contexto |
| UX/HCD | ISO 9241-11/110/210 (edições confirmadas para adoção) | Jornada, heurísticas e UAT observacional, não só UI decorativa |
| Acessibilidade | WCAG22, ISO40500:2025, ABNT17225:2025, WCAG-EM2 | Matriz de critérios, telas representativas, teclado/leitor, zoom e relatório manual |
| Segurança | ISO27001, OWASP ASVS5, NIST SSDF | Segredos, supply chain, login, autorização, isolamento, adversarial, fix e regressão |
| Dados | ISO25012, ISO8000-61, ISO38505-1:2026 | Origem, integridade, unicidade, temporalidade, dados mestres e normas de acesso |
| Capacidade | ISO 25010 como modelo | Taxas de sucesso, SLO/p95/p99, throughput/concorrência/limite RAM, datasets máximos |
| Continuidade | ISO 12207 e governança de operações | Recovery/restore/rollback e monitoramento autorizado |
| Sustentabilidade | ISO21031 SCI; W3C WSG Draft Note | Unidade funcional, medido vs estimado, energia, carbono embutido/operacional, limites |
| Privacidade | LGPD/ANPD | RIPD conforme risco, retenção, finalidade, tratamento de dados de saúde/empresa |
| Auditabilidade | ISO 15489, 10007, IIA/COSO/COBIT conforme escopo | Baseline, auditor independente, evidência, controle, riscos residuais e reparação |

**Importante:** a norma ISO 21031 define método para indicador de intensidade; não produz automaticamente a medição. WCAG-EM 2.0 organiza avaliação; não substitui os critérios WCAG. COSO/COBIT têm aplicação orientadora de controles e riscos, não substituem legislação fiscal/saúde.

## 5. Evidência de plataformas de excelência: qual técnica pode ser aproveitada?

| Produto / ecossistema | Capacidade apresentada por fontes públicas | Uso potencial | Não inferir |
|---|---|---|---|
| Kolossus Auditor | Central de auditoria/crosschecks, XML/SPED, tributação, estoque e recuperação | Biblioteca fiscal modular e procedimentos | código, regra proprietária ou validação de todos cenários |
| e-Auditoria | Auditorias de arquivo, riscos, cruzamentos e laudos | Investigação e escala de exceções | percentuais de acerto sem experimento |
| Caseware IDEA | Join, amostragem, análise de dados, histórico | Ferramentas genéricas para auditorias | algoritmo interno ou cobertura fiscal |
| Diligent ACL Analytics | Rotinas, análise integral, extração e reexecução | Pipeline reproduzível | performance comparável sem testes |
| MindBridge | Anomalias/riscos com IA | Hipóteses de investigação assistida | afirmar fraude ou erro fiscal automaticamente |
| Microsoft Power Query | Tipos de join, chaves e composição de consultas | Semântica de INNER/OUTER/ANTI e facilidade de aprendizado | resultados fiscais corretos |
| W3C, OWASP, NIST, ISO | Critérios e métodos de engenharia | Gatilhos técnicos e procedimentos verificáveis | certificado só pela referência |

O benchmark funcional já existente na [expansão v0.1](../../homologacao/v1/expansoes/BENCHMARK_PLATAFORMAS_AUDITORIA_v01.md) permanece como origem. Produtos são referências por **capacidade divulgada**, não avalições empíricas conduzidas nesta sessão.

## 6. Fases de decisão antes de implantar

| Gate | Marco de decisão | Aprovação necessária | Estado |
|---|---|---|---|
| PRE-00 | Escopo completo e segregação de projetos | PMO + owners de domínio | DRAFT |
| PRE-01 | Inventário normativo com edições, direitos e aplicabilidade | Fiscal/Clínico/Jurídico conforme item | HOLD_HUMAN |
| PRE-02 | Metamodelos, tipos, master data, fontes e provenance | Dados e Segurança | HOLD_HUMAN |
| PRE-03 | Requisitos, RCM, RTM e risco residual | QA e Governança independentes | HOLD_HUMAN |
| PRE-04 | Contrato de execução e oráculo independente de cada validador | QA + especialista respectivo | HOLD_HUMAN |
| PRE-05 | Autorização de construir e testar validators em sandbox | Dono do produto e segurança | NOT_AUTHORIZED |
| PRE-06 | Meta-teste executado com mutações, FP/FN, replay, ataques e limites | QA independente | NOT_RUN |
| PRE-07 | Segurança, UAT, WCAG manual, capacidade e sustentabilidade por produto | Domínio + Segurança + Operações + UX | NOT_RUN |
| PRE-08 | Uso de fontes reais do ERP ou pacientes | Autoridade específica, legal, segurança, privacidade | NOT_AUTHORIZED |
| PRE-09 | Homologação de serviço piloto | Dono de produto de cada trilha | NO_GO |
| PRE-10 | Homologação fiscal empresarial ou clínica profissional | Especialistas e alçadas regulamentares correspondentes | NO_GO |
| PRE-11 | Merge, implantação e rollback | CAB/autoridade de mudança, freeze e monitoramento | NO_GO |

**WO canônica nasce antes da execução**; o FIND é aberto para falha ou conflito em qualquer fase, não é obrigatoriamente ponto inicial. Cada transição deve ter tarefas homólogas, teste/revisão de admissibilidade e trilha imutável. Nenhum serviço ou Supabase é autorizado a promover sozinho uma WO.

## 7. Separação de ambientes e repositórios

- `IndiciumFIN/dev-chatgpt-workspace`: repositório de origem desta documentação, com branches WU-TRIB isoladas e PRs em Draft.
- `IndiciumFIN/calculadorasdeenfermagem`: repositório da outra iniciativa mencionado historicamente, **sem inspeção autenticada neste turno**; tentativa de consulta respondeu 404 à conexão (não prova inexistência).
- Supabase de WU-TRIB em schema próprio `wutrib` na SOT e o projeto Calculadoras-Smart são **diferentes**; não executar migração no projeto errado e não reaproveitar RLS como autorização cruzada.
- Vercel de WU-TRIB é projeto próprio, mantendo site publicado anterior inalterado. Nenhum deploy nesta revisão.
- Todo novo engine deve declarar `projectId, productDomain, organizationId, environment, sourcePermissions, contractVersion` e passar autorização no servidor antes de processar.

**Decisão final atual:** manter elaboração e revisão documental, sem implantação, execução ou alegação de cobertura total.
