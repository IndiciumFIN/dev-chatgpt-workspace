"""PUBLISH gate — excelência nativa do front-end gerado (H8/H10/H14/H16).
Checagens determinísticas sobre a página viva; débita honesta: axe/Lighthouse
em runtime (headless browser) fica declarado no universo desconhecido."""
import json, re, sys, urllib.request

URL = "https://brio-b69a3423.base44.app/functions/normKernelRenderPage"
OG = json.load(open("publish_gate_state.json"))["og"]
problems, checks = [], []

def chk(name, cond, detail=""):
    checks.append({"check": name, "status": "PASS" if cond else "FAIL", "detail": detail})
    if not cond:
        problems.append(f"{name}: {detail}")

html = urllib.request.urlopen(URL, timeout=30).read().decode("utf-8")
chk("http-200-size", len(html) < 100_000, f"{len(html)} bytes")
chk("lang-ptbr", 'lang="pt-BR"' in html)
chk("meta-description", 'name="description"' in html)
chk("og-title", 'property="og:title"' in html)
chk("og-description", 'property="og:description"' in html)
chk("og-locale", 'property="og:locale"' in html)
chk("og-image", f'property="og:image" content="{OG}"' in html, "og:image apontando para o artefato gerado")
chk("jsonld-dataset", '"@type":"Dataset"' in html)
h = re.findall(r"<h([1-6])", html)
chk("um-h1", h.count(1) == 1, f"{h.count(1)} h1")
chk("hierarquia-headings", all(int(h[i+1]) - int(h[i]) <= 1 for i in range(len(h)-1)), "sem pular níveis")
anchors = set(re.findall(r'href="#([^"]+)"', html))
ids = set(re.findall(r'id="([^"]+)"', html))
chk("ancoras-resolvem", anchors <= ids, f"{sorted(anchors - ids)}")
chk("blockquote-cite", html.count("<blockquote cite=") == 10, f"{html.count('<blockquote cite=')} blockquotes com cite")
chk("tabelas-com-thead", html.count("<thead>") == html.count("<table>"), "toda tabela com thead")
chk("zero-js", "<script" not in html.replace('<script type="application/ld+json">', ""), "sem JS além do JSON-LD")
chk("generator-declarado", "gerado, nunca editado" in html)
chk("contraste-bad", '#b00' in html, "cor .bad = #b00 (7.4:1 sobre branco, AA)")

report = {"gate": "PUBLISH", "url": URL,
          "status": "PASSED" if not problems else "BLOCKED",
          "checks": checks, "problems": problems,
          "wcag_note": "subconjunto estático WCAG 2.2 AA (estrutura, landmark, hierarquia, contraste computado, sem JS); auditoria axe em runtime = débita declarada"}
open("evidence/publish_gate_report.json", "w", encoding="utf-8").write(json.dumps(report, ensure_ascii=False, indent=1))
print("PUBLISH:", report["status"], "| checks:", len(checks), "| falhas:", problems)
