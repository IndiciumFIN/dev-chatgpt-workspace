# Diagnóstico de reutilização editorial — 2026-10-26

**Natureza:** levantamento de leitura e proposta de reconciliação. **Não é contrato novo, FIND aprovado, Work Order admitida, evidência clínica, autorização de publicação ou fonte de verdade.**

**Escopo autorizado:** `IndiciumFIN/dev-chatgpt-workspace`, branch `work/editorial-canonical-learning-20261026`, baseline `main@6c62bb61791631681979b229ccfbb05f7f5ac411`. **Sem alteração na main, Supabase ou publicação.**

## 1. Correção de abordagem

O proprietário esclareceu que já foi produzida a família de **guias completos e páginas canônicas**, com **capa fotográfica, metadados, “Sobre esta publicação”, sumário, conteúdo progressivo, referências e contracapa**. O trabalho correto é **localizar, reconciliar e reutilizar o existente** — nunca recriar um padrão paralelo ou substituir as capas sem necessidade.

**Evidências de artefatos anteriores consultados na Biblioteca do usuário (não incorporados ao presente repositório como fonte de código):**

| Artefato da Biblioteca | Características efetivamente vistas | Limitação |
|---|---|---|
| `fugulin-guia-completo.pdf` (2026-10-03) | 7 páginas; capa fotográfica, introdução, sumário; 9 e 12 áreas tratadas separadamente; referência e contexto normativo | Exemplar editorial, não homologação clínica; mídia original e licença não verificadas nesta branch |
| `insulina-guia-completo.pdf` (2026-10-03) | 7 páginas; capa fotográfica, sumário, do conceito ao conteúdo avançado | Não autoriza dose ou conduta; validação e direitos ainda requerem comprovação |
| `gotejamento-guia-completo.pdf` (2026-10-03) | 8 páginas; capa fotográfica, sequência do básico às verificações avançadas | Exige cruzamento com prescrição, regras e fontes |
| `README(8).md` (2026-10-03; universo Dimensionamento v0.2.0) | Descreve `Canonical Content Page Pattern` e `Canonical PDF Publication Pattern`, afirmando herança de master de Insulina/Fugulin | Instrução de proveniência externa; reconciliar versão e autoridade com contratos presentes |
| `APGAR_GUIDE.pdf` (2026-09-06) | Piloto técnico integrado, tabela de critérios e rastreabilidade, publicação bloqueada | **Não** foi comprovado que seja o mesmo guia editorial com capa mencionado pelo proprietário. Localizar o exemplar correto. |

A referência editorial pré-existente contém, para páginas HTML, breadcrumb, hero, utilitybar, actionbar, conteúdo por seções/cards, sidebar/TOC, sharebar, referências, CTA, relacionados, metadados e acessibilidade. Para PDF, capa full-bleed, logo, “Sobre”, sumário, miolo, referências, contracapa e QR. O novo trabalho **não cria** componentes nem templates concorrentes.

## 2. Contratos já existentes no repositório

- `contracts/cko-editorial/README.md`: pacote CKO Editorial v0.2.0, com master → claim/evidence → recursos → projeção → template/renderer; 8 perfis de artigo/caso/flashcard/quiz/infográfico/guia de bolso/PDF/slides.
- `contracts/cko-editorial/schemas/projection_request.schema.json` e `block_instance.schema.json`.
- `contracts/cko-editorial/policy/editorial_projection.rego`: por padrão bloqueia publicação sem evidências, direitos, acessibilidade, fidelidade e inexistência de HOLD.
- `contracts/cko-schemas/source.schema.json`, `canonical_object.schema.json`, `claim.schema.json`, `authority_binding.schema.json`, `audit_evidence.schema.json`, `learning_resource.schema.json`, `publication.schema.json`.
- `agents/normativos-licenciados.md`: não inventar enums/IDs/níveis; separar fonte, material inspecionado, direitos e o que a evidência realmente demonstra.
- `AGENTS.project.md`: código de autoridade limitado ao backup público; DB e integração remota desligados. **A consulta ao banco nesta análise é externa/read-only, não muda essa política.**

**Conciliação pendente:** versão/autoridade do padrão de guia completo existente na Biblioteca em relação ao `cko-editorial` já presente no repositório. Esta conciliação pode gerar FIND, não segundo template.

## 3. Inventário read-only: Supabase Calculadoras-Smart

Consultas executadas em 2026-10-26 ao projeto `pgsybzggewhinaniybiy`, sem mutação.

| Fonte | Observado |
|---|---|
| `calculadoras_de_enfermagem.theme_inventory` | 15 temas e 547.908 **átomos declarados no inventário**, não prova de 547.908 linhas de conteúdo materializadas no banco |
| `calculadoras_de_enfermagem.source_lineage` | 61 vínculos; **0** com `verified=true` |
| `calculadoras_de_enfermagem.document_atomization` | 17 documentos registrados; **0** com `publication_allowed=true`; em amostra, `LOCAL_ARTIFACT_NOT_DURABLE` |
| `cko_master.entities` | 1.164 entidades, das quais 77 `CLINICAL_TOOL`, várias `CONTROLLED_CANDIDATE`; `source_of_truth=false` nos exemplos analisados |
| `cko_evidence.claims` | 41 registros — existência não prova apoio suficiente por ferramenta |
| `calculadoras_de_enfermagem.clinical_score_crosswalk` | 6 relações, **0** equivalências completas e **0** homologações comprovadas |
| `ce_curiosidades_v1.pages` | 87 páginas com estados `NEEDS_REVIEW` / `BLOCKED_SOURCE`; não publicar por mera existência |
| `xlf_publication` / `xlf_learning` | São namespaces de outro produto, não reaproveitar como se fossem conteúdo CE |

