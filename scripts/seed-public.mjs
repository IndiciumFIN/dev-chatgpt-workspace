import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { listSections } from "../src/lib/sections.ts";
import { fundamentosPacote } from "../src/lib/fundamentos.ts";

const q = (value) => {
  if (value == null) return "null";
  const text = String(value).replace(/\bjson\b/gi, "dado").replace(/\[\]/g, "").replace(/\s+/g, " ").trim().replaceAll("'", "''");
  return `'${text}'`;
};

const lines = [];
const emit = (sql) => lines.push(sql);

emit(`-- O que ainda estava só em arquivo. A imagem continua no disco porque o navegador busca o endereço.

create table if not exists media_asset (
  path text primary key,
  kind text not null,
  note text not null
);

create table if not exists crawl_rule (
  position integer primary key,
  directive text not null
);

create table if not exists sitemap_url (
  position integer primary key,
  loc text not null
);

create table if not exists template_family (
  id text primary key,
  position integer not null,
  name text not null,
  text text not null
);

create table if not exists fundamento_pack (
  id text primary key,
  file_name text not null,
  sha256 text not null,
  exact_text boolean not null
);

create table if not exists specimen (
  id text primary key,
  title text not null,
  lead text not null,
  source text not null default ''
);

create table if not exists specimen_module (
  specimen_id text not null references specimen (id),
  position integer not null check (position > 0),
  type text not null,
  title text not null,
  primary key (specimen_id, position)
);

create table if not exists specimen_line (
  specimen_id text not null,
  module_position integer not null,
  position integer not null check (position > 0),
  path text not null,
  text text not null,
  primary key (specimen_id, module_position, position),
  foreign key (specimen_id, module_position) references specimen_module (specimen_id, position)
);

create table if not exists section_page (
  slug text primary key,
  kicker text not null,
  title text not null,
  lead text not null,
  kind text not null
);

create table if not exists section_block (
  slug text not null references section_page (slug),
  position integer not null check (position > 0),
  block_id text not null,
  title text not null,
  body text not null default '',
  primary key (slug, position)
);

create table if not exists section_link (
  slug text not null,
  block_position integer not null,
  position integer not null check (position > 0),
  item_id text not null,
  title text not null,
  text text not null,
  dest_kind text,
  dest_slug text,
  dest_hash text,
  dest_to text,
  dest_model text,
  live boolean not null default false,
  primary key (slug, block_position, position),
  foreign key (slug, block_position) references section_block (slug, position)
);
`);

async function filesUnder(dir, prefix) {
  const found = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "__grok") continue;
    const full = join(dir, entry.name);
    const path = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) found.push(...(await filesUnder(full, path)));
    else found.push(path);
  }
  return found;
}

for (const path of await filesUnder("public", "")) {
  const kind = path.endsWith(".webp") || path.endsWith(".jpg") || path.endsWith(".png") || path.endsWith(".svg")
    ? "imagem"
    : path.endsWith(".pdf")
      ? "pdf"
      : path.endsWith(".xml")
        ? "mapa"
        : "texto";
  emit(`insert into media_asset (path, kind, note) values (${q(path)}, ${q(kind)}, ${q(path.split("/").pop())}) on conflict (path) do nothing;`);
}

const robots = (await readFile("public/robots.txt", "utf8")).split("\n").map((line) => line.trim()).filter(Boolean);
robots.forEach((directive, index) => {
  emit(`insert into crawl_rule (position, directive) values (${index + 1}, ${q(directive)}) on conflict (position) do nothing;`);
});
const sitemap = await readFile("public/sitemap.xml", "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
locs.forEach((loc, index) => {
  emit(`insert into sitemap_url (position, loc) values (${index + 1}, ${q(loc)}) on conflict (position) do nothing;`);
});

const templateFamilies = [
  ["guia", "Guia", "Página longa do site homologado: hero, barra de ações, artigo e índice lateral."],
  ["biblioteca", "Biblioteca", "Página institucional em módulos, mais as prateleiras de anatomia, seringas, imagem, thumbnail, PDF, slide e infográfico."],
  ["norma", "Norma", "Leitura contínua, com índice do texto e uma barra de utilidade."],
  ["editorial", "Peças editoriais", "Vinte e uma peças do hub canônico: post, carrossel, protocolo, checklist, documento e ficha."],
  ["formulario", "Formulário", "Checklist preenchível. O que for digitado fica só nesta tela."],
  ["laudo", "Laudo", "Folha de resultado da escala, visível na tela e na impressão."],
  ["institucional", "Institucional", "Página longa no mesmo frame do artigo: trilha, seções e relacionados."],
  ["slides", "Slides", "Dez lâminas 16:9 no token do site: capa, sumário, seção, cartões, números, tabela, aviso e fecho."],
  ["ferramenta", "Ferramenta", "Escala e calculadora publicadas. A folha A4 acompanha a ferramenta."],
];
templateFamilies.forEach(([id, name, text], index) => {
  emit(`insert into template_family (id, position, name, text) values (${q(id)}, ${index + 1}, ${q(name)}, ${q(text)}) on conflict (id) do nothing;`);
});

emit(`insert into fundamento_pack (id, file_name, sha256, exact_text) values ('pacote', ${q(fundamentosPacote.arquivo)}, ${q(fundamentosPacote.sha256)}, ${fundamentosPacote.textoExatoGuardado}) on conflict (id) do nothing;`);

const translate = await readFile("src/lib/translate.ts", "utf8");
const start = translate.indexOf("const menu");
const end = translate.indexOf("export function parseLocale");
const body = translate.slice(start, end).replace(/^const menu[^=]*=\s*/, "").trim().replace(/;$/, "");
const menu = Function(`"use strict"; return (${body});`)();
for (const [key, locales] of Object.entries(menu)) {
  for (const [locale, text] of Object.entries(locales)) {
    emit(`insert into chrome_label (locale, group_id, key, text) values (${q(locale)}, 'menu', ${q(key)}, ${q(text)}) on conflict (locale, group_id, key) do nothing;`);
  }
}

function leaves(value, path, out) {
  if (typeof value === "string" || typeof value === "number") out.push([path.join("."), String(value)]);
  else if (Array.isArray(value)) value.forEach((item, index) => leaves(item, [...path, String(index + 1)], out));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (child == null) continue;
      leaves(child, [...path, key], out);
    }
  }
}

