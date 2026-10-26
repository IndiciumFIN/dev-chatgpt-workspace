/** Deterministic and read-only ingestion preflight.
 * CSV / TSV / JSON only; no network, writes, AI inference or automatic promotion.
 * See docs/governance/ADMIN_BATCH_IMPORT_20261026.md before enabling persistence.
 */
export type ImportField = {
  key: string;
  label: string;
  type: 'id' | 'text' | 'boolean' | 'json' | 'url' | 'date';
  required: boolean;
};
export type ImportProfile = {
  id: 'sources' | 'policies' | 'validators';
  label: string;
  destination: string;
  primaryKey: string;
  fields: readonly ImportField[];
};
const field=(key:string,label:string,type:ImportField['type'],required=true):ImportField=>({key,label,type,required});
/** Fields reconciled in READ_ONLY inspection of the existing CKO tables.
 * No new canonical entity or schema is introduced here. */
export const importProfiles: readonly ImportProfile[] = [
  {id:'sources',label:'Fontes e licenças',destination:'cko_evidence.sources',primaryKey:'source_id',fields:[
    field('source_id','Identificador da fonte','id'),
    field('source_type','Tipo de fonte','text'),
    field('title','Título','text'),
    field('publisher','Publicador','text',false),
    field('official_uri','URL oficial','url',false),
    field('host','Domínio da fonte','text',false),
    field('jurisdiction','Jurisdição','text',false),
    field('authority_level','Nível de autoridade','text'),
    field('accreditation_status','Estado de acreditação','text'),
    field('accepted_for','Finalidades aceitas (JSON)','json'),
    field('review_due','Próxima revisão','date',false),
    field('attributes','Atributos (JSON)','json'),
  ]},
  {id:'policies',label:'Políticas',destination:'cko_orch.policy_registry',primaryKey:'policy_id',fields:[
    field('policy_id','ID da política','id'),field('version','Versão','text'),
    field('category','Categoria','text'),field('description','Descrição','text'),
    field('severity_on_violation','Severidade da violação','text'),
    field('action_on_violation','Ação na violação','text'),
    field('rule_json','Regra estruturada (JSON)','json'),
    field('active','Ativa?','boolean'),
  ]},
  {id:'validators',label:'Validadores',destination:'cko_validation.validators',primaryKey:'validator_id',fields:[
    field('validator_id','ID do validador','id'),field('name','Nome','text'),
    field('domain','Domínio','text'),field('version','Versão','text'),
    field('blocking','Bloqueante?','boolean'),
    field('input_types','Tipos de entrada (JSON)','json'),
    field('requirements','Requisitos (JSON)','json'),
    field('severity_policy','Política de severidade (JSON)','json'),
    field('owner_function','Função responsável','text'),
    field('status','Estado','text'),
  ]},
];
export type ParsedImport = {
  format:'csv'|'tsv'|'json'; delimiter:string | null;
  headers:string[];
  rows:Array<{line:number;cells:string[]}>;
};
export type ImportIssue = {line:number;column:string;code:string;message:string};
export type ImportRecord = {line:number;identifier:string;state:'CANDIDATE'|'HOLD';data:Record<string,unknown>;issues:ImportIssue[]};
export type ImportReview = {
  profileId:ImportProfile['id']; destination:string;
  sourceFormat:ParsedImport['format']; mapping:Record<string,string>;
  total:number; candidates:number; held:number; duplicates:number;
  records:ImportRecord[]; issues:ImportIssue[];
  admission:'NOT_SUBMITTED'; writeEnabled:false;
};
export const LIMITS={maxBytes:5*1024*1024,maxRows:10000,maxColumns:60,maxCellChars:4096} as const;
function stop(message:string):never{throw new Error(message);}
function canonicalHeader(v:string){return v.normalize('NFKC').trim().toLocaleLowerCase('pt-BR').replace(/[\s_-]+/g,'');}
const suspicious=/^[\s\u0000-\u001f\uFEFF]*[=+\-@]/;
const idPattern=/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/;

