import type { ClinicalTool } from "@/lib/tools/types";
import { getTool } from "./catalog.ts";
import { assertProductionAuth } from "../publish-guard.ts";

type Tx = <T>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T[]>;

function on(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

export async function saveSheetTx(sql: Tx, tool: ClinicalTool, published: boolean, userId: string) {
  assertProductionAuth();
  const gate = await sql<{ enabled: unknown }>`select enabled from process where id = ${"publicar_ferramenta"}`;
  if (!on(gate[0]?.enabled)) throw new Error("O processo publicar_ferramenta está desligado.");
  const cover = await sql<{ slug: string }>`select slug from source_tool where slug = ${tool.slug}`;
  if (!cover[0]) throw new Error("Ferramenta fora da fonte.");
  await sql`
    update source_tool
    set title = ${tool.title},
        lead = ${tool.lead},
        kind = ${tool.kind},
        category = ${tool.category},
        nanda_mode = ${tool.nandaMode},
        band_from = ${tool.bandFrom ?? null},
        evidence = ${tool.evidence ?? null},
        version = ${tool.version ?? null},
        published = ${published},
        updated_by = ${userId},
        updated_at = now()
    where slug = ${tool.slug}
  `;
  for (const statement of [
    sql`delete from tool_choice where tool_slug = ${tool.slug}`,
    sql`delete from tool_criterion where tool_slug = ${tool.slug}`,
    sql`delete from tool_field where tool_slug = ${tool.slug}`,
    sql`delete from tool_select_option where tool_slug = ${tool.slug}`,
    sql`delete from tool_select where tool_slug = ${tool.slug}`,
    sql`delete from tool_meta_option where tool_slug = ${tool.slug}`,
    sql`delete from tool_meta where tool_slug = ${tool.slug}`,
    sql`delete from tool_output where tool_slug = ${tool.slug}`,
    sql`delete from tool_band_nanda where tool_slug = ${tool.slug}`,
    sql`delete from tool_band where tool_slug = ${tool.slug}`,
    sql`delete from tool_reference where tool_slug = ${tool.slug}`,
    sql`delete from tool_step where tool_slug = ${tool.slug}`,
    sql`delete from tool_faq where tool_slug = ${tool.slug}`,
    sql`delete from tool_related where tool_slug = ${tool.slug}`,
    sql`delete from tool_specific where tool_slug = ${tool.slug}`,
  ]) {
    await statement;
  }
  for (const [index, criterion] of (tool.criteria ?? []).entries()) {
    await sql`
      insert into tool_criterion (tool_slug, id, label, help, position)
      values (${tool.slug}, ${criterion.id}, ${criterion.label}, ${criterion.help}, ${index + 1})
    `;
    for (const [choiceIndex, choice] of criterion.choices.entries()) {
      await sql`
        insert into tool_choice (tool_slug, criterion_id, value, label, position)
        values (${tool.slug}, ${criterion.id}, ${choice.value}, ${choice.label}, ${choiceIndex + 1})
      `;
    }
  }
  for (const [index, field] of (tool.fields ?? []).entries()) {
    await sql`
      insert into tool_field (tool_slug, id, label, unit, min_value, max_value, step, position)
      values (${tool.slug}, ${field.id}, ${field.label}, ${field.unit}, ${field.min}, ${field.max}, ${field.step}, ${index + 1})
    `;
  }
  for (const [index, field] of (tool.selects ?? []).entries()) {
    await sql`
      insert into tool_select (tool_slug, id, label, position)
      values (${tool.slug}, ${field.id}, ${field.label}, ${index + 1})
    `;
    for (const [optionIndex, option] of field.options.entries()) {
      await sql`
        insert into tool_select_option (tool_slug, select_id, value, label, position)
        values (${tool.slug}, ${field.id}, ${option.value}, ${option.label}, ${optionIndex + 1})
      `;
    }
  }
  for (const [index, field] of (tool.metaFields ?? []).entries()) {
    await sql`
      insert into tool_meta (tool_slug, id, label, position)
      values (${tool.slug}, ${field.id}, ${field.label}, ${index + 1})
    `;
    for (const [optionIndex, option] of field.options.entries()) {
      await sql`
        insert into tool_meta_option (tool_slug, meta_id, value, label, position)
        values (${tool.slug}, ${field.id}, ${option.value}, ${option.label}, ${optionIndex + 1})
      `;
    }
  }
  for (const [index, output] of (tool.outputs ?? []).entries()) {
    await sql`
      insert into tool_output (tool_slug, id, label, unit, digits, position)
      values (${tool.slug}, ${output.id}, ${output.label}, ${output.unit}, ${output.digits}, ${index + 1})
    `;
  }
  for (const band of tool.bands ?? []) {
    await sql`
      insert into tool_band (tool_slug, min_score, max_score, label, tone, note)
      values (${tool.slug}, ${band.min}, ${band.max}, ${band.label}, ${band.tone}, ${band.note})
    `;
    for (const label of band.nanda) {
      await sql`
        insert into tool_band_nanda (tool_slug, min_score, label)
        values (${tool.slug}, ${band.min}, ${label})
      `;
    }
  }
  for (const [index, citation] of tool.references.entries()) {
    await sql`insert into tool_reference (tool_slug, position, citation) values (${tool.slug}, ${index + 1}, ${citation})`;
  }
  for (const [index, body] of tool.howTo.entries()) {
    await sql`insert into tool_step (tool_slug, position, body) values (${tool.slug}, ${index + 1}, ${body})`;
  }
  for (const [index, faq] of tool.faqs.entries()) {
    await sql`insert into tool_faq (tool_slug, position, question, answer) values (${tool.slug}, ${index + 1}, ${faq.q}, ${faq.a})`;
  }
  for (const [index, related] of tool.related.entries()) {
    await sql`insert into tool_related (tool_slug, related_slug, position) values (${tool.slug}, ${related}, ${index + 1})`;
  }
  for (const [index, body] of (tool.specific ?? []).entries()) {
    await sql`insert into tool_specific (tool_slug, position, body) values (${tool.slug}, ${index + 1}, ${body})`;
  }
  await sql`
    insert into audit_event (id, actor_id, action, entity, entity_id)
    values (${crypto.randomUUID()}, ${userId}, ${"gravar_ficha"}, ${"source_tool"}, ${tool.slug})
  `;
}

const processIds = new Set(["publicar_ferramenta", "assinatura", "comunidade"]);

export async function restoreCopyTx(
  sql: Tx,
  copy: { process: { id: string; enabled: boolean }[]; tools: { slug: string; title: string; lead: string; published: boolean }[] },
  userId: string,
) {
  await sql`update process set enabled = true where id = ${"publicar_ferramenta"}`;
  for (const row of copy.tools) {
    const base = getTool(row.slug);
    const title = row.title.trim();
    const lead = row.lead.trim();
    if (!base || title.length < 3 || title.length > 80 || lead.length < 10 || lead.length > 400) continue;
    await saveSheetTx(sql, { ...base, title, lead }, row.published === true, userId);
  }
  for (const row of copy.process) {
    if (!processIds.has(row.id)) continue;
    await sql`update process set enabled = ${row.enabled === true}, updated_by = ${userId}, updated_at = now() where id = ${row.id}`;
  }
  await sql`
    insert into audit_event (id, actor_id, action, entity, entity_id)
    values (${crypto.randomUUID()}, ${userId}, ${"restaurar"}, ${"process"}, ${"copia"})
  `;
}
