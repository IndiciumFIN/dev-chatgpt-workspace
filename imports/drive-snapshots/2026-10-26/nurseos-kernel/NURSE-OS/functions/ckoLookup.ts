// NURSE-OS — CKO Lookup Service (v1.1 — handler defensivo)
// Agentes citam CKOs por URI (cko://domain/slug); este serviço resolve a URI
// e retorna o objeto canônico para grounding das afirmações clínicas.

const CKO_REGISTRY = {
  "medications/dipirona": {
    identity: {
      cko_uri: "cko://medications/dipirona",
      domain: "medications",
      slug: "dipirona",
      version: "1.0.0",
      name: "Dipirona sódica",
      names: { "pt-BR": "Dipirona sódica", en: "Metamizole sodium", es: "Dipirona sódica" }
    },
    classification: { atc: "N02BB02", who_essential: true, therapeutic_class: "analgésico não opioide / antipirético" },
    clinical: {
      indications: ["dor aguda leve a moderada", "febre", "dor pós-operatória"],
      contraindications: ["agranulocitose prévia", "hipersensibilidade a pirazolonas", "terceiro trimestre de gestação", "insuficiência hepática/renal grave"],
      warnings: ["risco de agranulocitose — monitorar febre/sinais de infecção", "hipotensão em administração IV rápida"],
      dosing: { adulto_oral: "500–1000 mg até 4x/dia (máx 4000 mg/dia)", adulto_iv: "1000–2000 mg diluído, infusão >= 15 min", pediatrico: "10–15 mg/kg/dose, máximo 4x/dia" },
      interactions: ["ciclosporina (reduz níveis)", "anticoagulantes (potencialização do efeito)"],
      monitoring: ["contagem de leucócitos em uso prolongado", "PA em via IV", "temperatura"]
    },
    nursing: {
      nic_refs: ["cko://procedures/medication-administration-iv", "cko://procedures/pain-assessment"],
      safer_use: ["administrar IV lentamente", "orientar paciente a reportar febre/angina/sinais infecciosos"],
      high_alert: false
    },
    governance: { sources: ["ANVISA", "FDA", "WHO EML"], last_review: "2026-09-02", reviewer: "Leivis Lima" }
  },
  "procedures/fall-prevention": {
    identity: { cko_uri: "cko://procedures/fall-prevention", domain: "procedures", slug: "fall-prevention", version: "1.0.0", name: "Prevenção de quedas" },
    clinical: { indications: ["pacientes com Morse >= 45", "uso de sedativos/anticoagulantes", "idade >= 65"], protocol: ["identificação por bracelete amarelo", "sinalização de risco no leito", "camas travadas e baixas", "chamada de emergência ao alcance"] },
    nursing: { nic_refs: ["cko://procedures/fall-prevention"], safer_use: ["reavaliar Morse a cada turno e após queda"] },
    governance: { sources: ["AORN", "diretrizes nacionais"], last_review: "2026-09-02" }
  },
  "microorganisms/mrsa": {
    identity: { cko_uri: "cko://microorganisms/mrsa", domain: "microorganisms", slug: "mrsa", version: "1.0.0", name: "Staphylococcus aureus resistente à meticilina (MRSA)" },
    clinical: { transmission: "contato direto / fomites", precautions: ["precaução de contato", "privativo preferencial", "higienização de mãos 5 momentos"] },
    governance: { sources: ["NCBI Taxonomy: 1280", "CDC MRSA guidelines"], last_review: "2026-09-02" }
  }
};

function extractRef(req) {
  const candidates = [];
  const push = (v) => { if (typeof v === "string" && v.length > 0) candidates.push(v); };
  // formas possíveis do request no runtime
  const shapes = [req, req && req.body, req && req.query_params, req && req.query, req && req.data];
  for (const s of shapes) {
    if (s && typeof s === "object") {
      push(s.ref); push(s.uri);
      if (typeof s.domain === "string" && typeof s.slug === "string" && s.domain && s.slug) {
        candidates.push(`${s.domain}/${s.slug}`);
      }
    }
  }
  return candidates.length ? candidates[0] : null;
}

export default async function (req) {
  try {
    let key = extractRef(req);
    if (!key) {
      return {
        status: 400,
        error: "BAD_REQUEST",
        message: "Informe ref=cko://<domain>/<slug> ou domain+slug",
        available_domains: ["medications", "procedures", "microorganisms"]
      };
    }
    key = key.replace(/^cko:\/\//, "").replace(/\/$/, "");

    const cko = CKO_REGISTRY[key];
    if (!cko) {
      return {
        status: 404,
        error: "CKO_NOT_FOUND",
        requested_ref: `cko://${key}`,
        message: "CKO não registrado — agente deve recusar afirmação sem grounding (POL-001/POL-004)."
      };
    }

    return {
      status: 200,
      cko,
      grounding: {
        resolved_ref: `cko://${key}`,
        version: cko.identity.version,
        retrieved_at: new Date().toISOString(),
        checksum_source: "governance.last_review"
      }
    };
  } catch (e) {
    return { status: 500, error: "INTERNAL", message: String(e && e.message ? e.message : e) };
  }
}
