# CKO-POL-UT-001 — Política Universal de Ferramentas e Aplicação de Camadas

**Versão 1.1.0 · 22/08/2026 · Produto público: Calculadoras de Enfermagem · Namespace: CKO**

> Extraído do `.docx` fornecido pelo dono. A **emenda v1.2.0** vive em
> `docs/CKO-POL-UT-001-EMENDA-v1.2.0.md` e altera §5, §10, §11 e o UTC-016.

---

CKO-POL-UT-001
Política Universal de Ferramentas
Governança, reutilização, inteligência, referências, privacidade e aplicação sequencial por camadas
Produto público
Calculadoras de Enfermagem
Namespace interno
CKO
Versão
1.1.0
Data
22/08/2026
Status
POLÍTICA CONTROLADA — REVISÃO PRIVACIDADE, REFERÊNCIAS, PI E ARREDONDAMENTO
Escopo
44 camadas sequenciais + controles transversais multiagente
Nota de controle
Este documento define a política e o mapeamento arquitetural. Não constitui evidência de implementação completa, conformidade externa ou release. O CKO-MD permanece sujeito à remediação do gate de autoridade normativa em nível de família/campo; qualquer camada a jusante herda esse bloqueio até reperformance e promoção formal.
## 1. Objetivo e princípio nuclear

A política transforma cada ferramenta em um objeto governado, reutilizável e auditável, e não em uma página isolada. O fluxo obrigatório é: Fonte/Norma → Requisito → CKO-REG → CKO-MD/Reference Data → Tool Contract → Engines/Rules → Safety/Inference/SAE → Renderer/Runtime → Assurance → Release.
Nenhuma ferramenta define primeiro uma regra clínica para depois procurar uma referência. A fonte autoritativa e o requisito precedem a implementação.
## 2. Reutilização total e proibição de inline

Toda capacidade reutilizável deve existir como objeto, profile, contract, rule, message key ou componente governado. HTML, template, renderer e JavaScript não são fontes de verdade clínica.
Não podem ser hardcoded por ferramenta: unidades, conversões, ranges, thresholds, fórmulas, textos clínicos, populações, sinais vitais, mensagens clínicas, interpretações, relações, SEO/canonical, OG, bibliografia, badges de mudança normativa, regras de persistência, estados de processamento ou fluxos entre ferramentas.
## 3. Binding em nível de campo

Todo campo aplicável recebe um vínculo governado. A autoridade pode ser legal/regulatória, norma técnica formal, sistema terminológico/código autoritativo ou configuração interna governada quando o campo não for clínico/normativo.
O usuário normalmente não visualiza IDs de requisitos, dispositivos, validators, evidence bundles ou hashes. A bibliografia e as informações editoriais pertinentes permanecem visíveis.
## 4. Segregação multiagente

Maker ≠ Checker ≠ Auditor. Source, Regulatory, MD, Field Binding, Library, Terminology, Formula, Rule, Safety, Inference, SAE, i18n, Accessibility, Metadata, Advertising, Analytics, Privacy, Security, CAAT, IPE e Audit operam como funções segregadas, preservando provenance e evidence trail.
Agentes não votam verdade clínica. Gates objetivos, fontes e validators prevalecem sobre consenso de modelos.
## 5. Dados, contexto do paciente e interoperabilidade

Master/Reference Data: Define conceitos canônicos: quantities, dimensions, units, conversions, date/time, locale, populations, terminologies, medications, solutions, devices, vital-sign definitions e demais objetos reutilizáveis.
Patient Context: quando aplicável, a ferramenta usa somente contexto clínico mínimo e não identificável. Não solicita nome, CPF, prontuário, e-mail, telefone, endereço, geolocalização, identificador de dispositivo ou texto livre de paciente. Valores clínicos necessários ao cálculo são Observations efêmeras de runtime, sem vínculo de identidade, sem persistência, sem analytics e sem publicidade.
Sinais vitais: Conceito, unidade, método, body site, qualidade e regras vêm de MD/REG. Valores observados incluem timestamp e contexto.
Parsing e medidas: parser numérico locale-aware aceita ponto (.) e vírgula (,) como separadores decimais quando a leitura for inequívoca; ponto e vírgula (;) só pode ser separador em campos explicitamente multi-value. Conversão de unidades é reutilizável, dimensionalmente segura, leva o engine à unidade canônica e opera em fail-closed.
Interoperabilidade: Mappings semânticos e Tool Handoff usam conceitos, code systems e unidades, nunca similaridade de label. Relações são exact/equivalent/narrower/broader/related/no-match conforme contrato.
## 6. Engine, segurança e inteligência clínica

Formula Engine: Determinístico, declarativo, versionado, com test vectors, precision, rounding, conversion e replay.
Rule/Safety Engine: Regras, bloqueios de anomalia, valores negativos impossíveis, zero indevido, incompatibilidades, populações não suportadas e estados fail-closed.
Inference/AI: Inferência tem classe e allowed_use; LLM pode explicar/recuperar/contextualizar, mas não altera fórmula, threshold, dose, classificação ou norma canônica.
Resultado e interpretação: Resultado bruto e interpretação são objetos separados. Interpretação só existe com regra/evidência aplicável.
Memória de cálculo: Registra entradas, normalização, fórmula, substituição, passos, rounding, resultado e versões de Tool/Formula/MD/REG para reperformance.
SAE: Orquestra avaliação, achados, resultado e conhecimento; NANDA-I/NIC/NOC somente quando homologados/licenciados e com relação governada. Caso contrário HOLD ou NOT_APPLICABLE_JUSTIFIED.
Segurança do paciente: Certos de medicamentos e metas de segurança são conjuntos versionados/jurisdicionais, mapeados por pertinência à ferramenta, nunca arrays inline.
## 7. Experiência, Design System e templates

