# NORM-KERNEL — Documentação de Sistemas v1.0.0

**Norma de estrutura:** ISO/IEC/IEEE 26514 (projeto e desenvolvimento de
documentação) + ISO/IEC/IEEE 42010 (descrição de arquitetura) + ISO 8000
(qualidade de dados). **Nota de licença (P7):** os textos ISO são fonte
`pending_license` (SRC-ISO, KL-0004); a estrutura segue as cláusulas
conhecidas da série e a verificação formal contra o texto integral é
**débita registrada** (backlog/registro universal).

| Controle | Valor |
|---|---|
| Versão do documento | 1.0.0 (2026-09-29, aprovação Leivis 13:43) |
| Versão do sistema | **NORM-KERNEL v1.0.0 — Fase 0 (calibração) COMPLETA** |
| Anexo do metamodelo | v1.4.0 — pin `sha256:17530e3c…` (EMENDA-0002/0003/0004 aplicadas) |
| Evidência corrente | EV-NK-0010 → EV-NK-0011 (13 gates PASS) |
| Backup v1 | norm_kernel_v1.0.0_backup_2026-09-29.zip (checksum no handoff) |

## 1. Escopo e audiências
Cobre TODO o sistema: metamodelo, kernel, gates, registros, artefatos,
front-end e processos. Audiências: (a) operador/governante humano (Leivis);
(b) agente supervisor (superagent) — operação via OS; (c) auditor — evidências
e journal; (d) desenvolvedor futuro — handoff e próximos passos.

## 2. Propósito
Banco fundamental **governado** de atomização normativa: transformar
normativos (leis, portarias, RFCs, specs) em **átomos deônticos** verificáveis
(1 átomo = 1 proposição), com proveniência integral, qualidade ISO 8000 por
campo e um kernel que bloqueia tudo que não nascer registrado.

## 3. Arquitetura (ISO 42010)

### 3.1 Componentes (todos registrados no artifact_register com checksum)
| Componente | Papel | Deploys |
|---|---|---|
| kernel-order (v0.5.0) | Único escritor do banco; OS assinadas; ids gerados; máquina de estado derivada do anexo | normKernelOrder |
| intake-guard (v0.3.1) | Valida qualquer registro contra o anexo; quarentena em violação; journal de recusas | normKernelIntake |
| meta-audit (v0.2.1) | Conformidade integral do banco (enums, cadeias, lifecycles do anexo) | normKernelMetaAudit |
| deploy-gate (v0.2.1) | Linha de base EV-NK-0006; diff só por OS aceita; exclusão recusada | normKernelDeployGate |
| render-page (v0.1.4) | Front-end GERADO do master data (nunca editado); OG + JSON-LD | normKernelRenderPage |
| pipeline (v0.7.0) | Instrumento do kernel: 13 gates + evidência JCS + auto re-registro com --os + ledger | sandbox |
| atomizer (v0.1.1) | Fixture → documento + átomos (checksum canônico RFC 8785) | sandbox |
| build_artifact_register (v0.2.0) | Registro universal (nada nasce solto) | sandbox |

### 3.2 Modelo de dados (5 registros governados + suporte)
- **NormDocument** (fonte → doc, citação canônica, coverage, cadeias version_of/restored_from)
- **NormAtom** (verbatim + plain language + locator + canon refs + checksum)
- **NormSource / DictionaryTerm / ExtractionRun** (fontes, dicionário DICT:ns:slug, runs terminais)
- Suporte: ServiceOrder (journal de OS), AgentPolicy (POL-NK-001..008),
  PolicyEvidence (EV-NK-*), KnowledgeLicense (KL-*), NormSource↔KL (P7).
- **Máquinas de estado** (birth + transitions) codificadas como DADOS no
  anexo `lifecycles` — código deriva em runtime (POL-NK-008 C2).

### 3.3 Camadas
Governança (políticas + emendas) → Metamodelo (anexo pinado) → Kernel
(funções + gates) → Banco (registros governados) → Evidência (JCS sha256) →
Registro universal (artefatos sandbox) → Ledger de tasks → Front-end gerado.

## 4. Fluxo de informações (ponta a ponta)

