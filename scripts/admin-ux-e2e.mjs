#!/usr/bin/env node
/** Browser real: matriz mobile-first /admin + /central-comando, em servidor local isolado.
 * Sem chamadas remotas de mutação; não executa WO.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const base = process.env.ADMIN_E2E_BASE_URL || 'http://127.0.0.1:4173';
const dir = 'audit-evidence/admin-ux';
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const summary = [], errors = [];
const widths = [320,360,390,430,768,1024,1440];
async function assertNoOverflow(page,label) {
  const m=await page.evaluate(()=>{
    const html=document.documentElement;
    const el=document.querySelector('.ce-admin, .cc-page');
    return {viewport:window.innerWidth,documentWidth:html.scrollWidth,appWidth:Math.ceil(el?.scrollWidth??0),appClient:Math.ceil(el?.clientWidth??0)};
  });
  summary.push({label,...m});
  assert.ok(m.appClient>0,label+': main not rendered');
  assert.ok(m.appWidth-m.appClient<=2,label+': panel overflow '+JSON.stringify(m));
  assert.ok(m.documentWidth-m.viewport<=2,label+': page horizontal overflow '+JSON.stringify(m));
}
async function screenshot(page,file) {
  await page.screenshot({path:dir+'/'+file,fullPage:true,animations:'disabled'});
}
function wireErrors(page,tag) {
  page.on('pageerror',e=>errors.push({route:tag,error:e.message}));
  page.on('console',e=>{if(e.type()==='error') errors.push({route:tag,error:e.text()});});
}
try{
  for(const width of widths){
    const mobile=width<680;
    const p=await browser.newPage({viewport:{width,height:mobile?780:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,reducedMotion:'reduce'});
    wireErrors(p,'admin-'+width);
    await p.goto(base+'/admin',{waitUntil:'networkidle'});
    await p.getByRole('heading',{name:'Centro de administração'}).waitFor();
    await p.getByRole('heading',{name:'Fila única de execução'}).waitFor();
    const select=p.locator('#ce-admin-mobile-module');
    const nav=p.getByRole('navigation',{name:'Módulos da administração'});
    if(width<960) {
      assert.equal(await select.isVisible(),true,'module selector absent at '+width);
      assert.equal(await nav.isVisible(),false,'desktop nav exposed at '+width);
    } else {
      assert.equal(await select.isVisible(),false,'mobile select exposed at '+width);
      assert.equal(await nav.isVisible(),true,'desktop nav absent at '+width);
    }
    await assertNoOverflow(p,'admin-pmo-'+width);
    await screenshot(p,'admin-pmo-'+width+'.png');
    if(width<960) await select.selectOption('templates');
    else await nav.getByRole('button',{name:/Templates/}).click();
    await p.getByRole('heading',{name:'Inventário canônico de templates'}).waitFor();
    await assertNoOverflow(p,'admin-templates-'+width);
    if([320,390,768,1440].includes(width)) await screenshot(p,'admin-templates-'+width+'.png');
    if(width<960) await select.selectOption('content');
    else await nav.getByRole('button',{name:/Conteúdos/}).click();
    await p.locator('#admin-tool-title').waitFor();
    await assertNoOverflow(p,'admin-content-'+width);
    if([320,390,768,1440].includes(width)) await screenshot(p,'admin-content-'+width+'.png');
    if(width===390){
      await p.locator('#admin-tool-title').fill('Escala de Braden · mobile-first QA');
      await p.getByRole('button',{name:'Salvar rascunho'}).click();
      await select.selectOption('publication');
      await p.getByRole('checkbox',{name:/Entendo que esta publicação/}).check();
      await p.getByRole('button',{name:/Publicar rascunho salvo/}).click();
      await p.getByText(/Projeção LOCAL publicada/).waitFor();
      await p.reload({waitUntil:'networkidle'});
      await p.locator('#ce-admin-mobile-module').selectOption('content');
      await p.getByRole('radio',{name:'Publicado local'}).check();
      await p.getByRole('heading',{name:'Escala de Braden · mobile-first QA',exact:true}).waitFor();
      await screenshot(p,'admin-editor-save-local-390.png');
    }
    await p.close();
  }
  for(const width of widths){
    const mobile=width<680;
    const p=await browser.newPage({viewport:{width,height:mobile?780:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,reducedMotion:'reduce'});
    wireErrors(p,'command-'+width);
    await p.goto(base+'/central-comando',{waitUntil:'networkidle'});
    await p.getByRole('heading',{name:'Central de Comando'}).waitFor();
    await assertNoOverflow(p,'command-'+width);
    await p.getByRole('button',{name:/Tabelas propostas/}).click();
    await p.getByRole('heading',{name:'Inventário lógico v1.0'}).waitFor();
    await assertNoOverflow(p,'command-tables-'+width);
    if([320,390,768,1440].includes(width)) await screenshot(p,'command-tables-'+width+'.png');
    if(width===390){
      await p.getByRole('searchbox',{name:/Pesquisar tabela/}).fill('gov.polic');
      await p.getByText('gov.policies',{exact:true}).waitFor();
      assert.equal(await p.getByRole('button',{name:/Executar WO/}).isDisabled(),true,'WO must be disabled');
      await p.locator('#command-prompt').fill('Consultar tarefas aprovadas');
      await p.getByRole('button',{name:/Pré-checar/}).click();
      await p.getByText(/Nenhuma solicitação remota/).waitFor();
      await p.getByRole('tab',{name:'Agentes'}).click();
      await p.getByText(/Sem agente, permissões/).waitFor();
    }
    await p.close();
  }
  assert.deepEqual(errors,[],'browser JavaScript/console errors');
  console.log('PASS ADMIN E2E: 7 viewports x 2 routes, PMO, editor, cards, blocked WO; '+summary.length+' overflow checks');
}catch(e){
  console.error('FAIL ADMIN E2E',e);
  process.exitCode=1;
}finally{
  writeFileSync(dir+'/mobile-matrix.json',JSON.stringify({base,checkedAt:new Date().toISOString(),summary,errors},null,2)+'\n');
  await browser.close();
}
