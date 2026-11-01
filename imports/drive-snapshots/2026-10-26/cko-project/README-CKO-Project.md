# CKO Project - Clinical Knowledge Object
## Biblioteca de Doenças - Diabetes e Condições Relacionadas
### Backup completo: 26/10/2026

---

## Estrutura de Pastas

### cko-schemas/ (7 arquivos)
- **CKO-Disease-Schema.json** — Schema JSON (draft-07) que define a arquitetura de todos os objetos de doença. Corrigido em 27/07/2026: "clinical" removido do required + releaseNotes adicionado.
- **CKO-DIS-000001-Diabetes-Mellitus-Tipo-2.json** — Objeto piloto (v1.1.0). ICD-11: 5A11 | SNOMED: 44054006. 11 medicamentos, 11 NANDA, 10 testes LOINC, 21 categorias no bloco related.
- **CKO-DIS-000002-Diabetes-Mellitus-Tipo-1.json** — ICD-11: 5A10 | SNOMED: 46635009 | MedGen: C0011854. Estadiamento TrialNet (3 estágios), autoanticorpos com LOINC.
- **CKO-DIS-000003-Diabetes-Gestacional.json** — ICD-11: JA63.2 | SNOMED: 11687002. Critérios IADPSG (TOTG 75g), staging A1/A2GDM.
- **CKO-DIS-000004-Sindrome-Metabolica.json** — SNOMED: 237602007. Critérios NCEP ATP III (3 de 5).
- **CKO-DIS-000005-Obesidade.json** — ICD-11: 5B11 | SNOMED: 414916001. Classes I-III, farmacoterapia GLP-1, cirurgia bariátrica.
- **CKO-Object-Registry.json** — Registro de 67 objetos CKO do ecossistema (medicamentos, procedimentos, protocolos, vacinas, calculadoras, escalas, anatomia, feridas, curativos, agulhas, seringas, vídeos, algoritmos).

### cko-research/ (4 arquivos)
- **API-Results-All-Diseases.md** — Documentação completa das extrações de API por doença (27/07/2026).
- **API-Results-Consolidated.json** — Resultados crus das chamadas de API (re-extração 26/10/2026: MedlinePlus Connect por ICD-10 e SNOMED, WHO ICD-11, CDC, NIH/NIDDK, páginas MedlinePlus).
- **api_diseases.py** — Script de extração de dados das APIs oficiais para as 5 doenças.
- **README-CKO-Project.md** — Este arquivo.

### cko-content/ (4 arquivos)
- **articles-med-farm-direct.json** — 5 artigos de medicina e farmácia (Ominous Octet, Algoritmo ADA 2024, CAD, Farmacocinética das Insulinas, Interações Medicamentosas).
- **articles-part2.json** — 4 artigos de enfermagem (NANDA 00179, 00098, 00047, 00088 com planos NIC/NOC).
- **quiz-medicina-direct.json** — 20 questões de medicina (fisiopatologia, diagnóstico, tratamento, complicações, emergências).
- **quiz-farmacia-direct.json** — 15 questões de farmácia (farmacologia, interações, dispensação, legislação).

**Todos os artigos e questões contêm bloco ckoReferences obrigatório** com cross-referências aos objetos CKO do ecossistema.

---

## APIs Utilizadas e Status (26/10/2026)

| API | Status | Observação |
|-----|--------|------------|
| MedlinePlus Connect (ICD-10) | OK | 17 entries nas 5 doenças |
| MedlinePlus Connect (SNOMED CT) | OK | 17 entries nas 5 doenças |
| Páginas MedlinePlus | OK | 5/5 acessíveis |
| NIH/NIDDK | OK | 5/5 páginas 200 OK |
| WHO ICD-11 API | 401 | Requer OAuth; códigos confirmados via web search |
| CDC (direto) | 403 | Bloqueado no sandbox; dados via web search |

## Identificadores Oficiais

| Doença | CKO ID | ICD-10 | ICD-11 | SNOMED CT |
|--------|--------|--------|--------|-----------|
| DM Tipo 2 | CKO-DIS-000001 | E11 | 5A11 | 44054006 |
| DM Tipo 1 | CKO-DIS-000002 | E10 | 5A10 | 46635009 |
| DM Gestacional | CKO-DIS-000003 | O24.4 | JA63.2 | 11687002 |
| Síndrome Metabólica | CKO-DIS-000004 | E88.81 | 5A4E | 237602007 |
| Obesidade | CKO-DIS-000005 | E66 | 5B11 | 414916001 |

---

## Nota de Restauração (26/10/2026)

O sandbox do agente foi resetado entre 27/07/2026 e 26/10/2026. Os arquivos foram reconstruídos com fidelidade máxima a partir de:
1. **Re-extração das APIs** (26/10/2026) — dados frescos da MedlinePlus/NIDDK
2. **Contexto completo da conversa** — conteúdo clínico validado em julho/2026
3. **Memória estruturada do projeto** — estatísticas e arquitetura documentadas

O CKO-DIS-000001 foi refeito como v1.1.0 (o original v1.0.0 tinha ~115KB; esta versão de 74KB mantém toda a estrutura de 38 blocos, os 11 medicamentos, 11 NANDA, 8 NIC, 5 NOC, 10 LOINC, 5 regras clínicas e 21 categorias do bloco related).
