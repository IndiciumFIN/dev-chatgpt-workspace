# B59 — Confirmação de hashes e identidade documental (read-only)

Cruzamento do corpus `canonical_corpus.sqlite` recuperado com o Supabase `cko_evidence.snapshots`, comparando somente `document_id`, MIME, SHA-256 e estados de validação.

- Cinco associações de URL foram reavaliadas.
- **Seis documentos M03 distintos** associados a quatro fontes normativas, com SHA-256 já presentes; a Resolução COFEN 736/2024 possui um HTML e dois PDFs.
- **Sete snapshots Supabase**: quatro da resolução COFEN 736, um da RDC 36, um da Portaria 529 e um resumo da Lei 7498.
- **Zero hashes de bytes iguais** entre os documentos M03 e os snapshots Supabase examinados.
- Entre os quatro snapshots COFEN, um está `REJECTED_NON_NORMATIVE_SITE_CHROME_CHANGE` e dois `PENDING_NORMATIVE_VALIDATION`; outro está `PENDING_VALIDATION`.
- `SNP-BR-LEI-7498-1986-REQ` é um resumo textual (`PASS_REQUIREMENT_SUMMARY`), não prova de texto integral da lei/decreto.

Os status `PASS` em snapshots textuais resumidos não equivalem a comprovação de documento integral. Igualdade de URI aponta para a **mesma norma como candidato**, mas não para bytes/snapshot idênticos. A relação parcial Lei+Decreto versus apenas Lei permanece **não equivalente**.

**Próximo gate**: obter bytes dos snapshots em ambiente com licença, normalizar apenas conteúdo normativo de forma reprodutível, comparar versão/ementa/data/trechos e registrar aliases em tabela de linhagem após decisão humana. Não rebaixar o snapshot de UI a alteração de lei.

Documentos e seus hashes permanecem nos bancos privados. Somente **metadados e SHA** são versionados aqui, sem material protegido.
