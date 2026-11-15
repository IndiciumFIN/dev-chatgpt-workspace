# CE — fechamento técnico de contratos e próxima fila de bloqueios

**Data de corte:** 2026-11-14 BRT (logs CI em UTC 2026-11-15).
**Repositório:** IndiciumFIN/dev-chatgpt-workspace.
**Branch candidata:** fix/ce-chrome-frozen-tokens-source-20261114.
**PR canônica da frente:** [#74](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/74).
**Estado:** DRAFT / NO-GO. Sem merge para main ou autorização clínica.

## Resultado real

- [CI de frescor/integração](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43671620395): **sete de sete contratos de frescor PASS**. O controle posterior de cobertura também passou: reconhecimento de `candidateTools` e consumo real do façade de contratos pela rota `__root`. O job geral **continua FAIL** na etapa `npm test`, sem supressão.
- [Workflow somente leitura de CKO](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43671620370): PASS de regeneração, candidato sem autopublicação, nenhum arquivo divergente.
- [Paridade de rotas/componentes](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43671620383): PASS.
- [Tokens DS chrome](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43671620418): PASS. Os 11 valores históricos foram preservados e `--chrome-a11y=44px` foi recuperado de `MANIFESTO-backup.md`. O gerador agora reconhece nomes com dígitos. `--chrome-total` fica 44+44+64=152 px, compatível com o fallback do CSS admin.
- [Visual do HEAD integrado](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43671620382): PASS.
- [Baseline original da main, sem alteração](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43671617239): **470 testes, 438 PASS, 24 FAIL**.
- [Candidato da PR #74](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43671470109): **470 testes, 440 PASS, 22 FAIL**. As 22 falhas do candidato coincidiram pelos nomes com falhas do baseline original; duas falhas de `with-app-env` deixaram de ocorrer; **nenhuma falha nova nessa comparação**. É uma aferição exata dessa suíte, não equivalência funcional global.

## Contratos e CKO

- Rotas: **31 -> 51**; componentes site: **17 -> 19**; componentes vinculados a ferramentas: agora gerados dos mesmos 19 arquivos como `DRAFT`.
- A rota trabalhista está no inventário factual porque existe no código; **não** foi aprovada como ferramenta de enfermagem nem houve decisão de publicação.
- Ferramentas: **cinco no catálogo ativo** e **duas no catálogo candidato** (`aldrete`, `exames-laboratoriais`). O contrato agora contém sete, classificadas `CANDIDATE`; `aldrete` e exames mantêm `publicacao=candidata`.
- As cinco ferramentas do menu principal continuam com `publicacao=publicada` refletindo o código atual, apesar de `status=CANDIDATE` e `release_gate=HOLD_HUMAN`. **Essa divergência de efetiva exposição clínica exige revisão e decisão de segurança clínica, não um PASS de documentação.**
- Os seis registros de fonte inspecionados ainda contêm hashes de integridade zerados, e os 46 bindings não possuem pacote de evidência atômica. Quatro bindings de contexto não têm `source_ids` externo. Nenhuma fonte, tradução ou direito de uso foi inventado ou admitido.
- O report de recuperação de 41 fontes externas em outro repositório é material de **pesquisa** e **não** autoriza atribuição automática aqui.

## Fila de trabalho objetiva

| Etapa | Pendência | Próxima correção testável | Veto |
|---|---|---|---|
| 01 | `npm test`: 22 falhas herdadas da main | Dividir pelas origens: metadados de plataforma/OG, login/Better Auth, template skill, manifesto de auth e env | Não alterar testes para ignorar comportamento |
| 02 | Auth e credencial de preview | Integrar correção da [PR #72](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/72) após revogação da credencial antiga no issuer e E2E | `HOLD_SECRET_ROTATION` |
| 03 | SSR/deploy | [PR #71](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/71) com Nitro RC validado; executar preview externo quando a cota Vercel liberar | `HOLD_VERCEL_QUOTA` |
| 04 | Evidências clínicas e fontes | Conferir instrumentos, versões, direitos, fingerprints PDF, átomos e checker por binding | `HOLD_HUMAN` |
| 05 | Segurança/Supabase | Testar autorização real por identidade, RLS, functions, grants, env/issuer | `HOLD_SECURITY` |
| 06 | Conciliação global | Reconciliar branch/PR por domínio, design e artefato, com rollback | `HOLD_RELEASE` |

**Governança:** PR #73 foi fechada por duplicidade após validar que seus cinco arquivos foram copiados bit a bit para a PR #74. Branch e commits preservados; nenhuma exclusão de histórico. O workflow de baseline do snapshot `main@dacfaa6bc29f` foi deixado em `workflow_dispatch` para evitar falha de diagnóstico recorrente.

**Decisão:** GO de **paridade técnica de contratos na branch**; **NO-GO para merge/release** sem revisão independente, decisão de autoridade clínica e controles de segurança/identidade.