Anatomia: Sobre a ferramenta, calculadora, resultado, memória, interpretação, SAE, segurança, dicas/erros, conhecimento relacionado, ferramentas relacionadas, FAQ, referências e evidência são slots governados.
Design System: Ferramentas referenciam o DS oficial e componentes governados; sem recriar CSS, tokens ou componentes por página.
Disclosure: Conteúdo pesado/avançado é progressivo. Resultado, memória, SAE e gráficos aparecem somente no estado apropriado.
Feedback: Inline + toaster visual + som opcional + aria-live. Som nunca é o único canal. Tooltip não contém sozinho informação crítica.
Processamento: Estados reutilizáveis VALIDATING/NORMALIZING/CALCULATING/GENERATING/GENERATING_PDF etc. “Calculando…” ou “Gerando…” aparece apenas quando o processamento for perceptível; nunca usar percentual fictício.
Mobile-first: Breakpoints/modelos 360/768/1024/1440, reflow, zoom, touch, keyboard, orientation e virtual keyboard com paridade de verdade clínica.
## 8. Conteúdo relacionado, estado do usuário e fluxo entre ferramentas

Dicas e erros comuns: Objetos contextuais, disparados por campo/estado/condição; conteúdo clínico mantém source binding.
Ferramentas relacionadas: Relações tipadas e explicadas; “Você pode ter interesse em...” é projeção do grafo, não lista aleatória.
Bibliotecas relacionadas: Objetos de medicamentos, seringas, agulhas, cateteres, curativos, protocolos, exames etc. são resolvidos pelo grafo e APIs/fontes qualificadas.
Tool Handoff: Resultado de uma ferramenta pode alimentar outra somente com semantic match, unit mapping, population/jurisdiction compatibility, privacy gate e confirmação do usuário.
User State: Favoritos, histórico, recentes, coleções, progresso e resultados salvos vivem fora da verdade clínica canônica e referenciam canonical IDs.
## 9. Distribuição, exportação, publicidade e analytics

Bibliografia: Referências bibliográficas são visíveis. Bindings de auditoria e requisitos permanecem internos.
SEO/Canonical/OG: Canonical deriva de Route Registry; SEO, hreflang, structured data e OG derivam de objetos, relações, locale e media governada.
PDF/Print: campos possuem print/share/export policy. PDF não imprime o DOM inteiro. Nenhum dado pessoal ou dado sensível de paciente é capturado pelo produto; logo, nenhuma identidade de paciente pode ser exportada. Entradas clínicas efêmeras só entram em memória/PDF quando estritamente necessárias à reperformance e sem identidade.
Publicidade: Advertising Intelligence usa eligibility/placement/context/consent/brand safety. É vedado usar valores clínicos, contexto de paciente, condição inferida ou qualquer dado sensível para targeting, perfilamento, seleção de anúncio ou mensuração individual. Publicidade não entra na zona de decisão clínica.
Analytics: taxonomia governada mede jornada, erros, SAE, related tools, handoffs, i18n, performance e monetização. Valores clínicos, sinais vitais, medicamentos informados, resultados, contexto de paciente e quaisquer dados sensíveis não são capturados em analytics, logs de produto ou publicidade.
Observability: Trace técnico de engine/model/tool versions, latency, errors e validators separado de product analytics.
## 10. Política de não captura de dados sensíveis

A plataforma pública opera com princípio NO_SENSITIVE_CAPTURE. Não são solicitados, coletados, persistidos, transmitidos ou registrados dados pessoais sensíveis de pacientes. Ferramentas não solicitam identificadores diretos ou indiretos e não possuem campos de texto livre clínico capazes de reidentificação.
Entradas clínicas necessárias ao cálculo são processadas de forma efêmera, em memória de runtime, sem associação a identidade, sem persistência por padrão e sem envio para analytics, publicidade ou logs de produto. User State persistente limita-se a preferências e estados não sensíveis, como favoritos e configurações de interface.
A SAE, o Tool Handoff, gráficos, PDF/print e memória de cálculo recebem apenas o mínimo necessário e respeitam a mesma política. Qualquer mudança futura que pretenda tratar dado pessoal ou sensível exige novo escopo, base legal, Privacy Impact Gate e revisão formal desta política antes da implementação.
## 11. Política de referências bibliográficas e citações

Toda referência bibliográfica visível deve apontar diretamente para a fonte consultada sempre que tecnicamente possível. O registro canônico inclui autor ou instituição, título, edição/versão, ano/data, identificador persistente (DOI/PMID/ISBN/identificador normativo quando houver), URL direta, data de acesso, idioma, jurisdição, direitos/licença e provenance.
A apresentação de referências adota ABNT NBR 6023:2018 como baseline documental; as citações no corpo do conteúdo adotam ABNT NBR 10520:2023. Se houver edição superveniente aplicável, o CKO-REG deve detectar a mudança e revalidar o profile antes de promoção.
Tipos suportados: citação direta curta; citação direta longa; citação indireta/paráfrase; citação de citação (apud, somente quando a fonte original não estiver acessível); citação traduzida com indicação de tradução própria; citação legal/normativa com apontamento de artigo/inciso/item; citação de norma técnica com cláusula/seção; artigo científico/DOI; livro/capítulo; guideline/manual institucional; página oficial; dataset/API com versão/endpoint/data de acesso; software/repositório com versão/commit; imagem/figura com autoria/licença; e disclosure de conteúdo auxiliado por IA sem substituir a fonte primária.
Regra de fonte primária: sempre que houver autoridade oficial, DOI, publicação original, legislação consolidada, catálogo oficial ou documentação primária, a referência deve apontar para esse destino, não para agregadores, cópias ou resumos. URLs quebradas, redirecionamentos suspeitos ou fontes secundárias acionam source review.
## 12. Política antiplágio, direitos autorais e propriedade intelectual

