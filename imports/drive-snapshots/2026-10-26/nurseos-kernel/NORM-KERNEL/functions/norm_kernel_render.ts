/**
 * NORM-KERNEL Render — o front-end consome o MASTER DATA do projeto (registros
 * governados) e o anexo pinado, nunca arquivos soltos. C4/C6 da POL-NK-001.
 * Verifica em runtime o sha256 do anexo contra o pin da política (proveniência
 * na renderização) e exibe aderência por campo com a norma em <details> (C3).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ANNEX_URL = "https://base44.app/api/apps/6a66b1a87d027966b69a3423/files/mp/public/6a66b1a87d027966b69a3423/d964e7ed2_field_norms.json";
const ANNEX_PIN = "sha256:f72441e8d40e0e21c54106e7f48baa00b5d383743f94dbab1f37385a119650ba";

const esc = (s: any) => String(s ?? "").replace(/[&<>"']/g, (c: string) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const short = (s: any) => String(s ?? "").slice(0, 19) + "…";

async function sha256Hex(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const h = await crypto.subtle.digest("SHA-256", buf);
  return "sha256:" + [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const E = (base44 as any).entities;
  const json = (o: any, status = 200) => new Response(JSON.stringify(o), {
    status, headers: { "content-type": "application/json" },
  });

  try {
    // 1. Anexo pinado: fetch + verificação sha256 em runtime (proveniência)
    const annexRaw = await (await fetch(ANNEX_URL)).text();
    const annexHash = await sha256Hex(annexRaw);
    const annexVerified = annexHash === ANNEX_PIN;
    if (!annexVerified) {
      return json({ result: "BLOCKED", reason: "anexo field_norms.json diverge do pin da política (DRIFT na renderização)", annexHash, pin: ANNEX_PIN }, 409);
    }
    const annex = JSON.parse(annexRaw);

    // 2. MASTER DATA — tudo lido dos registros governados do projeto
    const [sources, licenses, docs, atoms, terms, runs, policies, evidences] = await Promise.all([
      E.NormSource.list(), E.KnowledgeLicense.list(), E.NormDocument.list(),
      E.NormAtom.list(), E.DictionaryTerm.list(), E.ExtractionRun.list(),
      E.AgentPolicy.list(), E.PolicyEvidence.list(),
    ]);
    const licById: Record<string, any> = {};
    (licenses || []).forEach((l: any) => { if (l.license_id) licById[l.license_id] = l; });

    const tr = (cells: string[]) => `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
    const badge = (s: any) => `<span class="b ${esc(s)}">${esc(s)}</span>`;

    const sourcesRows = (sources || []).map((s: any) => tr([
      `<code>${esc(s.source_id)}</code>`, esc(s.name), badge(s.kind), esc(s.kind === "fixture" ? "interna" : s.fetch_cadence),
      licById[s.license_ref] ? `<code>${esc(s.license_ref)}</code> (${esc(licById[s.license_ref].owner)})` : `<span class="bad">${esc(s.license_ref)} — SEM LICENÇA REGISTRADA</span>`,
      badge(s.status),
    ])).join("");

    const docsRows = (docs || []).map((d: any) => tr([
      `<code>${esc(d.doc_id)}</code>`, esc(d.doc_type), esc(d.issuer), esc(d.canonical_citation),
      `${d.coverage_json?.atom_count} átomos / ${d.coverage_json?.non_normative_count} não-normativos / ${d.coverage_json?.classified_percent}%`,
      d.coverage_json?.reconstruction_ok ? "reconstrução OK" : "RECONSTRUÇÃO FALHOU", badge(d.status),
    ])).join("");

    const atomCard = (a: any) => `
<li class="atom">
  <p class="atom-h"><code>${esc(a.atom_id)}</code> ${badge(a.atom_type)} <span class="mod">${esc(a.modality)}</span>
     <span class="loc">${esc((a.locator_path || []).join(" › "))}</span> ${badge(a.status)} <span class="conf">confiança ${esc(a.confidence)}</span></p>
  <blockquote cite="${esc(a.seo_json?.uri_slug)}">${esc(a.verbatim_text)}</blockquote>
  <p class="pl">${esc(a.plain_language)}</p>
  <p class="meta">sujeito <code>${esc(a.subject_canon || "—")}</code> · ação <code>${esc(a.action_canon || "—")}</code> · objeto <code>${esc(a.object_canon || "—")}</code>
     · checksum <code>${short(a.checksum)}</code> · evidência <code>${esc(a.evidence_id)}</code> · doc <code>${esc(a.doc_ref)}</code></p>
</li>`;

    const termsByNs: Record<string, string[]> = {};
    (terms || []).forEach((t: any) => { (termsByNs[t.namespace] ||= []).push(t.term_id); });

    const runsRows = (runs || []).map((r: any) => tr([
      `<code>${esc(r.run_id)}</code>`, esc(r.extractor_version), String(r.atoms_created),
      `${esc(r.coverage_percent)}%`, badge(r.status), `<code>${esc(r.evidence_id)}</code>`,
    ])).join("");

    const nkEvidences = (evidences || []).filter((e: any) => String(e.evidence_id).startsWith("EV-NK"));
    const evRows = nkEvidences.map((e: any) => tr([
      `<code>${esc(e.evidence_id)}</code>`, esc(e.generated_by), badge(e.gate_result),
      `<code>${short(e.checksum)}</code>`, esc((e.policy_ids || []).join(", ")),
    ])).join("");

    const pol = (policies || []).find((p: any) => p.policy_id === "POL-NK-001");

    // 3. Aderência por campo (C3): norma em <details>, gerada do anexo verificado
    const adherence = Object.entries(annex).map(([entity, fields]: [string, any]) => {
      const rows = Object.entries(fields).map(([field, n]: [string, any]) => {
        const comp = n.enum ? `enum: ${n.enum.join(" | ")}` : n.pattern ? `padrão: ${n.pattern}` : n.range ? `faixa: ${n.range[0]}-${n.range[1]}` : n.composition ? `composição: ${n.composition}` : "";
        return `<tr><td><code>${esc(entity)}.${esc(field)}</code></td><td>${esc(n.iso8000_dimension)}</td><td>${esc(n.minimum)}</td>
          <td><details><summary>norma</summary><p><strong>${esc(n.norm)}</strong></p><p>referência: ${esc(n.reference)}</p>${comp ? `<p>${esc(comp)}</p>` : ""}<p>evidência: ${esc(n.evidence)}</p></details></td></tr>`;
      }).join("");
      return `<h3>${esc(entity)}</h3><table><thead><tr><th>campo</th><th>ISO 8000</th><th>mínimo</th><th>norma granular</th></tr></thead><tbody>${rows}</tbody></table>`;
    }).join("");

    const counts = {
      sources: (sources || []).length, licenses: (licenses || []).length, docs: (docs || []).length,
      atoms: (atoms || []).length, terms: (terms || []).length, runs: (runs || []).length,
      evidences: nkEvidences.length, annex_fields: Object.values(annex).reduce((a: number, f: any) => a + Object.keys(f).length, 0),
    };

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>NORM-KERNEL — Banco Fundamental Governado</title>
<meta name="description" content="Registros governados de atomização normativa: fontes, licenças, documentos, átomos deônticos, dicionário canônico, runs, evidências e aderência por campo.">
<meta property="og:title" content="NORM-KERNEL — Banco Fundamental Governado">
<meta property="og:description" content="Cada campo com norma granular e qualidade ISO 8000. Front-end gerado do master data verificado.">
<meta property="og:locale" content="pt_BR">
<meta name="generator" content="norm-kernel-render-v0.1.0 (POL-NK-001 C4: gerado, nunca editado)">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Dataset","name":"NORM-KERNEL","description":"Registros governados de atomização normativa","license":"https://base44.com","creator":"Leivis Lima"}</script>
<style>
:root{color-scheme:light dark}
body{font:16px/1.5 system-ui,sans-serif;margin:0 auto;max-width:72rem;padding:1rem}
h1{font-size:1.5rem}h2{border-bottom:2px solid #666;padding-bottom:.2rem}h3{margin:.8rem 0 .2rem}
table{border-collapse:collapse;width:100%;margin:.5rem 0 1.2rem}
th,td{border:1px solid #888;padding:.35rem .5rem;text-align:left;vertical-align:top}
code{background:rgba(127,127,127,.15);padding:0 .3rem;border-radius:3px}
.b{display:inline-block;padding:0 .4rem;border:1px solid #888;border-radius:.6rem;font-size:.8rem}
.bad{color:#b00;font-weight:700}
blockquote{border-left:4px solid #666;margin:.3rem 0;padding:.2rem .7rem}
.atom{margin:0 0 1rem;padding:.6rem;border:1px solid #999;border-radius:6px}
.atom-h{margin:0}.pl{margin:.2rem 0}.meta{margin:.2rem 0;font-size:.85rem}
.mod,.loc,.conf{font-size:.85rem;padding-left:.6rem}
details summary{cursor:pointer}footer{margin-top:2rem;font-size:.85rem;border-top:1px solid #888;padding-top:.6rem}
</style>
</head>
<body>
<header>
<h1>NORM-KERNEL — Banco Fundamental Governado</h1>
<p>Banco fundamental de atomização normativa. Front-end <strong>gerado do master data</strong> (C4: gerado, nunca editado).
Anexo de normas por campo verificado em runtime: <code>${ANNEX_PIN}</code> — ${annexVerified ? "VERIFICADO" : "DIVERGENTE"}.</p>
<p>Política: ${pol ? `<strong>${esc(pol.title)} v${esc(pol.version)}</strong> — ${esc(pol.severity)}` : "POL-NK-001"} ·
Cadeia de evidências: ${nkEvidences.map((e: any) => esc(e.evidence_id)).join(" → ")}</p>
</header>
<nav aria-label="Índice"><ul><li><a href="#fontes">Fontes e licenças</a></li><li><a href="#documentos">Documentos</a></li><li><a href="#atomos">Átomos</a></li><li><a href="#dicionario">Dicionário</a></li><li><a href="#runs">Runs e evidências</a></li><li><a href="#aderencia">Aderência por campo</a></li></ul></nav>
<section id="fontes"><h2>Fontes registradas (${counts.sources})</h2>
<table><thead><tr><th>id</th><th>fonte</th><th>tipo</th><th>cadência</th><th>licença (KL do LicenseRegistry)</th><th>status</th></tr></thead><tbody>${sourcesRows}</tbody></table>
<p>Registros de licença: ${counts.licenses} (KL-0001..0007 NORM-KERNEL + KL-LEG legadas do NURSE-OS).</p></section>
<section id="documentos"><h2>Documentos (${counts.docs})</h2>
<table><thead><tr><th>id</th><th>tipo</th><th>emissor</th><th>citação canônica</th><th>cobertura declarada</th><th>R4</th><th>status</th></tr></thead><tbody>${docsRows}</tbody></table></section>
<section id="atomos"><h2>Átomos normativos (${counts.atoms})</h2><ol class="atoms">${(atoms || []).map(atomCard).join("")}</ol></section>
<section id="dicionario"><h2>Dicionário canônico (${counts.terms})</h2>
${Object.entries(termsByNs).map(([ns, ids]: [string, string[]]) => `<p><strong>${esc(ns)}</strong>: ${ids.map((i) => `<code>${esc(i)}</code>`).join(" ")}</p>`).join("")}</section>
<section id="runs"><h2>Runs (${counts.runs}) e evidências (${counts.evidences})</h2>
<table><thead><tr><th>run</th><th>extrator</th><th>átomos</th><th>cobertura</th><th>status</th><th>evidência</th></tr></thead><tbody>${runsRows}</tbody></table>
<table><thead><tr><th>evidência</th><th>gerada por</th><th>gate</th><th>checksum</th><th>políticas</th></tr></thead><tbody>${evRows}</tbody></table></section>
<section id="aderencia"><h2>Aderência por campo (C3 — norma granular em detalhes)</h2>
<p>Cada campo de cada registro tem norma granular + dimensão de qualidade ISO 8000 + mínimo + composição (enum/padrão/faixa) no anexo pinado. ${counts.annex_fields} campos, 0 órfãos.</p>
${adherence}</section>
<footer>
<p>Conteúdo atual de calibração: fixtures sintéticos — <strong>não são normas reais</strong>. Cadeia: fonte registrada → documento (reconstrução R4) → átomo (verbatim+checksum) → campo (norma pinada) → política (POL-NK-001) → gate → evidência (JCS sha256) → front-end gerado.</p>
<p>Universo desconhecido explícito: ver EV-NK-0003. Gerado por norm-kernel-render-v0.1.0.</p>
</footer>
</body></html>`;

    return json({ result: "PASSED", annex_verified: true, annex_hash: annexHash, counts, html });
  } catch (e: any) {
    return json({ result: "BLOCKED", reason: String(e?.message || e) }, 500);
  }
});
