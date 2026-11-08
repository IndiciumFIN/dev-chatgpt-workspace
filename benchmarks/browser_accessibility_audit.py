"""Audit-only Playwright + axe on intercepted origin: browser executes real ES modules and CSP.
No connections to Vercel, Supabase, or customer systems. Results are indicative, not WCAG certification.
"""
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
import json

ROOT=Path(__file__).resolve().parents[1]
BASE='https://wutrib.example.invalid'
manifest=json.loads((ROOT/'vercel.json').read_text())
GLOBAL_HEADERS={e['key']:e['value'] for h in manifest['headers'] for e in h['headers']}
MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'}
def route_fn(route):
    u=urlparse(route.request.url)
    p=u.path.lstrip('/') or 'index.html'
    path=(ROOT/p).resolve()
    if u.netloc!='wutrib.example.invalid' or not path.is_relative_to(ROOT) or not path.is_file():
        route.fulfill(status=404,body='Not found');return
    route.fulfill(status=200,body=path.read_bytes(),
                  content_type=MIME.get(path.suffix,'application/octet-stream'),
                  headers=GLOBAL_HEADERS)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for title,width,height in [('desktop',1440,900),('mobile',390,844)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        page.route('**/*',route_fn)
        page.goto(BASE+'/',wait_until='load',timeout=30000)
        page.wait_for_function("document.querySelector('#metric-xml')?.textContent === '3'",timeout=30000)
        page.add_script_tag(url=BASE+'/node_modules/axe-core/axe.min.js')
        result=page.evaluate("""async()=>{
          const r=await axe.run(document,{
            runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}
          });
          return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,
            affected:v.nodes.length,description:v.help})),
            incomplete:r.incomplete.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),
            passes:r.passes.length};
        }""")
        result['view']=title
        print('WUTRIB_A11Y_AUDIT='+json.dumps(result,ensure_ascii=False))
        # Report violations rather than declaring all accessibility compliance.
        page.close()
    browser.close()