Não existe uma lei federal brasileira denominada “Lei do Plágio”. O controle jurídico do CKO é fundamentado principalmente na Lei nº 9.610/1998 (Direitos Autorais), no art. 184 do Código Penal para violação de direito autoral e, para software, na Lei nº 9.609/1998.
A Lei nº 9.610/1998 protege a forma de expressão de obras intelectuais e estabelece limites. O art. 8º exclui da proteção autoral, como tais, ideias, procedimentos normativos, sistemas, métodos, projetos e conceitos matemáticos; o art. 7º, §3º, esclarece que, em ciências, a proteção recai sobre a forma literária ou artística e não sobre o conteúdo científico ou técnico. Isso significa que fórmulas, métodos e conceitos matemáticos não são apropriados como “texto autoral exclusivo”; entretanto, a redação explicativa, figuras, tabelas, seleção/organização original, software e outros elementos expressivos podem ser protegidos.
Mesmo quando fórmula, método, dado ou ato oficial não é protegido como obra autoral, a provenance científica/técnica continua obrigatória: origem, versão, autoridade, publicação, localizador e transformação devem permanecer rastreáveis. Ausência de direito autoral não elimina dever de atribuição, integridade científica, validação clínica ou direitos/licenças de bases e terminologias.
Citações de trechos protegidos devem permanecer na extensão necessária, com autor e origem identificados, observando a legislação aplicável e o padrão ABNT. É proibida reprodução substancial ou transformação que masque cópia. O Checker deve avaliar similaridade textual, atribuição, licença e provenance antes de publicação.
Programas de computador possuem regime próprio de proteção pela Lei nº 9.609/1998. Código-fonte, bibliotecas, assets e dependências externas devem manter licença, versão e origem; uma fórmula matemática não protegida não autoriza copiar implementação de software de terceiros.
## 13. Política de arredondamento, precisão e casas decimais

A ABNT NBR 5891:2014 é o baseline do CKO para arredondamento decimal quando a fonte clínica, regulatória, científica ou técnica da ferramenta não prescrever regra específica. O engine mantém precisão interna superior à apresentação e evita arredondamentos intermediários desnecessários.
Regra baseline: se o primeiro algarismo descartado for menor que 5, mantém-se o algarismo conservado; se for maior que 5, ou igual a 5 seguido de algum algarismo não zero, incrementa-se o algarismo conservado; quando o descarte é exatamente 5 seguido apenas de zeros, aplica-se arredondamento para par: algarismo conservado ímpar é incrementado e algarismo conservado par permanece.
Cada Formula/Tool declara rounding_mode, rounding_stage, decimal_places ou significant_digits, display_precision, calculation_precision e source_ref. A regra explícita da fonte específica da fórmula tem precedência sobre o baseline geral; qualquer override deve ser versionado, testado e auditável.
Valor calculado, valor exibido e valor exportado devem ser distinguíveis. Memória de cálculo registra os valores de alta precisão necessários à reperformance e também a transformação de arredondamento aplicada ao resultado apresentado.
Matriz de tipos de citação/fonte
Legal/normativa: art./§/inc./item; URL da fonte oficial/consolidada. Pinpoint obrigatório; vigência/provenance; preferir fonte oficial.
Norma técnica: número/edição/cláusula; catálogo/landing oficial ou acesso licenciado. Não reproduzir conteúdo licenciado integralmente; guardar requirement + locator.
Artigo científico: DOI/PMID + página/seção quando aplicável; DOI/publisher/repositório primário. Preferir publicação original; fonte secundária não substitui a primária.
Direta curta/longa: página/seção/localização; URL/DOI da obra. Conforme ABNT NBR 10520; extensão apenas necessária.
Indireta/paráfrase: fonte/ano; página opcional quando cabível; URL/DOI. Síntese fiel; não disfarçar cópia textual.
Apud: fonte original + fonte consultada; link da fonte consultada. Uso excepcional quando original inacessível.
Dataset/API: dataset/endpoint, versão, snapshot/hash, acesso; docs/endpoint oficial. Payload passa por Source → REG/MD antes de uso canônico.
Software/repositório: versão/tag/commit + licença; repositório/página oficial. Lei 9.609/1998 e licença; fórmula não autoriza copiar implementação.
Imagem/figura: autor/origem/licença/versão; fonte/licença original. Rights + provenance + alt + variant policy.
IA assistida: execução/modelo quando exigido; sempre acompanhada da fonte primária. IA não é authority clínica nem substitui referência primária.
Fontes normativas e documentais desta revisão
BRASIL. Lei nº 9.610, de 19 de fevereiro de 1998. Direitos Autorais. Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9610.htm
BRASIL. Decreto-Lei nº 2.848, de 7 de dezembro de 1940. Código Penal, art. 184. Fonte oficial: https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm
BRASIL. Lei nº 9.609, de 19 de fevereiro de 1998. Lei de Software. Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9609.htm
ABNT. ABNT NBR 6023:2018. Informação e documentação — Referências — Elaboração. Guia institucional de apoio consultado: https://posedu.ufop.br/nbr-60232018-informa%C3%A7%C3%A3o-e-documenta%C3%A7%C3%A3o-refer%C3%AAncias-elabora%C3%A7%C3%A3o
ABNT. ABNT NBR 10520:2023. Informação e documentação — Citações em documentos — Apresentação. Guia institucional de apoio consultado: https://sibi.ufj.edu.br/apresentacao-de-citacoes-em-documentos-abnt-nbr-105202023/
ABNT. ABNT NBR 5891:2014. Regras de arredondamento na numeração decimal. A implementação canônica deve manter source_ref para exemplar/licença oficial ou repositório institucional autorizado; a norma não deve ser reproduzida integralmente no produto.
## 14. Política de visibilidade

