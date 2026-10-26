import { writeFile } from "node:fs/promises";
import { institutionalPages } from "../src/lib/institutional.ts";
import { agents } from "../src/lib/agents.ts";
import { libraryShelves } from "../src/lib/library-shelves.ts";
import { fundamentosNormas } from "../src/lib/fundamentos.ts";
import { policySections } from "../src/lib/policy-document.ts";
import { primaryNav } from "../src/lib/nav.ts";
import {
  specialties,
  sideCards,
  resourceCards,
  calculators,
  simulations,
  scales,
  phases,
  held,
  tokens,
  rejected,
} from "../src/lib/site-data.ts";
import footerCopy from "../src/content/i18n/footer.json" with { type: "json" };
import homeCopy from "../src/content/i18n/home.json" with { type: "json" };
import editorial from "../src/content/editorial-catalog.json" with { type: "json" };

const q = (value) => {
  if (value == null) return "null";
  const text = String(value).replace(/\bjson\b/gi, "dado").replace(/\[\]/g, "").replace(/\s+/g, " ").trim().replaceAll("'", "''");
  return `'${text}'`;
};

const lines = [];
const emit = (sql) => lines.push(sql);

emit(`-- Copia o que estava só em arquivo. Não é norma oficial. A conta continua interpretada no navegador.

create table if not exists tool_formula (
  tool_slug text primary key,
  method text not null check (method in ('soma', 'gotejamento', 'imc')),
  statement text not null
);

create table if not exists tool_formula_step (
  tool_slug text not null references tool_formula (tool_slug),
  position integer not null check (position > 0),
  target text not null,
  expression text not null,
  primary key (tool_slug, position)
);

create table if not exists chrome_label (
  locale text not null,
  group_id text not null,
  key text not null,
  text text not null,
  primary key (locale, group_id, key)
);

create table if not exists nav_item (
  id text primary key,
  parent_id text,
  position integer not null check (position > 0),
  label text not null,
  dest_kind text,
  dest_slug text,
  dest_hash text,
  dest_to text,
  dest_model text
);

create table if not exists catalog_item (
  list_id text not null,
  position integer not null check (position > 0),
  title text not null,
  text text not null,
  icon text,
  slug text,
  file text,
  section text,
  hash text,
  primary key (list_id, position)
);

create table if not exists specialty (
  position integer primary key check (position > 0),
  name text not null
);

create table if not exists phase_note (
  id text primary key,
  position integer not null,
  name text not null,
  status text,
  detail text not null
);

create table if not exists color_token (
  name text primary key,
  hex text not null,
  role text not null,
  rejected boolean not null default false
);

create table if not exists inst_page (
  path text primary key,
  title text not null,
  kicker text not null,
  lead text not null,
  kind text not null
);

create table if not exists inst_section (
  path text not null references inst_page (path),
  position integer not null check (position > 0),
  title text not null,
  body text not null,
  primary key (path, position)
);

create table if not exists inst_child (
  path text not null references inst_page (path),
  position integer not null check (position > 0),
  child_path text not null,
  primary key (path, position)
);

create table if not exists library_shelf (
  id text primary key,
  position integer not null,
  title text not null,
  lead text not null,
  kind text not null
);

create table if not exists library_item (
  shelf_id text not null references library_shelf (id),
  position integer not null check (position > 0),
  title text not null,
  text text not null default '',
  href text not null default '',
  primary key (shelf_id, position)
);

create table if not exists editorial_template (
  id text primary key,
  position integer not null,
  type text not null,
  name text not null,
  category text not null,
  description text not null
);

create table if not exists editorial_line (
  template_id text not null references editorial_template (id),
  position integer not null check (position > 0),
  path text not null,
  text text not null,
  primary key (template_id, position)
);

create table if not exists fundamento (
  id text primary key,
  name text not null,
  domain text not null,
  right_name text not null,
  priority text not null
);

create table if not exists policy_part (
  id text primary key,
  position integer not null,
  label text not null,
  hint text not null
);

create table if not exists agent_basis (
  agent_id text not null references agent (id),
  position integer not null check (position > 0),
  citation text not null,
  primary key (agent_id, position)
);

create table if not exists agent_check (
  agent_id text not null references agent (id),
  position integer not null check (position > 0),
  body text not null,
  primary key (agent_id, position)
);
`);

