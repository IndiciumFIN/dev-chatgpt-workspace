import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const content=readFileSync('.github/workflows/portoes.yml','utf8');
const steps=[
 'Índice do banco — rótulo humano para tudo',
 'Governança — rejeitar placeholders de aprovação',
 'CE — integridade dos 870 arquivos recuperados (sem autorização de release)',
 'DERBY — nada fica retido',
 'Processo de source',
 'Fonte — o texto no banco é o texto da fonte',
 'Registro — o mapa do PMO é verdade',
];

test('todos os portões independentes verificam falhas reais sem serem saltados por falhas anteriores',()=>{
 for(const name of steps){
  const token='      - name: '+name+'\n';
  const i=content.indexOf(token);
  assert.ok(i>=0,'Missing gate: '+name);
  const j=content.indexOf('\n      - name: ',i+token.length);
  const block=content.slice(i,j>=0?j:content.length);
  assert.match(block,/if: \$\{\{ !cancelled\(\) \}\}/,'Gate skipped after upstream failure: '+name);
  assert.doesNotMatch(block,/continue-on-error:\s*true/,'False positive allowed: '+name);
 }
 assert.match(content,/name: P1 — inventário de colisões de migrations/);
 assert.match(content,/name: Preservar evidência P1/);
});
