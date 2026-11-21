// Trilha de carreira: structural QA only; no clinical/legal or educational credential validation.
// node cko/canonical-content/2026-11-14/career-path/validate-career-path.mjs
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const base=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(base,"../../../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const json=p=>JSON.parse(read(p));
const errors=[];
function assert(cond,msg){if(!cond)errors.push(msg);}
function csv(s){const out=[];let row=[],f="",q=false;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(q&&s[i+1]==='"'){f+='"';i++;}else q=!q;}else if(c===','&&!q){row.push(f);f="";}else if(c==="\n"&&!q){row.push(f);if(row.some(x=>x.length))out.push(row);row=[];f="";}else if(c!=="\r"||q)f+=c;}if(f||row.length){row.push(f);out.push(row)}const [head,...rows]=out;return rows.map(r=>Object.fromEntries(head.map((k,j)=>[k,r[j]??""])));}
const prefix="cko/canonical-content/2026-11-14/";
const d=json(prefix+"career-path/CARDIOLOGIA_CAREER_PATH_CANDIDATE.json");
const units=csv(read(prefix+"datasets/01_unidades_curriculares.csv"));
const mods=csv(read(prefix+"datasets/02_modulos.csv"));
const axes=csv(read(prefix+"datasets/15_UC08_EIXOS_RECEBIDOS.csv"));
assert(d.display_label==="Trilha de carreira","Display label");
assert(d.state==="CANDIDATE_NOT_ADMITTED"&&!d.clinical_release&&!d.publication_allowed,"Candidate release gate");
assert(d.legacy_contract_refs.join("|")==="CURRICULUM|UC|MODULE","Legacy schema preservation");
assert(d.career_level==="UNDETERMINED"&&d.career_stage_ids.length===0&&d.certificates_approved.length===0&&d.competencies_approved.length===0,"No invented career progression");
assert(d.units.length===units.length&&units.length===10,"Unit count");
const byId=new Map(units.map(x=>[x.unit_id,x]));
const sourceModules=new Map(mods.map(x=>[x.module_id,x]));
const seenUnits=new Set(),seenModules=new Set(),seenAxes=new Set();
let hours=0,modHours=0,moduleCount=0,axesCount=0;
for(const u of d.units){
 const s=byId.get(u.learning_unit_ref_id);assert(!!s,"Missing UC source "+u.learning_unit_ref_id);if(!s)continue;
 assert(!seenUnits.has(u.learning_unit_ref_id),"Duplicate UC "+u.learning_unit_ref_id);seenUnits.add(u.learning_unit_ref_id);
 assert(u.title===s.title&&u.hours===Number(s.hours)&&u.source_id===s.source_id,"UC changed "+u.learning_unit_ref_id);
 assert(u.career_stage_id===null&&u.progression_prerequisites==="PENDING_SOURCE","Unsupported career stage");
 hours+=u.hours;let hh=0;
 for(const m of u.modules){const z=sourceModules.get(m.module_id);assert(z&&z.unit_id===u.learning_unit_ref_id&&z.title===m.title&&z.source_id===m.source_id&&Number(z.hours)===m.hours,"Module parity "+m.module_id);assert(!seenModules.has(m.module_id),"Duplicate module "+m.module_id);seenModules.add(m.module_id);hh+=m.hours;modHours+=m.hours;moduleCount++;}
 assert(u.unallocated_module_hours===u.hours-hh,"Module hours mismatch "+u.learning_unit_ref_id);
 for(const a of u.unresolved_axes){const z=axes.find(x=>x.axis_id===a.axis_id);assert(z&&z.unit_id===u.learning_unit_ref_id&&z.axis_title===a.title&&z.related_uc07_module===a.related_uc07_module,"Axis parity "+a.axis_id);assert(a.allocated_hours===null&&a.publication==="BLOCKED","UC08 must remain unallocated/block");assert(!seenAxes.has(a.axis_id),"Duplicate axis");seenAxes.add(a.axis_id);axesCount++;}
}
assert(seenUnits.size===10&&hours===300&&moduleCount===51&&seenModules.size===mods.length&&modHours===270&&axesCount===8&&seenAxes.size===axes.length,"Expected historical baseline totals");
const uc08=d.units.find(x=>x.learning_unit_ref_id==="CARDIOLOGIA-UC-08");
assert(uc08?.modules.length===0&&uc08?.unallocated_module_hours===30&&uc08?.unresolved_axes.length===8&&uc08?.career_path_review==="HOLD_HUMAN_UC08_COLLISIONS","UC08 conflict preserved");
const summary={gate:"CAREER_PATH_STRUCTURAL_ONLY",status:errors.length?"FAIL":"PASS",units:d.units.length,source_modules:moduleCount,source_module_hours:modHours,uc08_unallocated_hours:uc08?.unallocated_module_hours,uc08_axes:axesCount,professional_progression_approved:0,clinical_release:false,errors};
process.stdout.write(JSON.stringify(summary,null,2)+"\n");if(errors.length)process.exitCode=1;
