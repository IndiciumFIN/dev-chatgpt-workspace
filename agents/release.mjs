import {readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {verifyAgent,check,file,root} from './_agent.mjs';
const allowedTop=new Set(['.github','.gitignore','README.md','index.html','styles.css','src','docs','tests','agents','package.json','vercel.json','api','db','scripts']);
const top=readdirSync(root).filter(x=>x!=='.git'&&!x.startsWith('preview-'));
const forbidden=[];
function scan(d=''){
 for(const f of readdirSync(join(root,d))){
  if(['.git','node_modules','__pycache__'].includes(f))continue;
  const name=join(d,f),stat=statSync(join(root,name));
  if(stat.isDirectory())scan(name);
  else if(name.includes('calculadorasdeenfermagem')||name.includes('.env')||name.endsWith('.pem'))forbidden.push(name);
 }
}
scan();
const pkg=JSON.parse(file('package.json'));
const api=file('api/demo-casefiles.js'),sql=file('db/wutrib_demo_v04.sql');
const hardened=file('db/wutrib_demo_v041_hardening.sql');
verifyAgent('release',[
 check('REL-001',top.every(x=>allowedTop.has(x)),'Only WU-TRIB sources present; unexpected: '+top.filter(x=>!allowedTop.has(x)).join(', ')),
 check('REL-002',forbidden.length===0,'No forbidden private/clinical/source files: '+forbidden.join(', ')),
 check('REL-003',pkg.private===true&&pkg.type==='module','Private npm package using ES modules'),
 check('REL-004',pkg.version==='0.3.0','Public browser remains canonical v0.3 while backend is a candidate'),
 check('REL-005',!process.env.GITHUB_REF_NAME||['wutrib/web-pilot-20261108','wutrib/demo-persistence-v04-20261108','main'].includes(process.env.GITHUB_REF_NAME),'CI only for isolated WU-TRIB branches or new standalone main'),
 check('REL-006',file('README.md').includes('fictíc')&&file('README.md').includes('Supabase'),'Browser stays synthetic-only and disconnected'),
 check('REL-007',api.includes('DEMO_PERSISTENCE_DISABLED')&&api.includes('WUTRIB_OPERATOR_TOKEN')&&!file('src/ui.js').includes('WUTRIB_OPERATOR_TOKEN'),'Server-only optional API fails closed'),
 check('REL-008',sql.includes('security invoker')&&sql.includes('revoke execute')&&sql.includes('enable row level security'),'Private RLS contract with INVOKER RPC only'),
 check('REL-009',hardened.includes('security invoker')&&hardened.includes('demo_operator_rate_limits')&&hardened.includes('demo_casefiles_strict_fixture_v041'),'Hardening migration is versioned and isolated')
]);