const formulas = [
  ["braden", "soma", "Soma dos critérios marcados."],
  ["morse", "soma", "Soma dos critérios marcados."],
  ["apgar", "soma", "Soma dos critérios marcados."],
  ["gotejamento", "gotejamento", "Volume, tempo e fator viram mililitros por hora e gotas por minuto."],
  ["imc", "imc", "Peso dividido pelo quadrado da altura em metros."],
];
for (const [slug, method, statement] of formulas) {
  emit(`insert into tool_formula (tool_slug, method, statement) values (${q(slug)}, ${q(method)}, ${q(statement)}) on conflict (tool_slug) do nothing;`);
}
const steps = [
  ["gotejamento", 1, "minutes", "horas * 60 + minutos"],
  ["gotejamento", 2, "mlh", "volume / (minutes / 60)"],
  ["gotejamento", 3, "gotas", "round(volume * fator / minutes)"],
  ["imc", 1, "metros", "altura / 100"],
  ["imc", 2, "imc", "peso / (metros * metros)"],
  ["braden", 1, "total", "soma dos critérios"],
  ["morse", 1, "total", "soma dos critérios"],
  ["apgar", 1, "total", "soma dos critérios"],
];
for (const [slug, position, target, expression] of steps) {
  emit(`insert into tool_formula_step (tool_slug, position, target, expression) values (${q(slug)}, ${position}, ${q(target)}, ${q(expression)}) on conflict (tool_slug, position) do nothing;`);
}

function leaves(value, path, out) {
  if (typeof value === "string") out.push([path.join("."), value]);
  else if (Array.isArray(value)) value.forEach((item, index) => leaves(item, [...path, String(index + 1)], out));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) leaves(child, [...path, key], out);
  }
}

for (const [group, book] of [["footer", footerCopy], ["home", homeCopy]]) {
  for (const [locale, tree] of Object.entries(book)) {
    const rows = [];
    leaves(tree, [], rows);
    for (const [key, text] of rows) {
      emit(`insert into chrome_label (locale, group_id, key, text) values (${q(locale)}, ${q(group)}, ${q(key)}, ${q(text)}) on conflict (locale, group_id, key) do nothing;`);
    }
  }
}

const navRows = [];
function walkNav(nodes, parent) {
  nodes.forEach((node, index) => {
    const dest = node.dest ?? {};
    navRows.push({ id: node.id, parent, position: index + 1, label: node.label, dest });
    for (const group of node.groups ?? []) walkNav(group.items, node.id);
  });
}
walkNav(primaryNav, null);
for (const row of navRows) {
  emit(`insert into nav_item (id, parent_id, position, label, dest_kind, dest_slug, dest_hash, dest_to, dest_model) values (${q(row.id)}, ${q(row.parent)}, ${row.position}, ${q(row.label)}, ${q(row.dest.kind)}, ${q(row.dest.slug)}, ${q(row.dest.hash)}, ${q(row.dest.to)}, ${q(row.dest.id)}) on conflict (id) do nothing;`);
}

function catalog(listId, items) {
  items.forEach((item, index) => {
    emit(`insert into catalog_item (list_id, position, title, text, icon, slug, file, section, hash) values (${q(listId)}, ${index + 1}, ${q(item.title)}, ${q(item.text)}, ${q(item.icon)}, ${q(item.slug)}, ${q(item.file)}, ${q(item.section)}, ${q(item.hash)}) on conflict (list_id, position) do nothing;`);
  });
}
catalog("calculadoras", calculators);
catalog("simulados", simulations);
catalog("escalas", scales);
catalog("home-lateral", sideCards);
catalog("home-recurso", resourceCards);
specialties.forEach((name, index) => emit(`insert into specialty (position, name) values (${index + 1}, ${q(name)}) on conflict (position) do nothing;`));
phases.forEach((item, index) => emit(`insert into phase_note (id, position, name, status, detail) values (${q(item.id)}, ${index + 1}, ${q(item.name)}, ${q(item.status)}, ${q(item.detail)}) on conflict (id) do nothing;`));
held.forEach((item, index) => emit(`insert into phase_note (id, position, name, detail) values (${q(item.id)}, ${100 + index}, ${q(item.name)}, ${q(item.detail)}) on conflict (id) do nothing;`));
for (const item of tokens) emit(`insert into color_token (name, hex, role, rejected) values (${q(item.name)}, ${q(item.hex)}, ${q(item.role)}, false) on conflict (name) do nothing;`);
for (const item of rejected) emit(`insert into color_token (name, hex, role, rejected) values (${q(item.name)}, ${q(item.hex)}, ${q(item.role)}, true) on conflict (name) do nothing;`);

for (const page of institutionalPages) {
  emit(`insert into inst_page (path, title, kicker, lead, kind) values (${q(page.path)}, ${q(page.title)}, ${q(page.kicker)}, ${q(page.lead)}, ${q(page.kind)}) on conflict (path) do nothing;`);
  page.sections.forEach((section, index) => {
    emit(`insert into inst_section (path, position, title, body) values (${q(page.path)}, ${index + 1}, ${q(section.title)}, ${q(section.text)}) on conflict (path, position) do nothing;`);
  });
  (page.children ?? []).forEach((child, index) => {
    emit(`insert into inst_child (path, position, child_path) values (${q(page.path)}, ${index + 1}, ${q(child)}) on conflict (path, position) do nothing;`);
  });
}

