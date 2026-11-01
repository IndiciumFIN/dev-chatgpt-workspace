# Console administrativo

Este texto descreve o console que está no código em `src/components/admin/admin-console.tsx` e no catálogo `src/lib/admin-module-registry.ts`. Não é homologação, não é declaração de conformidade e não autoriza publicação.

A versão anterior deste documento descrevia nove módulos como ativos e prontos para produção: Comandante, PMO, Agentes de IA, Base RAG, Usuários e IAM, FinOps, Webhooks, Fontes e Templates. Esse console não existe. Não há painel de agentes, base vetorial, módulo de usuários, FinOps nem webhooks. Não há seletor de papel. ISO/IEC 42001, NIST AI RMF e EU AI Act não estão implantados como controles deste console.

## O que a tela faz

Há sete abas com painel próprio e uma área de módulo para o restante do catálogo.

| Aba | O que mostra | O que não faz |
|---|---|---|
| PMO · fila | Fila versionada de ordens | Não cria, não atribui e não executa ordem |
| Visão geral | Contagens do registro local de instrumentos, templates e revisões | Não é telemetria ao vivo |
| Commander | Preparação local | Não chama modelo, Kernel nem agente |
| Conteúdos | Título, descrição e visibilidade de instrumento já catalogado | Não altera cálculo nem regra clínica |
| Templates | Inventário de templates do código | Não edita contrato |
| Fontes e controle | Identificadores de fonte do catálogo | Não qualifica licença nem vigência |
| Publicação | Rascunho e projeção deste navegador | Não publica em GitHub, Vercel nem Supabase |

A publicação local pede confirmação explícita. O texto da tela diz que ela não é homologação clínica. Conflito entre abas, registro inválido e alteração ainda não salva bloqueiam a gravação.

`AdminErrorBoundary` envolve PMO, Commander, visão geral, conteúdos, templates, fontes, publicação e o detalhe do módulo. Se um painel quebra, os outros continuam. Nenhum dado é salvo ou publicado por essa recuperação. Trocar o módulo selecionado limpa a falha do detalhe.

Não há identidade neste console. Não há matriz RBAC em execução.

## Catálogo

O catálogo tem sete grupos e 22 módulos, de M01 a M22. A presença no catálogo não significa que o módulo está implantado. `previewScope`, quando existe, descreve só a projeção parcial.

| Grupo | Módulos |
|---|---|
| G01 Estratégia e Governança | M01 Painel executivo, M02 Estratégia, M04 Governança, M17 Normas, M22 Gestão corporativa |
| G02 Gestão e Execução | M03 PMO |
| G03 Dados e Conhecimento | M05 Metamodelo, M06 Fontes, M07 Kernel, M18 Governança clínica |
| G04 Produtos e Experiência | M08 Ferramentas, M09 Editorial, M10 Design System, M11 Idiomas e acessibilidade |
| G05 Relacionamento | M12 Usuários e assinaturas, M13 Marketing |
| G06 Tecnologia | M15 Publicação, M16 Infraestrutura, M19 IA e agentes, M20 Segurança e privacidade |
| G07 Qualidade e Auditoria | M14 Qualidade, M21 Auditoria |

M01, M03, M06, M08, M09, M10 e M15 abrem as abas da tabela anterior. M04 e M17 estão marcados como superfície de governança, mas a navegação atual abre o detalhe do módulo, não uma aba separada. M16 aponta a Central de Comando já existente em `/central-comando`. Commander é uma aba do console, não o módulo M19.

## O que tem registro para ler

O workspace de cada módulo lista os submódulos do catálogo. Só estes submódulos leem uma coleção que já existe. Os outros dizem que não há coleção consultável. Nenhum registro é fabricado para preencher a lista.

| Módulo | Submódulo | Fonte | Limite visível na tela |
|---|---|---|---|
| M03 | Work Orders | Fila PMO versionada | Leitura |
| M04 | Governança corporativa | Registro FIND versionado | Sem validação executável |
| M06 | Fontes e licenças | IDs citados no catálogo de ferramentas | Estado fixo: não qualificada aqui |
| M06 | Importação em lote | Importação local já existente | Não é conector remoto |
| M08 | Calculadoras | Catálogo de ferramentas do código | A edição permitida é a de metadados da aba Conteúdos |
| M10 | Templates e slots | Catálogo de templates | Sem promoção de componente |
| M17 | Normativos e versões | Normas candidatas versionadas | Admissão de Kernel não concedida |
| M21 | Achados e pareceres | O mesmo registro FIND de M04 | Sem validação executável |

Busca, filtro, ordenação, cartões, tabela, contagem e CSV usam somente essa coleção. O CSV não analisa conformidade.

A aba de formulário só aparece quando `submoduleTemplateBindings` liga aquele submódulo a um schema CKO já versionado. O formulário é rascunho de interface. Não admite, não homologa e não grava no servidor. Submódulo sem esse vínculo informa que não há contrato próprio. O schema de outro domínio não é reaproveitado como se fosse o cadastro dele.

A aba de fluxos mostra as entradas e saídas declaradas no catálogo. São relações planejadas, não integrações executadas, e não concedem escrita.

## O que continua fora

- Agentes autônomos, orquestração, prompts enviados a um modelo e base vetorial.
- Usuários, papéis, sessão e permissão verificada no servidor.
- Custo de token, orçamento e webhooks.
- Publicação remota, deploy e rollback de produção.
- Aprovação humana registrada por uma pessoa identificada.

M12, M13, M19, M20 e M22 continuam no catálogo com esse limite. O formulário de agente em M19 não executa agente.

## Esqueleto separado

`candidates/cko-admin-skeleton/` é outro aplicativo, só de navegador, sem login e sem rede. Os 22 módulos daquele esqueleto não são estes M01–M22. O README dele não descreve este console.
