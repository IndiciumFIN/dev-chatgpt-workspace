# Aquisição transversal — acompanhamento de 24/10/2026

**Repositório único:** `IndiciumFIN/dev-chatgpt-workspace` · **WO:** `WO-GOV-TRANS-001`

## Evidência de cópia permanente

- **21 atos públicos brasileiros** (leis, decretos, resoluções da Autoridade Nacional de Proteção de Dados) com HTML original e extração textual ainda não revisada.
- **3 especificações originais W3C** (PROV-O, WCAG 2.2 e SHACL), preservadas integralmente com avisos de licença.
- **1 eMAG 3.1**, obtido diretamente do portal oficial, com licença CC BY 4.0 indicada no documento, HTML, texto extraído e atribuição.
- **22 referências históricas** com identificação/metadados, mas sem cópia integral. Dessas, **21** continuam candidatas à aplicação/aquisição; **IFRS S1/S2 foi excluída por não aplicabilidade justificada** ao produto de enfermagem, mantendo o registro.

Os primeiros 24 foram copiados exatamente da execução [40065059009](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/40065059009), com validação dos hashes **depois** de adicionar ao índice do Git, e foram arquivados em:
[Snapshot](../../audit-evidence/transversal-acquisition/snapshots/20261024/SNAPSHOT-MANIFEST.json).
O eMAG foi preservado separadamente em:
[Evidência eMAG](../../audit-evidence/transversal-acquisition/snapshots/20261024-extended/emag/evidence.json).

## Lacunas técnicas e jurídicas (sem introduzir nova classificação)

| Área | Exemplos | Situação |
|---|---|---|
| Normas ISO/IEC | 18 referências, incluindo ISO 8000, ISO 11179, ISO 14001 e ISO/IEC 40500 | Metadados públicos; texto integral não arquivado |
| Associação Brasileira de Normas Técnicas | ABNT NBR 17225:2025 | Fonte exata e direitos de acesso ainda a qualificar |
| Governança de tecnologia | COBIT 2019, ISACA | Sem cópia integral licenciada |
| Divulgação de sustentabilidade financeira | IFRS S1 e S2 | **FAIL na triagem anterior**: não aplicável ao escopo do produto de enfermagem; manter registro histórico, sem aquisição |
| Tecnologia de políticas | Open Policy Agent/Rego | Documentação pública identificada, licença e arquivamento da documentação ainda não individualizados |

**Oportunidade sem desembolso identificada:** os catálogos ISO das normas ISO/IEC 11179-1:2023, 11179-3:2023, 11179-31:2023 e ISO/IEC 40500:2025 indicam **0 CHF** para o formato disponibilizado. Isso não significa que o PDF tenha sido baixado, nem autorização para redistribuição ou incorporação a produto. A especificação WCAG 2.2 do W3C já está no repositório, mas não foi certificada equivalência documental à versão distribuída pela ISO.

## Links corrigidos após consulta às fontes oficiais

- ISO/IEC 25012:2008: https://www.iso.org/standard/35736.html
- ISO 37301:2021: https://www.iso.org/standard/75080.html
- ISO/IEC 42001:2023: https://www.iso.org/standard/42001
- ISO/IEC 40500:2025: https://www.iso.org/standard/91029.html

Os endereços anteriores foram preservados no registro. Outros endereços de metadados permanecem pendentes de revisão individual. As edições e emendas precisam ser cotejadas antes de qualquer binding de requisito.

## Limites de uso e próximos passos

Arquivamento histórico ≠ atualidade jurídica ≠ requisito de cláusula comprovado ≠ implementação funcional. Validar atualização legal, anexos, emendas e alcance de licença por fonte; reconciliar candidatos, e somente depois derivar aplicação aos contratos existentes. **Não houve atomização normativa homologada, teste de cláusulas, admissão no Kernel, certificação ou publicação do conteúdo.** Não repetir downloads de fontes já preservadas com hash idêntico sem motivo documentado.


## Correção de aplicabilidade e contratos (24/10/2026)
**Erro de seleção — IFRS S1/S2:** a inclusão entre aquisições para o produto de enfermagem não tinha vínculo demonstrado a uma funcionalidade clínica, educacional ou editorial do site. No inventário, manter a fonte histórica com `NOT_APPLICABLE_JUSTIFIED` (decisão do contrato existente `contracts/cko-schemas/applicability.schema.json`), `acquisitionRequired=false` e justificativa. **FAIL refere-se à falha de triagem, não à qualidade/validade das normas IFRS.** Só reavaliar com mudança formal do escopo.

**Contrato ISO/ISO-IEC já existente, não utilizado completamente:**
- Política: `docs/CKO-POL-UT-001.md` e emenda vigente.
- Registro de fonte: `contracts/cko-schemas/source.schema.json`: autoridade, versão, direitos, URL/pinpoint, datas e hash de snapshot real.
- Aplicabilidade: `contracts/cko-schemas/applicability.schema.json`: escopo, justificativa, exclusões e decisão.
- Vínculos de autoridade: `contracts/cko-schemas/authority_binding.schema.json`: campo, requisito, fontes, validade, decisão, teste e evidência.
- Evidência: `contracts/cko-schemas/audit_evidence.schema.json`.
- Regra de tratamento proporcional de fontes licenciadas: `agents/normativos-licenciados.md`.

**Constatação:** 18 normas ISO/ISO/IEC no inventário; nenhuma instância de fonte, binding de cláusula ou teste normativo qualificados demonstrados nesta auditoria. Não apresentar preço zero do catálogo como licença de redistribuição. Metadados oficiais e atividades técnicas independentes continuam elegíveis; somente requisito que depende do texto integral fica pendente.

Os dois achados de remediação foram registrados em `registers/governance/find-register.v1.json` como **candidatos**, sem admissão ou WO nova. Os 25 documentos já arquivados não foram alterados. O total histórico do catálogo permanece 47, dos quais 46 são candidatos de escopo e 21 continuam apenas em metadados.


### Correção de inventário ativo — 24/10/2026
IFRS S1/S2 saiu de `coverageExpansion.items`: **46 referências ativas**, 1 exclusão histórica em `coverageExpansion.excludedByApplicability`, 25 documentos preservados, 21 fontes ativas apenas com metadados. Nenhuma exclusão física de evidências. O snapshot histórico da aquisição mantém 47 entradas e não é alterado.


## Materialização de registros canônicos candidatos — 24/10/2026
- **18 ISO/ISO-IEC**: `registers/governance/transversal-source-instances/` (18 fontes, 18 aplicabilidades HOLD, 18 vínculos de autoridade HOLD_HUMAN, 18 evidências estruturais), todos derivados somente do catálogo interno, não dos textos integrais ISO.
- **25 fontes públicas**: `registers/governance/transversal-source-instances/public/` (25 fontes candidatas e 25 evidências com hashes dos arquivos originais recuperados). Sem criação de cláusulas, regras jurídicas ou validação de vigência.
- O gate `scripts/verify-transversal-public-materialization.py` confronta identidades, licenças registradas, snapshots e hashes com os contratos existentes; os contratos **não foram alterados**.
- IFRS S1/S2 permanece **fora da lista ativa**, mas rastreada em `coverageExpansion.excludedByApplicability`.
- **Nenhuma fonte ISO ou pública foi admitida ou promovida no Kernel.** Não confundir armazenamento e validação estrutural com publicação de conteúdo normativo.