Classe
Exemplos
Política
Interno / oculto
requirement_id, provision_ref, validator_id, evidence bundle, hashes, authority bindings
Disponível a governança, auditoria, explicabilidade e SAE interna; não polui a experiência padrão.
Usuário / sempre que aplicável
Sobre a ferramenta, população, público-alvo, limitações, labels, unidades, resultado, interpretação
Apresentação clara, localizada e acessível.
Usuário / sob demanda
Fórmula detalhada, memória, fontes completas, gráficos, SAE, ferramentas/bibliotecas relacionadas
Progressive disclosure; estado e pertinência controlam renderização.
Usuário / regulatório
Referências bibliográficas, atualização/revisão normativa e badge de mudança
Mostrar em linguagem humana; sem expor IDs internos.
Nunca usar para targeting
Contexto do paciente, sinais vitais, medicamento/dose informados, resultado clínico
Bloqueado para publicidade e product analytics por padrão.
## 15. Aplicação sequencial às camadas

Os controles são atribuídos a uma camada primária, mas podem depender/herdar controles de outras camadas. Controles transversais (multiagente, field binding, CAAT/IPE/AUD-8L, interoperabilidade, publicidade) não criam automaticamente novas raízes arquiteturais; são profiles/controles que atravessam a espinha sequencial.
Bloco
Camadas
Responsabilidade
Fundação
CKO-MD; CKO-REG
Identidade, autoridade, field binding, units, populations, sources, provenance, versions, sequential gates.
Conhecimento clínico
Clinical Calculators; Scales & Scores; Clinical Rules; Library Objects; Medications & Solutions; Laboratory Exams; Anatomy; Diseases/Conditions; Procedures/Protocols; Terminologies
Ferramentas, regras, interpretações, SAE, bibliotecas, paciente/contexto, termos e relações.
Conteúdo e projeções
Educational/Contest; References/Bibliography/Glossary; Articles/Guides/Summaries; Flashcards/Questions/Quizzes
Bibliografia, evidência, learning objects, conteúdo relacionado.
Experiência
Page Templates; Document Templates; Images/Media/Icons; Asset Derivation; HCD/Usability; Accessibility; Design System; UI Components & Interaction
Anatomia, DS, UI, responsive, feedback, tour, progress, assets.
Governança de dados digitais
Privacy/LGPD; Security/Cybersecurity; Routes/URLs; SEO; Open Graph/Social; Structured Data; i18n/l10n
Privacidade, segurança, rotas, metadata, social, machine metadata e localização.
Descoberta e jornada
Internal Search; Recommendations; User State/Favorites/Collections; Analytics/Telemetry
Relacionamentos, handoff, estado do usuário, funis e monetização contextual.
Operação
Performance; Reliability/Resilience; Observability; Sustainability; Renderer; Runtime/E2E; PDF/Export Profiles; Publication/Release; Monitoring
Runtime, exportação, release, monitoramento, mudança normativa e regressão.
Privacidade absoluta
Privacy/LGPD; Security/Cybersecurity; Analytics/Telemetry; User State/Favorites/Collections; Runtime/E2E
NO_SENSITIVE_CAPTURE, processamento efêmero, exclusão de analytics/ads/logs e persistência apenas de estado não sensível.
Referências/PI
CKO-REG; References/Bibliography/Glossary; Articles/Guides/Summaries; i18n/l10n
ABNT 6023/10520, links diretos, anti-plágio, licenças, citação e translation provenance.
Precisão e arredondamento
CKO-MD; Clinical Calculators; Scales & Scores; Clinical Rules; PDF/Export Profiles
NBR 5891 baseline, precision/rounding declarados, source-specific override, memória e export coerentes.
## 16. Regra de implementação e gate atual

Recuperar/inventariar candidatos de CALENF/NKD e módulos históricos somente como fonte de requisitos e objetos candidatos.
Qualificar autoridades e fontes no CKO-REG; criar Authority → Data Family → Field blocker matrix.
Criar Reference/Master Data reutilizável e promover apenas candidatos cujo blocker esteja satisfeito.
Reperformar validators, CAAT, IPE e as oito lentes do CKO-MD.
Somente após o gate de MD reabrir Clinical Calculators/Scales, aplicando o Universal Tool Contract e Tool Handoff.
Progredir pela sequência de camadas sem declarar 100% antes de evidence bundles, runtime/E2E e release gate.
## 17. Materiais recuperados que fundamentam requisitos de arquitetura

