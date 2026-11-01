# Documentação de API - Todas as Doenças CKO

## Data: 2026-07-27
## APIs utilizadas: MedlinePlus Connect, CDC, WHO, SNOMED CT, LOINC, IDF, Vigitel

---

## 1. CKO-DIS-000001 - Diabetes Mellitus Tipo 2

### MedlinePlus Connect API
- **Endpoint:** `https://connect.medlineplus.gov/service?mainSearchCriteria.v.cs=2.16.840.1.113883.6.90&mainSearchCriteria.v.c=E11&knowledgeResponseType=application/json`
- **ICD-10:** E11
- **ICD-11:** 5A11
- **SNOMED CT:** 44054006
- **MedlinePlus URL:** https://medlineplus.gov/diabetestype2.html
- **Entries:** Múltiplas (sumário, conteúdo paciente, NIDDK)
- **Status:** Sincronizado

### CDC
- **Prevalência EUA:** 38.4 milhões (11.6% da população)
- **Diagnosticados:** 29.7 milhões
- **Prediabetes:** 97.6 milhões
- **Fonte:** https://www.cdc.gov/diabetes/php/data-research/index.html

### IDF Diabetes Atlas 11ª Ed.
- **Global:** 589 milhões adultos (20-79 anos)
- **Projeção 2050:** 853 milhões
- **Mortes 2024:** 3.4 milhões (1 a cada 9 segundos)
- **Custo global:** USD 1 trilhão

---

## 2. CKO-DIS-000002 - Diabetes Mellitus Tipo 1

### MedlinePlus Connect API
- **Endpoint ICD-10:** `?mainSearchCriteria.v.cs=2.16.840.1.113883.6.90&mainSearchCriteria.v.c=E10`
- **Endpoint SNOMED:** `?mainSearchCriteria.v.cs=2.16.840.1.113883.6.96&mainSearchCriteria.v.c=46635009`
- **ICD-10:** E10
- **ICD-11:** 5A10
- **SNOMED CT:** 46635009
- **MedGen:** C0011854
- **Entries (ICD-10):** 5 entries
  - "Diabetes Type 1" - https://medlineplus.gov/diabetestype1.html
  - "Type 1 diabetes" (Genetics) - https://medlineplus.gov/genetics/condition/type-1-diabetes
  - "Healthy Living with Diabetes" - NIDDK
  - "Managing Diabetes" - NIDDK
  - "Type 1 Diabetes" - NIDDK
- **Entries (SNOMED):** 4 entries (mesmos conteúdos)
- **Status:** Sincronizado

### CDC
- **Prevalência EUA:** 2.1 milhões de pessoas diagnosticadas
  - 1.8 milhões de adultos
  - 314.000 crianças
- **Aumento:** ~30% no número de diagnósticos desde 2017
- **Fonte:** https://www.cdc.gov/diabetes/php/data-research/index.html

### IDF / Global
- **Global:** 9.4 milhões de pessoas vivendo com DM1
- **Novos casos/ano:** ~500.000
- **Projeção 2040:** 2.1 milhões diagnosticados
- **Custo associado:** USD 16 bilhões
- **Fonte:** https://idf.org/about-diabetes/diabetes-facts-figures/

---

## 3. CKO-DIS-000003 - Diabetes Gestacional

### MedlinePlus Connect API
- **Endpoint ICD-10:** `?mainSearchCriteria.v.cs=2.16.840.1.113883.6.90&mainSearchCriteria.v.c=O24.4`
- **Endpoint SNOMED:** `?mainSearchCriteria.v.cs=2.16.840.1.113883.6.96&mainSearchCriteria.v.c=11687002`
- **ICD-10:** O24.4
- **ICD-11:** JA63.2
- **SNOMED CT:** 11687002
- **Entries (ICD-10):** 3 entries
  - "Diabetes and Pregnancy" - https://medlineplus.gov/diabetesandpregnancy.html
  - "Gestational diabetes" (Genetics) - https://medlineplus.gov/genetics/condition/gestational-diabetes
  - "Gestational Diabetes" - NIDDK
- **Entries (SNOMED):** 5 entries
- **Status:** Sincronizado

### CDC
- **Prevalência EUA:** 5-9% das gestações afetadas
- **Tendência:** Aumentou de 6.0% (2016) para 8.3% (2021)
- **Fonte:** https://www.cdc.gov/diabetes/about/gestational-diabetes.html
- **Dados detalhados:** https://www.cdc.gov/mmwr/volumes/72/wr/mm7201a4.htm

