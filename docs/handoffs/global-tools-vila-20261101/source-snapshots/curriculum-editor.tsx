import { useState } from "react";
import {
  UserIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  AwardIcon,
  LanguagesIcon,
  BookOpenIcon,
  TrophyIcon,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  UploadIcon,
} from "lucide-react";
import { useCurricula, exportAll, importAll } from "@/lib/career/store";
import type { CareerBackup } from "@/lib/career/store";
import { projectCV } from "@/lib/career/projector";
import {
  createEmptyCurriculum,
  PROJECTION_TARGET_LABELS,
  PRIVACY_PROFILE_LABELS,
  DEGREE_LABELS,
  SKILL_CATEGORY_LABELS,
  SKILL_LEVEL_LABELS,
  LANGUAGE_PROFICIENCY_LABELS,
  EVENT_TYPE_LABELS,
  EVENT_ROLE_LABELS,
  generateId,
  type Curriculum,
  type Education,
  type EducationDegree,
  type Experience,
  type Certification,
  type Skill,
  type SkillCategory,
  type SkillLevel,
  type Language,
  type LanguageProficiency,
  type Award,
  type Membership,
  type EventParticipation,
  type EventType,
  type EventRole,
  type ProjectionTarget,
  type PrivacyProfile,
} from "@/lib/career/types";
import { useReferences, useSources } from "@/lib/research/store";
import { formatReference } from "@/lib/research/abnt";

type Section =
  | "owner"
  | "summary"
  | "education"
  | "experience"
  | "publications"
  | "certifications"
  | "skills"
  | "languages"
  | "awards"
  | "memberships"
  | "events"
  | "preview";

const SECTIONS: { id: Section; label: string; icon: typeof UserIcon }[] = [
  { id: "owner", label: "Dados pessoais", icon: UserIcon },
  { id: "summary", label: "Resumo", icon: FileTextIcon },
  { id: "education", label: "Formação", icon: GraduationCapIcon },
  { id: "experience", label: "Experiência", icon: BriefcaseIcon },
  { id: "publications", label: "Publicações", icon: BookOpenIcon },
  { id: "certifications", label: "Certificações", icon: AwardIcon },
  { id: "skills", label: "Competências", icon: AwardIcon },
  { id: "languages", label: "Idiomas", icon: LanguagesIcon },
  { id: "awards", label: "Prêmios", icon: TrophyIcon },
  { id: "memberships", label: "Filiações", icon: UsersIcon },
  { id: "events", label: "Eventos", icon: CalendarIcon },
  { id: "preview", label: "Preview / Exportar", icon: EyeIcon },
];

