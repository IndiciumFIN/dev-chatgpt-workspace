# Matriz de autoridade e aplicabilidade — Apgar e Fugulin (piloto)
**Data:** 2026-10-26  
**Natureza:** evidência bibliográfica pública e análise de aplicabilidade para reconciliação; **não** homologação ou permissão de reprodução integral.  
**Escrita no Supabase:** não realizada. **Publicação clínica:** HOLD.

| Ferramenta | Fonte e versão verificável | Escopo de autoridade | Não autoriza |
|---|---|---|---|
| Apgar | ACOG/AAP, *The Apgar Score*, Committee Opinion nº 644, 2015, reafirmado em 2025; https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2015/10/the-apgar-score | Cinco componentes; cada item 0/1/2; registro nos minutos pertinentes; limitações diagnósticas; apresentação da intervenção concomitante | Diagnosticar asfixia por escore isolado; prognosticar individualmente; inferir que a referência possua licença para cópia integral no banco |
| Fugulin — 9 áreas | Artigo secundário acadêmico que descreve instrumento de 9 áreas com quatro pontos por item: https://www.scielo.br/j/reeusp/a/mgnLNV4Mf6TGfLYsFY5hTkC/ | Rastreamento de critérios de variante, **dependente da validação da versão e original** | Presumir que todos os instrumentos Fugulin têm as mesmas áreas/limites |
| Fugulin — 12 áreas | Pesquisa de 2012 sobre instrumento de classificação ampliado: https://new.scielo.br/j/reben/a/JyqRw3qXtXG7nyZRXr6dTvn/ | Indica variante de 12 áreas (12–48), demanda validação do esquema de faixas e licença | Converter sem revisão a variante de 9 áreas para 12 ou vice-versa |
| Dimensão regulatória SCP | Parecer Normativo COFEN nº 1/2024: https://www.cofen.gov.br/parecer-normativo-no-1-2024-cofen/ | Planejamento da força de trabalho, emprego de SCP adequado, contexto de classificação, aplicabilidade territorial BR | Declarar que COFEN fixou automaticamente todos os valores do instrumento clínico |
| Vigência normativa | Resolução COFEN nº 743/2024: https://www.cofen.gov.br/resolucao-cofen-no-743-de-12-de-marco-de-2024/ | Revoga 543/2017; aponta Parecer Normativo 1/2024 como disciplina vigente do tema | Aplicar parâmetros históricos 543/2017 como vigentes sem marcação temporal |

## Achados mandatórios do piloto
**Fugulin NÃO É uma variante única.** A versão de 9 áreas e a proposta de complementação de 12 áreas exigem IDs de variante, contratos e vetores de teste distintos. Estudos descritivos posteriores não substituem a cadeia artigo original/manual autorizado → trecho localizado → afirmação validada → versão da regra → vetor clínico homologado.

**Faixa conflitante:** a redação encontrada na publicação acadêmica de 2012 apresenta sobreposição de extremidade entre duas categorias (valor 34). Antes de qualquer algoritmo de classificação da variante ampliada, obter a fonte primária da complementação e sua versão/errata, verificar o valor 34 e registrar a decisão de um revisor clínico. O sistema não deve decidir automaticamente onde colocar 34 por aproximação ou “correção de digitação”.

**Fonte Apgar:** a extração normativa `NDE-APGAR-AAP-ACOG-2015-CAND` foi localizada no banco. Todos os seis requisitos vinculados aos três claims existentes continuam sem checker, em `CANDIDATE_UNCHECKED`; é preciso comparar cada afirmação à edição oficial e registrar prova de leitura. A ficha no frontend inclui `snapshot_ref="PENDING_SNAPSHOT"` e hash nulo; isso não vale como integridade.

**Direitos:** o fato de uma fonte ser acessível no site de instituição/revista não implica permissão para republicar trechos inteiros, imagens, tabelas ou armazenar conteúdo fechado. Até revisão jurídica/licença, usar identificadores, metadados bibliográficos e citações curtas permitidas.

## Aplicação no banco
Resolver as classes já existentes de `cko_governance.normative_reference_catalog`, `cko_governance.artifact_normative_bindings`, `cko_governance.field_normative_bindings` e `cko_governance.object_versions`. Diferenciar o papel “autoridade de regras científicas”, “exercício profissional”, “gestão do dimensionamento”, “LGPD” e “acessibilidade”. Se falta tipo de vínculo ou chave canônica, abrir FIND e nova versão **somente mediante Kernel** — não desenvolver tabela paralela.

## Teste de saída obrigatório
Cada variante produz pacote de evidência independente, no qual o cálculo dispõe de (i) fontes diretas, direitos e escopo; (ii) critérios pontuáveis tipados; (iii) AST/regra com versão/hashes; (iv) casos-ouro e bordas revisados; (v) verificação de não sobreposição de bandas; (vi) interpretação separada; (vii) versão projetada em HTML, guia com capa, PDF e demais idiomas; (viii) revisão humana e Kernel. **Enquanto qualquer item estiver HOLD, sem endpoint clínico liberado**.

## Fontes consultadas em 26/10/2026
- ACOG/AAP 2015, reafirmada 2025 — https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2015/10/the-apgar-score
- COFEN Res. 743/2024 — https://www.cofen.gov.br/resolucao-cofen-no-743-de-12-de-marco-de-2024/
- COFEN Parecer Normativo 1/2024 — https://www.cofen.gov.br/parecer-normativo-no-1-2024-cofen/
- SciELO 2012 — https://new.scielo.br/j/reben/a/JyqRw3qXtXG7nyZRXr6dTvn/
- SciELO 2022 — https://www.scielo.br/j/reeusp/a/mgnLNV4Mf6TGfLYsFY5hTkC/

**Limitação:** a checagem bibliográfica é pública. Não substitui auditoria integral do texto/licença, revisão da fonte original de cada variante ou confronto com a base proprietária extraída.
