/**
 * Fontes normativas e bindings de autoridade — por campo.
 *
 * UTC-001: a fonte autoritativa e o requisito precedem a implementacao.
 * UTC-002: todo campo aplicavel recebe binding governado em nivel de campo.
 * UTC-003: nada clinical inline em template — a autoridade mora aqui, referenciada.
 *
 * O binding e por CAMPO (`field_path`), nao por ferramenta: cada criterio e cada faixa
 * aponta para a fonte que o sustenta. Uma ferramenta pode ter criteria de fontes
 * diferentes — e e exatamente isso que o modelo por ferramenta nao permitia.
 */
import type { AuthorityBinding, CampoDefinido, FonteNormativa, PrivacyProfile } from "./contracts";

const HOJE = "2026-10-22";
const VERSAO = "1.2.0";
const HASH_ZERO = "0000000000000000000000000000000000000000000000000000000000000000";

/* ═══════════════════════════════════════════════════════════════════════════
   FONTES NORMATIVAS
   Cada uma e um `source.schema.json` valido: jurisdiction, rights, locator
   com pinpoint, integridade e vigencia.
   ═══════════════════════════════════════════════════════════════════════════ */
export const FONTES: FonteNormativa[] = [
  {
    schema_version: "0.1.0",
    canonical_id: "SRC-CFM-PARECER-28-2020",
    version: "1.0.0",
    status: "SOURCE_QUALIFIED",
    updated_at: HOJE,
    provenance_refs: ["SRC-CKO-POL-UT-001", "CKO-POL-UT-001@1.2.0"],
    source_type: "REGULATOR",
    source_type_rationale: "parecer tecnico do Conselho Federal de Medicina: nao e lei, e parecer de conselho profissional",
    title: "Critérios para alta da sala de recuperação pós-anestésica",
    authority: "Conselho Federal de Medicina (CFM)",
    locator: {
      uri: "https://sistemas.cfm.org.br/normas/arquivos/pareceres/PR/2020/2806_2020.pdf",
      pinpoint: "Parecer nº 28/2020, seção de critérios de alta da SRPA",
    },
    rights: "PUBLIC_DOMAIN",
    jurisdiction: "BR",
    retrieved_at: HOJE,
    integrity: { sha256: "089dba1488ac8ee0a3ca943c1131b193e4ee593bbd5c9a3289718320afd68c2d", artifact_ref: "docs/evidence/ce-comparacao-2026-10-31/04-capturas-normativas/capturas-2026-11-01/cfm_parecer28_2020.pdf", snapshot_ref: "docs/evidence/ce-comparacao-2026-10-31/04-capturas-normativas/capturas-2026-11-01/cfm_parecer28_2020.pdf", method: "SHA-256 do PDF preservado no pacote de capturas normativas (36/36 verificados)" },
    effective_from: "2020-01-01",
    license_ref: "LEI-9.610-1998",
    language: "pt-BR",
    citacao:
      "CONSELHO FEDERAL DE MEDICINA. Parecer nº 28/2020. Assunto: Critérios para alta da sala de recuperação pós-anestésica. Brasília: CFM, 2020.",
  },
  {
    schema_version: "0.1.0",
    canonical_id: "SRC-REV-ENF-USP-BRADEN-1999",
    version: "1.0.0",
    status: "REVIEW_REQUIRED",
    updated_at: HOJE,
    provenance_refs: ["SRC-CKO-POL-UT-001"],
    source_type: "PRIMARY_STUDY",
    source_type_rationale: "artigo cientifico original de validacao da escala de Braden",
    title: "Avaliação de risco para úlceras de pressão por meio da escala de Braden, na língua portuguesa",
    authority: "Revista de Enfermagem da USP",
    locator: {
      uri: "https://www.revistas.usp.br/revenf",
      pinpoint: "Paranhos WY, Santos VLCG. Rev Esc Enferm USP. 1999;33(esp):191-206",
    },
    rights: "LICENSED",
    jurisdiction: "BR",
    retrieved_at: HOJE,
    integrity: { sha256: "NOT_AVAILABLE", reason: "documento-fonte nao preservado no pacote de evidencia (as capturas so contem o parecer do CFM); a fonte nao tem hash verificavel", artifact_ref: null, snapshot_ref: "PENDING_SNAPSHOT" },
    effective_from: "1999-01-01",
    license_ref: "PERMISSION_REVIEW",
    language: "pt-BR",
    citacao:
      "Paranhos WY, Santos VLCG. Avaliação de risco para úlceras de pressão por meio da escala de Braden, na língua portuguesa. Rev Esc Enferm USP. 1999;33(esp):191-206.",
  },
  {
    schema_version: "0.1.0",
    canonical_id: "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA",
    version: "1.0.0",
    status: "REVIEW_REQUIRED",
    updated_at: HOJE,
    provenance_refs: ["SRC-CKO-POL-UT-001"],
    source_type: "GUIDELINE",
    source_type_rationale: "manual de consulta rapida de referencia: nem norma nem lei",
    title: "Manual de Consulta Rápida em Enfermagem — Escala de Morse",
    authority: "CAPES/MEC",
    locator: {
      uri: "https://educapes.capes.gov.br/bitstream/capes/1180808/2/Manual%20de%20consulta%20r%C3%A1pida-%20monitoria.pdf",
      pinpoint: "Escala de Morse — Fonte: Urbanetto et al., 2013",
    },
    rights: "PUBLIC_DOMAIN",
    jurisdiction: "BR",
    retrieved_at: HOJE,
    integrity: { sha256: "NOT_AVAILABLE", reason: "documento-fonte nao preservado no pacote de evidencia (as capturas so contem o parecer do CFM); a fonte nao tem hash verificavel", artifact_ref: null, snapshot_ref: "PENDING_SNAPSHOT" },
    language: "pt-BR",
    citacao:
      "CAPES/MEC. Manual de Consulta Rápida em Enfermagem. Escala de Morse. Fonte: Urbanetto et al., 2013.",
  },
  {
    schema_version: "0.1.0",
    canonical_id: "SRC-OMS-OBESIDADE-2000",
    version: "1.0.0",
    status: "REVIEW_REQUIRED",
    updated_at: HOJE,
    provenance_refs: ["SRC-CKO-POL-UT-001"],
    source_type: "GUIDELINE",
    source_type_rationale: "relatorio/recomendacao da Organizacao Mundial de Saude: a OMS nao legisla no Brasil",
    title: "Obesity: preventing and managing the global epidemic — cortes de IMC",
    authority: "Organização Mundial da Saúde (OMS/WHO)",
    locator: {
      uri: "https://www.who.int/publications/i/item/9789240015128",
      pinpoint: "Cortes de IMC para adultos (WHO 2000, tabela de référence)",
    },
    rights: "PUBLIC_DOMAIN",
    jurisdiction: "INTERNACIONAL",
    retrieved_at: HOJE,
    integrity: { sha256: "NOT_AVAILABLE", reason: "documento-fonte nao preservado no pacote de evidencia (as capturas so contem o parecer do CFM); a fonte nao tem hash verificavel", artifact_ref: null, snapshot_ref: "PENDING_SNAPSHOT" },
    effective_from: "2000-01-01",
    license_ref: "WHO-IRIS",
    language: "en",
    citacao:
      "World Health Organization. Obesity: preventing and managing the global epidemic. Geneva: WHO; 2000. Cortes de IMC para adultos.",
  },
  {
    schema_version: "0.1.0",
    canonical_id: "SRC-APGAR-1953",
    version: "1.0.0",
    status: "REVIEW_REQUIRED",
    updated_at: HOJE,
    provenance_refs: ["SRC-CKO-POL-UT-001"],
    source_type: "PRIMARY_STUDY",
    source_type_rationale: "artigo cientifico original do metodo de Apgar",
    title: "A proposal for a new method of evaluation of the newborn infant",
    authority: "Current Researches in Anesthesia & Analgesia",
    locator: { uri: "https://pubmed.ncbi.nlm.nih.gov/", pinpoint: "Apgar V. Curr Res Anesth Analg. 1953;32(4):260-267" },
    rights: "LICENSED",
    jurisdiction: "INTERNACIONAL",
    retrieved_at: HOJE,
    integrity: { sha256: "NOT_AVAILABLE", reason: "documento-fonte nao preservado no pacote de evidencia (as capturas so contem o parecer do CFM); a fonte nao tem hash verificavel", artifact_ref: null, snapshot_ref: "PENDING_SNAPSHOT" },
    effective_from: "1953-01-01",
    language: "en",
    citacao: "Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-267.",
  },
  {
    schema_version: "0.1.0",
    canonical_id: "SRC-GOTEJAMENTO-FORMULA-CLASSICA",
    version: "1.0.0",
    status: "REVIEW_REQUIRED",
    updated_at: HOJE,
    provenance_refs: ["SRC-CKO-POL-UT-001"],
    source_type: "STANDARD",
    source_type_rationale: "formula tecnica de nursing: padrao de pratica, nem norma nem lei",
    title: "Fórmula clássica de gotejamento",
    authority: "Prática assistencial de gotejamento",
    locator: { uri: "", pinpoint: "gts/min = (volume em mL × fator do equipo) / tempo em minutos" },
    rights: "PUBLIC_DOMAIN",
    jurisdiction: "BR",
    retrieved_at: HOJE,
    integrity: { sha256: "NOT_AVAILABLE", reason: "documento-fonte nao preservado no pacote de evidencia (as capturas so contem o parecer do CFM); a fonte nao tem hash verificavel", artifact_ref: null, snapshot_ref: "PENDING_SNAPSHOT" },
    language: "pt-BR",
    citacao: "Fórmula clássica de gotejamento: gotas/min = (volume em mL × fator do equipo) / tempo em minutos.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   BINDINGS POR CAMPO
   Um binding por criterio e por faixa. A autoridade vem da fonte; o campo
   declara o que ele e e a politica de privacidade que o campo obeyece.
   ═══════════════════════════════════════════════════════════════════════════ */
export const BINDINGS: AuthorityBinding[] = [];
export const CAMPOS: CampoDefinido[] = [];

/** Criterio clinico de uma escala: campo de entrada com binding a uma fonte. */
function criterioClinico(tool: string, criterioId: string, rotulo: string, sourceId: string, fonteId: string) {
  const campoPath = `tool.${tool}.criteria.${criterioId}`;
  const bindingId = `AB-${tool.toUpperCase()}-${criterioId.toUpperCase()}`;
  BINDINGS.push({
    schema_version: "0.1.0",
    canonical_id: bindingId,
    version: VERSAO,
    status: "HOLD_HUMAN",
    updated_at: HOJE,
    provenance_refs: [sourceId],
    field_path: campoPath,
    requirement_id: `UTC-018`,
    source_ids: [sourceId],
    authority_class: "CLINICAL_EVIDENCE",
    validity: { jurisdiction: "BR" },
    decision: "HOLD_HUMAN",
    validator_ids: [],
    evidence_bundle_ids: [],
    exception_reason:
      "Autoridade declarada, evidencia ausente: validator_ids e evidence_bundle_ids vazios. ALLOW exigiria ambos.",
  });
  CAMPOS.push({
    schema_version: "0.1.0",
    canonical_id: `FD-${tool.toUpperCase()}-${criterioId.toUpperCase()}`,
    version: VERSAO,
    status: "HOLD_HUMAN",
    updated_at: HOJE,
    provenance_refs: [sourceId],
    field_path: campoPath,
    semantic_concept_ref: `MD-${criterioId.toUpperCase()}`,
    value_type: "ORDINAL_SCORE",
    authority_binding_ref: bindingId,
    privacy_policy: "NOT_APPLICABLE",
    applicability_ref: "POP-ADULTO-GERAL",
    message_key: `${tool}.${criterioId}.help`,
  });
  void rotulo;
  void fonteId;
}

/** Faixa de classificacao: binding a fonte, porque o corte e um fato normativo. */
function faixaClinica(tool: string, faixaId: string, fonteId: string, fonteRef: string) {
  const campoPath = `tool.${tool}.bands.${faixaId}`;
  const bindingId = `AB-${tool.toUpperCase()}-BAND-${faixaId.toUpperCase()}`;
  BINDINGS.push({
    schema_version: "0.1.0",
    canonical_id: bindingId,
    version: VERSAO,
    status: "HOLD_HUMAN",
    updated_at: HOJE,
    provenance_refs: [fonteId],
    field_path: campoPath,
    requirement_id: "UTC-024",
    source_ids: [fonteRef],
    authority_class: "CLINICAL_EVIDENCE",
    validity: { jurisdiction: "BR" },
    decision: "HOLD_HUMAN",
    validator_ids: [],
    evidence_bundle_ids: [],
    exception_reason:
      "Faixa de escore declarada, evidencia ausente: validator_ids e evidence_bundle_ids vazios. ALLOW exigiria ambos.",
  });
}

/* ── Aldrete: 5 criterios + 3 faixas, todas ao CFM ─────────────────────── */
criterioClinico("aldrete", "atividade", "Atividade (motricidade)", "SRC-CFM-PARECER-28-2020", "SRC-CFM-PARECER-28-2020");
criterioClinico("aldrete", "respiracao", "Respiração", "SRC-CFM-PARECER-28-2020", "SRC-CFM-PARECER-28-2020");
criterioClinico("aldrete", "circulacao", "Circulação (PA)", "SRC-CFM-PARECER-28-2020", "SRC-CFM-PARECER-28-2020");
criterioClinico("aldrete", "consciencia", "Nível de consciência", "SRC-CFM-PARECER-28-2020", "SRC-CFM-PARECER-28-2020");
criterioClinico("aldrete", "saturacao", "Saturação de O² (SpO₂)", "SRC-CFM-PARECER-28-2020", "SRC-CFM-PARECER-28-2020");
faixaClinica("aldrete", "ok", "SRC-CFM-PARECER-28-2020", "SRC-CFM-PARECER-28-2020");
faixaClinica("aldrete", "warn", "SRC-CFM-PARECER-28-2020", "SRC-CFM-PARECER-28-2020");
faixaClinica("aldrete", "danger", "SRC-CFM-PARECER-28-2020", "SRC-CFM-PARECER-28-2020");

/* ── Braden ─────────────────────────────────────────────────────────────── */
for (const c of ["sensorial", "umidade", "atividade", "mobilidade", "nutricao", "friccao"]) {
  criterioClinico("braden", c, c, "SRC-REV-ENF-USP-BRADEN-1999", "SRC-REV-ENF-USP-BRADEN-1999");
}
for (const b of ["muitoAlto", "alto", "moderado", "baixo", "semRisco"]) {
  faixaClinica("braden", b, "SRC-REV-ENF-USP-BRADEN-1999", "SRC-REV-ENF-USP-BRADEN-1999");
}

/* ── Morse ──────────────────────────────────────────────────────────────── */
for (const c of ["quedas", "diagnostico", "auxilio", "venoso", "marcha", "mental"]) {
  criterioClinico("morse", c, c, "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA", "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA");
}
for (const b of ["baixo", "medio", "alto"]) {
  faixaClinica("morse", b, "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA", "SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA");
}

/* ── Apgar: so o artigo original — origem internacional ─────────────────── */
for (const c of ["aparencia", "pulso", "reflexo", "tonus", "cor"]) {
  criterioClinico("apgar", c, c, "SRC-APGAR-1953", "SRC-APGAR-1953");
}
for (const b of ["normal", "depressao", "grave"]) {
  faixaClinica("apgar", b, "SRC-APGAR-1953", "SRC-APGAR-1953");
}


/** Campo numerico de calculadora: binding a fonte da formula. */
function campoNumerico(tool: string, campoId: string, valueType: string, sourceId: string, unidade?: string) {
  const campoPath = `tool.${tool}.fields.${campoId}`;
  const bindingId = `AB-${tool.toUpperCase()}-${campoId.toUpperCase()}`;
  BINDINGS.push({
    schema_version: "0.1.0",
    canonical_id: bindingId,
    version: VERSAO,
    status: "HOLD_HUMAN",
    updated_at: HOJE,
    provenance_refs: [sourceId],
    field_path: campoPath,
    requirement_id: "UTC-018",
    source_ids: [sourceId],
    authority_class: "TECHNICAL_STANDARD",
    validity: { jurisdiction: "BR" },
    decision: "HOLD_HUMAN",
    validator_ids: [],
    evidence_bundle_ids: [],
    exception_reason:
      "Autoridade declarada, evidencia ausente: validator_ids e evidence_bundle_ids vazios. ALLOW exigiria ambos.",
  });
  CAMPOS.push({
    schema_version: "0.1.0",
    canonical_id: `FD-${tool.toUpperCase()}-${campoId.toUpperCase()}`,
    version: VERSAO,
    status: "HOLD_HUMAN",
    updated_at: HOJE,
    provenance_refs: [sourceId],
    field_path: campoPath,
    semantic_concept_ref: `MD-${campoId.toUpperCase()}`,
    value_type: valueType,
    authority_binding_ref: bindingId,
    privacy_policy: "NOT_APPLICABLE",
    applicability_ref: "POP-ADULTO-GERAL",
    message_key: `${tool}.${campoId}.help`,
    unit_ref: unidade,
  });
}

/* ── Gotejamento: formula classica, campos em mL e minutos ───────────────── */
campoNumerico("gotejamento", "volume", "QUANTITY", "SRC-GOTEJAMENTO-FORMULA-CLASSICA", "mL");
campoNumerico("gotejamento", "horas", "QUANTITY", "SRC-GOTEJAMENTO-FORMULA-CLASSICA", "h");
campoNumerico("gotejamento", "minutos", "QUANTITY", "SRC-GOTEJAMENTO-FORMULA-CLASSICA", "min");
campoNumerico("gotejamento", "fator", "ORDINAL_SCORE", "SRC-GOTEJAMENTO-FORMULA-CLASSICA");

/* ── IMC: peso e altura, cortes da OMS ───────────────────────────────────── */
campoNumerico("imc", "peso", "QUANTITY", "SRC-OMS-OBESIDADE-2000", "kg");
campoNumerico("imc", "altura", "QUANTITY", "SRC-OMS-OBESIDADE-2000", "cm");


/* ═══════════════════════════════════════════════════════════════════════════
   CONTEXTO ASSISTENCIAL — emenda v1.2.0
   Opcionais, mascarados, sem captura LGPD. O binding NAO e clinico: e
   configuracao interna governada (UTC-002 permite "configuracao interna
   governada quando o campo nao for clinico/normativo").
   ═══════════════════════════════════════════════════════════════════════════ */
export const CAMPOS_CONTEXTO: CampoDefinido[] = [
  ["nome", "Nome do paciente", "DIRECT_IDENTIFIER"],
  ["idade", "Idade", "INDIRECT_IDENTIFIER"],
  ["setor", "Unidade / leito", "INDIRECT_IDENTIFIER"],
  ["data", "Data do atendimento", "INDIRECT_IDENTIFIER"],
].map(([id, rotulo, classe]) => ({
  schema_version: "0.1.0",
  canonical_id: `FD-CTX-${String(id).toUpperCase()}`,
  version: VERSAO,
  status: "HOLD_HUMAN" as const,
  updated_at: HOJE,
  provenance_refs: ["CKO-POL-UT-001@1.2.0"],
  field_path: `tool.contexto.${id}`,
  semantic_concept_ref: `CTX-${classe}`,
  value_type: "FREE_TEXT",
  authority_binding_ref: `AB-CTX-${String(id).toUpperCase()}`,
  privacy_policy: "EPHEMERAL_NOT_CAPTURED",
  applicability_ref: "NOT_APPLICABLE_JUSTIFIED",
  message_key: `contexto.${id}.ajuda`,
}));

for (const c of CAMPOS_CONTEXTO) {
  BINDINGS.push({
    schema_version: "0.1.0",
    canonical_id: c.authority_binding_ref,
    version: VERSAO,
    status: "HOLD_HUMAN",
    updated_at: HOJE,
    provenance_refs: ["CKO-POL-UT-001@1.2.0"],
    field_path: c.field_path,
    requirement_id: "UTC-016",
    source_ids: [],
    authority_class: "INTERNAL_NONCLINICAL",
    validity: { jurisdiction: "BR" },
    decision: "HOLD_HUMAN",
    validator_ids: [],
    evidence_bundle_ids: [],
    exception_reason:
      "Campo de contexto: sem autoridade externa e sem fonte; configuracao interna governada, decisao pendente de aprovacao humana.",
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRIVACY PROFILE — a emenda v1.2.0, em forma de contrato
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * Estrategia de mascara por campo.
 *   FULL    — oculta o valor (nome: "M•••• S••••")
 *   PARTIAL — oculta a parte que identifica, preserva a clinica (setor: "UT••••12")
 *   NONE    — preserva o valor: e dado clinico/calendario, nao identifica sozinho
 * A idade e a data ficam NONE de proposito: mascarar a idade para "••" inutiliza a
 * ficha que o profissional quer imprimir. A decisao final e do dono.
 */
export const ESTRATEGIA_MASCARA: Record<string, "FULL" | "PARTIAL" | "NONE"> = {
  nome: "FULL",
  idade: "NONE",
  setor: "PARTIAL",
  data: "NONE",
};

export const PRIVACY_PROFILE: PrivacyProfile = {
  sensitive_capture: "NO_SENSITIVE_CAPTURE",
  lgpd_capture: "NO_LGPD_CAPTURE",
  optional_context_fields: CAMPOS_CONTEXTO.map((c) => ({
    field_path: c.field_path,
    masked: ESTRATEGIA_MASCARA[c.field_path.split(".").pop() ?? ""] !== "NONE",
    mask_strategy: ESTRATEGIA_MASCARA[c.field_path.split(".").pop() ?? ""] ?? "FULL",
    capture: "DISABLED" as const,
  })),
  forbidden_fields: [
    "cpf",
    "prontuario",
    "email",
    "telefone",
    "endereco",
    "geolocalizacao",
    "identificador_de_dispositivo",
    "texto_livre_clinico",
  ],
  persistence: "NONE",
  transmission: "NONE",
  analytics: "EXCLUDED",
  advertising: "EXCLUDED",
  logs: "EXCLUDED",
};

export function fontePorId(id: string): FonteNormativa | undefined {
  return FONTES.find((f) => f.canonical_id === id);
}
