import {readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {verifyAgent,check,file,root} from './_agent.mjs';
const allowedTop=new Set(['.github','.gitignore','README.md','index.html','styles.css','src','docs','tests','agents','package.json','vercel.json']);
const top=readdirSync(root).filter(x=>x!=='.git'&&!x.startsWith('preview-'));
const forbidden=[];
function scan(d=''){
 for(const f of readdirSync(join(root,d))){
  if(['.git','node_modules','__pycache__'].includes(f))continue;
  const name=join(d,f),stat=statSync(join(root,name));
  if(stat.isDirectory()) scan(name);
  else if(name.includes('calculadorasdeenfermagem')||name.includes('.env')||name.endsWith('.pem')) forbidden.push(name);
 }
}
scan();
const pkg=JSON.parse(file('package.json'));
verifyAgent('release',[ 
 check('REL-001',top.every(x=>allowedTop.has(x)),`Only WU-TRIB sources present; unexpected: ${top.filter(x=>!allowedTop.has(x)).join(', ')}`),
 check('REL-002',forbidden.length===0,`No forbidden private/clinical/source files: ${forbidden.join(', ')}`),
 check('REL-003',pkg.private===true&&pkg.type==='module','Project must be private npm package using ES modules'),
 check('REL-004',pkg.version==='0.3.0','Manifest version matches this pilot release'),
 check('REL-005',!process.env.GITHUB_REF_NAME || process.env.GITHUB_REF_NAME==='wutrib/web-pilot-20261108','GitHub Action may run only on WU-TRIB branch'),
 check('REL-006',file('README.md').includes('fictíc')&&file('README.md').includes('Supabase'),'Readme states synthetic-only, no database connection'),
]);
