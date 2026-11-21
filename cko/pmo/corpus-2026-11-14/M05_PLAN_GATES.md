# Plano P0 — M05: Evidência e claims

## Avanços executados
- PR #66: 3 claims `claim.schema.json` com `status=CANDIDATE`, `review=PENDING`, apoiadas em 4 átomos distintos da diretriz SBC ECG 2022, sem reprodução literal dos átomos.
- PR #68: FINDs candidatos (SCM falso positivo, SBV sem texto, direitos HA2025), regra de bloqueio por par topic+source, 6 fontes de metadados para suporte mecânico e transplante, filas de direitos e ausência de evidência.
- PR #67: PMO atualizado, riscos e decisões novos, sem alterar PMO mestre Drive.

## Critérios de aceite desta microtarefa (não cumpridos ainda)
1. Para cada claim, validadores verificam `source_id`, `document_id`, `evidence_atom_id`, SHA, page/locator, direitos por uso e status da fonte.
2. Reviewer clínico confere literal original em ambiente autorizado, vigência e população.
3. Atoms de BLS ficam sem claim até fonte examinável/permitida; fontes AHA/ERC somente referência até direitos resolvidos.
4. Anulação do falso positivo de SCM exige aprovar a regra e eventual alteração de mapeamento via workflow de governança, jamais apagar a baseline.
5. Novo suporte mecânico: ELSO/ISHLT antes de resumo clínico; transplante cardíaco: SNT/MS e PCDT, com direitos e adaptação curricular.
6. Passar inspeção por schema + QA de integridade + revisão clínica independente + CI sem bloqueio.

## Estado por frente
| Piloto | Atoms selecionados | Claims candidatos | Claims clinicamente aprovados | Principais bloqueios |
|---|---:|---:|---:|---|
| ECG | 4 | 3 | 0 | item-licença, revisão clínica, vigência |
| SBV | 0 | 0 | 0 | falta de átomos textuais no recorte, direitos AHA/ERC |
| SCM | 0 | 0 | 0 | falso positivo com hipertensão; falta de evidência direta |
| Transplante | 0 | 0 | 0 | documentos apenas descobertos, não ingeridos |

**Nenhum desses dados equivale a liberação de conteúdo clínico.** Os 29 claims legados do banco não foram reavaliados. O PMO Master no Drive permanece read-only e nenhum WRITE no Supabase foi realizado.

## Próxima microtarefa M05-B
- Confirmar direito por item e obter snapshot versionado de ELSO/ISHLT/SNT/MS em local permitido.
- Fazer checagem dos quatro átomos ECG por profissional clínico independente.
- Validar execução automática dos schemas com scripts no repositório sem segredos e verificar CI após liberar quota.
- Consolidar FINDs → policy → validators → TASKs e WOs candidatos por gate.
