"""Deterministic Chromium acceptance suite using DOM/CSS/JS injection.
Network navigation to localhost or external URLs is blocked in this execution environment.
This verifies behavior, not actual HTTP hosting or browser enforcement of Vercel headers.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, hashlib, subprocess

ROOT=Path(__file__).resolve().parents[1]
CONFIG=json.loads((ROOT/'vercel.json').read_text())
CSP=next(x['value'] for h in CONFIG['headers'] for x in h['headers'] if x['key']=='Content-Security-Policy')
ORIGIN='https://wutrib.example.invalid'

MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'}

def route_request(route):
    from urllib.parse import urlparse
    parsed=urlparse(route.request.url)
    path=parsed.path.lstrip('/') or 'index.html'
    requested=(ROOT/path).resolve()
    if parsed.netloc != 'wutrib.example.invalid' or not requested.is_relative_to(ROOT) or not requested.is_file():
        route.fulfill(status=404,body='Not found')
        return
    headers={'Content-Security-Policy':CSP,'X-Content-Type-Options':'nosniff'}
    route.fulfill(status=200,body=requested.read_bytes(),content_type=MIME.get(requested.suffix,'application/octet-stream'),headers=headers)


def run():
    checks=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for name,kwargs in [('desktop',{'viewport':{'width':1440,'height':900}}),
                            ('mobile',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
            context=browser.new_context(accept_downloads=True,**kwargs)
            page=context.new_page();page.set_default_timeout(7000)
            errors=[]; requests=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('request',lambda req:requests.append(req.url))
            html=(ROOT/'index.html').read_text()
            css=(ROOT/'styles.css').read_text()
            js='\n'.join([(ROOT/'src/audit.js').read_text(), (ROOT/'src/fixtures.js').read_text(), (ROOT/'src/triage.js').read_text()]).replace('export const ', 'const ').replace('export function ', 'function ').replace("import {escapeCSVCell} from './audit.js';",'')+'\n'+(ROOT/'src/ui.js').read_text().replace("import {parseNFeXML,parseEFDText,auditCrossCheck,findingsCSV,MAX_XML_BYTES,MAX_EFD_BYTES,assessInputReadiness,incompleteAuditReport} from './audit.js';",'').replace("import {demoXMLs,demoEFD} from './fixtures.js';",'').replace("import {createTriageLedger,recordTriage,TRIAGE_LABELS,dossierWithTriage,findingsCSVWithTriage,MAX_REVIEW_NOTE} from './triage.js';",'')
            page.set_content(html)
            page.add_style_tag(content=css)
            page.add_script_tag(content=js)
            page.wait_for_function("document.querySelector('#metric-xml')?.textContent === '3'",timeout=10000)
            assert page.locator('#metric-efd').inner_text()=='3'
            assert page.locator('#metric-matches').inner_text()=='1'
            assert page.locator('#metric-findings').inner_text()=='3'
            assert not requests,requests
            checks.append(f'{name}: local DOM/script interaction (no HTTP)')
            width=page.evaluate('document.documentElement.scrollWidth')
            viewport=page.evaluate('window.innerWidth')
            assert width <= viewport+1, f'Horizontal overflow {width}>{viewport}'
            checks.append(f'{name}: no horizontal overflow')
            page.screenshot(path=str(ROOT/f'preview-{name}-v0.2.png'),full_page=True)
            if name=='mobile':
                assert page.locator('#menu-toggle').get_attribute('aria-expanded')=='false'
                page.locator('#menu-toggle').click()
                assert page.locator('#menu-toggle').get_attribute('aria-expanded')=='true'
                page.keyboard.press('Escape')
                assert page.locator('#menu-toggle').get_attribute('aria-expanded')=='false'
                page.locator('#menu-toggle').click()
            page.locator('nav button[data-view="findings"]').click()
            assert page.locator('#findings-table tr').count()==3
            page.locator('#severity-filter').select_option('HIGH')
            assert page.locator('#findings-table tr').count()==1
            page.locator('#severity-filter').select_option('ALL')
            page.locator('#finding-search').fill('DIFF-')
            assert page.locator('#findings-table tr').count()==1
            page.locator('#finding-search').fill('')
            assert page.locator('button.table-open').count()==3
            page.locator('button.table-open').first.click()
            assert 'HIPÓTESE' in page.locator('#finding-detail').inner_text()
            # Triage is an unapproved, ephemeral annotation; new note appears in filters and exports.
            page.locator('#triage-status').select_option('INVESTIGATING')
            page.locator('#triage-note').fill('Verificar documento fictício e fonte do C100.')
            page.locator('#triage-form button[type=submit]').click()
            assert 'Em investigação' in page.locator('#findings-table').inner_text()
            page.locator('#triage-filter').select_option('INVESTIGATING')
            assert page.locator('#findings-table tr').count()==1
            page.locator('#triage-filter').select_option('ALL')
            page.screenshot(path=str(ROOT/f'preview-triage-v0.3-{name}.png'),full_page=True)
            with page.expect_download() as dl:
                page.locator('#export-csv').click()
            assert dl.value.suggested_filename.endswith('.csv')
            with page.expect_download() as dl:
                page.locator('#export-json').click()
            assert dl.value.suggested_filename.endswith('.json')
            json_file=Path(dl.value.path())
            exported=json.loads(json_file.read_text(encoding='utf-8'))
            assert exported['triageMode']=='EPHEMERAL_CLIENT_ONLY'
            assert exported['approval']=='NOT_APPROVED'
            assert exported['audit']['taxConformity']=='NOT_EVALUATED'
            assert len(exported['reviews'])==1
            assert exported['reviews'][0]['status']=='INVESTIGATING'
            checks.append(f'{name}: filters/triage/exports with no approval')
            if name=='mobile':
                page.locator('#menu-toggle').click()
            page.locator('nav button[data-view="import"]').click()
            # Tests a user replacing demo XML with a corrupt file; must not infer missing documents.
            page.locator('#xml-files').set_input_files({'name':'invalida.xml','mimeType':'application/xml','buffer':b'<broken>'})
            page.wait_for_function("document.querySelector('#import-state').textContent.includes('LOTE INCOMPLETO')", timeout=5000)
            assert page.locator('#metric-findings').inner_text()=='0'
            assert page.locator('#last-run-match').inner_text().startswith('NÃO EXECUTADO')
            assert page.locator('#export-csv').is_disabled()
            checks.append(f'{name}: fail-closed invalid XML')
            # Regression: one valid + one invalid XML; subsequently reselecting a valid
            # EFD must NEVER clear the XML error and create speculative MISSING_XML.
            assets=json.loads(subprocess.check_output(['node','--input-type=module','-e',
              "import {demoXMLs,demoEFD} from './src/fixtures.js'; console.log(JSON.stringify({xml:demoXMLs[0],efd:demoEFD}));"], cwd=ROOT,text=True))
            page.locator('#xml-files').set_input_files([
              {'name':'valida.xml','mimeType':'application/xml','buffer':assets['xml'].encode()},
              {'name':'rejeitada.txt','mimeType':'text/plain','buffer':b'invalid'}
            ])
            page.wait_for_function("document.querySelector('#import-state').textContent.includes('LOTE INCOMPLETO')")
            assert page.locator('#export-json').is_disabled()
            page.locator('#efd-file').set_input_files({'name':'efd-valida.txt','mimeType':'text/plain','buffer':assets['efd'].encode()})
            page.wait_for_function("document.querySelector('#import-state').textContent.includes('LOTE INCOMPLETO')")
            assert page.locator('#export-csv').is_disabled()
            assert page.locator('#metric-findings').inner_text()=='0'
            assert 'rejeitada.txt' in page.locator('#import-warnings').inner_text()
            checks.append(f'{name}: selection error preserved after EFD reimport')
            page.locator('#reset-demo').click()
            assert page.locator('#metric-findings').inner_text()=='3'
            page.locator('#menu-toggle').click() if name=='mobile' and page.locator('#menu-toggle').get_attribute('aria-expanded')=='false' else None
            page.locator('nav button[data-view="findings"]').click()
            assert 'Em investigação' not in page.locator('#findings-table').inner_text()
            checks.append(f'{name}: new source clears stale local triage')
            if name=='mobile': page.locator('#menu-toggle').click()
            page.locator('nav button[data-view="import"]').click()
            assert page.locator('#export-csv').is_enabled()
            # invalid EFD cannot retain previously valid demo source
            page.locator('#efd-file').set_input_files({'name':'danificada.txt','mimeType':'text/plain','buffer':b'|C100|faltando-cabecalho|'})
            assert page.locator('#metric-findings').inner_text()=='0'
            page.wait_for_function("document.querySelector('#import-state').textContent.includes('LOTE INCOMPLETO')", timeout=5000)
            checks.append(f'{name}: fail-closed EFD')
            assert not errors,errors
            checks.append(f'{name}: no uncaught JS errors')
            context.close()
        browser.close()
    return checks

if __name__=='__main__':
    print(json.dumps({'result':'PASS','checks':run()},ensure_ascii=False,indent=2))
