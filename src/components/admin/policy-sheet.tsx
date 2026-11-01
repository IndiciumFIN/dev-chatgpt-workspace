import { policyCycle, policySections, type PolicySections } from "@/lib/policy-document";
import { Status } from "@/components/admin/admin-layout";

export function PolicySheet({
  sections,
  legacy,
  approved,
  onChange,
}: {
  sections: PolicySections;
  legacy: string;
  approved: boolean;
  onChange?: (id: keyof PolicySections, value: string) => void;
}) {
  return (
    <div className="policy-doc">
      <ol className="policy-cycle">
        {policyCycle.map((step) => (
          <li key={step.id}><Status value={step.id === "aprovada" && approved ? "Aprovado" : step.id === "definida" ? "Definida" : "Não feito"} /> {step.label}</li>
        ))}
      </ol>
      {legacy ? <section><h3>Texto gravado antes desta forma</h3><p>{legacy}</p></section> : null}
      {policySections.map((section) => (
        <section key={section.id}>
          <h3>{section.label}</h3>
          <p className="tool-help">{section.hint}</p>
          {approved || !onChange ? <p>{sections[section.id] || "Vazio."}</p> : (
            <textarea aria-label={section.label} value={sections[section.id]} rows={3} onChange={(event) => onChange(section.id, event.target.value)} />
          )}
        </section>
      ))}
    </div>
  );
}