### IDF
- **Global (2024):** 23.3 milhões de nascidos vivos afetados por hiperglicemia na gravidez (1 em cada 5)
- **Crescimento:** Prevalência crescente globalmente
- **Fonte:** https://idf.org/about-diabetes/gestational-diabetes/

---

## 4. CKO-DIS-000004 - Síndrome Metabólica

### MedlinePlus Connect API
- **Endpoint ICD-10:** `?mainSearchCriteria.v.cs=2.16.840.1.113883.6.90&mainSearchCriteria.v.c=E88.81`
- **Endpoint SNOMED:** `?mainSearchCriteria.v.cs=2.16.840.1.113883.6.96&mainSearchCriteria.v.c=237602007`
- **ICD-10:** E88.81
- **SNOMED CT:** 237602007
- **Entries (ICD-10):** 1 entry - "Metabolic Disorders"
- **Entries (SNOMED):** 1 entry - "Metabolic Syndrome"
- **Status:** Sincronizado

### CDC
- **Prevalência EUA:** ~35% dos adultos (35.1% homens, 34.3% mulheres)
- **Por grupo:** 61.6% em obesos, 33.2% em sobrepeso, 8.6% em normais
- **Tendência:** Aumentando, especialmente em não-obesos
- **Fonte:** https://www.cdc.gov/pcd/issues/2020/20_0020.htm

---

## 5. CKO-DIS-000005 - Obesidade

### MedlinePlus Connect API
- **Endpoint ICD-10:** `?mainSearchCriteria.v.cs=2.16.840.1.113883.6.90&mainSearchCriteria.v.c=E66`
- **Endpoint SNOMED:** `?mainSearchCriteria.v.cs=2.16.840.1.113883.6.96&mainSearchCriteria.v.c=414916001`
- **ICD-10:** E66 (E66.01 para obesidade mórbida)
- **ICD-11:** 5B11 (obesidade simples), 5B12 (induzida por drogas)
- **SNOMED CT:** 414916001
- **Entries (ICD-10):** 3 entries - Obesity, Body Weight, Food Portions
- **Status:** Sincronizado

### WHO (OMS)
- **Global (2022):** 2.5 bilhões de adultos com sobrepeso
- **Obesidade:** 890 milhões de adultos (16% da população adulta mundial)
- **Crianças (<5 anos):** 35 milhões com sobrepeso (2024)
- **Mortes/ano:** 4 milhões atribuíveis ao sobrepeso/obesidade
- **Fonte:** https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight

### CDC
- **EUA (2021-2023):** 40.3% dos adultos obesos (>100 milhões)
- **Obesidade severa:** 9.2% dos adultos (>22 milhões)
- **Fonte:** https://www.cdc.gov/obesity/adult-obesity-facts/index.html

### Vigitel Brasil 2024
- **Excesso de peso:** 62.6% dos adultos (em 2006: 42.6%)
- **Obesidade (IMC ≥30):** 25.7% (em 2006: 11.8%) - mais que dobrou
- **Crescimento:** 72% em 13 anos
- **Fonte:** https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/vigitel/vigitel-brasil-2006-2024.pdf

---

## Resumo de Sincronização por API

| API | DM2 | DM1 | Gestacional | Síndrome Metab. | Obesidade |
|-----|-----|-----|-------------|-----------------|-----------|
| MedlinePlus (ICD-10) | 5 entries | 5 entries | 3 entries | 1 entry | 3 entries |
| MedlinePlus (SNOMED) | 4 entries | 4 entries | 5 entries | 1 entry | 3 entries |
| CDC | 38.4M | 2.1M | 5-9% gest. | 35% | 40.3% |
| WHO/OMS | 830M | - | - | - | 890M |
| IDF | 589M | 9.4M | 23.3M partos | - | - |
| Vigitel BR | - | - | - | - | 25.7% |
| ICD-11 | 5A11 | 5A10 | JA63.2 | 5A4E | 5B11 |
| SNOMED CT | 44054006 | 46635009 | 11687002 | 237602007 | 414916001 |

## Identificadores Oficiais Consolidados

| Doença | CKO ID | ICD-10 | ICD-11 | SNOMED CT | MedGen |
|--------|--------|--------|--------|-----------|--------|
| DM Tipo 2 | CKO-DIS-000001 | E11 | 5A11 | 44054006 | C0011860 |
| DM Tipo 1 | CKO-DIS-000002 | E10 | 5A10 | 46635009 | C0011854 |
| DM Gestacional | CKO-DIS-000003 | O24.4 | JA63.2 | 11687002 | - |
| Síndrome Metabólica | CKO-DIS-000004 | E88.81 | 5A4E | 237602007 | - |
| Obesidade | CKO-DIS-000005 | E66 | 5B11 | 414916001 | - |
