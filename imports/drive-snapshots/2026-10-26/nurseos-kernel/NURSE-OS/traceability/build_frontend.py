#!/usr/bin/env python3
"""
BUILD FRONTEND — o front-end é GERADO do grafo verificado (MD + legislação + dados)
================================================================================
POL-026: ninguém edita o HTML. Edita-se o MD; o front-end regenera.
"""
import json, os, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
g = json.load(open(f"{HERE}/links-verified.json", encoding="utf-8"))

SEV_COLORS = {"blocking": "#b91c1c", "runtime": "#b45309", "ci_gate": "#1d4ed8", "graph": "#4338ca"}
STATUS_COLORS = {"covered": "#15803d", "partial": "#a16207", "blocked": "#b91c1c",
                 "data_level": "#475569", "knowledge_level": "#6d28d9"}

def esc(t): return (t or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def policy_card(pid, p):
    secs = "".join(f'<span class="chip md">MD §{esc(s.split(".")[0])} · {esc(s.split("—")[0][3:40])}</span>'
                   for s in p["source_md"]["sections"][:2])
    legal = f'<span class="chip ok">aderência sustentada · {len(p["legal_basis"])} norma(s) granular(es) em registro</span>' 
    runs = "".join(f'<a class="chip run">{esc(r)}</a>' for r in p["runs"]) or '<span class="chip muted">—</span>'
    c = SEV_COLORS.get(p["severity"], "#475569")
    return f'''<div class="card">
  <div class="card-head"><span class="pid">{pid}</span><span class="sev" style="background:{c}">{esc(p['severity'])}</span><span class="ver">v{esc(p['version'])}</span></div>
  <p class="title">{esc(p['title'])}</p>
  <div class="row"><label>fonte MD</label>{secs}</div>
  <div class="row"><label>base legal</label>{legal}</div>
  <div class="row"><label>runs</label>{runs}</div>
</div>'''

cards = "".join(policy_card(pid, p) for pid, p in sorted(g["policies"].items()))
def field_card(f):
    return f'''<div class="card">
  <div class="card-head"><span class="pid">{esc(f["entity"])}</span><span class="field">{esc(f["field"])}</span><span class="sev" style="background:#15803d">aderência evidenciada</span></div>
  <p class="title">{esc(f["evidencia"])}</p>
  <details><summary>norma granular que sustenta</summary><span class="chip legal">{esc(f["norm"])}</span></details>
</div>'''
field_cards = "".join(field_card(f) for f in g.get("field_adherence", []))
vrows = "".join(
    f'<tr><td>{esc(v["vertical_id"])}</td><td>{esc(v["name"])}</td>'
    f'<td><span class="vstatus" style="background:{STATUS_COLORS.get(v["status"], "#475569")}">{esc(v["status"])}</span></td>'
    f'<td>{esc(v.get("mission_ref") or "—")}</td><td>{esc(v.get("run_ref") or "—")}</td><td>{esc(v.get("outcome_ref") or "—")}</td></tr>'
    for v in g["verticals"])

chain = ' <span class="arrow">→</span> '.join(f'<span class="chainstep">{esc(c)}</span>' for c in g["chain"])

html = f'''<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NURSE-OS — Rastreabilidade Integral</title><style>
:root{{--bg:#0f172a;--card:#1e293b;--text:#e2e8f0;--muted:#94a3b8;--accent:#38bdf8}}
*{{box-sizing:border-box}} body{{margin:0;font-family:-apple-system,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);padding:32px}}
h1{{font-size:22px;margin:0 0 6px}} .sub{{color:var(--muted);font-size:13px;margin-bottom:24px}}
.banner{{background:linear-gradient(90deg,#0ea5e9,#6366f1);padding:14px 18px;border-radius:10px;font-size:14px;font-weight:600;margin-bottom:28px;display:flex;flex-wrap:wrap;align-items:center;gap:8px}}
.chainstep{{background:rgba(0,0,0,.25);padding:4px 10px;border-radius:6px}} .arrow{{opacity:.7}}
h2{{font-size:15px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin:28px 0 12px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px}}
.card{{background:var(--card);border-radius:10px;padding:14px;border:1px solid #334155}}
.card-head{{display:flex;gap:8px;align-items:center;margin-bottom:6px}}
.pid{{font-weight:700;font-family:monospace}} .sev{{font-size:10px;padding:2px 8px;border-radius:99px;color:#fff}} .ver{{font-size:11px;color:var(--muted)}}
.title{{font-size:13px;margin:0 0 10px;line-height:1.4}}
.row{{margin:6px 0;font-size:11px}} .row label{{display:block;color:var(--muted);text-transform:uppercase;font-size:9px;letter-spacing:.08em;margin-bottom:3px}}
.chip{{display:inline-block;background:#334155;padding:2px 8px;border-radius:5px;margin:2px 4px 2px 0;font-size:10.5px}}
.chip.legal{{background:#312e81}} .chip.ok{{background:#14532d}} .field{{color:var(--accent);font-family:monospace;font-size:11px}}
details{{margin-top:6px}} details summary{{font-size:10.5px;color:var(--muted);cursor:pointer}} .chip.md{{background:#14532d}} .chip.run{{background:#7c2d12;cursor:pointer}} .chip.muted{{background:#334155;color:var(--muted)}}
table{{width:100%;border-collapse:collapse;background:var(--card);border-radius:10px;overflow:hidden;font-size:12.5px}}
th{{text-align:left;padding:10px;background:#0b1220;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.08em}}
td{{padding:9px 10px;border-top:1px solid #334155}} .vstatus{{font-size:10px;padding:2px 8px;border-radius:99px;color:#fff}}
footer{{margin-top:30px;padding:14px;background:var(--card);border-radius:10px;border:1px dashed #475569;font-size:12px;color:var(--muted)}}
</style></head><body>
<h1>NURSE-OS — Rastreabilidade Integral</h1>
<div class="sub">Todo artefato provém do MD fonte. A norma granular não é exibida — ela sustenta: cada campo carrega a evidência de aderência regulatória em registro. Front-end gerado, jamais editado — POL-026 v1.1.</div>
<div class="banner">{chain}</div>
<h2>Legislação executável ({len(g['policies'])} políticas — cada uma com fonte MD e base legal)</h2>
<div class="grid">{cards}</div>
<h2>Aderência regulatória por campo (norma granular sustenta — POL-026 v1.1)</h2>
<div class="grid">{field_cards}</div>
<h2>Verticais (estado auditado — POL-025)</h2>
<table><tr><th>vertical</th><th>nome</th><th>estado</th><th>missão</th><th>run</th><th>outcome</th></tr>{vrows}</table>
<footer><strong>Este HTML não é editado à mão.</strong> Gerado por <code>build_frontend.py</code> a partir de <code>nursing-intelligence-os-v2.md</code> + <code>policies.json</code> + <code>links.json</code> (grafo verificado). Para mudar o front-end, mude o MD e regenere. Gerado em {datetime.datetime.now().isoformat(timespec="seconds")}.</footer>
</body></html>'''

out = f"{HERE}/frontend/index.html"
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, "w", encoding="utf-8").write(html)
print(f"frontend gerado: {out} ({len(g['policies'])} políticas, {len(g['verticals'])} verticais)")