CKO Brand & Experience System v3.0 — componentes, mobile-first, toolShell/result, tooltip, toast, favorite, sharebar e feedback.
runtime-core-v6_4_0.json — about tool, population, target audience, limitations, tips/errors, evidence, patient safety, privacy, i18n e estados.
calculator-canonical-v1 / templates históricos — ordem obrigatória de seções, visibility, converter, SAE e patient safety.
CKO Biblioteca Hub / Vanilla e site graph — Library Objects, relações, APIs regulatórias, medications/devices e graph-based recommendations.
Análises CKO v1.0-v1.4 — não adotar CSS/schemas históricos como fonte de verdade; reaproveitar requisitos, objetos e checks; SEO/OG derivados de canonical objects; PDF/export como profiles; LGPD by design.
Arquivos históricos de cálculo de medicamentos — memória de cálculo, validações e exportação como casos de teste, nunca como baseline canônico.
Apêndice A — Matriz de controles e camada primária
A planilha complementar contém também camadas secundárias, classe de autoridade, visibilidade, agentes, validators/assurance e gate.
ID
Domínio
Camada primária
Requisito
### UTC-001

Governance
CKO-REG
Norma/fonte autoritativa precede requisito, MD/Reference Data e ferramenta; nenhuma regra clínica nasce na UI.
### UTC-002

Governance
CKO-MD
Todos os campos aplicáveis possuem binding governado em nível de campo. O binding pode ser clínico/regulatório, técnico ou configuração interna governada conforme natureza do campo.
### UTC-003

Governance
CKO-MD
Nenhum dado clínico, limite, unidade, fórmula, interpretação, texto clínico, população ou regra pode ser fonte de verdade inline em HTML/JS/template.
### UTC-004

Identity
CKO-MD
canonical_id estável, UUIDv7, business key, version_ref, hash/provenance quando aplicável.
### UTC-005

Versioning
CKO-REG
Version-on-change, sem overwrite silencioso; ferramenta, fórmula, regra, interpretação, metadata, DS/profile e evidência versionados.
### UTC-006

Agents
CKO-REG
Maker ≠ Checker ≠ Auditor em todas as camadas; múltiplos agentes especializados por função.
### UTC-007

Assurance
CKO-REG
CAAT, IPE e AUD-8L executados por camada antes do gate sequencial.
### UTC-008

Source acquisition
CKO-REG
Official/API-first: BR prioriza MS, ANVISA, COFEN/COREN e fontes governamentais; global OMS/WHO/ISO; US FDA/CDC/NIH/NLM/CMS/AHRQ conforme competência.
### UTC-009

Libraries
Library Objects
Medicamentos, seringas, agulhas, cateteres, curativos e demais bibliotecas são objetos canônicos abastecidos por APIs/fontes qualificadas; páginas são projeções.
### UTC-010

Medication master data
Medications & Solutions
Medicamento, princípio ativo, apresentação, concentração, via, fabricante, registro e status regulatório separados em objetos/relações com fonte competente.
### UTC-011

Device master data
Library Objects
Seringa, agulha, cateter, sonda, equipo e demais dispositivos usam classificação, medidas, material, esterilidade, uso, registro e relações governadas.
### UTC-012

Terminologies
Terminologies
UCUM, ICD/CID, LOINC/SNOMED quando aplicável/licenciado, NANDA/NIC/NOC e demais code systems possuem release, rights, jurisdiction e mappings explícitos.
### UTC-013

Tool anatomy
Clinical Calculators
Universal Tool Contract referencia anatomy, template, DS, responsive, result, feedback, print/PDF, metadata, OG, analytics and privacy profiles.
### UTC-014

About tool
Clinical Calculators
Sobre a ferramenta declara objetivo, escopo, população, público-alvo, contexto assistencial e limitações.
### UTC-015

Population
CKO-MD
Population/applicability é objeto/referência do MD; ferramentas declaram inclusão, exclusão e condições de uso.
### UTC-016

Patient context
Clinical Rules
Quando aplicável, Patient Context reutiliza conceitos do MD e só coleta o mínimo necessário; valores do paciente são runtime observations, não Master Data.
### UTC-017

Vital signs
CKO-MD
Sinais vitais são definições canônicas no MD; observações possuem valor, unidade, método, body site, timestamp e quality status.
### UTC-018

Inputs
Clinical Calculators
Input Contract define tipo, conceito, unidade, obrigatoriedade, condição, precisão, range, default permitido, help, tooltip e privacy/print/share policies.
### UTC-019

Required fields
Clinical Rules
Obrigatoriedade é declarativa e pode ser always/conditional; nunca apenas asterisco do front-end.
### UTC-020

Parsing
i18n/l10n
Parser numérico reutilizável, locale-aware, aceita ponto/vírgula quando inequívocos; ';' apenas em campos explicitamente multi-value/list.
### UTC-021

Measure conversion
CKO-MD
Conversão de medidas reutiliza Quantity/Dimension/Unit/Conversion do MD; engine recebe unidade canônica; fail-closed.
### UTC-022

Anomalies
Clinical Rules
Bloqueadores para negativos impossíveis, NaN, infinito, overflow, zeros indevidos, datas inválidas, ranges e combinações incompatíveis.
### UTC-023

State machine
Clinical Calculators
Estados NOT_EVALUATED/INCOMPLETE/READY/CALCULATING/CALCULATED/INVALID/BLOCKED/ERROR e stale-result protection.
### UTC-024

Formula engine
Clinical Calculators
Fórmula determinística declarativa, versionada, com constantes, ordem, conversões, precisão, rounding e test vectors.
### UTC-025

Rule engine
Clinical Rules
IF/THEN e demais regras são declarativas, versionadas, source-backed e separadas da fórmula.
### UTC-026

