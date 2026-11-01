import {readFileSync,existsSync} from "node:fs";
let n=0;const ck=(name,ok,d="")=>{console.log(`${ok?"PASS":"FAIL"} RESEARCH: ${name}${d?` — ${d}`:""}`);if(!ok)n++};const read=p=>readFileSync(p,"utf8");
const req=[
"migrations/0004_research_participation_candidate.sql","src/lib/research-candidate-db.server.ts","src/lib/research-participation.functions.ts","src/components/research/research-hub.tsx",
"schemas/research-project.schema.json","schemas/research-instrument.schema.json","schemas/research-risk.schema.json","schemas/research-skill-need.schema.json",
"schemas/participation-process.schema.json","schemas/participation-contribution.schema.json","schemas/participation-proposal.schema.json","schemas/participation-consensus-vote.schema.json","schemas/participation-outcome.schema.json",
"registers/research/candidate.v1.json","registers/governance/candidates/WO-RES-PART-001.json"];
for(const p of req)ck("arquivo-presente",existsSync(p),p);
const sql=read(req[0]);ck("sql-nao-destrutivo",!/\b(drop|truncate|delete)\b/i.test(sql));ck("sql-sem-pii",!/(\bemail\b|\bcpf\b|\bphone\b|\btelefone\b|\bpatient\b|\bpaciente\b|\bleito\b)/i.test(sql));ck("skill-gap-modelado",sql.includes("research_skill_need_candidate"));
const db=read(req[1]);ck("db-pglite-local",db.includes("@electric-sql/pglite")&&!db.includes("DATABASE_URL")&&!db.includes("new Pool"));
const fn=read(req[2]);ck("entrada-bloqueia-identificadores",fn.includes("direct")&&fn.includes("Não inclua e-mail, CPF ou telefone."));
const hub=read(req[3]);for(const id of ["studio","instrumentos","etica","equipe","riscos-impacto","participacao","propostas","consenso","devolutiva","relatorio","governanca"])ck("modulo-ui",hub.includes(`active==="${id}"`),id);
for(const s of req.filter(p=>p.startsWith("schemas/"))){const j=JSON.parse(read(s));ck("schema-draft-2020-12",j.$schema==="https://json-schema.org/draft/2020-12/schema",s)}
const regPath="registers/research/candidate.v1.json";const reg=JSON.parse(read(regPath));ck("registry-candidate",reg.status==="CANDIDATE_HOLD"&&reg.publicationAuthorized===false&&reg.kernelAdmission==="NOT_SUBMITTED");
ck("registry-cobre-schemas",Array.isArray(reg.schemas)&&reg.schemas.length===9&&reg.schemas.every(existsSync),`${reg.schemas?.length??0} schemas`);
const wo=JSON.parse(read("registers/governance/candidates/WO-RES-PART-001.json"));ck("wo-sem-admissao-fabricada",wo.kernel_admission==="NOT_SUBMITTED"&&["CANDIDATE","HOLD_HUMAN"].includes(wo.status),`${wo.status} · ${wo.kernel_admission}`);
const route=read("src/routes/secao.$slug.tsx");ck("rota-existente-reutilizada",route.includes("ResearchHub")&&route.includes('slug === "pesquisa"'));ck("rota-noindex",route.includes('params.slug === "pesquisa"')&&route.includes("noindex, nofollow"));
const cat=read("src/lib/template-catalog.ts");ck("catalogo-materializado",/id: "ferramentas-pesquisa"[\s\S]*url: "\/secao\/pesquisa"/.test(cat));
if(n){console.error(`BLOCKED: ${n} falha(s).`);process.exit(1)}console.log("OK: Research + Participation candidate isolado.");
