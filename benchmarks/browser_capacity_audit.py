"""Browser capacity audit. Intercepted origin, synthetic EFD only, zero requests to production."""
from pathlib import Path
from urllib.parse import urlparse
from time import monotonic
from playwright.sync_api import sync_playwright
import json

ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://wutrib.example.invalid'
manifest=json.loads((ROOT/'vercel.json').read_text())
HEADERS={e['key']:e['value'] for h in manifest['headers'] for e in h['headers']}
MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'}
def route_fn(route):
    parsed=urlparse(route.request.url)
    p=(ROOT/(parsed.path.lstrip('/') or 'index.html')).resolve()
    if parsed.netloc!='wutrib.example.invalid' or not p.is_relative_to(ROOT) or not p.is_file():
        route.fulfill(status=404,body='Not found')
        return
    route.fulfill(status=200,body=p.read_bytes(),headers=HEADERS,
                  content_type=MIME.get(p.suffix,'application/octet-stream'))
def efd_lines(n):
    rows=['|0000|']
    for i in range(1,n+1):
        rows.append('|C100|1|0|PART|55|00|1|'+str(i)+'|'+str(i).zfill(44)+'|01112026|01112026|120,00|')
    return ('\n'.join(rows)+'\n').encode('utf-8')

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--enable-precise-memory-info'])
    for count in [1000,10000,35000]:
        raw=efd_lines(count)
        assert len(raw)<=4*1024*1024
        page=browser.new_page(viewport={'width':1366,'height':768})
        page.route('**/*',route_fn)
        page.goto(ORIGIN+'/',wait_until='load',timeout=30000)
        page.wait_for_function("document.querySelector('#metric-efd')?.textContent === '3'",timeout=30000)
        stamp=monotonic()
        page.locator('#efd-file').set_input_files({
          'name':'efd-ficticia-capacidade.txt','mimeType':'text/plain','buffer':raw
        })
        try:
            page.wait_for_function(
                "(n)=>document.querySelector('#metric-efd')?.textContent === String(n)",arg=count,timeout=45000)
            elapsed=(monotonic()-stamp)*1000
            stats=page.evaluate("""()=>{
              return {rows:document.querySelectorAll('#findings-table tr').length,
                total_count:document.querySelector('#result-count')?.textContent,
                page_status:document.querySelector('#findings-page-status')?.textContent,
                dom_nodes:document.querySelectorAll('*').length,
                js_heap_mib:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(1):null,
                status:document.querySelector('#import-state')?.textContent
              }
            }""")
            assert stats['rows'] <= 50, 'render window must be bounded'
            assert stats['rows'] == 50
            assert stats['dom_nodes'] < 4000, 'DOM may not scale with all records'
            assert stats['page_status'].startswith('Página 1 de ')
            assert str(count+3) in stats['total_count'], '3 existing XML fixtures must remain unmatched'
            assert stats['status'] == 'PROCESSAMENTO LOCAL'
            page.locator('#findings-next').click()
            assert page.locator('#findings-page-status').inner_text().startswith('Página 2 de ')
            assert page.locator('#findings-table tr').count() == 50
            page.locator('#findings-prev').click()
            assert page.locator('#findings-page-status').inner_text().startswith('Página 1 de ')
            print('WUTRIB_UI_CAPACITY='+json.dumps(dict(
                records=count,input_bytes=len(raw),elapsed_ms=round(elapsed,2),**stats
            )))
        finally:
            page.close()
    browser.close()
