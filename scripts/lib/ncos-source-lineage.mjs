/**
 * Source-first CKO lineage validator. This is an evidence audit, NOT a new CKO schema.
 * Diagnostic finding IDs do not replace canonical statuses in vendored JSON Schemas.
 */
export function inspectCanonicalLineage({ sources, bindings, fields, tools, editorial, schemas }) {
  const errors = [], holds = [], edges = [];
  const finding = (target, code, entity, detail) => target.push({ code, entity, detail });
  const ids = new Set();
  const addNode = (id, label) => {
    if (ids.has(id)) finding(errors, "DUPLICATE_CANONICAL_ID", id, label);
    ids.add(id);
  };
  const sourceIds = new Set(sources.map(s=>s.canonical_id));
  const bindingIds = new Set(bindings.map(b=>b.canonical_id));
  const fieldIds = new Set(fields.map(f=>f.canonical_id));
  const supportedValues = (schema, key) => schema?.properties?.[key]?.enum || null;
  function checkSchema(item, schema, id) {
    for (const key of schema.required || [])
      if (item[key] === undefined || item[key] === null)
        finding(errors, "MISSING_REQUIRED_CKO_PROPERTY", id, key);
    for (const [key, value] of Object.entries(item)) {
      if (schema.additionalProperties === false && !Object.hasOwn(schema.properties||{},key))
        finding(holds, "LEGACY_EXTENSION_NOT_IN_CKO_SCHEMA", id, key);
      const allowed = supportedValues(schema, key);
      if (allowed && !allowed.includes(value))
        finding(errors, "NOT_IN_CANONICAL_VOCABULARY", id, key);
    }
    if (item.schema_version !== schema.properties?.schema_version?.const)
      finding(errors, "CKO_SCHEMA_VERSION_DRIFT", id, String(item.schema_version));
  }
  for (const s of sources) {
    const id=s.canonical_id;addNode(id,"source");checkSchema(s,schemas.source,id);
    const sha=s.integrity?.sha256;
    const snapshot=s.integrity?.snapshot_ref;
    if (!sha || /^0{64}$/.test(sha) || !/^[a-f0-9]{64}$/.test(sha))
      finding(holds, "SOURCE_INTEGRITY_NOT_VERIFIED", id, "No verified source snapshot SHA");
    if (!snapshot || /PENDING|PLACEHOLDER|TODO/i.test(snapshot))
      finding(holds, "SOURCE_SNAPSHOT_NOT_AVAILABLE", id, "Snapshot reference pending");
    if (!s.locator?.uri || !s.locator?.pinpoint)
      finding(errors, "SOURCE_PINPOINT_MISSING", id, "Locator needs URI and pinpoint");
    if (s.rights==="UNKNOWN" || s.rights==="RESTRICTED" || s.rights==="LICENSED")
      finding(holds, "SOURCE_USE_RIGHTS_REQUIRE_REVIEW", id, String(s.rights));
    // Claimed source qualification is not evidence of clause review or rights.
    if (["SOURCE_QUALIFIED","EVIDENCE_BOUND","ASSURED","ELIGIBLE_FOR_RELEASE","RELEASED"].includes(s.status)
        && (!sha || /^0{64}$/.test(sha) || !snapshot || /PENDING/i.test(snapshot)))
      finding(errors, "SOURCE_QUALIFICATION_WITHOUT_SNAPSHOT", id, s.status);
  }
  for (const b of bindings) {
    const id=b.canonical_id;addNode(id,"authority_binding");checkSchema(b,schemas.binding,id);
    if (!b.source_ids?.length) finding(errors,"BINDING_WITHOUT_SOURCE",id,b.field_path||"");
    for (const src of b.source_ids||[]) {
      if (!sourceIds.has(src)) finding(errors,"BINDING_UNKNOWN_SOURCE",id,src);
      else edges.push({from:src,to:id,relation:"source_ids",kind:"SOURCE_AUTHORITY_BINDING"});
    }
    if (!b.validity?.applicable_from)
      finding(holds,"BINDING_VALIDITY_INCOMPLETE",id,"applicable_from");
    if (!b.evidence_bundle_ids?.length)
      finding(holds,"BINDING_WITHOUT_ATOM_EVIDENCE",id,b.field_path||"");
  }
  for (const f of fields) {
    const id=f.canonical_id;addNode(id,"field_definition");checkSchema(f,schemas.field,id);
    if (!bindingIds.has(f.authority_binding_ref))
      finding(errors,"FIELD_AUTHORITY_NOT_FOUND",id,String(f.authority_binding_ref));
    else edges.push({from:f.authority_binding_ref,to:id,relation:"authority_binding_ref",kind:"BINDING_FIELD_DEFINITION"});
    if (!f.semantic_concept_ref) finding(holds,"FIELD_SEMANTIC_CONCEPT_MISSING",id,f.field_path||"");
  }
  for (const t of tools) {
    const id=t.id;addNode(id,"clinical_tool");
    for (const ref of t.authority_binding_refs||[]) {
      if (!bindingIds.has(ref)) finding(errors,"TOOL_BINDING_NOT_FOUND",id,ref);
      else edges.push({from:ref,to:id,relation:"authority_binding_refs",kind:"BINDING_TOOL_PROJECTION"});
    }
    for (const ref of t.field_definition_refs||[])
      if (!fieldIds.has(ref)) finding(errors,"TOOL_FIELD_NOT_FOUND",id,ref);
      else edges.push({from:ref,to:id,relation:"field_definition_refs",kind:"FIELD_TOOL_PROJECTION"});
    if (!t.source_ids?.length)
      finding(holds,"TOOL_SOURCE_IDS_NOT_RECONCILED",id,"No source-verified identity on tool");
    if (!t.evidence_refs?.length)
      finding(holds,"TOOL_EVIDENCE_NOT_BOUND",id,"No verified claim/atom evidence");
  }
  let moduleCount=0,modulesWithoutProvenance=0,editorialLegacyRefs=0;
  for (const entry of editorial) {
    const slug=entry.slug;
    const page=entry.content,prov=entry.provenance;
    if (page.identity?.slug !== slug || prov.page_slug !== slug)
      finding(errors,"EDITORIAL_IDENTITY_CONFLICT",slug,"content/provenance slug mismatch");
    const modules=page.modules||[];
    const present=new Set();
    for (const m of modules) {
      moduleCount++;
      const id=m.module_id;
      if (present.has(id))finding(errors,"EDITORIAL_DUPLICATE_MODULE",slug,id);
      present.add(id);
      if (!prov.module_provenance?.[id]) {
        modulesWithoutProvenance++;
        finding(holds,"EDITORIAL_MODULE_WITHOUT_PROVENANCE",slug,id);
      }
      // Module IDs are local projection keys, not new canonical object identities.
      edges.push({from:"editorial:"+slug,to:"editorial:"+slug+"#"+id,
        relation:"module_provenance",kind:"EDITORIAL_PROJECTION_NOT_NORMATIVE"});
    }
    for (const id of Object.keys(prov.module_provenance||{}))
      if (!present.has(id))finding(holds,"EDITORIAL_UNUSED_PROVENANCE",slug,id);
    if (prov.page_source?.source_file) {
      editorialLegacyRefs++;
      finding(holds,"EDITORIAL_ORIGIN_NOT_CANONICAL_SOURCE_BINDING",slug,
        "Legacy source reference is editorial provenance, not a CKO source/claim");
    } else finding(holds,"EDITORIAL_PAGE_SOURCE_UNRESOLVED",slug,"No page source locator");
  }
  const counts={sourceRecords:sources.length,bindingRecords:bindings.length,fieldRecords:fields.length,
    toolRecords:tools.length,editorialPages:editorial.length,editorialModules:moduleCount,
    modulesWithoutProvenance,editorialLegacyRefs,graphEdges:edges.length,
    errors:errors.length,holds:holds.length};
  return {counts,errors,holds,edges:edges.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),
    releaseGate:errors.length||holds.length?"HOLD_HUMAN":"EVIDENCE_NOT_RELEASE_AUTHORIZATION"};
}