Inference
Clinical Rules
Inferência classificada como deterministic/rule-based/ontological/semantic/statistical/probabilistic/LLM-assisted/hybrid, com provenance e allowed_use.
### UTC-027

AI
Clinical Rules
IA generativa pode explicar, recuperar e contextualizar, mas não altera fórmula, threshold, dose, classificação ou norma canônica.
### UTC-028

Result
Clinical Calculators
Result Contract padroniza raw_value, normalized_value, unidade, rounding, status, trace, classification e actions.
### UTC-029

Interpretation
Clinical Rules
Interpretação é objeto separado do cálculo bruto, com thresholds, population, applicability, source/evidence e limitations.
### UTC-030

Calculation memory
Clinical Calculators
Memória de cálculo registra inputs, normalização, fórmula, substituição, passos, rounding, resultado, tool/formula/MD/REG versions e replay hash.
### UTC-031

SAE
Clinical Rules
SAE orquestra contexto, resultado, evidência e conhecimento; NANDA-I/NIC/NOC somente homologados/licenciados; caso contrário HOLD/N/A.
### UTC-032

Medication safety
Clinical Rules
Certos de medicamentos são conjuntos versionados, jurisdicionais e source-backed, não arrays hardcoded.
### UTC-033

Patient safety goals
Clinical Rules
Metas internacionais e requisitos brasileiros de segurança são objetos distintos, relacionados no grafo e renderizados apenas quando pertinentes.
### UTC-034

Tips
Clinical Rules
Dicas são objetos governados com type, trigger, field/tool state, source/evidence quando clínico e message_key.
### UTC-035

Common errors
Clinical Rules
Erros comuns possuem condition, reason, consequence, prevention, recovery e evidence quando aplicável.
### UTC-036

Related tools
Recommendations
Ferramentas relacionadas usam relações tipadas e explicadas; nunca lista aleatória/hardcoded.
### UTC-037

Related libraries
Recommendations
Bibliotecas e objetos específicos relacionados são resolvidos pelo grafo com applicability, condition, jurisdiction e evidence.
### UTC-038

Tool handoff
Recommendations
Saída de uma ferramenta pode preencher outra somente via ToolHandoffContract com semantic match, unit mapping, population/jurisdiction compatibility, privacy e user confirmation.
### UTC-039

Visibility
UI Components & Interaction
Progressive disclosure: resultado/memória/SAE/safety/gráficos only after relevant state; internal bindings hidden; bibliography visible.
### UTC-040

Feedback
UI Components & Interaction
FeedbackEvent reutilizável: inline, toaster visual, som opcional, aria-live, severity, dedupe, recovery and telemetry policy.
### UTC-041

Tooltips
UI Components & Interaction
Tooltips reutilizam glossary/terminology/message keys, suportam touch/keyboard; informação crítica não pode existir só no tooltip.
### UTC-042

Tour
UI Components & Interaction
Tour versionado, skippable, resumable, com targets semânticos, i18n e accessibility; broken target bloqueia release quando material.
### UTC-043

Progress
UI Components & Interaction
Progress real: determinate/indeterminate/stepped; 'Calculando...', 'Gerando...', 'Gerando PDF...' apenas quando processamento perceptível; sem percentuais fictícios.
### UTC-044

Responsive
Design System
Mobile-first, breakpoint models, reflow/zoom/orientation/virtual keyboard/touch; resultado e regra invariantes entre breakpoints.
### UTC-045

Design system
Design System
Ferramenta referencia DS oficial; sem recriar tokens/componentes/CSS por página; componentes precisam de estado, semântica, a11y e variantes autorizadas.
### UTC-046

Page template
Page Templates
Anatomia da página é declarativa e versionada; slots/sections/visibility referenciam objetos canônicos.
### UTC-047

Document/PDF template
Document Templates
Print/PDF usa export profile governado e seleciona campos por policy; não imprime DOM inteiro.
### UTC-048

Bibliography
References/Bibliography/Glossary
Referências bibliográficas são projeção visível; audit bindings internos permanecem ocultos.
### UTC-049

Evidence level
References/Bibliography/Glossary
Nível de evidência exige framework declarado, source type, certainty, applicability, assessed_by/date; sem badge A/B arbitrário.
### UTC-050

Regulatory change badge
Monitoring
Monitoramento normativo gera NO_IMPACT / REFERENCE_UPDATED / REVALIDATION_REQUIRED / MATERIAL_CHANGE_BLOCKED e badge humano correspondente.
### UTC-051

Routes
Routes/URLs
Rota/canonical vem do Route Registry; nenhum canonical hardcoded em página.
### UTC-052

SEO
SEO
title, description, robots, sitemap, breadcrumb, audience and indexability são derivados de objetos canônicos e locale.
### UTC-053

Open Graph
Open Graph/Social
OG/social metadata e assets derivam de canonical object + route + locale + governed media asset.
### UTC-054

Structured data
Structured Data
JSON-LD/schema mappings são derivados do tipo canônico e relations; tipos médicos precisam de revalidação por objeto.
### UTC-055

i18n
i18n/l10n
Códigos/IDs/fórmulas/unidades controladas invariáveis quando aplicável; labels, help, errors, tips, tours, metadata e explanations localizados com provenance/fallback.
### UTC-056

Media
Images/Media/Icons
Imagens, ícones, infográficos e OG assets possuem canonical asset ID, creator/provenance, rights, alt, variants, dimensions and hash.
### UTC-057

