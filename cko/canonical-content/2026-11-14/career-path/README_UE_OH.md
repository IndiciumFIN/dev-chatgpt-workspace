# Trilha de carreira — agrupamento de temas (Urgência e Enfermagem do Trabalho)

Esta projeção foi derivada **somente dos metadados da tabela `topics` do SQLite M03 recuperado** (SHA256 `cad94fa782918fb3ef9f77666306537139e3d04ebc96631425bdbd6383372142`), sem cópia de textos de fontes clínicas, e mantém os 1.055 IDs individuais na **fonte original**, recuperáveis com a consulta SQL de cada grupo.

| Área | Origem canônica M03 | Grupos | Tópicos | Links candidatos de evidência |
|---|---|---:|---:|---:|
| Urgência e Emergência | `URG_EMERG_ATOMIZED_V1_2_0` | 7 | 170 | 9.102, **não aprovados** |
| Enfermagem do Trabalho | `ENF_TRABALHO_TOPIC_UNIVERSE_V0_1_0` | 32 | 885 | 0 neste recorte |

**Os 39 grupos são eixos temáticos existentes, não 39 etapas de progressão profissional.** Não há progressão, pré-requisito profissional, credencial, competência legal, carga horária oficial ou comprovação de formação nos dados atomizados deste recorte. Os campos permanecem bloqueados. A categorização `Estágio` em Urgência é o **nome literal de um cluster de origem**, não autorização para contabilizar estágio curricular.

Cada grupo preserva código, nome, contagem e query determinística por `origin_system` e `cluster_code` para materializar os IDs de tópico a partir do corpus governado. A origem tem 885 tópicos de Enfermagem do Trabalho **sem links de átomos textuais na tabela de candidatos recuperada**; não inferir evidência clínica.

**Próxima operação:** construir a matriz `CareerPath → SourceTopic → EvidenceAtom → CompetencyCandidate`, testar os direitos e evitar confundir conteúdo editorial de tópico com habilitação profissional. A fase PP04 ainda requer decisões institucionais. Centro Cirúrgico/CME permanecem `HOLD_SOURCE` até localizar suas ementas oficiais.

## QA
`node cko/canonical-content/2026-11-14/career-path/validate-ue-oh.mjs`, integrado ao workflow de candidato no PR #66.