export function CurriculumEditor() {
  const { items, upsert, remove } = useCurricula();
  const [activeCvId, setActiveCvId] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("owner");
  const [editing, setEditing] = useState(false);

  // CV ativo (ou cria um novo)
  const activeCv = items.find((c) => c.canonical_id === activeCvId) || null;

  function handleNew() {
    const cv = createEmptyCurriculum();
    upsert(cv);
    setActiveCvId(cv.canonical_id);
    setSection("owner");
    setEditing(true);
  }

  function handleExport() {
    const backup = exportAll();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `curriculos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result)) as CareerBackup;
        const n = importAll(backup);
        alert(`${n} currículo(s) importado(s).`);
      } catch (e) {
        alert(`Falha ao importar: ${e instanceof Error ? e.message : String(e)}`);
      }
    };
    reader.readAsText(file);
    ev.target.value = "";
  }

  // Se não há CV ativo e há CVs, seleciona o primeiro
  if (!activeCv && items.length > 0) {
    setActiveCvId(items[0].canonical_id);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
          Currículos — {items.length} cadastrado{items.length === 1 ? "" : "s"}
        </h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={handleNew} className="ce-btn ce-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <PlusIcon size={16} /> Novo currículo
          </button>
          <button onClick={handleExport} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <DownloadIcon size={16} /> Exportar
          </button>
          <label className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
            <UploadIcon size={16} /> Importar
            <input type="file" accept="application/json" onChange={handleImport} hidden />
          </label>
        </div>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "var(--muted, #666)",
            border: "1px dashed var(--border, #ccc)",
            borderRadius: "0.4rem",
          }}
        >
          <p style={{ marginBottom: "0.5rem" }}>Nenhum currículo cadastrado.</p>
          <p>Clique em "Novo currículo" para começar a montar seu CV.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1rem" }}>
          {/* Sidebar: lista de CVs */}
          <aside>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.25rem" }}>
              {items.map((cv) => (
                <li key={cv.canonical_id}>
                  <button
                    onClick={() => {
                      setActiveCvId(cv.canonical_id);
                      setSection("owner");
                      setEditing(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.6rem 0.75rem",
                      background:
                        cv.canonical_id === activeCvId
                          ? "var(--accent, #0a66c2)"
                          : "var(--surface, #fff)",
                      color: cv.canonical_id === activeCvId ? "white" : "inherit",
                      border: "1px solid var(--border, #e0e0e0)",
                      borderRadius: "0.3rem",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {cv.owner.full_name || "[Sem nome]"}
                    </div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                      {cv.owner.professional_id || "Sem registro"}
                    </div>
                    <div style={{ fontSize: "0.7rem", marginTop: "0.2rem", opacity: 0.7 }}>
                      {PROJECTION_TARGET_LABELS[cv.projection_target]}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Painel principal */}
          <div>
            {activeCv && (
              <>
                {/* Abas de seção */}
                <nav
                  style={{
                    display: "flex",
                    gap: "0.25rem",
                    flexWrap: "wrap",
                    marginBottom: "1rem",
                    borderBottom: "1px solid var(--border, #eee)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  {SECTIONS.map((s) => {
                    const Icon = s.icon;
                    const active = section === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSection(s.id)}
                        style={{
                          background: active ? "var(--accent-soft, #e8f0fe)" : "transparent",
                          color: active ? "var(--accent, #0a66c2)" : "inherit",
                          border: "1px solid " + (active ? "var(--accent, #0a66c2)" : "var(--border, #ddd)"),
                          padding: "0.4rem 0.7rem",
                          borderRadius: "0.3rem",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        <Icon size={14} />
                        {s.label}
                      </button>
                    );
                  })}
                </nav>

                {/* Conteúdo da seção */}
                {section === "owner" && (
                  <OwnerSection cv={activeCv} onSave={(c) => upsert(c)} editing={editing} setEditing={setEditing} />
                )}
                {section === "summary" && <SummarySection cv={activeCv} onSave={(c) => upsert(c)} />}
                {section === "education" && <EducationSection cv={activeCv} onSave={(c) => upsert(c)} />}
                {section === "experience" && <ExperienceSection cv={activeCv} onSave={(c) => upsert(c)} />}
                {section === "publications" && <PublicationsSection cv={activeCv} onSave={(c) => upsert(c)} />}
                {section === "certifications" && <CertificationsSection cv={activeCv} onSave={(c) => upsert(c)} />}
                {section === "skills" && <SkillsSection cv={activeCv} onSave={(c) => upsert(c)} />}
                {section === "languages" && <LanguagesSection cv={activeCv} onSave={(c) => upsert(c)} />}
                {section === "awards" && <AwardsSection cv={activeCv} onSave={(c) => upsert(c)} />}
                {section === "memberships" && <MembershipsSection cv={activeCv} onSave={(c) => upsert(c)} />}
                {section === "events" && <EventsSection cv={activeCv} onSave={(c) => upsert(c)} />}
                {section === "preview" && <PreviewSection cv={activeCv} onSave={(c) => upsert(c)} onRemove={(id) => { remove(id); setActiveCvId(null); }} />}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Seção: Dados Pessoais (Owner)
// ============================================================

function OwnerSection({
  cv,
  onSave,
  editing,
  setEditing,
}: {
  cv: Curriculum;
  onSave: (c: Curriculum) => void;
  editing: boolean;
  setEditing: (b: boolean) => void;
}) {
  const [draft, setDraft] = useState<Curriculum>(cv);

  function patchOwner<K extends keyof Curriculum["owner"]>(key: K, value: Curriculum["owner"][K]) {
    setDraft((d) => ({ ...d, owner: { ...d.owner, [key]: value } }));
  }
  function patchAddress<K extends keyof NonNullable<Curriculum["owner"]["address"]>>(key: K, value: string) {
    setDraft((d) => ({ ...d, owner: { ...d.owner, address: { ...d.owner.address, [key]: value } } }));
  }
  function patch<K extends keyof Curriculum>(key: K, value: Curriculum[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  if (!editing) {
    return (
      <SectionCard
        title="Dados pessoais"
        onEdit={() => setEditing(true)}
        content={
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <Row label="Nome completo" value={cv.owner.full_name || "[não preenchido]"} />
            <Row label="Registro profissional" value={cv.owner.professional_id || "—"} />
            {cv.owner.preferred_name && <Row label="Nome de citação" value={cv.owner.preferred_name} />}
            {cv.owner.email && <Row label="E-mail" value={cv.owner.email} />}
            {cv.owner.phone && <Row label="Telefone" value={cv.owner.phone} />}
            {cv.owner.orcid && <Row label="ORCID" value={cv.owner.orcid} />}
            {cv.owner.lattes_id && <Row label="Lattes ID" value={cv.owner.lattes_id} />}
            {cv.owner.linkedin_url && <Row label="LinkedIn" value={cv.owner.linkedin_url} />}
            {cv.owner.address?.city && (
              <Row label="Endereço" value={`${cv.owner.address.city}, ${cv.owner.address.state || "—"}, ${cv.owner.address.country || "Brasil"}`} />
            )}
            <Row label="Perfil de privacidade" value={PRIVACY_PROFILE_LABELS[cv.privacy_profile]} />
            <Row label="Projeção padrão" value={PROJECTION_TARGET_LABELS[cv.projection_target]} />
            <Row label="Status canônico" value={cv.status} />
          </div>
        }
      />
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...draft, updated_at: new Date().toISOString().slice(0, 10) });
        setEditing(false);
      }}
      style={formStyle}
    >
      <h4 style={{ marginTop: 0 }}>Dados pessoais</h4>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Field label="Nome completo" required>
          <input type="text" value={draft.owner.full_name} onChange={(e) => patchOwner("full_name", e.target.value)} style={inputStyle} placeholder="Ex.: Maria Aparecida da Silva" required />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="Registro profissional (COREN/CRM/etc.)" required>
            <input type="text" value={draft.owner.professional_id} onChange={(e) => patchOwner("professional_id", e.target.value)} style={inputStyle} placeholder="COREN-SP 123456" required />
          </Field>
          <Field label="Tipo de registro">
            <select value={draft.owner.professional_id_type || ""} onChange={(e) => patchOwner("professional_id_type", e.target.value as any)} style={inputStyle}>
              <option value="">Selecione...</option>
              <option value="COREN">COREN</option>
              <option value="CRM">CRM</option>
              <option value="CRF">CRF</option>
              <option value="CRFA">CRFA</option>
              <option value="CRO">CRO</option>
              <option value="CFE">CFE</option>
              <option value="OTHER">Outro</option>
            </select>
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
          <Field label="E-mail">
            <input type="email" value={draft.owner.email || ""} onChange={(e) => patchOwner("email", e.target.value)} style={inputStyle} placeholder="maria@exemplo.com" />
          </Field>
          <Field label="Telefone">
            <input type="tel" value={draft.owner.phone || ""} onChange={(e) => patchOwner("phone", e.target.value)} style={inputStyle} placeholder="(11) 99999-9999" />
          </Field>
          <Field label="Data de nascimento">
            <input type="date" value={draft.owner.birth_date || ""} onChange={(e) => patchOwner("birth_date", e.target.value)} style={inputStyle} />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="ORCID">
            <input type="text" value={draft.owner.orcid || ""} onChange={(e) => patchOwner("orcid", e.target.value)} style={inputStyle} placeholder="0000-0002-1234-5678" />
          </Field>
          <Field label="Lattes ID">
            <input type="text" value={draft.owner.lattes_id || ""} onChange={(e) => patchOwner("lattes_id", e.target.value)} style={inputStyle} placeholder="1234567890123456" />
          </Field>
        </div>
        <Field label="LinkedIn URL">
          <input type="url" value={draft.owner.linkedin_url || ""} onChange={(e) => patchOwner("linkedin_url", e.target.value)} style={inputStyle} placeholder="https://linkedin.com/in/maria-silva" />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
          <Field label="Cidade">
            <input type="text" value={draft.owner.address?.city || ""} onChange={(e) => patchAddress("city", e.target.value)} style={inputStyle} placeholder="São Paulo" />
          </Field>
          <Field label="Estado (UF)">
            <input type="text" value={draft.owner.address?.state || ""} onChange={(e) => patchAddress("state", e.target.value)} style={inputStyle} placeholder="SP" />
          </Field>
          <Field label="País">
            <input type="text" value={draft.owner.address?.country || "Brasil"} onChange={(e) => patchAddress("country", e.target.value)} style={inputStyle} />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="Perfil de privacidade">
            <select value={draft.privacy_profile} onChange={(e) => patch("privacy_profile", e.target.value as PrivacyProfile)} style={inputStyle}>
              {Object.entries(PRIVACY_PROFILE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Projeção padrão">
            <select value={draft.projection_target} onChange={(e) => patch("projection_target", e.target.value as ProjectionTarget)} style={inputStyle}>
              {Object.entries(PROJECTION_TARGET_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={() => setEditing(false)} className="ce-btn ce-btn-ghost">Cancelar</button>
          <button type="submit" className="ce-btn ce-btn-primary">Salvar</button>
        </div>
      </div>
    </form>
  );
}

// ============================================================
// Seção: Resumo
// ============================================================

function SummarySection({ cv, onSave }: { cv: Curriculum; onSave: (c: Curriculum) => void }) {
  const [text, setText] = useState(cv.summary);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <SectionCard
      title="Resumo profissional"
      content={
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ ...inputStyle, minHeight: "8rem", resize: "vertical" }}
            placeholder="Escreva um resumo profissional de 200-500 palavras. Descreva sua trajetória, áreas de atuação, especialidades e interesses de pesquisa."
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <small style={{ color: wordCount < 200 || wordCount > 500 ? "var(--warn, #c47b00)" : "var(--success, #2e7d32)" }}>
              {wordCount} palavra(s) {wordCount >= 200 && wordCount <= 500 ? "✓ dentro do padrão Lattes" : "(recomendado: 200-500)"}
            </small>
            <button
              onClick={() => onSave({ ...cv, summary: text, updated_at: new Date().toISOString().slice(0, 10) })}
              className="ce-btn ce-btn-primary"
              disabled={text === cv.summary}
            >
              Salvar resumo
            </button>
          </div>
        </div>
      }
    />
  );
}

// ============================================================
// Seção: Educação
// ============================================================

function EducationSection({ cv, onSave }: { cv: Curriculum; onSave: (c: Curriculum) => void }) {
  const [editing, setEditing] = useState<Education | null>(null);

  function emptyEducation(): Education {
    return {
      id: generateId("EDU"),
      degree: "GRADUATION",
      field: "",
      institution: "",
      start_date: "",
      status: "ONGOING",
    };
  }
  function patchItem(item: Education) {
    const existing = cv.education_refs.findIndex((e) => e.id === item.id);
    const next = existing >= 0 ? cv.education_refs.map((e) => (e.id === item.id ? item : e)) : [...cv.education_refs, item];
    onSave({ ...cv, education_refs: next, updated_at: new Date().toISOString().slice(0, 10) });
    setEditing(null);
  }
  function removeItem(id: string) {
    onSave({ ...cv, education_refs: cv.education_refs.filter((e) => e.id !== id), updated_at: new Date().toISOString().slice(0, 10) });
  }

  return (
    <SectionCard
      title="Formação acadêmica"
      action={
        <button onClick={() => setEditing(emptyEducation())} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <PlusIcon size={14} /> Adicionar
        </button>
      }
      content={
        <div>
          {editing && (
            <EducationForm item={editing} onSave={patchItem} onCancel={() => setEditing(null)} />
          )}
          {!editing && cv.education_refs.length === 0 && <EmptyState text="Nenhuma formação cadastrada." />}
          {!editing && cv.education_refs.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
              {[...cv.education_refs]
                .sort((a, b) => (b.start_date || "").localeCompare(a.start_date || ""))
                .map((e) => (
                  <li key={e.id} style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.6rem 0.75rem", background: "var(--surface, #fff)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{DEGREE_LABELS[e.degree]} em {e.field || "[Sem área]"}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>{e.institution}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--muted, #888)" }}>
                          {e.start_date ? new Date(e.start_date).getFullYear() : "—"} —{" "}
                          {e.status === "ONGOING" ? "Em andamento" : e.end_date ? new Date(e.end_date).getFullYear() : "—"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <button onClick={() => setEditing(e)} className="ce-btn ce-btn-ghost ce-btn-icon"><EditIcon size={14} /></button>
                        <button onClick={() => removeItem(e.id)} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }}><TrashIcon size={14} /></button>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      }
    />
  );
}

function EducationForm({ item, onSave, onCancel }: { item: Education; onSave: (e: Education) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Education>(item);
  function patch<K extends keyof Education>(k: K, v: Education[K]) { setDraft((d) => ({ ...d, [k]: v })); }
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(draft); }} style={{ ...formStyle, background: "var(--surface, #fafafa)" }}>
      <h5 style={{ marginTop: 0 }}>{item.field ? "Editar formação" : "Nova formação"}</h5>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.5rem" }}>
        <Field label="Grau" required>
          <select value={draft.degree} onChange={(e) => patch("degree", e.target.value as EducationDegree)} style={inputStyle}>
            {Object.entries(DEGREE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Área/Curso" required>
          <input type="text" value={draft.field} onChange={(e) => patch("field", e.target.value)} style={inputStyle} placeholder="Ex.: Enfermagem, Cardiologia" required />
        </Field>
      </div>
      <Field label="Instituição" required>
        <input type="text" value={draft.institution} onChange={(e) => patch("institution", e.target.value)} style={inputStyle} placeholder="Ex.: Universidade de São Paulo" required />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
        <Field label="Início" required>
          <input type="date" value={draft.start_date} onChange={(e) => patch("start_date", e.target.value)} style={inputStyle} required />
        </Field>
        <Field label="Conclusão">
          <input type="date" value={draft.end_date || ""} onChange={(e) => patch("end_date", e.target.value)} style={inputStyle} disabled={draft.status === "ONGOING"} />
        </Field>
        <Field label="Status" required>
          <select value={draft.status} onChange={(e) => patch("status", e.target.value as any)} style={inputStyle}>
            <option value="ONGOING">Em andamento</option>
            <option value="COMPLETED">Concluído</option>
            <option value="ABANDONED">Interrompido</option>
          </select>
        </Field>
      </div>
      <Field label="Orientador (se aplicável)">
        <input type="text" value={draft.advisor || ""} onChange={(e) => patch("advisor", e.target.value)} style={inputStyle} placeholder="Ex.: Profa. Dra. Joana Souza" />
      </Field>
      <Field label="Título do trabalho (TCC/dissertação/tese)">
        <input type="text" value={draft.thesis_title || ""} onChange={(e) => patch("thesis_title", e.target.value)} style={inputStyle} />
      </Field>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">Cancelar</button>
        <button type="submit" className="ce-btn ce-btn-primary">Salvar</button>
      </div>
    </form>
  );
}

// ============================================================
// Seção: Experiência
// ============================================================

function ExperienceSection({ cv, onSave }: { cv: Curriculum; onSave: (c: Curriculum) => void }) {
  const [editing, setEditing] = useState<Experience | null>(null);

  function emptyExperience(): Experience {
    return { id: generateId("EXP"), role: "", institution: "", start_date: "", status: "CURRENT" };
  }
  function patchItem(item: Experience) {
    const existing = cv.experience_refs.findIndex((e) => e.id === item.id);
    const next = existing >= 0 ? cv.experience_refs.map((e) => (e.id === item.id ? item : e)) : [...cv.experience_refs, item];
    onSave({ ...cv, experience_refs: next, updated_at: new Date().toISOString().slice(0, 10) });
    setEditing(null);
  }
  function removeItem(id: string) {
    onSave({ ...cv, experience_refs: cv.experience_refs.filter((e) => e.id !== id), updated_at: new Date().toISOString().slice(0, 10) });
  }

  return (
    <SectionCard
      title="Experiência profissional"
      action={
        <button onClick={() => setEditing(emptyExperience())} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <PlusIcon size={14} /> Adicionar
        </button>
      }
      content={
        <div>
          {editing && <ExperienceForm item={editing} onSave={patchItem} onCancel={() => setEditing(null)} />}
          {!editing && cv.experience_refs.length === 0 && <EmptyState text="Nenhuma experiência cadastrada." />}
          {!editing && cv.experience_refs.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
              {[...cv.experience_refs]
                .sort((a, b) => (b.start_date || "").localeCompare(a.start_date || ""))
                .map((e) => (
                  <li key={e.id} style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.6rem 0.75rem", background: "var(--surface, #fff)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{e.role}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>{e.institution}{e.department ? ` — ${e.department}` : ""}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--muted, #888)" }}>
                          {e.start_date ? new Date(e.start_date).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "—"} —{" "}
                          {e.status === "CURRENT" ? "Atual" : e.end_date ? new Date(e.end_date).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "—"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <button onClick={() => setEditing(e)} className="ce-btn ce-btn-ghost ce-btn-icon"><EditIcon size={14} /></button>
                        <button onClick={() => removeItem(e.id)} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }}><TrashIcon size={14} /></button>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      }
    />
  );
}

function ExperienceForm({ item, onSave, onCancel }: { item: Experience; onSave: (e: Experience) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Experience>(item);
  function patch<K extends keyof Experience>(k: K, v: Experience[K]) { setDraft((d) => ({ ...d, [k]: v })); }
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(draft); }} style={{ ...formStyle, background: "var(--surface, #fafafa)" }}>
      <h5 style={{ marginTop: 0 }}>{item.role ? "Editar experiência" : "Nova experiência"}</h5>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.5rem" }}>
        <Field label="Cargo" required>
          <input type="text" value={draft.role} onChange={(e) => patch("role", e.target.value)} style={inputStyle} placeholder="Ex.: Enfermeiro" required />
        </Field>
        <Field label="Instituição" required>
          <input type="text" value={draft.institution} onChange={(e) => patch("institution", e.target.value)} style={inputStyle} placeholder="Ex.: Hospital das Clínicas" required />
        </Field>
      </div>
      <Field label="Setor/Departamento">
        <input type="text" value={draft.department || ""} onChange={(e) => patch("department", e.target.value)} style={inputStyle} placeholder="Ex.: UTI Adulto" />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
        <Field label="Início" required>
          <input type="date" value={draft.start_date} onChange={(e) => patch("start_date", e.target.value)} style={inputStyle} required />
        </Field>
        <Field label="Término">
          <input type="date" value={draft.end_date || ""} onChange={(e) => patch("end_date", e.target.value)} style={inputStyle} disabled={draft.status === "CURRENT"} />
        </Field>
        <Field label="Status" required>
          <select value={draft.status} onChange={(e) => patch("status", e.target.value as any)} style={inputStyle}>
            <option value="CURRENT">Atual</option>
            <option value="PAST">Anterior</option>
          </select>
        </Field>
      </div>
      <Field label="Carga horária semanal (h)">
        <input type="number" min={0} max={80} value={draft.workload_hours_week || ""} onChange={(e) => patch("workload_hours_week", e.target.value ? Number(e.target.value) : undefined)} style={inputStyle} placeholder="Ex.: 36" />
      </Field>
      <Field label="Descrição das atividades">
        <textarea value={draft.description || ""} onChange={(e) => patch("description", e.target.value)} style={{ ...inputStyle, minHeight: "3rem", resize: "vertical" }} placeholder="Descreva atividades, conquistas, etc." />
      </Field>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">Cancelar</button>
        <button type="submit" className="ce-btn ce-btn-primary">Salvar</button>
      </div>
    </form>
  );
}

// ============================================================
// Seção: Publicações (vincula com bloco Pesquisa)
// ============================================================

function PublicationsSection({ cv, onSave }: { cv: Curriculum; onSave: (c: Curriculum) => void }) {
  const { items: references } = useReferences();
  const { items: sources } = useSources();
  const sourcesById = new Map(sources.map((s) => [s.id, s]));

  function toggleRef(id: string) {
    const next = cv.publication_refs.includes(id)
      ? cv.publication_refs.filter((x) => x !== id)
      : [...cv.publication_refs, id];
    onSave({ ...cv, publication_refs: next, updated_at: new Date().toISOString().slice(0, 10) });
  }

  return (
    <SectionCard
      title="Produções bibliográficas"
      content={
        <div>
          <p style={{ fontSize: "0.9rem", color: "var(--muted, #555)" }}>
            Vincule produções cadastradas no Bloco Pesquisa (Citações ABNT). Cada produção
            vinculada aparece na seção "Produções" do CV exportado.
          </p>
          {references.length === 0 ? (
            <EmptyState text="Nenhuma citação cadastrada. Vá em /ferramentas-pesquisa (aba Citações ABNT) para cadastrar produções primeiro." />
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.4rem" }}>
              {references.map((r) => {
                const src = sourcesById.get(r.sourceId);
                const checked = cv.publication_refs.includes(r.id);
                const preview = src ? formatReference(src, r) : "[fonte não encontrada]";
                return (
                  <li key={r.id} style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.5rem 0.75rem", background: checked ? "var(--accent-soft, #f0f6ff)" : "var(--surface, #fff)" }}>
                    <label style={{ display: "flex", gap: "0.5rem", cursor: "pointer", alignItems: "flex-start" }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleRef(r.id)} style={{ marginTop: "0.25rem" }} />
                      <span style={{ fontSize: "0.85rem", flex: 1, fontFamily: "Georgia, serif" }}>{preview.slice(0, 200)}{preview.length > 200 ? "..." : ""}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          {cv.publication_refs.length > 0 && (
            <div style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
              <strong>{cv.publication_refs.length} produção(ões) vinculada(s) a este CV.</strong>
            </div>
          )}
        </div>
      }
    />
  );
}

// ============================================================
// Seção: Certificações
// ============================================================

function CertificationsSection({ cv, onSave }: { cv: Curriculum; onSave: (c: Curriculum) => void }) {
  const [editing, setEditing] = useState<Certification | null>(null);
  function empty(): Certification { return { id: generateId("CER"), title: "", issuer: "", issue_date: "" }; }
  function patchItem(item: Certification) {
    const existing = cv.certification_refs.findIndex((e) => e.id === item.id);
    const next = existing >= 0 ? cv.certification_refs.map((e) => (e.id === item.id ? item : e)) : [...cv.certification_refs, item];
    onSave({ ...cv, certification_refs: next, updated_at: new Date().toISOString().slice(0, 10) });
    setEditing(null);
  }
  function removeItem(id: string) {
    onSave({ ...cv, certification_refs: cv.certification_refs.filter((e) => e.id !== id), updated_at: new Date().toISOString().slice(0, 10) });
  }
  return (
    <SectionCard
      title="Certificações e títulos"
      action={<button onClick={() => setEditing(empty())} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><PlusIcon size={14} /> Adicionar</button>}
      content={
        <div>
          {editing && <SimpleForm title={editing.title ? "Editar" : "Nova certificação"} fields={[
            { key: "title", label: "Título", required: true, placeholder: "ACLS Provider" },
            { key: "issuer", label: "Emissor", required: true, placeholder: "American Heart Association" },
            { key: "issue_date", label: "Data de emissão", type: "date", required: true },
            { key: "expiry_date", label: "Validade", type: "date" },
            { key: "registry_number", label: "Número de registro" },
          ]} item={editing} onSave={(item) => patchItem(item as Certification)} onCancel={() => setEditing(null)} />}
          {!editing && cv.certification_refs.length === 0 && <EmptyState text="Nenhuma certificação cadastrada." />}
          {!editing && cv.certification_refs.length > 0 && (
            <ul style={listStyle}>
              {cv.certification_refs.map((c) => (
                <li key={c.id} style={listItemStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>{c.issuer} · {c.issue_date}{c.expiry_date ? ` (válido até ${c.expiry_date})` : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button onClick={() => setEditing(c)} className="ce-btn ce-btn-ghost ce-btn-icon"><EditIcon size={14} /></button>
                    <button onClick={() => removeItem(c.id)} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }}><TrashIcon size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      }
    />
  );
}

// ============================================================
// Seção: Competências
// ============================================================

function SkillsSection({ cv, onSave }: { cv: Curriculum; onSave: (c: Curriculum) => void }) {
  const [editing, setEditing] = useState<Skill | null>(null);
  function empty(): Skill { return { id: generateId("SKL"), name: "", category: "CLINICAL", level: "INTERMEDIATE" }; }
  function patchItem(item: Skill) {
    const existing = cv.skill_refs.findIndex((e) => e.id === item.id);
    const next = existing >= 0 ? cv.skill_refs.map((e) => (e.id === item.id ? item : e)) : [...cv.skill_refs, item];
    onSave({ ...cv, skill_refs: next, updated_at: new Date().toISOString().slice(0, 10) });
    setEditing(null);
  }
  function removeItem(id: string) {
    onSave({ ...cv, skill_refs: cv.skill_refs.filter((e) => e.id !== id), updated_at: new Date().toISOString().slice(0, 10) });
  }
  return (
    <SectionCard
      title="Competências"
      action={<button onClick={() => setEditing(empty())} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><PlusIcon size={14} /> Adicionar</button>}
      content={
        <div>
          {editing && <SkillForm item={editing} onSave={patchItem} onCancel={() => setEditing(null)} />}
          {!editing && cv.skill_refs.length === 0 && <EmptyState text="Nenhuma competência cadastrada." />}
          {!editing && cv.skill_refs.length > 0 && (
            <ul style={listStyle}>
              {cv.skill_refs.map((s) => (
                <li key={s.id} style={listItemStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>{SKILL_CATEGORY_LABELS[s.category]} · {SKILL_LEVEL_LABELS[s.level]}</div>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button onClick={() => setEditing(s)} className="ce-btn ce-btn-ghost ce-btn-icon"><EditIcon size={14} /></button>
                    <button onClick={() => removeItem(s.id)} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }}><TrashIcon size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      }
    />
  );
}

function SkillForm({ item, onSave, onCancel }: { item: Skill; onSave: (s: Skill) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Skill>(item);
  function patch<K extends keyof Skill>(k: K, v: Skill[K]) { setDraft((d) => ({ ...d, [k]: v })); }
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(draft); }} style={{ ...formStyle, background: "var(--surface, #fafafa)" }}>
      <h5 style={{ marginTop: 0 }}>{item.name ? "Editar competência" : "Nova competência"}</h5>
      <Field label="Nome" required>
        <input type="text" value={draft.name} onChange={(e) => patch("name", e.target.value)} style={inputStyle} placeholder="Ex.: Punção venosa, SVD, Liderança" required />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <Field label="Categoria" required>
          <select value={draft.category} onChange={(e) => patch("category", e.target.value as SkillCategory)} style={inputStyle}>
            {Object.entries(SKILL_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Nível" required>
          <select value={draft.level} onChange={(e) => patch("level", e.target.value as SkillLevel)} style={inputStyle}>
            {Object.entries(SKILL_LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">Cancelar</button>
        <button type="submit" className="ce-btn ce-btn-primary">Salvar</button>
      </div>
    </form>
  );
}

// ============================================================
// Seção: Idiomas
// ============================================================

function LanguagesSection({ cv, onSave }: { cv: Curriculum; onSave: (c: Curriculum) => void }) {
  const [editing, setEditing] = useState<Language | null>(null);
  function empty(): Language { return { id: generateId("LNG"), language: "", speaking: "BASIC", writing: "BASIC", reading: "BASIC" }; }
  function patchItem(item: Language) {
    const existing = cv.language_refs.findIndex((e) => e.id === item.id);
    const next = existing >= 0 ? cv.language_refs.map((e) => (e.id === item.id ? item : e)) : [...cv.language_refs, item];
    onSave({ ...cv, language_refs: next, updated_at: new Date().toISOString().slice(0, 10) });
    setEditing(null);
  }
  function removeItem(id: string) {
    onSave({ ...cv, language_refs: cv.language_refs.filter((e) => e.id !== id), updated_at: new Date().toISOString().slice(0, 10) });
  }
  return (
    <SectionCard
      title="Idiomas"
      action={<button onClick={() => setEditing(empty())} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><PlusIcon size={14} /> Adicionar</button>}
      content={
        <div>
          {editing && <LanguageForm item={editing} onSave={patchItem} onCancel={() => setEditing(null)} />}
          {!editing && cv.language_refs.length === 0 && <EmptyState text="Nenhum idioma cadastrado." />}
          {!editing && cv.language_refs.length > 0 && (
            <ul style={listStyle}>
              {cv.language_refs.map((l) => (
                <li key={l.id} style={listItemStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{l.language}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>
                      Fala: {LANGUAGE_PROFICIENCY_LABELS[l.speaking]} · Leitura: {LANGUAGE_PROFICIENCY_LABELS[l.reading]} · Escrita: {LANGUAGE_PROFICIENCY_LABELS[l.writing]}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button onClick={() => setEditing(l)} className="ce-btn ce-btn-ghost ce-btn-icon"><EditIcon size={14} /></button>
                    <button onClick={() => removeItem(l.id)} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }}><TrashIcon size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      }
    />
  );
}

function LanguageForm({ item, onSave, onCancel }: { item: Language; onSave: (l: Language) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Language>(item);
  function patch<K extends keyof Language>(k: K, v: Language[K]) { setDraft((d) => ({ ...d, [k]: v })); }
  const profOptions = Object.entries(LANGUAGE_PROFICIENCY_LABELS);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(draft); }} style={{ ...formStyle, background: "var(--surface, #fafafa)" }}>
      <h5 style={{ marginTop: 0 }}>{item.language ? "Editar idioma" : "Novo idioma"}</h5>
      <Field label="Idioma" required>
        <input type="text" value={draft.language} onChange={(e) => patch("language", e.target.value)} style={inputStyle} placeholder="Ex.: Inglês, Espanhol" required />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
        <Field label="Fala" required>
          <select value={draft.speaking} onChange={(e) => patch("speaking", e.target.value as LanguageProficiency)} style={inputStyle}>
            {profOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Leitura" required>
          <select value={draft.reading} onChange={(e) => patch("reading", e.target.value as LanguageProficiency)} style={inputStyle}>
            {profOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Escrita" required>
          <select value={draft.writing} onChange={(e) => patch("writing", e.target.value as LanguageProficiency)} style={inputStyle}>
            {profOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">Cancelar</button>
        <button type="submit" className="ce-btn ce-btn-primary">Salvar</button>
      </div>
    </form>
  );
}

// ============================================================
// Seções restantes: Awards, Memberships, Events — usam SimpleForm
// ============================================================

function AwardsSection({ cv, onSave }: { cv: Curriculum; onSave: (c: Curriculum) => void }) {
  const [editing, setEditing] = useState<Award | null>(null);
  function empty(): Award { return { id: generateId("AWD"), title: "", issuer: "", date: "" }; }
  function patchItem(item: Award) {
    const list = cv.award_refs || [];
    const existing = list.findIndex((e) => e.id === item.id);
    const next = existing >= 0 ? list.map((e) => (e.id === item.id ? item : e)) : [...list, item];
    onSave({ ...cv, award_refs: next, updated_at: new Date().toISOString().slice(0, 10) });
    setEditing(null);
  }
  function removeItem(id: string) {
    const next = (cv.award_refs || []).filter((e) => e.id !== id);
    onSave({ ...cv, award_refs: next, updated_at: new Date().toISOString().slice(0, 10) });
  }
  return (
    <SectionCard
      title="Prêmios e distinções"
      action={<button onClick={() => setEditing(empty())} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><PlusIcon size={14} /> Adicionar</button>}
      content={
        <div>
          {editing && <SimpleForm title={editing.title ? "Editar prêmio" : "Novo prêmio"} fields={[
            { key: "title", label: "Título", required: true, placeholder: "Prêmio de Excelência em Enfermagem" },
            { key: "issuer", label: "Emissor", required: true, placeholder: "ABEn-SP" },
            { key: "date", label: "Data", type: "date", required: true },
            { key: "description", label: "Descrição", type: "textarea" },
          ]} item={editing} onSave={(item) => patchItem(item as Award)} onCancel={() => setEditing(null)} />}
          {!editing && (!cv.award_refs || cv.award_refs.length === 0) && <EmptyState text="Nenhum prêmio cadastrado." />}
          {!editing && cv.award_refs && cv.award_refs.length > 0 && (
            <ul style={listStyle}>
              {cv.award_refs.map((a) => (
                <li key={a.id} style={listItemStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{a.title}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>{a.issuer} · {a.date}</div>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button onClick={() => setEditing(a)} className="ce-btn ce-btn-ghost ce-btn-icon"><EditIcon size={14} /></button>
                    <button onClick={() => removeItem(a.id)} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }}><TrashIcon size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      }
    />
  );
}

function MembershipsSection({ cv, onSave }: { cv: Curriculum; onSave: (c: Curriculum) => void }) {
  const [editing, setEditing] = useState<Membership | null>(null);
  function empty(): Membership { return { id: generateId("MEM"), organization: "", role: "", start_date: "", status: "ACTIVE" }; }
  function patchItem(item: Membership) {
    const list = cv.membership_refs || [];
    const existing = list.findIndex((e) => e.id === item.id);
    const next = existing >= 0 ? list.map((e) => (e.id === item.id ? item : e)) : [...list, item];
    onSave({ ...cv, membership_refs: next, updated_at: new Date().toISOString().slice(0, 10) });
    setEditing(null);
  }
  function removeItem(id: string) {
    const next = (cv.membership_refs || []).filter((e) => e.id !== id);
    onSave({ ...cv, membership_refs: next, updated_at: new Date().toISOString().slice(0, 10) });
  }
  return (
    <SectionCard
      title="Filiações a sociedades profissionais"
      action={<button onClick={() => setEditing(empty())} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><PlusIcon size={14} /> Adicionar</button>}
      content={
        <div>
          {editing && <SimpleForm title={editing.organization ? "Editar filiação" : "Nova filiação"} fields={[
            { key: "organization", label: "Organização", required: true, placeholder: "ABEn-SP, SBE, ANS" },
            { key: "role", label: "Cargo", required: true, placeholder: "Membro, Diretor, Presidente" },
            { key: "start_date", label: "Início", type: "date", required: true },
            { key: "end_date", label: "Término", type: "date" },
          ]} item={editing} onSave={(item) => patchItem(item as Membership)} onCancel={() => setEditing(null)} />}
          {!editing && (!cv.membership_refs || cv.membership_refs.length === 0) && <EmptyState text="Nenhuma filiação cadastrada." />}
          {!editing && cv.membership_refs && cv.membership_refs.length > 0 && (
            <ul style={listStyle}>
              {cv.membership_refs.map((m) => (
                <li key={m.id} style={listItemStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{m.organization}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>{m.role} · {m.start_date} — {m.end_date || "Atual"}</div>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button onClick={() => setEditing(m)} className="ce-btn ce-btn-ghost ce-btn-icon"><EditIcon size={14} /></button>
                    <button onClick={() => removeItem(m.id)} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }}><TrashIcon size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      }
    />
  );
}

function EventsSection({ cv, onSave }: { cv: Curriculum; onSave: (c: Curriculum) => void }) {
  const [editing, setEditing] = useState<EventParticipation | null>(null);
  function empty(): EventParticipation { return { id: generateId("EVT"), event_name: "", role: "ATTENDEE", date: "" }; }
  function patchItem(item: EventParticipation) {
    const list = cv.event_participation_refs || [];
    const existing = list.findIndex((e) => e.id === item.id);
    const next = existing >= 0 ? list.map((e) => (e.id === item.id ? item : e)) : [...list, item];
    onSave({ ...cv, event_participation_refs: next, updated_at: new Date().toISOString().slice(0, 10) });
    setEditing(null);
  }
  function removeItem(id: string) {
    const next = (cv.event_participation_refs || []).filter((e) => e.id !== id);
    onSave({ ...cv, event_participation_refs: next, updated_at: new Date().toISOString().slice(0, 10) });
  }
  return (
    <SectionCard
      title="Participação em eventos"
      action={<button onClick={() => setEditing(empty())} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><PlusIcon size={14} /> Adicionar</button>}
      content={
        <div>
          {editing && <EventForm item={editing} onSave={patchItem} onCancel={() => setEditing(null)} />}
          {!editing && (!cv.event_participation_refs || cv.event_participation_refs.length === 0) && <EmptyState text="Nenhuma participação em evento cadastrada." />}
          {!editing && cv.event_participation_refs && cv.event_participation_refs.length > 0 && (
            <ul style={listStyle}>
              {cv.event_participation_refs.map((e) => (
                <li key={e.id} style={listItemStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{e.event_name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>
                      {EVENT_ROLE_LABELS[e.role]} · {e.event_type ? EVENT_TYPE_LABELS[e.event_type] : "Evento"} · {e.date}
                      {e.workload_hours ? ` · ${e.workload_hours}h` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button onClick={() => setEditing(e)} className="ce-btn ce-btn-ghost ce-btn-icon"><EditIcon size={14} /></button>
                    <button onClick={() => removeItem(e.id)} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }}><TrashIcon size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      }
    />
  );
}

function EventForm({ item, onSave, onCancel }: { item: EventParticipation; onSave: (e: EventParticipation) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<EventParticipation>(item);
  function patch<K extends keyof EventParticipation>(k: K, v: EventParticipation[K]) { setDraft((d) => ({ ...d, [k]: v })); }
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(draft); }} style={{ ...formStyle, background: "var(--surface, #fafafa)" }}>
      <h5 style={{ marginTop: 0 }}>{item.event_name ? "Editar participação" : "Nova participação"}</h5>
      <Field label="Nome do evento" required>
        <input type="text" value={draft.event_name} onChange={(e) => patch("event_name", e.target.value)} style={inputStyle} required />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <Field label="Tipo">
          <select value={draft.event_type || ""} onChange={(e) => patch("event_type", e.target.value as EventType)} style={inputStyle}>
            <option value="">Selecione...</option>
            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Papel" required>
          <select value={draft.role} onChange={(e) => patch("role", e.target.value as EventRole)} style={inputStyle}>
            {Object.entries(EVENT_ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <Field label="Data" required>
          <input type="date" value={draft.date} onChange={(e) => patch("date", e.target.value)} style={inputStyle} required />
        </Field>
        <Field label="Carga horária (h)">
          <input type="number" min={0} value={draft.workload_hours || ""} onChange={(e) => patch("workload_hours", e.target.value ? Number(e.target.value) : undefined)} style={inputStyle} />
        </Field>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">Cancelar</button>
        <button type="submit" className="ce-btn ce-btn-primary">Salvar</button>
      </div>
    </form>
  );
}

// ============================================================
// Seção: Preview / Exportar
// ============================================================

function PreviewSection({ cv, onSave, onRemove }: { cv: Curriculum; onSave: (c: Curriculum) => void; onRemove: (id: string) => void }) {
  const [target, setTarget] = useState<ProjectionTarget>(cv.projection_target);
  const [copied, setCopied] = useState(false);
  const preview = projectCV(cv, target);

  function copyPreview() {
    navigator.clipboard.writeText(preview).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function downloadPreview() {
    const blob = new Blob([preview], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cv-${cv.owner.full_name?.toLowerCase().replace(/\s+/g, "-") || "sem-nome"}-${target.toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, marginRight: "0.5rem" }}>Formato de projeção:</label>
          <select value={target} onChange={(e) => setTarget(e.target.value as ProjectionTarget)} style={{ padding: "0.4rem", borderRadius: "0.3rem" }}>
            {Object.entries(PROJECTION_TARGET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={copyPreview} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            {copied ? "Copiado!" : "Copiar Markdown"}
          </button>
          <button onClick={downloadPreview} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <DownloadIcon size={14} /> Baixar .md
          </button>
          <button onClick={() => onSave({ ...cv, projection_target: target, updated_at: new Date().toISOString().slice(0, 10) })} className="ce-btn ce-btn-primary">Salvar padrão</button>
        </div>
      </div>

      <div
        style={{
          background: "var(--surface, #fafafa)",
          border: "1px solid var(--border, #ccc)",
          borderRadius: "0.4rem",
          padding: "1rem 1.25rem",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "0.95rem",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        {preview}
      </div>

      <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--accent-soft, #f5f8fc)", borderRadius: "0.4rem", fontSize: "0.85rem" }}>
        <strong>Campos canônicos do CV:</strong> {cv.canonical_id} · status: <code>{cv.status}</code> · versão: <code>{cv.version}</code> · schema: <code>curriculum.schema.json v0.1.0</code>
        <br />
        <strong>Recursos vinculados:</strong> {cv.education_refs.length} formação(ões) · {cv.experience_refs.length} experiência(s) · {cv.publication_refs.length} produção(ões) · {cv.certification_refs.length} certificação(ões) · {cv.skill_refs.length} competência(s) · {cv.language_refs.length} idioma(s)
      </div>

      <details style={{ marginTop: "1rem" }}>
        <summary style={{ cursor: "pointer", color: "var(--danger, #c0392b)", fontSize: "0.85rem" }}>Excluir este currículo</summary>
        <button onClick={() => { if (confirm(`Excluir currículo de "${cv.owner.full_name || "[sem nome]"}"?`)) onRemove(cv.canonical_id); }} className="ce-btn ce-btn-ghost" style={{ marginTop: "0.5rem", color: "var(--danger, #c0392b)" }}>
          <TrashIcon size={14} /> Excluir definitivamente
        </button>
      </details>
    </div>
  );
}

// ============================================================
// Componentes genéricos
// ============================================================

function SectionCard({ title, action, content, onEdit }: { title: string; action?: React.ReactNode; content: React.ReactNode; onEdit?: () => void }) {
  return (
    <div style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.75rem 1rem", background: "var(--surface, #fff)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", gap: "0.5rem" }}>
        <h4 style={{ margin: 0, fontSize: "1rem" }}>{title}</h4>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {onEdit && <button onClick={onEdit} className="ce-btn ce-btn-ghost ce-btn-icon" aria-label="Editar"><EditIcon size={14} /></button>}
          {action}
        </div>
      </div>
      {content}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div style={{ padding: "1rem", textAlign: "center", color: "var(--muted, #888)", fontSize: "0.9rem" }}>{text}</div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "12rem 1fr", gap: "0.5rem", fontSize: "0.9rem" }}>
      <div style={{ color: "var(--muted, #666)", fontWeight: 600 }}>{label}:</div>
      <div>{value}</div>
    </div>
  );
}

const formStyle: React.CSSProperties = { border: "1px solid var(--border, #ccc)", borderRadius: "0.4rem", padding: "1rem", marginBottom: "0.75rem" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.6rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.95rem", background: "var(--surface, #fff)" };
const listStyle: React.CSSProperties = { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.4rem" };
const listItemStyle: React.CSSProperties = { border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.5rem 0.75rem", background: "var(--surface, #fff)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" };

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

// ============================================================
// SimpleForm — formulário genérico para itens simples (Award, Membership, etc.)
// ============================================================

interface SimpleFormField {
  key: string;
  label: string;
  required?: boolean;
  type?: "text" | "date" | "textarea";
  placeholder?: string;
}

function SimpleForm<T extends { id: string }>({
  title,
  fields,
  item,
  onSave,
  onCancel,
}: {
  title: string;
  fields: SimpleFormField[];
  item: T;
  onSave: (item: T) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<T>(item);
  function patch(key: string, value: any) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(draft); }} style={formStyle}>
      <h5 style={{ marginTop: 0 }}>{title}</h5>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {fields.map((f) => (
          <Field key={f.key} label={f.label} required={f.required}>
            {f.type === "textarea" ? (
              <textarea value={(draft as any)[f.key] || ""} onChange={(e) => patch(f.key, e.target.value)} style={{ ...inputStyle, minHeight: "3rem", resize: "vertical" }} placeholder={f.placeholder} required={f.required} />
            ) : (
              <input type={f.type || "text"} value={(draft as any)[f.key] || ""} onChange={(e) => patch(f.key, e.target.value)} style={inputStyle} placeholder={f.placeholder} required={f.required} />
            )}
          </Field>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
        <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">Cancelar</button>
        <button type="submit" className="ce-btn ce-btn-primary">Salvar</button>
      </div>
    </form>
  );
}