**15 temas declarados:** cid10, dispositivos, epidemiologico, ferimentos, icd11, medicamentos, medlineplus, mesh, nutricao, protocolos_enfermagem, sepse, sinais_vitais, suprimentos, vacinal_brasil, vacinas.

**Atenção:** a atomização dos pacotes exportados não significa que seu conteúdo literal esteja consultável na tabela `document_atomization`, que na inspeção se comporta como manifesto/resumo de processamento. Primeiro localizar artefatos duráveis com hash verificável e direito de uso. Relação temática não equivale à vinculação com determinada ferramenta.

## 4. Ferramentas-piloto existentes: confronto entre universo editorial e master

| Ferramenta | Canonical ID encontrado | Estado do dossiê no banco | Próxima checagem |
|---|---|---|---|
| Fugulin | `cko:tool:clinical:fugulin@1` | `publication_state=HOLD`; direitos não resolvidos | Confrontar guia editorial anterior, versões de 9 e 12 áreas, claims, fontes, direitos e master |
| Insulina | `cko:tool:clinical:insulina@1` | `HOLD`; direitos não resolvidos | Separar educação, cálculos, segurança e regras terapêuticas restritas |
| Gotejamento | `cko:tool:clinical:gotejamento@1` | `HOLD`; direitos não resolvidos | Conferir fórmula, unidades, equipo, prevenção de erro e conteúdo avançado |
| Apgar | `cko:tool:clinical:apgar@1` | `HOLD`; revisão/direitos pendentes | Localizar guia editorial com capa exato; diferenciar do piloto técnico `APGAR_GUIDE.pdf`; verificar timing e critérios |
| Dimensionamento | `cko:tool:clinical:dimensionamento@1` | `HOLD`; direitos não resolvidos | Localizar pacote baseado em master Insulina/Fugulin e checar atualização normativa |

Nenhum registro acima autoriza promoção ou publicação clínica. Os IDs são **referências já existentes**, não criados por esta análise.

## 5. Pipeline de reaproveitamento — sem contrato paralelo

1. **Inventariar artefatos existentes** da família editorial (HTML/Markdown/PDF/JSON, capa/contracapa, asset IDs, hash e versões) e fonte exata no Drive/Biblioteca/Git, sem copiar tudo indiscriminadamente.
2. **Conciliar identidade** com `cko_master.entities`, `cko_closure.tool_dossiers`, relações e aliases, preservando versões diferentes de um mesmo instrumento.
3. **Encontrar átomos efetivos**: registrar localização durável, hash, emissor, versão, página/trecho, situação dos direitos e possibilidade de acesso pelo conteúdo. Documento-manifesto sem bytes não é conteúdo recuperado.
4. **Associar claims e regras** a fontes verificadas, sem criar inferências por nome/tema; gerar lacunas formalizáveis em FIND. Direitos restritos bloqueiam apenas operações dependentes.
5. **Comparar cobertura** por ferramenta, capítulo, público e profundidade do básico ao avançado. Distinguir EXISTENTE / LACUNA / CONFLITO / PRECISA REVISÃO em relatório descritivo; **não** introduzir esses rótulos como enums de banco.
6. **Projeção via perfil editorial existente** (web, PDF, flashcard, quiz, caso, infográfico) e tokens oficiais homologados; preservar conteúdo sem duplicar claims.
7. **Validar** com JSON Schema, vínculo source→claim→objeto→bloco, testes clínicos existentes, direitos, acessibilidade, fidelidade e revisão humana antes de liberar.
8. **PMO**: manter esta frente em diagnóstico na branch. Não alterar `registers/pmo/queue.v1.json` nem introduzir fonte concorrente; futura entrada passa pelo processo de WO/FIND/Kernel.

## 6. Pendências objetivas identificadas

- Localizar o **guia editorial completo de Apgar com capa** referido pelo proprietário; o PDF técnico localizado não cumpre essa identidade.
- Recuperar o acervo original dos guias completos e verificar versões/hashes, em especial os pacotes HTML/MD/PDF/JSON de Fugulin e Dimensionamento.
- Apurar se os 547.908 átomos declarados têm armazenamento recuperável (e se a licença permite reaproveitamento), evitando assumir que tudo está materializado.
- Validar lineage: 61 registros `verified=false`; 17 documentos sem publicação permitida; seis relações de pontuação sem equivalência completa.
- Resolver o crosswalk entre os guias anteriores e os contratos `cko-editorial` existentes, preservando o DS homologado.
- Nenhuma mutação ao banco ou produção até autorização e caminho governado.

**Limite da presente entrega:** diagnóstico de inventário e recuperação dos modelos, não uma auditoria clínica integral nem integração automática de dados. Status de execução do pipeline: **NOT_RUN**.