### 4.1 Fluxo de governança (escrita)
```
Leivis (diretriz) → superagent → OS (NK-OS-NNNN, requester, payload SEM id)
  → kernel-order: valida anexo (pin) + capabilities (pin) + id AUTOMÁTICO
     + nascimento (lifecycles.birth) + P2 (nada órfão) + máquina do anexo
  → banco nasce (draft|terminal) + ServiceOrder assinada (aceite/recusa)
  → deploy-gate: diff vs baseline EV-NK-0006 só por OS aceita
  → meta-audit: CONFORM
```
### 4.2 Fluxo de ingestão (job de extração)
```
backlog.json (NK-BL-NNNN, 15 itens) → job NK-JOB-NNNN (OS própria)
  → tentativas registradas (extraction_jobs.json: attempts[], hash imediato)
  → download + checksum sha256 → parse (structure_tree) → atomização
  → gates G1..G12 → evidência EV-NK-NNNN → run NK-RUN-NNNN (via OS)
  → doc NK-DOC-NNNNN (nascido draft → transição OS) → front-end regenerado
```
### 4.3 Fluxo de publicação (leitura)
```
render-page: anexo (pin em runtime) + master data do banco → HTML gerado
  → OG image, JSON-LD, WCAG, semantic tables → consumidor humano
  (também: OSCAL/PROV-O exportados como artefatos de interoperabilidade GRC)
```
### 4.4 Fluxo de emenda (mudança de metamodelo)
```
NK-EMENDA-NNNN (matriz de impactos completa + checksum + url)
  → OS amendment → kernel valida → AGUARDA HUMANO → aplicação (anexo novo
  + re-pin POL-NK-001 + cascata de 5 redeploys) → G4-pin verifica → evidência
```
### 4.5 Fluxo de finding (investigação)
```
bloqueio de gate/OS → finding AUTOMÁTICO (kernel) → investigação 5W
  (what, where_born, why, remediation, prevention) → dupla aprovação
  (kernel + humano) → closed (imutável; nunca apagado)
```

## 5. Interfaces HTTP (todas registram no ServiceOrder quando mutam)
| Endpoint | Método | Efeitos |
|---|---|---|
| normKernelOrder | POST | create/transition/amendment; recusas = journal |
| normKernelIntake | POST | valida registro; quarentena se violar |
| normKernelMetaAudit | GET/POST | relatório CONFORM/DIVERGENT |
| normKernelDeployGate | POST | check (baseline: ato de política) |
| normKernelRenderPage | GET | HTML gerado (página pública) |

## 6. Processos — ver docs/processes.md (P-01..P-08, POL-NK-008 C1)

## 7. Segurança e governança
Kernel guardião, default-deny (capabilities.json pinado); LLM sem autoridade
estrutural (INV-011); assinatura sha256 em toda OS; anexo/dependências
pinados; exclusão é humana (INV-005); versionamento/arquivamento são do kernel
(INV-003/004); diffs sem OS = bloqueio + finding automático (POL-NK-006 C3).

## 8. Qualidade e conformidade
ISO 8000: cada campo tem norma primária + 6 camadas transversais (90 campos,
542 vínculos, 0 órfãos). WCAG 2.2 (H8) no front-end; Lei 9.610 art. 8º:
citação canônica obrigatória; licenças KL por fonte (P7); LGPD (H11):
finalidade/consentimento por dado — débita para conteúdo real. Série ISO de
documentação: estrutura adotada, verificação formal débita (licença).

## 9. Operação
- Pipeline: `python3 pipeline.py --os NK-OS-NNNN [--run NK-RUN-NNNN]` (sem
  --os e com drift → BLOCKED + finding).
- OS: POST normKernelOrder (payload conforme §4.1); ids NUNCA inventados.
- Auditar: metaAudit (banco) + deployGate (baseline) + G10 (findings).

## 10. Evolução e manutenção
Emendas via P-03 (dupla aprovação). Backlog: 15 normativos com fonte/método/
licença/OS prevista (NK-BL-0001..0015). Débitas declaradas: ver HANDOFF §4.

## 11. Referência cruzada integral
Todo artefato, função, dependência e protocolo está no
registers/artifact_register.json com checksum + norma + template_fields;
todo run no ledger registers/kernel_tasks.json (os↔run↔evidência↔artefatos).
