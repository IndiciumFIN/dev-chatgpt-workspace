# Referência de crosswalk para Manus — 7 macrogrupos e M01–M22

**Emissão:** 26/10/2026 · **Natureza:** transcrição-resumo de proposta arquitetural, **NÃO homologação** nem contrato que substitua a autoridade do CKO.
**Fonte documental:** `Especificacao_Final_Central_de_Comando_e_Tabelas_Iniciais.docx`, versão 1.0, 26/10/2026, documento fornecido pelo proprietário; proposta de 19 páginas. O original não foi localizado no checkout do GitHub. Confirmar autoridade e integridade do arquivo original no handoff antes de uma promoção.
**Fontes de implementação:** `src/components/admin/admin-console.tsx`, `src/components/admin/commander-panel.tsx`, `registers/pmo/queue.v1.json`; PR #13; issue #16.

## Diferença de conceitos

- **Navegação hoje implementada no AdminConsole:** sete abas — PMO · fila; Visão geral; Commander; Conteúdos; Templates; Fontes e controle; Publicação. Estas **não** são os sete macrogrupos do alvo.
- **Navegação-alvo proposta no DOCX:** **sete macrogrupos, vinte e dois módulos**, códigos M01–M22. Não declarar que estejam implementados.
- **Central de Comando:** experiência transversal a M01, M03, M07, M16, M19, M20 e M14. Não é um Kernel, PMO ou storage concorrente.

## Matriz proposta (M01–M22)

| Macrogrupo proposto | Códigos e nomes | Situação |
|---|---|---|
| 01 — Estratégia e Governança | M02 Estratégia e Planejamento; M04 Governança/Riscos/Compliance; M17 Gestão Normativa; M22 Gestão Corporativa e Terceiros | PROPOSTO |
| 02 — Gestão e Execução | M01 Visão Geral; M03 PMO e Projetos | PROPOSTO |
| 03 — Dados e Conhecimento | M05 Arquitetura e Metamodelo; M06 Fontes e Ingestão; M07 Kernel e Conhecimento; M18 Governança Clínica | PROPOSTO |
| 04 — Produtos e Experiência | M08 Produtos e Ferramentas; M09 Editorial; M10 Design System; M11 Internacionalização/Acessibilidade | PROPOSTO |
| 05 — Relacionamento e Negócios | M12 Usuários e Assinaturas; M13 Marketing e Inteligência | PROPOSTO |
| 06 — Tecnologia e Operação | M15 Publicação/Distribuição; M16 Infraestrutura/Automações; M19 Governança de IA/Agentes; M20 Segurança/Privacidade/Continuidade | PROPOSTO |
| 07 — Qualidade e Auditoria | M14 Testes/Homologação; M21 Auditoria Independente/Assurance | PROPOSTO |

**Contagem:** 4+2+4+4+2+4+2 = **22 módulos**. A frase 'sete grupos/21 módulos existentes' na issue #16 não está validada e não deve orientar a implementação.

## Layout obrigatório da proposta para o protótipo

1. **Topo:** monitor de WO/run/logs (aprox. 65% do espaço principal) e comunicação contextual em abas LLM / Agentes / Kernel (aprox. 35%).
2. **Embaixo:** CommandComposer / prompt e modo (Consulta, Preparação, Execução Controlada — último desabilitado).
3. **Depois:** catálogo de WOs e elegibilidade; homologada não equivale a executável.
4. **Base:** cards de indicadores com denominador real de fixture rotulada e aba de detalhes contextual.
5. Em telas pequenas: painéis empilhados, operação consultiva e motivos de bloqueio visíveis. A sidebar de módulos não substitui essa hierarquia.

## Design-system HOLD

O GitHub em `contracts/entities/design-tokens.v1.json` declara `src/lib/site-data.ts` autoridade e mantém navy/azul como `canonical`, com `frozen:true`. O direcionamento recente do proprietário pede preto/branco. **Conflito real e não resolvido.** Autorizar apenas um wireframe monocromático de trabalho, CSS local/escopado, rotulado `NOT_HOMOLOGATED`. Não alterar tokens canônicos nem alegar aderência ao DS antes da decisão explícita e do gate WO-DS-001.

## Contrato de saída obrigatório

- Projeto-fonte editável do Manus, link/export e licença/uso; telas e estados reais em desktop, tablet e mobile.
- `component-inventory.md` mapeando componente local → props/states → componente canônico existente → gap.
- `flows-decisions.md` e crosswalk entre as **sete abas presentes** e os **sete macrogrupos propostos**, distinguindo `PRESENT`, `CANDIDATE`, `HOLD` sem inventar páginas.
- `screenshots/` com tamanho de viewport + data; `delivery-manifest.json`, `findings.json`, `validation.json`, `handoff.md`.
- Os controles de execução/despacho/aprovação/publicação são *disabled* nativos, com motivo visível fora do botão para teclado e leitores de tela. Estados passados só com evidência/versão; estado desconhecido = `NOT_RUN`/`HOLD`.
- Testes de build, links, fluxo local, teclado/contraste/overflow; registrar `NOT_RUN` para testes não executados, sem PASS simulado.
- Sem branch nova, DDL, backend, autenticação, credenciais, envio de conteúdo restrito a modelos ou alteração da `main`.

**Aceite técnico:** protótipo isolado e revisável, não integração canônica nem homologação visual/funcional.
