import { languageLinks } from "./seo.ts";

export type AuditLevel = "bloqueio" | "achado";

export type AuditFinding = {
  id: string;
  norm: string;
  level: AuditLevel;
  evidence: string;
};

type Row = Record<string, unknown>;

type Queryable = {
  query<T extends Row>(sql: string): Promise<{ rows: T[] }>;
};

const governed = ["apgar", "braden", "gotejamento", "imc", "morse"];

function numberOf(value: unknown) {
  return typeof value === "number" ? value : Number(value);
}

export async function auditEcosystem(db: Queryable): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];
  const block = (id: string, norm: string, evidence: string) => findings.push({ id, norm, level: "bloqueio", evidence });
  const note = (id: string, norm: string, evidence: string) => findings.push({ id, norm, level: "achado", evidence });

  const empty = await db.query<{ n: unknown }>(
    "select count(*)::int as n from content_text where status = 'publicado' and btrim(body) = ''",
  );
  if (numberOf(empty.rows[0]?.n) > 0) {
    block("PUB-CORPO", "Política de dado: rascunho vazio não abre", `${empty.rows[0]?.n} textos publicados sem corpo`);
  }

  const openTools = await db.query<{ slug: string }>("select slug from source_tool where published order by slug");
  const open = openTools.rows.map((row) => row.slug);
  if (open.join() !== governed.join()) {
    block("CLI-CAPA", "Capa publicada só das cinco ferramentas com fórmula", open.join(", ") || "nenhuma");
  }

  const bare = await db.query<{ slug: string }>(
    `select tool.slug
     from source_tool as tool
     where tool.published
       and not exists (select 1 from tool_formula as formula where formula.tool_slug = tool.slug)
       and not exists (select 1 from tool_criterion as criterion where criterion.tool_slug = tool.slug)
       and not exists (select 1 from tool_field as field where field.tool_slug = tool.slug)`,
  );
  if (bare.rows.length > 0) block("CLI-FORMULA", "Instrumento publicado precisa de fórmula, critério ou campo", bare.rows.map((row) => row.slug).join(", "));

  const kernel = await db.query<{ n: unknown }>(
    `select count(*)::int as n from (
       select id from kernel_order where approver_id = 'kernel'
       union all
       select order_id from kernel_manifest where approved_by = 'kernel'
     ) as hit`,
  );
  if (numberOf(kernel.rows[0]?.n) > 0) block("KER-PESSOA", "Admissão e manifesto exigem pessoa, nunca o valor kernel", `${kernel.rows[0]?.n} linhas`);

  const patient = await db.query<{ table_name: string; column_name: string }>(
    `select table_name, column_name
     from information_schema.columns
     where table_schema = 'public' and column_name ~ '(paciente|leito|prontuario|cpf)'
     order by table_name, column_name`,
  );
  if (patient.rows.length > 0) {
    block("LGPD-PACIENTE", "Política de dado: paciente, leito e documento não entram em tabela", patient.rows.map((row) => `${row.table_name}.${row.column_name}`).join(", "));
  }

  const alternates = languageLinks("/ferramentas/braden", "pt-BR").filter(
    (link) => link.rel === "alternate" && link.hrefLang !== "pt-BR" && link.hrefLang !== "x-default",
  );
  if (alternates.length > 0) {
    note("I18N-HREFLANG", "WCAG 3.1.1: não anunciar idioma cujo texto não está publicado", "languageLinks emite en, es e fr para uma ferramenta que só abre em pt-BR");
  }

  const missingTables = await db.query<{ name: string }>(
    `select entity.name
     from schema_entity as entity
     where not exists (
       select 1 from information_schema.tables as physical
       where physical.table_schema = 'public' and physical.table_name = entity.name
     )
     order by entity.name`,
  );
  if (missingTables.rows.length > 0) {
    note("DIC-ENTIDADE-SEM-TABELA", "Dicionário interno: entidade sem tabela física. Não é declaração de ISO 8000", missingTables.rows.map((row) => row.name).join(", "));
  }

  const missingEntities = await db.query<{ n: unknown }>(
    `select count(*)::int as n
     from information_schema.tables as physical
     where physical.table_schema = 'public'
       and physical.table_type = 'BASE TABLE'
       and physical.table_name <> '_migrations'
       and not exists (select 1 from schema_entity as entity where entity.name = physical.table_name)`,
  );
  if (numberOf(missingEntities.rows[0]?.n) > 0) {
    note("DIC-TABELA-SEM-ENTIDADE", "Dicionário interno: tabela física ainda sem entidade", `${missingEntities.rows[0]?.n} tabelas`);
  }

  const syntax = await db.query<{ syntax: string }>(
    "select syntax from data_specification where entity = 'source_tool' and characteristic = 'slug'",
  );
  const underscored = await db.query<{ n: unknown }>("select count(*)::int as n from source_tool where slug like '%\\_%' escape '\\'");
  if ((syntax.rows[0]?.syntax ?? "").includes("hífen") && !syntax.rows[0]?.syntax.includes("underline") && numberOf(underscored.rows[0]?.n) > 0) {
    note("DIC-SINTAXE", "Dicionário interno: a sintaxe gravada não descreve o slug que existe", syntax.rows[0]?.syntax ?? "");
  }

  const altGap = await db.query<{ n: unknown }>(
    `select count(*)::int as n
     from media_asset as image
     where image.kind = 'imagem'
       and (
         not exists (
           select 1 from media_alt as alt
           where alt.path = image.path and alt.locale = 'pt-BR' and alt.status = 'publicado' and btrim(alt.text) <> ''
         )
         or exists (
           select 1 from (values ('en'), ('es'), ('fr')) as offered (locale)
           where not exists (
             select 1 from media_alt as alt
             where alt.path = image.path and alt.locale = offered.locale and alt.status = 'publicado' and btrim(alt.text) <> ''
           )
         )
       )`,
  );
  if (numberOf(altGap.rows[0]?.n) > 0) {
    note("I18N-ALT", "WCAG 3.1.2: texto alternativo dos outros idiomas do seletor ainda está em rascunho", `${altGap.rows[0]?.n} imagens`);
  }

  const chromeGap = await db.query<{ n: unknown }>(
    `select count(*)::int as n
     from chrome_label as source
     where source.locale = 'pt'
       and exists (
         select 1 from (values ('en'), ('es'), ('fr')) as offered (locale)
         where not exists (
           select 1 from chrome_label as other
           where other.locale = offered.locale and other.group_id = source.group_id and other.key = source.key and btrim(other.text) <> ''
         )
       )`,
  );
  if (numberOf(chromeGap.rows[0]?.n) > 0) {
    note("I18N-CHROME", "Rótulo em português sem par em inglês, espanhol ou francês", `${chromeGap.rows[0]?.n} rótulos`);
  }

  const draftRules = await db.query<{ n: unknown }>("select count(*)::int as n from business_rule where status = 'rascunho'");
  if (numberOf(draftRules.rows[0]?.n) > 0) {
    note("REG-RASCUNHO", "Regra de negócio nasce em rascunho e não vale como controle aprovado", `${draftRules.rows[0]?.n} regras`);
  }

  return findings.sort((a, b) => a.id.localeCompare(b.id));
}
