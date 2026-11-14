// Pure, deterministic NCOS schema/dictionary integrity policy. No DB connection.
export function checkRelationalModel({ tables, columns, constraints, entities, dictionary, policies }) {
  const errors=[],gaps=[],holds=[];
  const names=new Set(tables.map(x=>x.table_name));
  const cols=new Set(columns.map(x=>x.table_name+"."+x.column_name));
  const documented=new Set(entities.map(x=>x.name));
  const mapped=new Set(dictionary.map(x=>x.entity+"."+x.name));
  const fks=constraints.filter(x=>x.kind==="f");
  const pks=new Set(constraints.filter(x=>x.kind==="p").map(x=>x.table_name));
  for(const t of tables){
    if(!pks.has(t.table_name)) errors.push({id:"MISSING_PK",table:t.table_name});
    if(!documented.has(t.table_name)) gaps.push({id:"MISSING_ENTITY_DICTIONARY",table:t.table_name});
  }
  for(const c of columns)if(!mapped.has(c.table_name+"."+c.column_name))gaps.push({id:"MISSING_COLUMN_DICTIONARY",table:c.table_name,column:c.column_name});
  for(const d of entities)if(!names.has(d.name))gaps.push({id:"STALE_ENTITY",table:d.name});
  for(const d of dictionary){
    if(!cols.has(d.entity+"."+d.name))gaps.push({id:"STALE_COLUMN",table:d.entity,column:d.name});
    if(d.ref_entity&&!fks.some(f=>f.table_name===d.entity&&f.target_table===d.ref_entity&&(f.from_columns||[]).includes(d.name)))
      holds.push({id:"UNBACKED_DECLARED_RELATION",table:d.entity,column:d.name,target:d.ref_entity});
  }
  for(const f of fks){
    if(!names.has(f.table_name)||!names.has(f.target_table))errors.push({id:"FK_TABLE_MISSING",name:f.name});
    if(!f.from_columns?.length||f.from_columns.length!==f.to_columns?.length)errors.push({id:"FK_ARITY_MISMATCH",name:f.name});
    for(const c of f.from_columns||[])if(!cols.has(f.table_name+"."+c))errors.push({id:"FK_SOURCE_COLUMN_MISSING",name:f.name,column:c});
    for(const c of f.to_columns||[])if(!cols.has(f.target_table+"."+c))errors.push({id:"FK_TARGET_COLUMN_MISSING",name:f.name,column:c});
    if(f.validated===false)errors.push({id:"FK_NOT_VALIDATED",name:f.name});
  }
  for(const name of ["content_text","media_alt"]){
    const t=tables.find(x=>x.table_name===name);
    if(!t)errors.push({id:"CRITICAL_TABLE_MISSING",table:name});
    else if(!t.rls_enabled)errors.push({id:"RLS_DISABLED",table:name});
    if(!policies.some(p=>p.table_name===name&&p.policy_name===name+"_publicado"))errors.push({id:"RLS_POLICY_MISSING",table:name});
  }
  return {errors,gaps,holds,gate:errors.length||gaps.length||holds.length?"HOLD_SCHEMA_DICTIONARY_CONSISTENCY":"SCHEMA_STATIC_PASS_NOT_RELEASE"};
}
