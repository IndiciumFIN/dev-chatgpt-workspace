# E3 — Camada normativa (o que o produto afirma e o que sustenta)

## Doutrina canónica do repo (já escrita — `agents/normativos-licenciados.md`, ID CKO-AI-INS-LIC-001 rev 1.1.0)
1. **Proibido inventar códigos/escalas/siglas/enums** para classificar evidência, norma, direitos ou risco. Se falta classificação: registar FIND, mudar esquema só pelo processo de governança.
2. **Quatro perguntas separadas** (não são níveis nem estados): (a) qual é a fonte? (b) que material foi consultado? (c) que direitos existem para o uso proposto? (d) o que a evidência comprova?
3. **Uso proporcional**: metadados oficiais oficiais ≠ texto de cláusula; biblioteca técnica ≠ aderência ISO; norma citada ≠ certificação; hash atesta bytes, não correção.
4. **Direitos**: leitura, extração, armazenamento, uso interno, redistribuição e partilha com modelo/API são atos distintos; sem comprovação → **HOLD**.
5. Rótulos `E0–E5` estão **proibidos** como vocabulário transversal.
6. Divergência gera **FIND**, nunca substituição silenciosa.

## Contrato de fontes do repo (`contracts/entities/tool-sources.v1.json`, 175 linhas)
Presente no `main` do repo de governança, com authority declarada e nota de contrato. Inclui entradas como `SRC-CFM-PARECER-28-2020` (citado no FIND-CTR-010: a Escala de Aldrete foi implementada com a fonte do CFM e o corte de 8 pontos, enquanto o site estático publica corte de 9 pontos — **divergência real e não resolvida**).

## Normativos que a PRODUÇÃO afirma (extraídos das páginas reais)
COFEN 01/2024 (dimensionamento) · Lei 7.498/86 · Lei 8.080/90 · Lei 5.905/73 · Resolução Cofen 736/2024 · Portaria GM/MS 6.734/2025 · NANDA-I 2018 · NIC · PNAB · SINAN · Código de Ética de Enfermagem · AHA/SBC (PCR) · IBSP · ISMP · ANVISA · MS (vacinas) · SBIM.

## O que isto significa para o esqueleto CE
- Os objetos `ClinicalTool`, `Norm`, `LibraryEntity` e `Question` **não podem** ser admitted sem `authorityBinding` (fonte + pinpoint + edição + direitos) — o metamodelo do esqueleto já tem `authorityBinding` no schema do ClinicalTool, mas está `CANDIDATE_HOLD`.
- **Faixas, escores e classificações** são invenção clínica se não houver fonte preservada: é o bloqueante nº1 do repositório (ver o verificador adversarial).
- O `Senado` (API de Dados Abertos) cobre a camada federal (leis/decretos/resoluções) mas **não devolve texto integral**: só metadados, catálogo, vides, edições e indexação — o texto exige `normas.leg.br`/DOU/planalto. Isto limita o que um agente pode afirmar.
- ISO/ABNT/ISACA/IFRS: **só metadado** (direito controlado; robots do ISO responde 403).
