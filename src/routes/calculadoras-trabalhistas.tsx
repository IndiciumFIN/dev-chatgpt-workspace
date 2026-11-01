import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { PageHero } from "@/components/site/page-hero";
import { Link } from "@tanstack/react-router";
import { CalculatorIcon, ArrowRightIcon } from "lucide-react";

export const Route = createFileRoute("/calculadoras-trabalhistas")({
  component: CalculadorasTrabalhistasPage,
  head: () => ({
    meta: [
      { title: "Calculadoras Trabalhistas · Calculadoras de Enfermagem" },
      {
        name: "description",
        content:
          "Centro de calculadoras trabalhistas para profissionais de enfermagem: férias, adicional noturno, horas extras e rescisão. Base legal na CLT.",
      },
    ],
  }),
});

const CALCULADORAS = [
  {
    slug: "ferias",
    title: "Calculadora de Férias",
    description: "Calcule o valor de férias (normais + 1/3 constitucional) e descontos. Considera salário base e dias de férias.",
    inputs: ["Salário base mensal", "Dias de férias (10-30)", "Quantidade de faltas"],
    base: "CLT Art. 129-153 · CF/88 Art. 7º XVII",
  },
  {
    slug: "adicional-noturno",
    title: "Calculadora de Adicional Noturno",
    description: "Calcule o adicional noturno (20% sobre hora diurna) e hora noturna reduzida (52min30s).",
    inputs: ["Salário base mensal", "Horas noturnas trabalhadas", "Adicional (%)"],
    base: "CLT Art. 73 · Lei 11.901/2009 (enfermagem) — 30% para SBT",
  },
  {
    slug: "horas-extras",
    title: "Calculadora de Horas Extras",
    description: "Calcule valor de hora extra (50% ou 70%) e seu impacto na folha. Considera hora normal como base.",
    inputs: ["Salário base mensal", "Horas extras (50%)", "Horas extras (Domingo/Feriado — 100%)"],
    base: "CLT Art. 59-62 · CF/88 Art. 7º XVI",
  },
  {
    slug: "rescisao",
    title: "Calculadora de Rescisão",
    description: "Calcule verbas rescisórias: saldo salário, férias + 1/3, 13º proporcional, aviso prévio, FGTS + multa de 40%.",
    inputs: ["Salário base", "Meses trabalhados", "Tipo de demissão (sem justa, pedido, etc.)"],
    base: "CLT Art. 477-482 · Lei 12.506/2011 (aviso prévio)",
  },
];

function CalculadorasTrabalhistasPage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selected = useMemo(() => CALCULADORAS.find((c) => c.slug === selectedSlug) || null, [selectedSlug]);

  return (
    <Shell>
      <main id="conteudo" className="page-wide">
        <PageHero
          eyebrow="Ferramentas trabalhistas · Enfermagem"
          title="Calculadoras Trabalhistas"
          lead="Centro de calculadoras trabalhistas para profissionais de enfermagem. Apura férias, adicional noturno, horas extras e verbas rescisórias com base legal explícita (CLT, CF/88, Lei 11.901/2009)."
        />

        <section style={{ marginTop: "1.5rem" }}>
          {!selected ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0.75rem" }}>
              {CALCULADORAS.map((c) => (
                <li key={c.slug} style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "1rem", background: "var(--surface, #fff)" }}>
                  <Link to="/ferramentas/$slug" params={{ slug: c.slug }} style={{ color: "inherit", textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <CalculatorIcon size={20} style={{ color: "var(--accent, #0a66c2)" }} />
                      <h3 style={{ margin: 0, fontSize: "1rem" }}>{c.title}</h3>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--muted, #555)", marginBottom: "0.5rem" }}>{c.description}</p>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted, #888)", marginTop: "0.5rem" }}>
                      <strong>Entradas:</strong> {c.inputs.join(", ")}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--accent, #0a66c2)", marginTop: "0.25rem" }}>
                      <strong>Base:</strong> {c.base}
                    </div>
                    <div style={{ marginTop: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--accent, #0a66c2)", fontSize: "0.85rem", fontWeight: 600 }}>
                      Abrir calculadora <ArrowRightIcon size={14} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <button onClick={() => setSelectedSlug(null)} className="ce-btn ce-btn-ghost" style={{ marginBottom: "1rem" }}>← Voltar à lista</button>
              <h3>{selected.title}</h3>
              <p>{selected.description}</p>
              <Link to="/ferramentas/$slug" params={{ slug: selected.slug }} className="ce-btn ce-btn-primary">Abrir calculadora</Link>
            </div>
          )}

          <div style={{ marginTop: "2rem", padding: "0.75rem 1rem", background: "var(--accent-soft, #f5f8fc)", borderRadius: "0.4rem", fontSize: "0.85rem", color: "var(--muted, #555)" }}>
            <strong>Atenção:</strong> As calculadoras trabalhistas são ferramentas de apoio. Os cálculos podem variar conforme acordos coletivos, convenções específicas de enfermagem (Lei 11.901/2009) e atualizações legislativas. Consulte sempre um advogado trabalhista ou o sindicato da categoria para decisão final.
          </div>
        </section>
      </main>
    </Shell>
  );
}
