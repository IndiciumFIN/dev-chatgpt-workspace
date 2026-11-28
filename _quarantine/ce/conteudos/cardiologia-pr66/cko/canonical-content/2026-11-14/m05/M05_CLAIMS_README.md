# M05 — Dossiê de claims ECG (CANDIDATE / HOLD CLINICAL)

Três proposições educacionais originais (não transcrição literal), estritamente vinculadas aos IDs dos átomos de `SRC-SBC-ECG-2022` e ao documento `DOC-abf0b50dde7e1c30`. Fonte: Diretriz de ECG da Sociedade Brasileira de Cardiologia, 2022, DOI 10.36660/abc.20220623.

## Modo de operação
- `CKO-M05-ECG-001`: ECG sem alterações não exclui isoladamente evento coronariano agudo. Escopo: suspeita de SCA.
- `CKO-M05-ECG-002`: V3R/V4R como derivações adicionais na avaliação de possível infarto do ventrículo direito. **Não** reproduz limiares ou decisões clínicas sem validação.
- `CKO-M05-ECG-003`: artefatos associados a movimentos e posição de eletrodos em ECG **pediátrico**, sem generalização.

Três objetos `claim.schema.json` com `status=CANDIDATE`, `review=PENDING`, `source_ids`, `binding_ids` e aplicabilidade provisória; nenhum tem aprovação nem está associado ao `source_claim_ids` dos `learning_resource` de M04. Os quatro hashes de texto e os respectivos identificadores de página e bloco estão no dossiê de evidências, sem cópia literal.

**Validade dos direitos:** o registro histórico indica CC BY na diretriz SBC 2022, sujeito a citação, atribuição e direitos sobre elementos de terceiros. A licença por item e a vigência da orientação clínica ainda devem ser verificadas no gate. Dados do título/DOI também foram localizados no site oficial da revista nesta execução.

## Gaps por piloto
- ECG: fontes e 4 átomos recuperados; 3 claims preparados; 0 aprovados.
- Suporte Básico de Vida: 26 ligações lexicais ao tópico, mas **0 átomos textuais correspondentes** no banco. AHA 2025 e ERC 2025 permanecem referências para análise de licença. Sem novo claim.
- Suporte Circulatório Mecânico: 106 ligações lexicais, **80** provenientes de hipertensão arterial 2025 (assunto incompatível); os demais **26** sem texto associado. **0 átomos relevantes confirmados** para ECMO ou dispositivo de assistência ventricular nesse recorte. Não produzir claim de suporte mecânico usando esse conjunto.

Os templates editoriais existentes não são alterados. Publicação, dose, protocolo assistencial e inferência de segurança permanecem bloqueados até revisão clínica e de direitos.