Charts
UI Components & Interaction
VisualizationContract define type, source data, units, thresholds, responsive/print variants, accessible summary and table fallback.
### UTC-058

Favorites
User State/Favorites/Collections
Favorite/history/recent/collections/progress são User State e referenciam canonical IDs; nunca alteram conhecimento canônico.
### UTC-059

Persistence
Privacy/LGPD
Persistência por campo: NEVER_PERSIST / SESSION_ONLY / LOCAL_NON_SENSITIVE / LOCAL_WITH_CONSENT / SERVER_WITH_LEGAL_BASIS / ANONYMIZED_TELEMETRY_ONLY.
### UTC-060

Clinical data privacy
Privacy/LGPD
Patient context/observations não vão para analytics/publicidade por padrão; identidade de paciente é proibida quando não necessária.
### UTC-061

Share
UI Components & Interaction
Sharebar distingue compartilhar ferramenta de compartilhar resultado; resultado obedece privacy/share policy e canonical URL.
### UTC-062

Security
Security/Cybersecurity
Input/output escaping, injection defenses, source trust, secrets, API boundaries and export safety; no clinical rule in insecure client-only path when authority requires stronger control.
### UTC-063

Advertising
Analytics/Telemetry
Advertising Intelligence é transversal governado: eligibility, placement, age/audience, locale, consent, sensitive context, conflict, frequency and brand safety.
### UTC-064

Advertising safety
Privacy/LGPD
Anúncios nunca usam valores/condições inferidas do paciente, nem entram em zona de decisão clínica; estados ADS_ALLOWED/CONTEXTUAL_ONLY/RESTRICTED/BLOCKED.
### UTC-065

Analytics
Analytics/Telemetry
Analytics Event Contract com allowlist; mede jornada, erros, handoffs, SAE, related resources, performance e monetização sem registrar valor clínico bruto por padrão.
### UTC-066

Funnels
Analytics/Telemetry
Funis: view→start→valid inputs→calc→result→interpretation→SAE→related tool→handoff; métricas de field error, tooltip, references, i18n and ads.
### UTC-067

Observability
Observability
Trace technical execution with engine/tool/model versions, latency, errors and validator outcomes, separated from product analytics.
### UTC-068

Performance
Performance
Heavy operations use appropriate loading/skeleton/progress; performance budgets apply to runtime, charts, AI, PDF and ad components.
### UTC-069

Reliability
Reliability/Resilience
Retries/cancel/idempotency/offline/error states governed; no double calculation or duplicate mutation.
### UTC-070

Sustainability
Sustainability
Reuse assets/components, optimize images/data/API calls and avoid duplicated logic or unnecessary processing.
### UTC-071

Renderer
Renderer
Renderer consumes canonical contracts/states only; no clinical formula/rule/threshold in renderer.
### UTC-072

Runtime
Runtime/E2E
Browser runtime validates all essential behaviors: keyboard/touch/mobile, state, error, related objects, handoff, i18n, privacy, print and network failures.
### UTC-073

PDF export
PDF/Export Profiles
PDF includes only permitted fields, result/memory/interpretation/alerts/references/version/canonical link as profile dictates; patient identity default excluded.
### UTC-074

Publication
Publication/Release
Release gate blocks missing source, field binding, formula validator, material a11y/security/privacy/rights issues or upstream HOLD.
### UTC-075

Monitoring
Monitoring
After release monitor normative change, drift, broken sources, API/source freshness, runtime regression, analytics anomalies and safety signals.
### UTC-076

Privacy
Privacy/LGPD
NO_SENSITIVE_CAPTURE: o produto público não solicita, coleta, persiste, transmite ou registra dados pessoais sensíveis de pacientes.
### UTC-077

Privacy
Privacy/LGPD
Contexto clínico necessário é não identificável, efêmero e sem campos de identidade ou texto livre; runtime não cria prontuário nem perfil de paciente.
### UTC-078

Analytics
Analytics/Telemetry
Valores clínicos, sinais vitais, medicamentos, resultados e contexto de paciente não entram em analytics, publicidade ou logs de produto.
### UTC-079

References
References/Bibliography/Glossary
Toda referência visível possui URL direta para a fonte primária consultada quando disponível, além de versão, identificador e data de acesso.
### UTC-080

References
References/Bibliography/Glossary
Referências seguem ABNT NBR 6023:2018 como baseline, sujeita a versionamento e change monitoring.
### UTC-081

Citations
References/Bibliography/Glossary
Citações seguem ABNT NBR 10520:2023 e suportam direta curta/longa, indireta, apud, tradução, legal/normativa, técnica, dataset/API, software, imagem e disclosure IA.
### UTC-082

Citations
CKO-REG
Citações legais/normativas e normas técnicas utilizam pinpoint locator (artigo/inciso/item/cláusula/seção) para rastreabilidade requirement-level.
### UTC-083

IP
CKO-REG
Política antiplágio considera Lei 9.610/1998, Código Penal art. 184 e, para software, Lei 9.609/1998; checker avalia atribuição, licença, similaridade e provenance.
### UTC-084

IP
Clinical Rules
Fórmulas, métodos e conceitos matemáticos como tais não são tratados como exclusividade autoral; provenance científica/técnica continua obrigatória.
### UTC-085

IP
CKO-REG
A expressão textual, figuras, tabelas, seleção/organização original e outros elementos protegidos não podem ser copiados sem base legal/licença; citação usa extensão necessária.
### UTC-086

Software IP
Security/Cybersecurity
Código, bibliotecas e dependências mantêm origem, versão e licença; fórmula não protegida não autoriza copiar implementação de software de terceiros.
### UTC-087

