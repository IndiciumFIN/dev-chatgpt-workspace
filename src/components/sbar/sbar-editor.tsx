import { useState } from "react";
import { EditIcon, TrashIcon, PlusIcon, CopyIcon, CheckIcon, FileTextIcon, DownloadIcon } from "lucide-react";
import { useHandoffs, exportAll } from "@/lib/sbar/store";
import {
  SHIFT_LABELS, SEVERITY_LABELS, SEVERITY_TONE, SEX_LABELS, ISOLATION_LABELS,
  FALL_RISK_LABELS, PRESSURE_RISK_LABELS,
  createEmptyHandoff, generateId,
  type SbarHandoff, type SbarSeverity, type Shift, type PatientSex, type IsolationPrecaution, type FallRisk, type PressureInjuryRisk, type CriticalItem,
} from "@/lib/sbar/types";

export function SbarEditor() {
  const { items, upsert, remove } = useHandoffs();
  const [editing, setEditing] = useState<SbarHandoff | null>(null);
  const [viewing, setViewing] = useState<SbarHandoff | null>(null);

  function handleExport() {
    const backup = exportAll();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sbar-handoffs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (editing) {
    return <HandoffForm handoff={editing} onSave={(h) => { upsert(h); setEditing(null); }} onCancel={() => setEditing(null)} />;
  }
  if (viewing) {
    return <HandoffView handoff={viewing} onEdit={() => { setEditing(viewing); setViewing(null); }} onClose={() => setViewing(null)} />;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Passagens de Plantão — {items.length}</h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setEditing(createEmptyHandoff())} className="ce-btn ce-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <PlusIcon size={16} /> Nova passagem
          </button>
          {items.length > 0 && (
            <button onClick={handleExport} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <DownloadIcon size={16} /> Exportar
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted, #666)", border: "1px dashed var(--border, #ccc)", borderRadius: "0.4rem" }}>
          <p style={{ marginBottom: "0.5rem" }}>Nenhuma passagem registrada.</p>
          <p>Clique em "Nova passagem" para estruturar um handoff SBAR.</p>
        </div>
      ) : (
        <ul style={listStyle}>
          {[...items]
            .sort((a, b) => (b.handoff_context.handoff_at || "").localeCompare(a.handoff_context.handoff_at || ""))
            .map((h) => (
              <li key={h.canonical_id} style={{ ...listItemStyle, borderLeft: `3px solid ${severityColor(h.severity)}` }}>
                <button onClick={() => setViewing(h)} style={{ flex: 1, textAlign: "left", background: "transparent", border: "none", padding: 0, cursor: "pointer", minWidth: 0 }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted, #888)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {SHIFT_LABELS[h.handoff_context.from_shift]} → {SHIFT_LABELS[h.handoff_context.to_shift]} · {new Date(h.handoff_context.handoff_at).toLocaleString("pt-BR")}
                  </div>
                  <div style={{ fontWeight: 600, marginTop: "0.15rem" }}>
                    {h.situation.patient_id || "[Sem paciente]"} — {h.handoff_context.location || "[Sem local]"}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>
                    {h.situation.reason.slice(0, 100)}{h.situation.reason.length > 100 ? "..." : ""}
                  </div>
                  <span style={{ display: "inline-block", fontSize: "0.7rem", padding: "0.1rem 0.4rem", background: severityColor(h.severity), color: "white", borderRadius: "0.2rem", marginTop: "0.25rem" }}>
                    {SEVERITY_LABELS[h.severity]}
                  </span>
                </button>
                <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                  <button onClick={() => setEditing(h)} className="ce-btn ce-btn-ghost ce-btn-icon" title="Editar"><EditIcon size={14} /></button>
                  <button onClick={() => { if (confirm("Excluir passagem?")) remove(h.canonical_id); }} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }} title="Excluir"><TrashIcon size={14} /></button>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================
// Form
// ============================================================

function HandoffForm({ handoff, onSave, onCancel }: { handoff: SbarHandoff; onSave: (h: SbarHandoff) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<SbarHandoff>(handoff);

  function patch<K extends keyof SbarHandoff>(k: K, v: SbarHandoff[K]) { setDraft((d) => ({ ...d, [k]: v })); }
  function patchContext<K extends keyof SbarHandoff["handoff_context"]>(k: K, v: any) {
    setDraft((d) => ({ ...d, handoff_context: { ...d.handoff_context, [k]: v } }));
  }
  function patchSituation<K extends keyof SbarHandoff["situation"]>(k: K, v: any) {
    setDraft((d) => ({ ...d, situation: { ...d.situation, [k]: v } }));
  }
  function patchBackground<K extends keyof SbarHandoff["background"]>(k: K, v: any) {
    setDraft((d) => ({ ...d, background: { ...d.background, [k]: v } }));
  }
  function patchVital<K extends keyof NonNullable<SbarHandoff["background"]["vital_signs_last"]>>(k: K, v: number | undefined) {
    setDraft((d) => ({ ...d, background: { ...d.background, vital_signs_last: { ...d.background.vital_signs_last, [k]: v } } }));
  }
  function patchAssessment<K extends keyof SbarHandoff["assessment"]>(k: K, v: any) {
    setDraft((d) => ({ ...d, assessment: { ...d.assessment, [k]: v } }));
  }
  function patchRisk<K extends keyof NonNullable<SbarHandoff["assessment"]["risk_assessments"]>>(k: K, v: any) {
    setDraft((d) => ({ ...d, assessment: { ...d.assessment, risk_assessments: { ...d.assessment.risk_assessments, [k]: v } } }));
  }
  function patchRecommendation<K extends keyof SbarHandoff["recommendation"]>(k: K, v: any) {
    setDraft((d) => ({ ...d, recommendation: { ...d.recommendation, [k]: v } }));
  }
  function toggleCritical(idx: number) {
    if (!draft.critical_items) return;
    const next = [...draft.critical_items];
    next[idx] = { ...next[idx], checked: !next[idx].checked };
    patch("critical_items", next);
  }
  function addCritical() {
    patch("critical_items", [...(draft.critical_items || []), { item: "", checked: false }]);
  }
  function patchCriticalItem(idx: number, key: "item" | "notes", value: string) {
    if (!draft.critical_items) return;
    const next = [...draft.critical_items];
    next[idx] = { ...next[idx], [key]: value };
    patch("critical_items", next);
  }
  function removeCritical(idx: number) {
    if (!draft.critical_items) return;
    patch("critical_items", draft.critical_items.filter((_, i) => i !== idx));
  }

  // Helper para listas (allergies, comorbidities, etc.)
  function ListField({ label, items, onAdd, onRemove, placeholder }: { label: string; items: string[] | undefined; onAdd: (v: string) => void; onRemove: (idx: number) => void; placeholder: string }) {
    const [input, setInput] = useState("");
    return (
      <Field label={label}>
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem" }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (input.trim()) { onAdd(input.trim()); setInput(""); } } }} style={inputStyle} placeholder={placeholder} />
          <button type="button" onClick={() => { if (input.trim()) { onAdd(input.trim()); setInput(""); } }} className="ce-btn ce-btn-ghost">+</button>
        </div>
        {(items || []).length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.2rem" }}>
            {(items || []).map((x, i) => (
              <li key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.2rem 0.4rem", background: "var(--surface-2, #f5f5f5)", borderRadius: "0.2rem", fontSize: "0.85rem" }}>
                <span>{x}</span>
                <button type="button" onClick={() => onRemove(i)} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ padding: "0.1rem 0.3rem" }}><TrashIcon size={12} /></button>
              </li>
            ))}
          </ul>
        )}
      </Field>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...draft, updated_at: new Date().toISOString().slice(0, 10) }); }} style={formStyle}>
      <h4 style={{ marginTop: 0 }}>Passagem de plantão SBAR</h4>
      <div style={{ display: "grid", gap: "1rem" }}>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Contexto da passagem</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.5rem" }}>
            <Field label="Turno de origem" required>
              <select value={draft.handoff_context.from_shift} onChange={(e) => patchContext("from_shift", e.target.value as Shift)} style={inputStyle}>
                {Object.entries(SHIFT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Turno de destino" required>
              <select value={draft.handoff_context.to_shift} onChange={(e) => patchContext("to_shift", e.target.value as Shift)} style={inputStyle}>
                {Object.entries(SHIFT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Local/Setor/Leito" required>
              <input type="text" value={draft.handoff_context.location} onChange={(e) => patchContext("location", e.target.value)} style={inputStyle} placeholder="Ex.: UTI-Adulto / Leito 12" required />
            </Field>
            <Field label="Data/hora da passagem" required>
              <input type="datetime-local" value={draft.handoff_context.handoff_at.slice(0, 16)} onChange={(e) => patchContext("handoff_at", new Date(e.target.value).toISOString())} style={inputStyle} required />
            </Field>
            <Field label="Profissional que passa (Coren)">
              <input type="text" value={draft.handoff_context.from_professional || ""} onChange={(e) => patchContext("from_professional", e.target.value)} style={inputStyle} placeholder="Nome / COREN-SP 123456" />
            </Field>
            <Field label="Profissional que recebe (Coren)">
              <input type="text" value={draft.handoff_context.to_professional || ""} onChange={(e) => patchContext("to_professional", e.target.value)} style={inputStyle} placeholder="Nome / COREN-SP 123456" />
            </Field>
          </div>
          <Field label="Severidade" required>
            <select value={draft.severity} onChange={(e) => patch("severity", e.target.value as SbarSeverity)} style={inputStyle}>
              {Object.entries(SEVERITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>S — Situation</legend>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
            <Field label="Identificação do paciente" required>
              <input type="text" value={draft.situation.patient_id} onChange={(e) => patchSituation("patient_id", e.target.value)} style={inputStyle} placeholder="Iniciais ou prontuário" required />
            </Field>
            <Field label="Idade">
              <input type="number" min={0} value={draft.situation.patient_age ?? ""} onChange={(e) => patchSituation("patient_age", e.target.value ? Number(e.target.value) : undefined)} style={inputStyle} />
            </Field>
            <Field label="Sexo">
              <select value={draft.situation.patient_sex || "UNKNOWN"} onChange={(e) => patchSituation("patient_sex", e.target.value as PatientSex)} style={inputStyle}>
                {Object.entries(SEX_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Motivo da internação/atendimento" required>
            <textarea value={draft.situation.reason} onChange={(e) => patchSituation("reason", e.target.value)} style={{ ...inputStyle, minHeight: "3rem", resize: "vertical" }} placeholder="Ex.: Pós-operatório de colecistectomia, DPOC descompensada..." required />
          </Field>
          <ListField label="Alergias" items={draft.situation.allergies} onAdd={(v) => patchSituation("allergies", [...(draft.situation.allergies || []), v])} onRemove={(i) => patchSituation("allergies", (draft.situation.allergies || []).filter((_, idx) => idx !== i))} placeholder="Ex.: Penicilina, Dipirona" />
          <Field label="Precauções de isolamento">
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {Object.entries(ISOLATION_LABELS).map(([k, v]) => {
                const checked = (draft.situation.isolation_precautions || []).includes(k as IsolationPrecaution);
                return (
                  <label key={k} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.9rem" }}>
                    <input type="checkbox" checked={checked} onChange={() => {
                      const list = draft.situation.isolation_precautions || [];
                      patchSituation("isolation_precautions", checked ? list.filter((x) => x !== k) : [...list, k as IsolationPrecaution]);
                    }} />
                    {v}
                  </label>
                );
              })}
            </div>
          </Field>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>B — Background</legend>
          <Field label="Histórico clínico relevante" required>
            <textarea value={draft.background.clinical_history} onChange={(e) => patchBackground("clinical_history", e.target.value)} style={{ ...inputStyle, minHeight: "4rem", resize: "vertical" }} placeholder="HAS, DM2, DPOC... Cirurgias prévias... Internações prévias..." required />
          </Field>
          <ListField label="Comorbidades" items={draft.background.comorbidities} onAdd={(v) => patchBackground("comorbidities", [...(draft.background.comorbidities || []), v])} onRemove={(i) => patchBackground("comorbidities", (draft.background.comorbidities || []).filter((_, idx) => idx !== i))} placeholder="Ex.: Diabetes, HAS" />
          <ListField label="Medicações em uso" items={draft.background.medications_current} onAdd={(v) => patchBackground("medications_current", [...(draft.background.medications_current || []), v])} onRemove={(i) => patchBackground("medications_current", (draft.background.medications_current || []).filter((_, idx) => idx !== i))} placeholder="Ex.: Losartana 50mg, Insulina NPH" />
          <ListField label="Acessos, drenos e sondas" items={draft.background.lines_drains} onAdd={(v) => patchBackground("lines_drains", [...(draft.background.lines_drains || []), v])} onRemove={(i) => patchBackground("lines_drains", (draft.background.lines_drains || []).filter((_, idx) => idx !== i))} placeholder="Ex.: CVC jugular direita, SVD, dreno tuboquadente" />
          <Field label="Sinais vitais atuais">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "0.5rem" }}>
              <SmallNum label="PAS (mmHg)" value={draft.background.vital_signs_last?.pas} onChange={(v) => patchVital("pas", v)} />
              <SmallNum label="PAD (mmHg)" value={draft.background.vital_signs_last?.pad} onChange={(v) => patchVital("pad", v)} />
              <SmallNum label="FC (bpm)" value={draft.background.vital_signs_last?.fc} onChange={(v) => patchVital("fc", v)} />
              <SmallNum label="FR (ipm)" value={draft.background.vital_signs_last?.fr} onChange={(v) => patchVital("fr", v)} />
              <SmallNum label="Tax (°C)" value={draft.background.vital_signs_last?.tax} onChange={(v) => patchVital("tax", v)} />
              <SmallNum label="SpO2 (%)" value={draft.background.vital_signs_last?.spo2} onChange={(v) => patchVital("spo2", v)} />
              <SmallNum label="Glasgow (3-15)" value={draft.background.vital_signs_last?.glasgow} onChange={(v) => patchVital("glasgow", v)} />
            </div>
          </Field>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>A — Assessment</legend>
          <Field label="Estado atual e principais achados" required>
            <textarea value={draft.assessment.current_status} onChange={(e) => patchAssessment("current_status", e.target.value)} style={{ ...inputStyle, minHeight: "3rem", resize: "vertical" }} placeholder="Ex.: Paciente estável, lúcido, sem queixas. Ferida operarória em cicatrização." required />
          </Field>
          <ListField label="Exames pendentes" items={draft.assessment.pending_results} onAdd={(v) => patchAssessment("pending_results", [...(draft.assessment.pending_results || []), v])} onRemove={(i) => patchAssessment("pending_results", (draft.assessment.pending_results || []).filter((_, idx) => idx !== i))} placeholder="Ex.: Hemograma, RX tórax" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.5rem" }}>
            <Field label="Braden (6-23)">
              <input type="number" min={6} max={23} value={draft.assessment.risk_assessments?.braden_score ?? ""} onChange={(e) => patchRisk("braden_score", e.target.value ? Number(e.target.value) : undefined)} style={inputStyle} />
            </Field>
            <Field label="Morse (0-125)">
              <input type="number" min={0} max={125} value={draft.assessment.risk_assessments?.morse_score ?? ""} onChange={(e) => patchRisk("morse_score", e.target.value ? Number(e.target.value) : undefined)} style={inputStyle} />
            </Field>
            <Field label="Risco de queda">
              <select value={draft.assessment.risk_assessments?.fall_risk || ""} onChange={(e) => patchRisk("fall_risk", e.target.value || undefined)} style={inputStyle}>
                <option value="">—</option>
                {Object.entries(FALL_RISK_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Risco de LPP">
              <select value={draft.assessment.risk_assessments?.pressure_injury_risk || ""} onChange={(e) => patchRisk("pressure_injury_risk", e.target.value || undefined)} style={inputStyle}>
                <option value="">—</option>
                {Object.entries(PRESSURE_RISK_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>R — Recommendation</legend>
          <Field label="Plano de cuidado para o próximo turno" required>
            <textarea value={draft.recommendation.plan} onChange={(e) => patchRecommendation("plan", e.target.value)} style={{ ...inputStyle, minHeight: "3rem", resize: "vertical" }} placeholder="Ex.: Manter antibioticoterapia, curativo às 14h, deambular com auxílio." required />
          </Field>
          <ListField label="Medicações a administrar" items={draft.recommendation.medications_to_administer} onAdd={(v) => patchRecommendation("medications_to_administer", [...(draft.recommendation.medications_to_administer || []), v])} onRemove={(i) => patchRecommendation("medications_to_administer", (draft.recommendation.medications_to_administer || []).filter((_, idx) => idx !== i))} placeholder="Ex.: Amoxicilina 500mg 12/12h" />
          <ListField label="Procedimentos agendados" items={draft.recommendation.procedures_scheduled} onAdd={(v) => patchRecommendation("procedures_scheduled", [...(draft.recommendation.procedures_scheduled || []), v])} onRemove={(i) => patchRecommendation("procedures_scheduled", (draft.recommendation.procedures_scheduled || []).filter((_, idx) => idx !== i))} placeholder="Ex.: Troca de CVC, fisioterapia 10h" />
          <ListField label="Alertas para monitorar" items={draft.recommendation.alerts_to_monitor} onAdd={(v) => patchRecommendation("alerts_to_monitor", [...(draft.recommendation.alerts_to_monitor || []), v])} onRemove={(i) => patchRecommendation("alerts_to_monitor", (draft.recommendation.alerts_to_monitor || []).filter((_, idx) => idx !== i))} placeholder="Ex.: Diurese < 30ml/h, SpO2 < 92%" />
          <Field label="Critério de escalation (quando chamar médico)">
            <textarea value={draft.recommendation.escalation_criteria || ""} onChange={(e) => patchRecommendation("escalation_criteria", e.target.value)} style={{ ...inputStyle, minHeight: "2rem", resize: "vertical" }} placeholder="Ex.: FC > 120 ou < 50, FR > 28, PAS < 90 — chamar plantão médico" />
          </Field>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Checklist crítico</legend>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>{(draft.critical_items || []).filter((x) => x.checked).length} de {(draft.critical_items || []).length} conferidos</span>
            <button type="button" onClick={addCritical} className="ce-btn ce-btn-ghost" style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}>+ Item</button>
          </div>
          {(draft.critical_items || []).map((item, idx) => (
            <div key={idx} style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.3rem", padding: "0.3rem 0.4rem", background: item.checked ? "var(--success-soft, #e8f5e8)" : "var(--surface-2, #f5f5f5)", borderRadius: "0.3rem" }}>
              <input type="checkbox" checked={item.checked} onChange={() => toggleCritical(idx)} />
              <input type="text" value={item.item} onChange={(e) => patchCriticalItem(idx, "item", e.target.value)} style={{ ...inputStyle, flex: 1, padding: "0.3rem 0.4rem", fontSize: "0.85rem" }} placeholder="Item a conferir" />
              <button type="button" onClick={() => removeCritical(idx)} className="ce-btn ce-btn-ghost ce-btn-icon"><TrashIcon size={12} /></button>
            </div>
          ))}
        </fieldset>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">Cancelar</button>
          <button type="submit" className="ce-btn ce-btn-primary">Salvar passagem</button>
        </div>
      </div>
    </form>
  );
}

// ============================================================
// View (resumo formatado)
// ============================================================

function HandoffView({ handoff, onEdit, onClose }: { handoff: SbarHandoff; onEdit: () => void; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const text = formatHandoff(handoff);

  function copyToClipboard() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div style={{ border: "1px solid var(--border, #ccc)", borderRadius: "0.4rem", padding: "1.25rem", background: "var(--surface, #fff)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted, #666)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {SHIFT_LABELS[handoff.handoff_context.from_shift]} → {SHIFT_LABELS[handoff.handoff_context.to_shift]} · {new Date(handoff.handoff_context.handoff_at).toLocaleString("pt-BR")}
          </div>
          <h3 style={{ margin: "0.2rem 0 0 0" }}>
            {handoff.situation.patient_id} — {handoff.handoff_context.location}
          </h3>
          <span style={{ display: "inline-block", fontSize: "0.75rem", padding: "0.1rem 0.5rem", background: severityColor(handoff.severity), color: "white", borderRadius: "0.2rem", marginTop: "0.3rem" }}>
            {SEVERITY_LABELS[handoff.severity]}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
          <button onClick={copyToClipboard} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            {copied ? "Copiado!" : "Copiar texto"}
          </button>
          <button onClick={onEdit} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <EditIcon size={14} /> Editar
          </button>
          <button onClick={onClose} className="ce-btn ce-btn-ghost">Fechar</button>
        </div>
      </div>

      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "0.95rem", lineHeight: 1.6, background: "var(--surface-2, #fafafa)", padding: "1rem", borderRadius: "0.4rem", margin: 0 }}>
        {text}
      </pre>

      <div style={{ marginTop: "1rem", padding: "0.6rem 0.75rem", background: "var(--accent-soft, #f5f8fc)", borderRadius: "0.3rem", fontSize: "0.8rem" }}>
        <strong>Campos canônicos:</strong> {handoff.canonical_id} · status: <code>{handoff.status}</code> · versão: <code>{handoff.version}</code> · schema: <code>sbar_handoff.schema.json v0.1.0</code>
      </div>
    </div>
  );
}

function formatHandoff(h: SbarHandoff): string {
  const lines: string[] = [];
  const ctx = h.handoff_context;
  lines.push(`# PASSAGEM DE PLANTÃO SBAR — ${SEVERITY_LABELS[h.severity].toUpperCase()}`);
  lines.push(`\n**Contexto:** ${SHIFT_LABELS[ctx.from_shift]} → ${SHIFT_LABELS[ctx.to_shift]}`);
  lines.push(`**Local:** ${ctx.location}`);
  lines.push(`**Data/hora:** ${new Date(ctx.handoff_at).toLocaleString("pt-BR")}`);
  if (ctx.from_professional) lines.push(`**Profissional que passa:** ${ctx.from_professional}`);
  if (ctx.to_professional) lines.push(`**Profissional que recebe:** ${ctx.to_professional}`);

  const s = h.situation;
  lines.push(`\n## S — SITUAÇÃO`);
  lines.push(`**Paciente:** ${s.patient_id}`);
  if (s.patient_age) lines.push(`**Idade:** ${s.patient_age} anos`);
  if (s.patient_sex && s.patient_sex !== "UNKNOWN") lines.push(`**Sexo:** ${SEX_LABELS[s.patient_sex]}`);
  lines.push(`**Motivo:** ${s.reason}`);
  if (s.allergies && s.allergies.length > 0) lines.push(`**Alergias:** ${s.allergies.join(", ")}`);
  if (s.isolation_precautions && s.isolation_precautions.length > 0) {
    lines.push(`**Precauções:** ${s.isolation_precautions.map((p) => ISOLATION_LABELS[p]).join(", ")}`);
  }

  const b = h.background;
  lines.push(`\n## B — BACKGROUND`);
  lines.push(`**Histórico clínico:** ${b.clinical_history}`);
  if (b.comorbidities && b.comorbidities.length > 0) lines.push(`**Comorbidades:** ${b.comorbidities.join(", ")}`);
  if (b.medications_current && b.medications_current.length > 0) lines.push(`**Medicações:** ${b.medications_current.join(", ")}`);
  if (b.lines_drains && b.lines_drains.length > 0) lines.push(`**Acessos/drenos:** ${b.lines_drains.join(", ")}`);
  const vs = b.vital_signs_last;
  if (vs) {
    const parts: string[] = [];
    if (vs.pas) parts.push(`PA ${vs.pas}/${vs.pad || "—"}`);
    if (vs.fc) parts.push(`FC ${vs.fc}`);
    if (vs.fr) parts.push(`FR ${vs.fr}`);
    if (vs.tax) parts.push(`Tax ${vs.tax}°C`);
    if (vs.spo2) parts.push(`SpO2 ${vs.spo2}%`);
    if (vs.glasgow) parts.push(`Glasgow ${vs.glasgow}`);
    if (parts.length > 0) lines.push(`**Sinais vitais:** ${parts.join(" · ")}`);
  }

  const a = h.assessment;
  lines.push(`\n## A — AVALIAÇÃO`);
  lines.push(`**Estado atual:** ${a.current_status}`);
  if (a.pending_results && a.pending_results.length > 0) lines.push(`**Exames pendentes:** ${a.pending_results.join(", ")}`);
  const r = a.risk_assessments;
  if (r) {
    const rp: string[] = [];
    if (r.braden_score) rp.push(`Braden ${r.braden_score}`);
    if (r.morse_score) rp.push(`Morse ${r.morse_score}`);
    if (r.fall_risk) rp.push(`Risco queda: ${FALL_RISK_LABELS[r.fall_risk]}`);
    if (r.pressure_injury_risk) rp.push(`Risco LPP: ${PRESSURE_RISK_LABELS[r.pressure_injury_risk]}`);
    if (rp.length > 0) lines.push(`**Avaliações de risco:** ${rp.join(" · ")}`);
  }

  const rec = h.recommendation;
  lines.push(`\n## R — RECOMENDAÇÃO`);
  lines.push(`**Plano:** ${rec.plan}`);
  if (rec.medications_to_administer && rec.medications_to_administer.length > 0) lines.push(`**Medicações a administrar:**\n${rec.medications_to_administer.map((m) => `  - ${m}`).join("\n")}`);
  if (rec.procedures_scheduled && rec.procedures_scheduled.length > 0) lines.push(`**Procedimentos agendados:**\n${rec.procedures_scheduled.map((p) => `  - ${p}`).join("\n")}`);
  if (rec.alerts_to_monitor && rec.alerts_to_monitor.length > 0) lines.push(`**Alertas para monitorar:**\n${rec.alerts_to_monitor.map((al) => `  ⚠ ${al}`).join("\n")}`);
  if (rec.escalation_criteria) lines.push(`**Critério de escalation:** ${rec.escalation_criteria}`);

  if (h.critical_items && h.critical_items.length > 0) {
    lines.push(`\n## CHECKLIST CRÍTICO`);
    h.critical_items.forEach((item) => {
      lines.push(`${item.checked ? "[✓]" : "[ ]"} ${item.item}${item.notes ? ` — ${item.notes}` : ""}`);
    });
  }

  lines.push(`\n---`);
  lines.push(`*Status canônico: ${h.status} · Versão: ${h.version} · ID: ${h.canonical_id}*`);
  return lines.join("\n");
}

function severityColor(s: SbarSeverity): string {
  return SEVERITY_TONE[s] === "danger" ? "var(--danger, #c0392b)"
    : SEVERITY_TONE[s] === "warn" ? "var(--warn, #c47b00)"
    : "var(--accent, #0a66c2)";
}

// ============================================================
// Estilos compartilhados
// ============================================================
const listStyle: React.CSSProperties = { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" };
const listItemStyle: React.CSSProperties = { border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.6rem 0.75rem", background: "var(--surface, #fff)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.6rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.95rem", background: "var(--surface, #fff)" };
const formStyle: React.CSSProperties = { border: "1px solid var(--border, #ccc)", borderRadius: "0.4rem", padding: "1.25rem", background: "var(--surface, #fafafa)" };
const fieldsetStyle: React.CSSProperties = { border: "1px solid var(--border, #ddd)", borderRadius: "0.4rem", padding: "0.75rem 1rem 1rem", margin: 0 };
const legendStyle: React.CSSProperties = { fontWeight: 600, padding: "0 0.4rem", fontSize: "0.9rem" };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
        {label}{required && <span style={{ color: "var(--danger, #c0392b)" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function SmallNum({ label, value, onChange }: { label: string; value?: number; onChange: (v: number | undefined) => void }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--muted, #666)", marginBottom: "0.2rem" }}>{label}</label>
      <input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)} style={{ ...inputStyle, padding: "0.3rem 0.4rem", fontSize: "0.85rem" }} />
    </div>
  );
}
