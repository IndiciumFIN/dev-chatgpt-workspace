import {readFileSync,existsSync} from "node:fs";
let fails=0;const ck=(name,ok,detail="")=>{console.log(`${ok?"PASS":"FAIL"} CAREER: ${name}${detail?` — ${detail}`:""}`);if(!ok)fails++};const read=p=>readFileSync(p,"utf8");
const required=[
"migrations/0004_career_youth_candidate.sql","src/lib/career-candidate-db.server.ts","src/lib/career.functions.ts","src/components/career/career-hub.tsx","src/styles/career.css",
"schemas/career-module.schema.json","schemas/career-role.schema.json","schemas/career-skill.schema.json","schemas/career-path.schema.json","schemas/career-opportunity.schema.json","schemas/career-profile.schema.json","schemas/career-application.schema.json","schemas/career-credential.schema.json","schemas/career-editorial-projection.schema.json",
"registers/career/candidate.v1.json","registers/governance/candidates/WO-CAREER-YOUTH-001.json","registers/governance/candidates/TASK-CAREER-YOUTH-001.json","registers/governance/candidates/FIND-CAREER-YOUTH-001.json"
];
for(const p of required)ck("arquivo-presente",existsSync(p),p);
const sql=read(required[0]);const sqlNoComments=sql.replace(/--.*$/gm,"");
ck("sql-nao-destrutivo",!/\b(drop|truncate|delete)\b/i.test(sqlNoComments));
ck("sql-sem-identificadores-pessoais",!/(\bemail\b|\bcpf\b|\bphone\b|\btelefone\b|\bcoren\b|\bpatient\b|\bpaciente\b|\bleito\b)/i.test(sqlNoComments));
for(const table of ["career_projection_candidate","career_module_candidate","career_role_candidate","career_skill_candidate","career_role_skill_candidate","career_path_candidate","career_opportunity_type_candidate","career_credential_candidate","career_document_template_candidate","career_market_signal_candidate","career_editorial_candidate","career_reflection_question_candidate","career_profile_candidate","career_application_candidate","career_profile_credential_candidate","career_milestone_candidate"])ck("tabela-db-first",sql.includes(`create table if not exists ${table}`),table);
ck("editorial-separado",sql.includes("career_editorial_candidate")&&sql.includes("object_class")&&sql.includes("'FUNCTIONAL','EDITORIAL','HYBRID'"));
ck("mercado-sem-dado-inventado",sql.includes("'SOURCE_REQUIRED'")&&sql.includes("metric_value numeric"));
const db=read(required[1]);ck("db-pglite-local",db.includes("@electric-sql/pglite")&&!db.includes("DATABASE_URL")&&!db.includes("new Pool"));
const funcs=read(required[2]);ck("snapshot-vem-do-banco",funcs.includes("career_projection_item_candidate")&&funcs.includes("career_module_candidate")&&funcs.includes("career_editorial_candidate"));
ck("texto-bloqueia-identificador",funcs.includes("Não inclua e-mail, CPF ou telefone"));
const ui=read(required[3]);ck("ui-consome-snapshot",ui.includes("getCareerSnapshot")&&ui.includes("snapshot.modules.map"));
ck("ui-sem-catalogo-paralelo",!ui.includes("const careerModules")&&!ui.includes("const youthModules"));
ck("youth-nao-psicometrico",ui.includes("não psicométrico")||ui.includes("não é teste vocacional psicométrico"));
for(const s of required.filter(p=>p.startsWith("schemas/"))){const j=JSON.parse(read(s));ck("schema-draft-2020-12",j.$schema==="https://json-schema.org/draft/2020-12/schema",s)}
const reg=JSON.parse(read("registers/career/candidate.v1.json"));ck("registry-candidate",reg.status==="CANDIDATE_HOLD"&&reg.publicationAuthorized===false&&reg.kernelAdmission==="NOT_SUBMITTED");ck("registry-9-schemas",reg.schemas?.length===9&&reg.schemas.every(existsSync),String(reg.schemas?.length??0));ck("duas-projecoes",reg.projections?.length===2&&reg.projections.some(x=>x.audience==="PROFESSIONAL")&&reg.projections.some(x=>x.audience==="YOUTH"));
const wo=JSON.parse(read("registers/governance/candidates/WO-CAREER-YOUTH-001.json"));ck("wo-sem-admissao-fabricada",wo.kernel_admission==="NOT_SUBMITTED"&&["CANDIDATE","HOLD_HUMAN"].includes(wo.status));
const route=read("src/routes/secao.$slug.tsx");ck("rotas-reutilizadas",route.includes('slug === "carreira"')&&route.includes('slug === "jovens"')&&route.includes("CareerHub"));ck("rotas-noindex",route.includes('["carreira","jovens"]')&&route.includes("noindex, nofollow"));
const sections=read("src/lib/sections.ts");ck("sections-carreira-jovens",sections.includes("carreira: {")&&sections.includes("jovens: {"));
const nav=read("src/lib/nav.ts");ck("nav-carreira-jovens",nav.includes('id: "carreira"')&&nav.includes('id: "jovens"'));
const cat=read("src/lib/template-catalog.ts");ck("catalogo-carreira",cat.includes('url: "/secao/carreira"'));ck("catalogo-jovem",cat.includes('url: "/secao/jovens"'));
if(fails){console.error(`BLOCKED: ${fails} falha(s) no candidato Career/Youth.`);process.exit(1)}console.log("OK: Career + Youth DB-first candidate estruturalmente consistente.");