libraryShelves.forEach((shelf, index) => {
  emit(`insert into library_shelf (id, position, title, lead, kind) values (${q(shelf.id)}, ${index + 1}, ${q(shelf.title)}, ${q(shelf.lead)}, ${q(shelf.kind)}) on conflict (id) do nothing;`);
  (shelf.items ?? []).forEach((item, itemIndex) => {
    const title = item.title ?? item.caption ?? item.alt ?? item.src;
    const text = item.text ?? item.alt ?? "";
    const href = item.href ?? item.src ?? "";
    emit(`insert into library_item (shelf_id, position, title, text, href) values (${q(shelf.id)}, ${itemIndex + 1}, ${q(title)}, ${q(text)}, ${q(href)}) on conflict (shelf_id, position) do nothing;`);
  });
});

editorial.templates.forEach((template, index) => {
  emit(`insert into editorial_template (id, position, type, name, category, description) values (${q(template.id)}, ${index + 1}, ${q(template.type)}, ${q(template.name)}, ${q(template.category)}, ${q(template.description)}) on conflict (id) do nothing;`);
  const rows = [];
  leaves(template.data ?? {}, [], rows);
  rows.forEach(([path, text], line) => {
    emit(`insert into editorial_line (template_id, position, path, text) values (${q(template.id)}, ${line + 1}, ${q(path)}, ${q(text)}) on conflict (template_id, position) do nothing;`);
  });
});

for (const item of fundamentosNormas) {
  emit(`insert into fundamento (id, name, domain, right_name, priority) values (${q(item.id)}, ${q(item.nome)}, ${q(item.dominio)}, ${q(item.direito)}, ${q(item.prioridade)}) on conflict (id) do nothing;`);
}
policySections.forEach((part, index) => {
  emit(`insert into policy_part (id, position, label, hint) values (${q(part.id)}, ${index + 1}, ${q(part.label)}, ${q(part.hint)}) on conflict (id) do nothing;`);
});

emit("delete from agent_rule;");
for (const agent of agents) {
  agent.basis.forEach((citation, index) => {
    emit(`insert into agent_basis (agent_id, position, citation) values (${q(agent.id)}, ${index + 1}, ${q(citation)}) on conflict (agent_id, position) do nothing;`);
  });
  agent.rules.forEach((body, index) => {
    emit(`insert into agent_rule (agent_id, position, body) values (${q(agent.id)}, ${index + 1}, ${q(body)}) on conflict (agent_id, position) do nothing;`);
  });
  const guard = agent.rules.length + 1;
  emit(`insert into agent_rule (agent_id, position, body) values (${q(agent.id)}, ${guard}, 'Não publica e não grava a fonte.') on conflict (agent_id, position) do nothing;`);
  agent.checklist.forEach((body, index) => {
    emit(`insert into agent_check (agent_id, position, body) values (${q(agent.id)}, ${index + 1}, ${q(body)}) on conflict (agent_id, position) do nothing;`);
  });
}

emit(`insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('tool_formula', 'clinico', 'tool_slug', 'Método da conta. Não é texto oficial de norma.', 'tool_slug → source_tool.slug'),
  ('tool_formula_step', 'clinico', 'tool_slug + position', 'Passo da conta.', 'tool_slug → tool_formula.tool_slug'),
  ('chrome_label', 'conteudo', 'locale + group_id + key', 'Rótulo de rodapé ou da home.', ''),
  ('nav_item', 'conteudo', 'id', 'Item de menu.', ''),
  ('catalog_item', 'conteudo', 'list_id + position', 'Card de lista.', ''),
  ('specialty', 'conteudo', 'position', 'Especialidade da home.', ''),
  ('phase_note', 'processo', 'id', 'Nota de fase. Não é publicação.', ''),
  ('color_token', 'conteudo', 'name', 'Cor nomeada.', ''),
  ('inst_page', 'conteudo', 'path', 'Página institucional que estava no arquivo.', ''),
  ('inst_section', 'conteudo', 'path + position', 'Seção dessa página.', 'path → inst_page.path'),
  ('inst_child', 'conteudo', 'path + position', 'Filha dessa página.', 'path → inst_page.path'),
  ('library_shelf', 'conteudo', 'id', 'Prateleira da biblioteca.', ''),
  ('library_item', 'conteudo', 'shelf_id + position', 'Item da prateleira.', 'shelf_id → library_shelf.id'),
  ('editorial_template', 'conteudo', 'id', 'Modelo editorial.', ''),
  ('editorial_line', 'conteudo', 'template_id + position', 'Trecho do modelo.', 'template_id → editorial_template.id'),
  ('fundamento', 'processo', 'id', 'Norma citada só por metadado.', ''),
  ('policy_part', 'processo', 'id', 'Parte do formulário de política.', ''),
  ('agent_basis', 'processo', 'agent_id + position', 'Base citada pelo agente.', 'agent_id → agent.id'),
  ('agent_check', 'processo', 'agent_id + position', 'Conferência do agente.', 'agent_id → agent.id')
on conflict (name) do nothing;`);

const sql = `${lines.join("\n")}\n`;
if (/\bjson\b|\[\]/i.test(sql.replace(/--.*$/gm, ""))) {
  throw new Error("a cópia ainda tem dado proibido");
}
await writeFile(new URL("../migrations/0030_stored_files.sql", import.meta.url), sql);
console.log(`linhas ${lines.length}`);
