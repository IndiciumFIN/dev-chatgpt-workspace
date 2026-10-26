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
    return {viewport:window.innerWidth,visual:Math.round(window.visualViewport?.width??0),documentWidth:html.scrollWidth,appWidth:Math.ceil(el?.scrollWidth??0),appClient:Math.ceil(el?.clientWidth??0),offenders:[...el.querySelectorAll('*')].filter(n=>{const r=n.getBoundingClientRect();const st=getComputedStyle(n);return st.display!=='none'&&(n.scrollWidth>n.clientWidth+4||r.right>el.clientWidth+4);}).sort((a,b)=>(b.scrollWidth-b.clientWidth)-(a.scrollWidth-a.clientWidth)).slice(0,12).map(n=>({tag:n.tagName,cls:typeof n.className==='string'?n.className.slice(0,80):'',scroll:n.scrollWidth,client:n.clientWidth,left:Math.round(n.getBoundingClientRect().left),right:Math.round(n.getBoundingClientRect().right)}))};
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
async function selectModule(page,width,group,id) {
  if(width<960) await page.locator('.ce-admin-mobile-launch').click();
  const nav=width<960
    ? page.getByRole('navigation',{name:'Módulos da administração — mobile'})
    : page.getByRole('navigation',{name:'Módulos da administração',exact:true});
  const groupPanel=nav.locator('[data-admin-group="'+group+'"]');
  const toggle=groupPanel.locator('.ce-admin-tree-group-button');
  if((await toggle.getAttribute('aria-expanded'))==='false') await toggle.click();
  await groupPanel.locator('[data-admin-module="'+id+'"]').click();
  if(width<960) await page.locator('.ce-admin-mobile-dialog').waitFor({state:'hidden'});
}
try{
  for(const width of widths){
    const mobile=width<680;
    const p=await browser.newPage({viewport:{width,height:mobile?780:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,reducedMotion:'reduce'});
    wireErrors(p,'admin-'+width);
    await p.goto(base+'/admin',{waitUntil:'networkidle'});
    await p.getByRole('banner',{name:'Cabeçalho da administração'}).waitFor();
    assert.equal(await p.getByRole('button',{name:/Notificações/}).isVisible(),true,'notificações ausentes');
    assert.equal(await p.getByRole('button',{name:'Configurações'}).isVisible(),true,'configurações ausentes');
    assert.equal(await p.getByRole('button',{name:'Meu perfil'}).isVisible(),true,'avatar ausente');
    assert.equal(await p.getByRole('button',{name:'Sair indisponível'}).isDisabled(),true,'prévia sem login não deve simular logout');
    assert.equal(await p.getByText('Prévia administrativa local — não é a autoridade corporativa.').count(),0);
    assert.equal(await p.getByText('Registro local carregado.').count(),0);
    assert.equal(await p.getByText('MACROGRUPOS', {exact:true}).count(),0);
    await p.getByRole('button',{name:'Configurações'}).click();
    await p.getByRole('checkbox',{name:/Visualização compacta/}).check();
    assert.equal(await p.locator('.ce-admin--compact').count(),1,'compact layout not active');
    await p.getByRole('button',{name:'Configurações'}).click();
    await p.getByRole('button',{name:/Notificações/}).click();
    await p.getByRole('button',{name:'Consultar PMO'}).waitFor();
    await p.getByRole('button',{name:/Notificações/}).click();
    await p.getByRole('heading',{name:'Visão geral'}).waitFor();
    const desktopNav=p.getByRole('navigation',{name:'Módulos da administração',exact:true});
    const mobileLaunch=p.locator('.ce-admin-mobile-launch');
    if(width<960) {
      assert.equal(await mobileLaunch.isVisible(),true,'mobile drawer trigger absent at '+width);
      assert.equal(await desktopNav.isVisible(),false,'desktop sidebar exposed at '+width);
    } else {
      assert.equal(await mobileLaunch.isVisible(),false,'mobile drawer trigger exposed at '+width);
      assert.equal(await desktopNav.isVisible(),true,'desktop sidebar absent at '+width);
      assert.equal(await desktopNav.locator('[data-admin-group]').count(),7,'seven groups required');
    }
    await selectModule(p,width,'G02','M03');
    await p.getByRole('navigation',{name:'Submódulos de PMO e Projetos'}).getByRole('button',{name:'Work Orders'}).click();
    await p.getByRole('button',{name:/Abrir funcionalidade existente de Work Orders/}).click();
    await p.getByRole('heading',{name:'Fila única de execução'}).waitFor();
    await assertNoOverflow(p,'admin-pmo-'+width);
    await screenshot(p,'admin-pmo-'+width+'.png');
    if(width===390){
      const expand=p.getByRole('button',{name:/Mostrar todas as/});
      assert.equal(await expand.isVisible(),true,'PMO expand action missing');
      await expand.click();
      assert.equal(await p.locator('[data-work-id]').count(),10,'expanded PMO should expose all orders');
      await p.getByRole('button',{name:'Recolher lista'}).click();
      assert.equal(await p.locator('[data-work-id]').count(),4,'collapsed PMO should be concise');
      await p.getByText(/Consultar achados em quarentena/).click();
      await p.getByText(/Consultar achados em quarentena/).click();
    }
    await selectModule(p,width,'G03','M18');
    await p.getByRole('heading',{name:'Governança Clínica e Segurança'}).last().waitFor();
    await p.getByRole('tab',{name:'Formulários'}).click();
    await p.getByRole('heading',{name:'Formulário de cadastro'}).waitFor();
    if(width===390){
      const form=p.locator('.ce-workspace .ce-schema');
      await form.getByRole('textbox',{name:/Identificador canônico/}).fill('ID com espaços!');
      await form.getByText(/Use apenas letras, números/).waitFor();
      await form.getByRole('textbox',{name:/Identificador canônico/}).fill('CKO:CLIN-001');
      await form.getByRole('button',{name:/Revisar rascunho/}).click();
      await form.getByText(/Há \d+ erro/).first().waitFor();
      await form.getByRole('combobox',{name:/Template \/ contrato/}).selectOption('safety_check');
      await form.getByRole('heading',{name:'Formulário de cadastro'}).waitFor();
      const moduleTemplate=await form.getByRole('combobox',{name:/Template \/ contrato/}).inputValue();
      assert.equal(moduleTemplate,'safety_check','schema template must update on selection');
    }
    await assertNoOverflow(p,'admin-planned-module-'+width);
    if([320,390,768,1440].includes(width)) await screenshot(p,'admin-module-M18-'+width+'.png');
    if(width===390){
      await selectModule(p,width,'G03','M07');
      await p.getByRole('heading',{name:'Kernel e Conhecimento'}).last().waitFor();
      await assertNoOverflow(p,'admin-planned-module-M07-390');
    }
    await selectModule(p,width,'G01','M04');
    await p.getByRole('button',{name:/Abrir funcionalidade existente de Governança corporativa/}).click();
    await p.getByRole('heading',{name:'Governança e evidências'}).waitFor();
    await assertNoOverflow(p,'admin-governance-'+width);
    if([320,390,768,1440].includes(width)) await screenshot(p,'admin-governance-'+width+'.png');
    if(width===390) {
      await p.getByRole('tab',{name:'Normativos'}).click();
      assert.equal(await p.locator('.ce-gov-item').count(),8,'norms must start with eight records');
      await p.getByRole('button',{name:/Mostrar mais 8/}).click();
      assert.equal(await p.locator('.ce-gov-item').count(),16,'governance list must expand');
      await p.locator('#ce-gov-search').fill('8000');
      await assertNoOverflow(p,'admin-governance-search-390');
    }
    await selectModule(p,width,'G04','M10');
    if(width===390){
      await p.getByRole('tab',{name:'Formulários'}).click();
      await p.getByText(/Sem contrato de formulário específico para Design tokens/).waitFor();
      await p.getByRole('tab',{name:'Registros'}).click();
    }
    await p.getByRole('navigation',{name:'Submódulos de Design System e Interfaces'}).getByRole('button',{name:'Templates e slots'}).click();
    if(width===390){
      await p.getByRole('tab',{name:'Relatórios'}).click();
      assert.equal(await p.getByRole('button',{name:'Exportar CSV'}).isEnabled(),true,'real templates report must export');
      await p.getByRole('tab',{name:'Registros'}).click();
      await p.getByRole('button',{name:'Visualizar tabela'}).click();
      await assertNoOverflow(p,'admin-templates-table-390');
    }
    await p.getByRole('button',{name:/Abrir funcionalidade existente de Templates e slots/}).click();
    await p.getByRole('heading',{name:'Inventário canônico de templates'}).waitFor();
    if(width===390){
      const initial=await p.locator('.ce-admin-table tbody tr').count();
      assert.ok(initial<=8,'mobile templates should start with <=8 rows');
      await p.getByRole('button',{name:/Mostrar todos os .* templates/}).click();
      assert.ok(await p.locator('.ce-admin-table tbody tr').count()>8,'templates expansion did not work');
      await p.getByRole('button',{name:'Recolher inventário'}).click();
    }
    if([320,390,768,1440].includes(width)) await screenshot(p,'admin-templates-'+width+'.png');
    await assertNoOverflow(p,'admin-templates-'+width);
    await selectModule(p,width,'G04','M08');
    if(width===390){
      await p.getByText(/Não há coleção canônica consultável para este submódulo/).waitFor();
      await p.getByRole('tab',{name:'Formulários'}).click();
      await p.getByText(/Sem contrato de formulário específico para Catálogo de produtos/).waitFor();
      await p.getByRole('tab',{name:'Registros'}).click();
    }
    await p.getByRole('navigation',{name:'Submódulos de Produtos e Ferramentas'}).getByRole('button',{name:'Calculadoras'}).click();
    await p.getByRole('button',{name:'Editar metadados'}).first().click();
    await p.locator('#admin-tool-title').waitFor();
    await assertNoOverflow(p,'admin-content-'+width);
    if([320,390,768,1440].includes(width)) await screenshot(p,'admin-content-'+width+'.png');
    if(width===390){
      await p.locator('#admin-tool-title').fill('Escala de Braden · mobile-first QA');
      await p.getByRole('button',{name:'Salvar rascunho'}).click();
      await selectModule(p,width,'G06','M15');
      await p.getByRole('navigation',{name:'Submódulos de Publicação e Distribuição'}).getByRole('button',{name:'Publicação'}).click();
      await p.getByRole('button',{name:/Abrir funcionalidade existente de Publicação/}).click();
      await p.getByRole('checkbox',{name:/Entendo que esta publicação/}).check();
      await p.getByRole('button',{name:/Publicar rascunho salvo/}).click();
      await p.getByText(/Projeção LOCAL publicada/).waitFor();
      await p.reload({waitUntil:'networkidle'});
      await selectModule(p,width,'G04','M08');
      await p.getByRole('navigation',{name:'Submódulos de Produtos e Ferramentas'}).getByRole('button',{name:'Calculadoras'}).click();
      await p.getByRole('button',{name:'Editar metadados'}).first().click();
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
    if(width===390){
      assert.equal(await p.locator('.cc-table-wrap tbody tr').count(),12,'catalog must show 12 records initially');
      await p.getByRole('button',{name:/Mostrar mais 12 tabelas/}).click();
      assert.equal(await p.locator('.cc-table-wrap tbody tr').count(),24,'catalog pagination did not reveal next page');
    }
    await assertNoOverflow(p,'command-tables-'+width);
    if([320,390,768,1440].includes(width)) await screenshot(p,'command-tables-'+width+'.png');
    if(width===390){
      await p.getByRole('searchbox',{name:/Pesquisar tabela/}).fill('gov.polic');
      await p.getByText('gov.policies',{exact:true}).waitFor();
      assert.equal(await p.getByRole('button',{name:/Executar WO/}).isDisabled(),true,'WO must be disabled');
      await p.locator('#command-prompt').fill('Consultar tarefas aprovadas');
      await p.getByRole('button',{name:/Pré-checar/}).click();
      await p.getByText(/nenhuma solicitação remota/i).waitFor();
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
