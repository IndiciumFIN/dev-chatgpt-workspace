import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

// Node 22 transpila somente anotações de tipo; o teste valida o MESMO modelo TS importado pela UI.
test('CE Builder: contrato canônico, revisão, importação e limites locais', () => {
  const code = String.raw`
    import assert from 'node:assert/strict';
    import {
      createPreviewDraft, validatePreviewDraft, emptyLocalRegister,
      validateLocalRegister, upsertLocalPreview, removeLocalPreview,
      exportPreviewDraft, importPreviewDraft, filterCanonicalTemplates
    } from './src/lib/template-builder/model.ts';
    const refs=[{id:'guia',name:'Guia',kind:'guia',href:'/modelos/guia',frame:'shell',note:'none',situacao:'montagem',source:'catalogo'},
      {id:'escala',name:'Escala',kind:'ferramenta',href:'/ferramentas/braden',frame:'shell',note:'none',situacao:'montagem',source:'catalogo'}];
    const dt='2026-11-28T11:00:00Z';
    const d=createPreviewDraft(refs[0],'r01',dt);
    assert.equal(validatePreviewDraft(d,refs).templateId,'guia');
    assert.throws(()=>validatePreviewDraft({...d,templateId:'desconhecido'},refs));
    assert.throws(()=>validatePreviewDraft({...d,content:{...d.content,title:'AB'}},refs));
    assert.throws(()=>validatePreviewDraft({...d,content:{...d.content,html:'<script>'}},refs));
    assert.throws(()=>validatePreviewDraft(d,[{...refs[0],href:'/mudou'},refs[1]]));
    let reg=upsertLocalPreview(emptyLocalRegister(),d,refs,dt);
    assert.equal(reg.revision,1);
    assert.equal(reg.drafts[0].revision,1);
    assert.throws(()=>upsertLocalPreview(reg,d,refs,dt));
    reg=upsertLocalPreview(reg,{...reg.drafts[0],content:{...d.content,title:'Guia atualizado'}},refs,dt);
    assert.equal(validateLocalRegister(reg,refs).drafts[0].revision,2);
    assert.equal(importPreviewDraft(exportPreviewDraft(d,refs),refs).instanceId,'r01');
    assert.throws(()=>importPreviewDraft('{}'.padEnd(40000,' '),refs));
    assert.deepEqual(filterCanonicalTemplates(refs,'escala','ferramenta').map(x=>x.id),['escala']);
    reg=removeLocalPreview(reg,'r01',refs);
    assert.equal(reg.drafts.length,0);
    console.log('10 contratos verificados');
  `;
  const output = execFileSync(process.execPath,
    ['--experimental-strip-types','--input-type=module','-e',code],
    {cwd:process.cwd(),encoding:'utf8',timeout:12000});
  assert.match(output,/10 contratos verificados/);
});
