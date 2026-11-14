# M05 — Auditoria de fontes e supressão de associações indevidas

## Achado científico principal
O tópico `TOPIC-UE-2-26` (choque cardiogênico, suporte mecânico) recebeu 80 vínculos de átomos da fonte `SRC-SBC-HA-2025`, que é a **Diretriz Brasileira de Hipertensão Arterial — 2025**, não uma diretriz de ECMO ou dispositivos ventriculares. Revisão de trechos mais bem classificados e varredura terminológica específica nos 80 registros: nenhuma ocorrência dos termos diretos auditados para suporte mecânico. **Bloqueio lógico proposto da combinação topic+source para promoção de claims**, preservando os dados brutos para investigação. Isso não é reprovação do artigo de hipertensão como fonte de hipertensão.

## Outro problema de proveniência de direitos
No `source_rights_profiles`, a fonte `SRC-SBC-HA-2025` cita `PMC9563889` e URL SciELO associada à diretriz ECG 2022 como evidência para direito autoral do artigo de HA 2025. Esse link de licença **não comprova por si só os direitos do artigo de HA 2025**. O status do cadastro histórico não pode ser interpretado como uma autorização nova; revisar origem específica.

## BLS adulto
`TOPIC-UE-2-3` tem 26 vínculos lexicais; `LEFT JOIN evidence_atoms` encontrou 0 registros textuais correspondentes. Fonte AHA 2025 localizada novamente em página oficial, mas seu texto e algoritmos não podem ser reproduzidos automaticamente e o registro de direitos exige autorização por operação. Nenhum claim M05 gerado para BLS.

## Fontes oficiais/científicas novas (descoberta de metadados apenas)
- ELSO: diretriz VA-ECMO adulta 2021, no catálogo institucional;
- ISHLT/HFSA: diretriz de suporte mecânico agudo 2023;
- ISHLT: diretriz MCS 2023 atualização de 10 anos;
- MS/SNT: cartilha para profissionais sobre transplante cardíaco (página atualizada em maio de 2026);
- MS/CONITEC: PCDT imunossupressão no transplante cardíaco (anexo alterado em março de 2022);
- AHA: BLS adulto 2025, DOI 10.1161/CIR.0000000000001369 (fonte já existente; evitar duplicação de source_id).

**Essas seis páginas são candidatas de descoberta, não documentos baixados, atomizados, direitos verificados ou claims validados.**

## Estado
3 FINDs compatíveis com `contracts/cko-schemas/find.schema.json` foram preparados como CANDIDATE sem admissão Kernel, e devem alimentar a cadeia FIND→policy→validator→TASK→WO→Kernel antes de qualquer promoção. Branch pública contém somente metadados e registros de auditoria.
