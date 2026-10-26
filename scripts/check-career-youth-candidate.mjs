import { readFileSync, existsSync } from "node:fs";

let failures = 0;
const read = (path) => readFileSync(path, "utf8");
function check(name, ok, detail = "") {
  console.log((ok ? "PASS" : "FAIL") + " CAREER: " + name + (detail ? " — " + detail : ""));
  if (!ok) failures += 1;
}

const required = [
  "migrations/0004_career_youth_candidate.sql",
  "src/lib/career-candidate-db.server.ts",
  "src/lib/career.functions.ts",
  "src/components/career/career-hub.tsx",
  "src/styles/career.css",
  "schemas/career-module.schema.json",
  "schemas/career-role.schema.json",
  "schemas/career-skill.schema.json",
  "schemas/career-path.schema.json",
  "schemas/career-opportunity.schema.json",
  "schemas/career-profile.schema.json",
  "schemas/career-application.schema.json",
  "schemas/career-credential.schema.json",
  "schemas/career-editorial-projection.schema.json",
  "registers/career/candidate.v1.json",
  "registers/governance/candidates/WO-CAREER-YOUTH-001.json",
  "registers/governance/candidates/TASK-CAREER-YOUTH-001.json",
  "registers/governance/candidates/FIND-CAREER-YOUTH-001.json",
];

for (const path of required) check("arquivo-presente", existsSync(path), path);

const sql = read("migrations/0004_career_youth_candidate.sql");
const sqlNoComments = sql.replace(/--.*$/gm, "");
check("sql-nao-destrutivo", !/\b(drop|truncate|delete)\b/i.test(sqlNoComments));

const personalTables = [
  "career_profile_candidate",
  "career_profile_skill_candidate",
  "career_application_candidate",
  "career_profile_credential_candidate",
  "career_milestone_candidate",
];
const personalSql = personalTables.map((table) => {
  const match = sqlNoComments.match(new RegExp("create table if not exists " + table + "\\s*\\(([\\s\\S]*?)\\);", "i"));
  return match?.[1] ?? "";
}).join("\n");
const forbiddenColumn = /^\s*(name|nome|email|cpf|phone|telefone|coren|patient|paciente|leito)\s+[a-z]/im;
check("workspace-sem-colunas-identificadoras", !forbiddenColumn.test(personalSql));

const tables = [
  "career_projection_candidate",
  "career_module_candidate",
  "career_role_candidate",
  "career_skill_candidate",
  "career_role_skill_candidate",
  "career_path_candidate",
  "career_opportunity_type_candidate",
  "career_credential_candidate",
  "career_document_template_candidate",
  "career_market_signal_candidate",
  "career_editorial_candidate",
  "career_reflection_question_candidate",
  "career_profile_candidate",
  "career_profile_skill_candidate",
  "career_application_candidate",
  "career_profile_credential_candidate",
  "career_milestone_candidate",
];
for (const table of tables) {
  check("tabela-db-first", sql.includes("create table if not exists " + table), table);
}

check(
  "editorial-separado",
  sql.includes("career_editorial_candidate") &&
    sql.includes("object_class") &&
    sql.includes("'FUNCTIONAL','EDITORIAL','HYBRID'"),
);
check(
  "mercado-sem-dado-inventado",
  sql.includes("'SOURCE_REQUIRED'") && sql.includes("metric_value numeric"),
);

const db = read("src/lib/career-candidate-db.server.ts");
check(
  "db-pglite-local",
  db.includes("@electric-sql/pglite") &&
    !db.includes("DATABASE_URL") &&
    !db.includes("new Pool"),
);

const functions = read("src/lib/career.functions.ts");
check(
  "snapshot-vem-do-banco",
  functions.includes("career_projection_item_candidate") &&
    functions.includes("career_module_candidate") &&
    functions.includes("career_editorial_candidate"),
);
check(
  "texto-bloqueia-identificador",
  functions.includes("Não inclua e-mail, CPF ou telefone"),
);

const ui = read("src/components/career/career-hub.tsx");
check(
  "ui-consome-snapshot",
  ui.includes("getCareerSnapshot") && ui.includes("snapshot.modules.map"),
);
check(
  "ui-sem-catalogo-paralelo",
  !ui.includes("const careerModules") && !ui.includes("const youthModules"),
);
check(
  "youth-nao-psicometrico",
  ui.includes("não psicométrico") || ui.includes("não é teste vocacional psicométrico"),
);

for (const path of required.filter((item) => item.startsWith("schemas/"))) {
  const schema = JSON.parse(read(path));
  check(
    "schema-draft-2020-12",
    schema.$schema === "https://json-schema.org/draft/2020-12/schema",
    path,
  );
}

const registry = JSON.parse(read("registers/career/candidate.v1.json"));
check(
  "registry-candidate",
  registry.status === "CANDIDATE_HOLD" &&
    registry.publicationAuthorized === false &&
    registry.kernelAdmission === "NOT_SUBMITTED",
);
check(
  "registry-9-schemas",
  registry.schemas?.length === 9 && registry.schemas.every(existsSync),
  String(registry.schemas?.length ?? 0),
);
check(
  "duas-projecoes",
  registry.projections?.length === 2 &&
    registry.projections.some((item) => item.audience === "PROFESSIONAL") &&
    registry.projections.some((item) => item.audience === "YOUTH"),
);

const wo = JSON.parse(read("registers/governance/candidates/WO-CAREER-YOUTH-001.json"));
check(
  "wo-sem-admissao-fabricada",
  wo.kernel_admission === "NOT_SUBMITTED" &&
    ["CANDIDATE", "HOLD_HUMAN"].includes(wo.status),
);

const route = read("src/routes/secao.$slug.tsx");
check(
  "rotas-reutilizadas",
  route.includes('slug === "carreira"') &&
    route.includes('slug === "jovens"') &&
    route.includes("CareerHub"),
);
check(
  "rotas-noindex",
  route.includes('["carreira","jovens"]') &&
    route.includes("noindex, nofollow"),
);

const sections = read("src/lib/sections.ts");
check(
  "sections-carreira-jovens",
  sections.includes("carreira: {") && sections.includes("jovens: {"),
);
check(
  "sections-candidatas",
  sections.includes('publicacao: "candidata"'),
);

const nav = read("src/lib/nav.ts");
check(
  "nav-carreira-jovens",
  nav.includes('id: "carreira"') && nav.includes('id: "jovens"'),
);

const catalog = read("src/lib/template-catalog.ts");
check("catalogo-carreira", catalog.includes('url: "/secao/carreira"'));
check("catalogo-jovem", catalog.includes('url: "/secao/jovens"'));

if (failures) {
  console.error("BLOCKED: " + failures + " falha(s) no candidato Career/Youth.");
  process.exit(1);
}
console.log("OK: Career + Youth DB-first candidate estruturalmente consistente.");
