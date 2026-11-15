/**
 * CKO regulatory projection integrity from already persisted metadata:
 * normative instruments -> official/derived snapshots -> source fragments ->
 * provisions -> cko_master, with explicit legislative amendment relationships.
 * No law text, no inferred validity, no automatic graph updates.
 */
export function auditRegulatorySourceChain({graph,sourceInventory}){
 const errors=[],holds=[],edges=[];
 const fail=(code,id,reason)=>errors.push({code,id,reason});
 const hold=(code,id,reason)=>holds.push({code,id,reason});
 if(graph.scope!=="NCOS_REGULATORY_NONACCOUNTING"||graph.noRemoteMutations!==true||
    graph.noAutomaticQualification!==true||graph.noNormativeFullTextIncluded!==true)
    fail("GOVERNANCE_INVARIANTS_INVALID","metadata","Refused automatic qualification");
 const d=graph.records;
 const db=sourceInventory.datasets;
 const instruments=new Map(d.instruments.map(x=>[x.instrument_id,x]));
 const instrumentBySource=new Map(d.instruments.map(x=>[x.official_source_id,x]));
 const sources=new Map(db.evidenceSources.map(x=>[x.source_id,x]));
 const snapshots=new Map(db.snapshots.map(x=>[x.snapshot_id,x]));
 const fragments=new Map(db.fragments.map(x=>[x.fragment_id,x]));
 const provisions=new Map(d.provisions.map(x=>[x.provision_id,x]));
 const masterByProvision=new Map(d.masterProvisions.map(x=>[x.provision_id,x]));
 const amended=d.amendments||[];
 const official=new Set(d.instruments.map(x=>x.canonical_id));
 const masterIds=new Set(d.masterProvisions.map(x=>x.canonical_id));
 if(instruments.size!==d.instruments.length||provisions.size!==d.provisions.length)
   fail("DUPLICATE_REGULATORY_ID","instruments/provisions","Identity must be unique");
 for(const i of d.instruments){
   if(!sources.has(i.official_source_id))fail("INSTRUMENT_UNKNOWN_OFFICIAL_SOURCE",i.instrument_id,i.official_source_id);
   const sn=snapshots.get(i.current_snapshot_id);
   if(!sn){fail("INSTRUMENT_UNKNOWN_SNAPSHOT",i.instrument_id,i.current_snapshot_id);continue;}
   if(sn.source_id!==i.official_source_id){
      const deriv=d.derivedSnapshotOrigins.find(x=>x.snapshot_id===i.current_snapshot_id);
      if(!deriv||deriv.source_id!==sn.source_id||
         deriv.source_type!=="DERIVED_REGULATORY_COMPOSITE"||
         deriv.raw_metadata?.not_an_official_publication!==true||
         deriv.raw_metadata?.legal_status_inference!==false||
         !deriv.component_sources?.includes(i.official_source_id))
        fail("UNACCOUNTED_DERIVED_SNAPSHOT",i.instrument_id,"Derived source requires exact, non-official, no-inference metadata");
      else{
        const snapshotRefs=[deriv.raw_metadata.base_snapshot,...(deriv.raw_metadata.amendment_snapshots||[])];
        for(const ref of snapshotRefs)if(!snapshots.has(ref))
           fail("DERIVED_COMPONENT_SNAPSHOT_MISSING",i.instrument_id,ref);
        if(!deriv.raw_metadata.composition_algorithm||!deriv.raw_metadata.algorithm_version)
           fail("DERIVED_COMPOSITION_UNVERSIONED",i.instrument_id,deriv.snapshot_id);
        hold("DERIVED_SNAPSHOT_IS_NOT_OFFICIAL_TEXT",i.instrument_id,"No legal-status inference or automatic release");
      }
   }
   edges.push({from:i.canonical_id,to:i.official_source_id,predicate:"HAS_OFFICIAL_SOURCE"});
   edges.push({from:i.canonical_id,to:i.current_snapshot_id,predicate:"CURRENT_SNAPSHOT_REFERENCE_NOT_LEGAL_FORCE"});
 }
 for(const rel of amended){
   const known=new Set([...official,...masterIds]);
   if(!known.has(rel.source_id)||!known.has(rel.target_id))
     fail("AMENDMENT_ENDPOINT_UNREGISTERED",rel.relationship_id,rel.source_id+" -> "+rel.target_id);
   if(!rel.provenance_ref||!sources.has(rel.provenance_ref))
     fail("AMENDMENT_MISSING_SOURCE",rel.relationship_id,rel.provenance_ref||"");
   edges.push({from:rel.source_id,to:rel.target_id,predicate:rel.relation_type,
     evidenceRef:rel.provenance_ref,status:rel.status});
 }
 let crossSourceSupported=0;
 for(const p of d.provisions){
   const i=instruments.get(p.instrument_id);
   if(!i){fail("PROVISION_UNKNOWN_INSTRUMENT",p.provision_id,p.instrument_id);continue;}
   const f=fragments.get(p.source_fragment_id);
   if(!f||f.snapshot_id!==p.snapshot_id||f.fragment_sha256!==p.fragment_sha256)
     fail("PROVISION_FRAGMENT_DRIFT",p.provision_id,p.source_fragment_id);
   const sn=snapshots.get(p.snapshot_id);
   if(!sn||sn.source_id!==p.fragment_source_id||sn.content_sha256!==p.source_snapshot_sha256)
     fail("PROVISION_SNAPSHOT_DRIFT",p.provision_id,p.snapshot_id);
   if(!sources.has(p.fragment_source_id))
     fail("PROVISION_UNKNOWN_EVIDENCE_SOURCE",p.provision_id,p.fragment_source_id);
   edges.push({from:p.provision_id,to:p.source_fragment_id,predicate:"GROUNDED_IN_FRAGMENT"});
   edges.push({from:p.provision_id,to:i.canonical_id,predicate:"PART_OF_NORMATIVE_INSTRUMENT"});
   const master=masterByProvision.get(p.provision_id);
   if(!master)hold("REGULATORY_PROVISION_NOT_IN_MASTER",p.provision_id,"Add a governed projection, not an invented legal text");
   else if(master.source_fragment_id!==p.source_fragment_id)
     fail("MASTER_PROVISION_FRAGMENT_DRIFT",p.provision_id,master.source_fragment_id+" != "+p.source_fragment_id);
   else edges.push({from:p.provision_id,to:master.canonical_id,predicate:"MATERIALIZED_IN_MASTER"});
   if(p.fragment_source_id!==i.official_source_id){
     const amendment=instrumentBySource.get(p.fragment_source_id);
     const supporting=amendment&&master&&amended.some(r=>
       r.relation_type==="AMENDS_PROVISION"&&r.source_id===amendment.canonical_id&&
       r.target_id===master.canonical_id&&r.provenance_ref===p.fragment_source_id);
     if(!supporting)fail("CROSS_SOURCE_PROVISION_WITHOUT_EXPLICIT_AMENDMENT",p.provision_id,p.fragment_source_id);
     else crossSourceSupported++;
   }
 }
 const empty=d.instruments.filter(i=>!d.provisions.some(p=>p.instrument_id===i.instrument_id));
 for(const i of empty)hold("NORMATIVE_INSTRUMENT_WITHOUT_PROVISIONS",i.canonical_id,"No atomized clause projection yet");
 const counts={
  instruments:d.instruments.length,provisions:d.provisions.length,
  provisionsLinkedToSourceFragments:d.provisions.filter(x=>fragments.has(x.source_fragment_id)).length,
  masterProvisionNodes:d.masterProvisions.length,
  missingMasterProvisionNodes:d.provisions.filter(x=>!masterByProvision.has(x.provision_id)).length,
  instrumentsWithoutProvisions:empty.length,
  sourceCrossingProvisions:d.provisions.filter(p=>p.fragment_source_id!==instruments.get(p.instrument_id)?.official_source_id).length,
  crossSourceProvisionsSupportedByExactAmendments:crossSourceSupported,
  explicitAmendmentEdges:amended.length,
  errors:errors.length,holds:holds.length
 };
 return {counts,errors,holds,edges,releaseGate:"HOLD_HUMAN_LEGAL_FORCE_AND_CANONICAL_PROJECTION"};
}