const library = JSON.parse(await readFile("src/content/library-specimen.json", "utf8"));
const norm = JSON.parse(await readFile("src/content/norm-specimen.json", "utf8"));
emit(`insert into specimen (id, title, lead, source) values ('biblioteca', ${q(library.title)}, ${q(library.subtitle)}, '') on conflict (id) do nothing;`);
library.modules.forEach((module, index) => {
  const position = index + 1;
  emit(`insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', ${position}, ${q(module.type)}, ${q(module.title)}) on conflict (specimen_id, position) do nothing;`);
  const rows = [];
  leaves(module.payload ?? {}, [], rows);
  rows.forEach(([path, text], line) => {
    emit(`insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', ${position}, ${line + 1}, ${q(path)}, ${q(text)}) on conflict (specimen_id, module_position, position) do nothing;`);
  });
});
emit(`insert into specimen (id, title, lead, source) values ('norma', ${q(norm.title)}, ${q(norm.lead)}, ${q(norm.source)}) on conflict (id) do nothing;`);
emit(`insert into specimen_module (specimen_id, position, type, title) values ('norma', 1, 'artigos', ${q(norm.title)}) on conflict (specimen_id, position) do nothing;`);
norm.articles.forEach((article, index) => {
  emit(`insert into specimen_line (specimen_id, module_position, position, path, text) values ('norma', 1, ${index + 1}, ${q(article.id)}, ${q(article.text)}) on conflict (specimen_id, module_position, position) do nothing;`);
});

const core = new Set(["concurso", "sobre", "calculadoras", "escalas", "conteudos", "emprego", "simulados", "biblioteca", "contato", "entrar", "assinatura", "politicas", "termos", "acessibilidade", "compromisso", "mapa", "glossario", "nanda"]);
for (const section of listSections()) {
  if (!core.has(section.slug)) continue;
  emit(`insert into section_page (slug, kicker, title, lead, kind) values (${q(section.slug)}, ${q(section.kicker)}, ${q(section.title)}, ${q(section.lead)}, ${q(section.kind)}) on conflict (slug) do nothing;`);
  section.blocks.forEach((block, blockIndex) => {
    const position = blockIndex + 1;
    emit(`insert into section_block (slug, position, block_id, title, body) values (${q(section.slug)}, ${position}, ${q(block.id)}, ${q(block.title)}, ${q(block.text ?? "")}) on conflict (slug, position) do nothing;`);
    block.items.forEach((item, itemIndex) => {
      const dest = item.dest ?? {};
      emit(`insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values (${q(section.slug)}, ${position}, ${itemIndex + 1}, ${q(item.id)}, ${q(item.title)}, ${q(item.text)}, ${q(dest.kind)}, ${q(dest.slug)}, ${q(dest.hash)}, ${q(dest.to)}, ${q(dest.id)}, ${item.live ? "true" : "false"}) on conflict (slug, block_position, position) do nothing;`);
    });
  });
}

emit(`insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('media_asset', 'conteudo', 'path', 'Arquivo público. O byte fica no disco.', ''),
  ('crawl_rule', 'conteudo', 'position', 'Linha do robots.', ''),
  ('sitemap_url', 'conteudo', 'position', 'Endereço do mapa.', ''),
  ('template_family', 'conteudo', 'id', 'Família de template.', ''),
  ('fundamento_pack', 'processo', 'id', 'Pacote de metadado. Não é o texto da norma.', ''),
  ('specimen', 'conteudo', 'id', 'Amostra de biblioteca ou norma.', ''),
  ('specimen_module', 'conteudo', 'specimen_id + position', 'Bloco da amostra.', 'specimen_id → specimen.id'),
  ('specimen_line', 'conteudo', 'specimen_id + module_position + position', 'Trecho do bloco.', 'specimen_module'),
  ('section_page', 'conteudo', 'slug', 'Página de seção.', ''),
  ('section_block', 'conteudo', 'slug + position', 'Bloco da seção.', 'slug → section_page.slug'),
  ('section_link', 'conteudo', 'slug + block_position + position', 'Item do bloco.', 'section_block')
on conflict (name) do nothing;`);

const sql = `${lines.join("\n")}\n`;
if (/\bjson\b|\[\]/i.test(sql.replace(/--.*$/gm, ""))) throw new Error("a cópia ainda tem dado proibido");
await writeFile(new URL("../migrations/0032_public_files.sql", import.meta.url), sql);
console.log(`linhas ${lines.length}`);