Official Sources
CKO-REG
Atos oficiais podem ser reproduzidos conforme regime legal aplicável, mas fonte oficial, vigência, snapshot/hash e provenance permanecem obrigatórios.
### UTC-088

Rounding
Clinical Rules
ABNT NBR 5891:2014 é baseline de arredondamento decimal quando a fonte específica não prescreve regra diversa.
### UTC-089

Rounding
Clinical Rules
Engine separa calculation_precision, display_precision e rounding_stage; evita arredondamento intermediário não exigido.
### UTC-090

Rounding
Clinical Rules
Regra explícita da fonte clínica/regulatória da fórmula prevalece sobre baseline geral e exige source_ref, versionamento e test vectors.
### UTC-091

i18n/Citation
i18n/l10n
Citação traduzida preserva fonte original, idioma, texto traduzido e disclosure de tradução própria; tradução não altera sentido normativo.
### UTC-092

AI/References
Articles/Guides/Summaries
Conteúdo auxiliado por IA deve ser divulgado conforme política editorial quando aplicável e nunca substitui referência primária ou authority clínica.
Apêndice B — Espinha sequencial de 44 camadas
Seq.
Camada
Princípio de herança
10
CKO-MD
ROOT executable layer
20
CKO-REG
inherits CKO-MD
30
Clinical Calculators
inherits CKO-MD + CKO-REG + preceding layer gates
40
Scales & Scores
inherits CKO-MD + CKO-REG + preceding layer gates
50
Clinical Rules
inherits CKO-MD + CKO-REG + preceding layer gates
60
Library Objects
inherits CKO-MD + CKO-REG + preceding layer gates
70
Medications & Solutions
inherits CKO-MD + CKO-REG + preceding layer gates
80
Laboratory Exams
inherits CKO-MD + CKO-REG + preceding layer gates
90
Anatomy
inherits CKO-MD + CKO-REG + preceding layer gates
100
Diseases/Conditions
inherits CKO-MD + CKO-REG + preceding layer gates
110
Procedures/Protocols
inherits CKO-MD + CKO-REG + preceding layer gates
120
Terminologies
inherits CKO-MD + CKO-REG + preceding layer gates
130
Educational/Contest
inherits CKO-MD + CKO-REG + preceding layer gates
140
References/Bibliography/Glossary
inherits CKO-MD + CKO-REG + preceding layer gates
150
Articles/Guides/Summaries
inherits CKO-MD + CKO-REG + preceding layer gates
160
Flashcards/Questions/Quizzes
inherits CKO-MD + CKO-REG + preceding layer gates
170
Page Templates
inherits CKO-MD + CKO-REG + preceding layer gates
180
Document Templates
inherits CKO-MD + CKO-REG + preceding layer gates
190
Images/Media/Icons
inherits CKO-MD + CKO-REG + preceding layer gates
200
Asset Derivation
inherits CKO-MD + CKO-REG + preceding layer gates
210
HCD/Usability
inherits CKO-MD + CKO-REG + preceding layer gates
220
Accessibility
inherits CKO-MD + CKO-REG + preceding layer gates
230
Design System
inherits CKO-MD + CKO-REG + preceding layer gates
240
UI Components & Interaction
inherits CKO-MD + CKO-REG + preceding layer gates
250
Privacy/LGPD
inherits CKO-MD + CKO-REG + preceding layer gates
260
Security/Cybersecurity
inherits CKO-MD + CKO-REG + preceding layer gates
270
Routes/URLs
inherits CKO-MD + CKO-REG + preceding layer gates
280
SEO
inherits CKO-MD + CKO-REG + preceding layer gates
290
Open Graph/Social
inherits CKO-MD + CKO-REG + preceding layer gates
300
Structured Data
inherits CKO-MD + CKO-REG + preceding layer gates
310
i18n/l10n
inherits CKO-MD + CKO-REG + preceding layer gates
320
Internal Search
inherits CKO-MD + CKO-REG + preceding layer gates
330
Recommendations
inherits CKO-MD + CKO-REG + preceding layer gates
340
User State/Favorites/Collections
inherits CKO-MD + CKO-REG + preceding layer gates
350
Analytics/Telemetry
inherits CKO-MD + CKO-REG + preceding layer gates
360
Performance
inherits CKO-MD + CKO-REG + preceding layer gates
370
Reliability/Resilience
inherits CKO-MD + CKO-REG + preceding layer gates
380
Observability
inherits CKO-MD + CKO-REG + preceding layer gates
390
Sustainability
inherits CKO-MD + CKO-REG + preceding layer gates
400
Renderer
inherits CKO-MD + CKO-REG + preceding layer gates
410
Runtime/E2E
inherits CKO-MD + CKO-REG + preceding layer gates
420
PDF/Export Profiles
inherits CKO-MD + CKO-REG + preceding layer gates
430
Publication/Release
inherits CKO-MD + CKO-REG + preceding layer gates
440
Monitoring
inherits CKO-MD + CKO-REG + preceding layer gates
Apêndice C — Declaração de fechamento documental
DOCUMENTADO ≠ IMPLANTADO ≠ ASSURED. Esta revisão também estabelece NO_SENSITIVE_CAPTURE, padrão bibliográfico com link direto à fonte, política antiplágio/propriedade intelectual e regra de arredondamento/precisão. O fechamento operacional continua condicionado à materialização dos contracts/profiles, field-level normative binding, validators, CAAT/IPE, AUD-8L, runtime/E2E e release gate.
