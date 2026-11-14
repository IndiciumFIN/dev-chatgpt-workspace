// Deterministic metadata-only career trail candidate validator.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const folder=path.dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(fs.readFileSync(path.join(folder,"UE_OH_CAREER_PATH_SOURCE_GROUPS.json"),"utf8"));
const errors=[];const check=(ok,m)=>{if(!ok)errors.push(m)};
check(data.status==="CANDIDATE_THEME_INDEX_ONLY"&&!data.publication_allowed,"release block");
check(data.source_text_embedded===false&&!data.source_topics_materialized_in_this_json,"no protected source text");
check(data.career_paths.length===2,"two specialty source groups");
const expected=[["URG_EMERG_ATOMIZED_V1_2_0",7,170,9102],["ENF_TRABALHO_TOPIC_UNIVERSE_V0_1_0",32,885,0]];
for(let i=0;i<data.career_paths.length;i++){
const p=data.career_paths[i],e=expected[i];
check(p.origin_system===e[0],p.specialty+": origin");
check(p.groups.length===e[1]&&p.cluster_count===e[1],p.specialty+": group count");
check(p.groups.reduce((n,g)=>n+g.source_topic_count,0)===e[2]&&p.topic_count===e[2],p.specialty+": topic count");
check(p.evidence_link_candidates===e[3],p.specialty+": candidate links");
check(p.groups.every(g=>g.career_stage_id===null&&g.professional_competency_ids.length===0&&g.clinical_claim_ids.length===0&&g.institutional_curriculum_status==="NOT_VERIFIED"),p.specialty+": inventing career stages/claims");
check(new Set(p.groups.map(g=>g.group_id)).size===p.groups.length,p.specialty+": duplicate group");
check(p.groups.every(g=>g.source_lookup_keys[0]===p.origin_system&&g.source_lookup_keys[1]===g.group_id),"source keys");
}
check(data.legally_approved_professional_stages===0&&data.clinical_claims_approved===0&&data.certifications_claimed===0,"illicit promotion");
const o={gate:"CAREER_PATH_SOURCE_GROUPS_STRUCTURAL",status:errors.length?"FAIL":"PASS",specialties:2,clusters:39,source_topics:1055,approved_career_stages:0,approved_clinical_claims:0,errors};console.log(JSON.stringify(o,null,2));if(errors.length)process.exitCode=1;
