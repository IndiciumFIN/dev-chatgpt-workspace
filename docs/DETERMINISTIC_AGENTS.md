# WU-TRIB — verificadores especializados determinísticos v0.2.0

Estes agentes são **scripts independentes** executados localmente ou no GitHub Actions. Não são IA generativa e não decidem conformidade fiscal. O objetivo é acelerar ciclos, evitar regressões e produzir gates reproduzíveis, sem depender de credenciais ou de dados empresariais.

| Agente | Escopo | Comando | Reprovação |
|---|---|---|---|
| `fiscal-contract` | Contratos de lote, diferenças, evidências e ausência de conclusão fiscal | `node agents/fiscal-contract.mjs` | Regra sem evidência de comportamento ou fixture divergente |
| `security` | CSP, sem rede, proteção DTD e ausência de segredos no frontend | `node agents/security.mjs` | Exposição de rede, scripts inline ou conteúdo não seguro |
| `ux-accessibility` | IDs, estrutura, navegação, teclado, feedback e responsividade | `node agents/ux-accessibility.mjs` | Falta de affordance, foco, anúncios ou semântica mínima |
| `release` | Árvore exclusiva, versão, branch, manifesto e limites públicos | `node agents/release.mjs` | Contaminação entre projetos, versão divergente ou arquivos sensíveis |

Todos retornam JSON com IDs estáveis e processo com exit code 1 quando um controle falha. `npm run verify` executa todos em sequência e `npm run check` executa agentes e testes Node. `tests/browser_e2e.py` amplia as verificações pelo Chromium real, **em DOM injetado** porque o ambiente do ChatGPT bloqueia acesso HTTP local e externo; não equivale ao E2E HTTPS da Vercel. A validação do endpoint público permanece um gate separado.

## Política para próximas waves

1. Abrir uma WO/atividade na trilha WU-TRIB e identificar impacto.
2. Executar `npm run check` e `python tests/browser_e2e.py` em prévia isolada. Sem testes verdes, não publicar.
3. Conferir exclusivamente os arquivos da branch WU-TRIB (nunca misturar com Calculadoras de Enfermagem).
4. Implantar no projeto Vercel `wutrib-auditor-web-piloto`, validar READY, logs e SHA de origem. Nunca aprovar conformidade fiscal automaticamente.
5. Registrar artefatos, resultados e limitações no `wutrib.project_documents` e `wo_tasks` do banco SOT. Somente metadados; sem dados reais ou segredos.

## Advertências

- Geração de achado **não deve ocorrer** quando um XML falha, quando não há EFD válida ou quando há C100 inválido. É melhor `INCOMPLETE` que falso positivo.
- RLS privado do banco WU-TRIB não deve ser aberto somente para dar acesso ao demo sem login.
- Qualquer uso real requer autenticação, isolamento por empresa, versões oficiais de leiaute, retenção e aprovação fiscal humana.