function csv(text:string,delimiter:string):ParsedImport['rows']{
  const rows:ParsedImport['rows']=[];
  let cells:string[]=[],value='',quoted=false,afterQuote=false,line=1,rowStart=1;
  const pushCell=()=>{
    if(value.length>LIMITS.maxCellChars)stop('Célula acima do limite de '+LIMITS.maxCellChars+' caracteres.');
    cells.push(value);value='';afterQuote=false;
    if(cells.length>LIMITS.maxColumns)stop('Número de colunas acima do limite de '+LIMITS.maxColumns+'.');
  };
  const pushRow=()=>{
    pushCell();
    if(cells.some(x=>x.trim()!=='')||rows.length>0) rows.push({line:rowStart,cells});
    if(rows.length>LIMITS.maxRows+1)stop('Limite máximo de linhas excedido.');
    cells=[];rowStart=line;
  };
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){
      if(c==='"'){if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;afterQuote=true;}}
      else {value+=c;if(c==='\n')line++;}
      continue;
    }
    if(afterQuote && c!==' '&&c!=='\t'&&c!==delimiter&&c!=='\n'&&c!=='\r')stop('Aspas inválidas na linha '+line+'.');
    if(c==='"'&&!afterQuote){
      if(value.trim()!=='')stop('Aspas inesperadas na linha '+line+'.');
      value='';quoted=true;
    } else if(c===delimiter)pushCell();
    else if(c==='\n'||c==='\r'){
      if(c==='\r'&&text[i+1]==='\n')i++;
      line++;pushRow();rowStart=line;
    } else if(afterQuote){
      // Whitespace after a quoted cell is ignored.
    } else value+=c;
    if(value.length>LIMITS.maxCellChars)stop('Célula acima do limite de '+LIMITS.maxCellChars+' caracteres.');
  }
  if(quoted)stop('Campo CSV com aspas não fechadas.');
  if(cells.length>0||value!==''||afterQuote)pushRow();
  return rows;
}
function detectDelimiter(text:string,extension:string):string{
  if(extension==='tsv')return '\t';
  // Count separators in first logical record, ignoring quoted portions.
  let quoted=false,comma=0,semicolon=0;
  for(let i=0;i<Math.min(text.length,32768);i++){
    const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"')i++;else quoted=!quoted;}
    if(!quoted){
      if(c==='\n'||c==='\r')break;
      if(c===',')comma++;
      if(c===';')semicolon++;
    }
  }
  if(comma===0&&semicolon===0)stop('Separador CSV não encontrado.');
  if(comma===semicolon)stop('Separador CSV ambíguo: selecione um formato não ambíguo.');
  return comma>semicolon?',':';';
}
export function parseBulkImport(filename:string,content:string):ParsedImport{
  if(typeof content!=='string'||!content.trim())stop('Arquivo vazio.');
  if(new TextEncoder().encode(content).length>LIMITS.maxBytes)stop('Arquivo acima do limite de 5 MiB.');
  const ext=filename.toLowerCase().split('.').pop();
  if(ext!=='csv'&&ext!=='tsv'&&ext!=='json')stop('Somente CSV, TSV ou JSON são aceitos.');
  const text=content.replace(/^\uFEFF/,'');
  let rows:ParsedImport['rows'],headers:string[],delimiter:string|null=null;
  if(ext==='json'){
    const parsed:unknown=JSON.parse(text);
    if(!Array.isArray(parsed)||parsed.length>LIMITS.maxRows)stop('JSON deve conter um array de até 10.000 registros.');
    if(!parsed.every(x=>x!==null&&typeof x==='object'&&!Array.isArray(x)))stop('Cada registro JSON deve ser um objeto.');
    const objects=parsed as Record<string,unknown>[];
    headers=[...new Set(objects.flatMap(Object.keys))];
    if(headers.length>LIMITS.maxColumns)stop('Número de colunas excedido.');
    rows=objects.map((o,i)=>({line:i+1,cells:headers.map(h=>{
      const value=o[h];
      if(value===undefined||value===null)return '';
      if(typeof value==='string')return value;
      if(typeof value==='boolean'||typeof value==='number')return String(value);
      return JSON.stringify(value);
    })}));
  }else{
    delimiter=detectDelimiter(text,ext);
    const data=csv(text,delimiter);
    if(data.length<2)stop('Arquivo sem cabeçalho e linhas de dados.');
    headers=data[0].cells.map(x=>x.trim());
    rows=data.slice(1);
    for(const row of rows)if(row.cells.length!==headers.length)stop('Número de colunas inconsistente na linha '+row.line+'.');
  }
  if(!headers.length||headers.some(x=>!x||x.length>120))stop('Cabeçalho vazio ou inválido.');
  if(new Set(headers.map(canonicalHeader)).size!==headers.length)stop('Cabeçalhos duplicados ou equivalentes.');
  for(const row of rows)for(const v of row.cells)if(v.length>LIMITS.maxCellChars)stop('Célula excede o limite na linha '+row.line+'.');
  if(!rows.length)stop('Arquivo sem registros.');
  return {format:ext as ParsedImport['format'],delimiter,headers,rows};
}
export function suggestedMapping(parsed:ParsedImport,profile:ImportProfile):Record<string,string>{
  const mapped:Record<string,string>={};
  for(const f of profile.fields){
    const matches=parsed.headers.filter(h=>canonicalHeader(h)===canonicalHeader(f.key)||canonicalHeader(h)===canonicalHeader(f.label));
    if(matches.length===1)mapped[f.key]=matches[0];
  }
  return mapped;
}
function convert(raw:string,field:ImportField):unknown{
  const v=raw.trim();
  if(!v)return undefined;
  if(v.length>LIMITS.maxCellChars)throw Error('Valor acima do tamanho permitido.');
  if(suspicious.test(v)&&field.type!=='json')throw Error('Valor com prefixo de fórmula perigoso. Revise a origem.');
  switch(field.type){
    case 'id':
      if(!idPattern.test(v))throw Error('Identificador inválido.');
      return v;
    case 'url':{
      const u=new URL(v);
      if(u.protocol!=='https:')throw Error('Use somente HTTPS.');
      if(u.username||u.password)throw Error('Credenciais não são permitidas na URL.');
      return v;
    }
    case 'date':
      if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v)))throw Error('Informe data ISO YYYY-MM-DD.');
      return v;
    case 'boolean':
      if(!['true','false','sim','não','nao','1','0'].includes(v.toLowerCase()))throw Error('Use true/false, sim/não ou 1/0.');
      return ['true','sim','1'].includes(v.toLowerCase());
    case 'json':{
      const json=JSON.parse(v);
      if(json===null||typeof json!=='object')throw Error('Estrutura JSON deve ser objeto ou array.');
      return json;
    }
    default:
      if(/[\u0000-\u0008\u000B-\u001F]/.test(v))throw Error('Caracteres de controle são proibidos.');
      return v;
  }
}
export function reviewBulkImport(parsed:ParsedImport,profile:ImportProfile,mapping:Record<string,string>):ImportReview{
  const selected=profile.fields.filter(f=>mapping[f.key]);
  if(!selected.length)stop('Mapeie ao menos uma coluna.');
  if(new Set(selected.map(f=>mapping[f.key])).size!==selected.length)stop('Uma coluna de origem não pode alimentar dois campos.');
  for(const f of selected)if(!parsed.headers.includes(mapping[f.key]))stop('Coluna desconhecida: '+mapping[f.key]);
  const records:ImportRecord[]=[];
  const seen=new Set<string>();
  let duplicates=0;
  for(const row of parsed.rows){
    const data:Record<string,unknown>={},issues:ImportIssue[]=[];
    for(const f of profile.fields){
      const idx=parsed.headers.indexOf(mapping[f.key]??'');
      const raw=idx>=0?row.cells[idx]??'':'';
      if(f.required&&!raw.trim())issues.push({line:row.line,column:f.key,code:'REQUIRED',message:'Campo obrigatório ausente.'});
      if(!raw.trim())continue;
      try{data[f.key]=convert(raw,f);}
      catch(err){issues.push({line:row.line,column:f.key,code:'INVALID',message:err instanceof Error?err.message:'Valor inválido.'});}
    }
    const identifier=String(data[profile.primaryKey]??'');
    if(identifier){
      if(seen.has(identifier)){duplicates++;issues.push({line:row.line,column:profile.primaryKey,code:'DUPLICATE_IN_BATCH',message:'Identificador repetido no lote.'});}
      else seen.add(identifier);
    }
    records.push({line:row.line,identifier,state:issues.length?'HOLD':'CANDIDATE',data,issues});
  }
  const issues=records.flatMap(r=>r.issues);
  return {profileId:profile.id,destination:profile.destination,sourceFormat:parsed.format,
    mapping,total:records.length,candidates:records.filter(x=>x.state==='CANDIDATE').length,
    held:records.filter(x=>x.state==='HOLD').length,duplicates,
    records,issues,admission:'NOT_SUBMITTED',writeEnabled:false};
}
export function csvTemplate(profile:ImportProfile):string{
  // Quoted headers; no user content used here.
  return '\uFEFF'+profile.fields.map(f=>'"'+f.key.replaceAll('"','""')+'"').join(';')+'\r\n';
}
