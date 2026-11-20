import { createServerFn } from "@tanstack/react-start";
import type { Dest } from "@/lib/sections";
import type { NavNode } from "@/lib/nav";
import type { LibraryShelf } from "@/lib/library-shelves";
import type { StoredAgent, StoredCard, StoredFamily, StoredLabel, StoredNorm, StoredPage, StoredPhase, StoredSite, StoredSpecimen, StoredTemplate, StoredToken } from "@/lib/stored";
import { unflatten } from "@/lib/stored";

type NavRow = {
  id: string;
  parent_id: string | null;
  position: number;
  label: string;
  dest_kind: string | null;
  dest_slug: string | null;
  dest_hash: string | null;
  dest_to: string | null;
  dest_model: string | null;
  tone: string | null;
  live: unknown;
};

function on(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

function destOf(row: NavRow): Dest | undefined {
  if (row.dest_kind === "home") return { kind: "home" };
  if (row.dest_kind === "section" && row.dest_slug) {
    return row.dest_hash ? { kind: "section", slug: row.dest_slug, hash: row.dest_hash } : { kind: "section", slug: row.dest_slug };
  }
  if (row.dest_kind === "tool" && row.dest_slug) return { kind: "tool", slug: row.dest_slug };
  if (row.dest_kind === "page" && row.dest_to) return { kind: "page", to: row.dest_to as "/login" };
  if (row.dest_kind === "model" && row.dest_model) {
    const id = row.dest_model as "biblioteca";
    return row.dest_hash ? { kind: "model", id, hash: row.dest_hash } : { kind: "model", id };
  }
  return undefined;
}

function navTree(rows: NavRow[], parent: string | null): NavNode[] {
  return rows
    .filter((row) => row.parent_id === parent)
    .sort((a, b) => a.position - b.position)
    .map((row) => {
      const children = navTree(rows, row.id);
      const tone = row.tone === "guide" || row.tone === "enter" || row.tone === "subscribe" ? row.tone : undefined;
      return {
        id: row.id,
        label: row.label,
        dest: destOf(row),
        ...(tone ? { tone } : {}),
        ...(on(row.live) ? { live: true } : {}),
        ...(children.length ? { groups: [{ items: children }] } : {}),
      };
    });
}

const statusLabel: Record<string, string> = {
  desbloqueado: "Desbloqueado",
  planejado: "Planejado",
  suspenso: "Suspenso",
};

export const readStoredSite = createServerFn({ method: "GET" }).handler(async (): Promise<StoredSite> => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const navRows = await sql<NavRow>`
    select item.id, item.parent_id, item.position, item.label, item.tone, item.live,
      dest.kind as dest_kind,
      case dest.kind when 'section' then dest.place_id when 'tool' then dest.tool_slug else null end as dest_slug,
      nullif(dest.hash, '') as dest_hash,
      nullif(dest.page_to, '') as dest_to,
      nullif(dest.model_id, '') as dest_model
    from nav_item as item
    left join screen_dest as dest on dest.id = item.dest_id
  `;
  const roots = navTree(navRows, null);
  const accountIds = new Set(["entrar", "assinatura"]);
  const agents = await sql<{ id: string; name: string; status: string; mission: string; scope: string }>`
    select id, name, status, mission, scope from agent order by name
  `;
  const rules = await sql<{ agent_id: string; position: number; body: string }>`select agent_id, position, body from agent_rule order by position`;
  const basis = await sql<{ agent_id: string; position: number; citation: string }>`select agent_id, position, citation from agent_basis order by position`;
  const checks = await sql<{ agent_id: string; position: number; body: string }>`select agent_id, position, body from agent_check order by position`;
  const shelves = await sql<{ id: string; title: string; lead: string; kind: string; position: number }>`select id, title, lead, kind, position from library_shelf order by position`;
  const shelfItems = await sql<{ shelf_id: string; position: number; title: string; text: string; href: string }>`select shelf_id, position, title, text, href from library_item order by position`;
  const labels = await sql<StoredLabel>`select locale, group_id as "groupId", key, text from chrome_label`;
  const catalog = await sql<StoredCard>`
    select list_id as "listId", title, text, icon, slug, file, section, hash
    from catalog_item
    order by list_id, position
  `;
  const specialties = await sql<{ name: string }>`select name from specialty order by position`;
  const phases = await sql<StoredPhase>`select id, name, status, detail from phase_note where status is not null order by position`;
  const held = await sql<StoredPhase>`select id, name, status, detail from phase_note where status is null order by position`;
  const tokens = await sql<StoredToken>`select name, hex, role, rejected from color_token order by rejected, name`;
  const families = await sql<StoredFamily>`select id, name, text from template_family order by position`;
  const templates = await sql<StoredTemplate>`select id, type, name, category, description from editorial_template order by position`;
  const normas = await sql<{ id: string; name: string; domain: string; right_name: string; priority: string }>`select id, name, domain, right_name, priority from fundamento order by id`;
  const pack = await sql<{ sha256: string }>`select sha256 from fundamento_pack where id = 'pacote'`;
  const specimenRows = await sql<{ id: string; title: string; lead: string; source: string }>`select id, title, lead, source from specimen`;
  const moduleRows = await sql<{ specimen_id: string; position: number; type: string; title: string }>`select specimen_id, position, type, title from specimen_module order by position`;
  const lineRows = await sql<{ specimen_id: string; module_position: number; position: number; path: string; text: string }>`select specimen_id, module_position, position, path, text from specimen_line order by position`;
  const pageRows = await sql<{ slug: string; title: string; lead: string }>`select slug, title, lead from section_page order by title`;
  const linkTitles = await sql<{ slug: string; title: string }>`select slug, title from section_link order by position`;
  const instPages = await sql<{ path: string; title: string; lead: string }>`select path, title, lead from inst_page where kind = 'page' order by path`;
  const pages: StoredPage[] = pageRows.map((row) => ({
    slug: row.slug,
    title: row.title,
    lead: row.lead,
    items: linkTitles.filter((link) => link.slug === row.slug).map((link) => link.title),
  }));
  const seen = new Set(pages.map((page) => page.slug));
  for (const row of instPages) {
    const slug = row.path.split("/").pop() ?? "";
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    pages.push({ slug, title: row.title, lead: row.lead, items: [] });
  }
  const specimens: StoredSpecimen[] = specimenRows.map((spec) => ({
    id: spec.id,
    title: spec.title,
    lead: spec.lead,
    source: spec.source,
    modules: moduleRows
      .filter((item) => item.specimen_id === spec.id)
      .map((item) => ({
        type: item.type,
        title: item.title,
        lines: lineRows
          .filter((line) => line.specimen_id === spec.id && line.module_position === item.position)
          .map((line) => ({ path: line.path, text: line.text })),
      })),
  }));
  const take = (rows: { agent_id: string; body?: string; citation?: string }[], id: string) =>
    rows.filter((row) => row.agent_id === id).map((row) => row.body ?? row.citation ?? "");
  return {
    nav: roots.filter((node) => !accountIds.has(node.id)),
    accountNav: roots.filter((node) => accountIds.has(node.id)),
    agents: agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      status: statusLabel[agent.status] ?? agent.status,
      owns: agent.scope,
      mission: agent.mission,
      basis: take(basis, agent.id),
      rules: take(rules, agent.id),
      checklist: take(checks, agent.id),
    })),
    shelves: shelves.map((shelf) => {
      const items = shelfItems.filter((item) => item.shelf_id === shelf.id);
      if (shelf.kind === "images") {
        return { id: shelf.id, title: shelf.title, lead: shelf.lead, kind: "images", items: items.map((item) => ({ src: item.href, alt: item.text, caption: item.title })) };
      }
      if (shelf.kind === "thumbs" || shelf.kind === "pdfs") {
        return { id: shelf.id, title: shelf.title, lead: shelf.lead, kind: shelf.kind, items: items.map((item) => ({ title: item.title, text: item.text, href: item.href })) };
      }
      if (shelf.kind === "device" || shelf.kind === "slides" || shelf.kind === "info" || shelf.kind === "plate") {
        return { id: shelf.id, title: shelf.title, lead: shelf.lead, kind: shelf.kind };
      }
      return { id: shelf.id, title: shelf.title, lead: shelf.lead, kind: "plate" as const };
    }) as LibraryShelf[],
    labels,
    catalog: catalog.map((row) => ({ ...row, icon: row.icon === "calc" || row.icon === "book" || row.icon === "cap" ? row.icon : null })),
    specialties: specialties.map((row) => row.name),
    phases,
    held,
    tokens: tokens.filter((row) => !on(row.rejected)),
    rejected: tokens.filter((row) => on(row.rejected)),
    families,
    templates,
    normas: normas.map((row) => ({ id: row.id, name: row.name, domain: row.domain, right: row.right_name, priority: row.priority })),
    packSha: pack[0]?.sha256 ?? "",
    specimens,
    pages,
  };
});

export const readInstPage = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => {
    if (!/^[a-z0-9-]{1,80}$/.test(slug)) throw new Error("Seção inválida.");
    return slug;
  })
  .handler(async ({ data: slug }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const pages = await sql<{ path: string; title: string; kicker: string; lead: string }>`
      select path, title, kicker, lead from inst_page where kind = 'page'
    `;
    const page = pages.find((item) => item.path === slug || item.path.endsWith(`/${slug}`));
    if (!page) return null;
    const sections = await sql<{ title: string; body: string; position: number }>`
      select title, body, position from inst_section where path = ${page.path} order by position
    `;
    const blocks = sections
      .map((section, index) => ({ id: `${slug}-${index + 1}`, title: section.title, text: section.body.replace(/\s+/g, " ").trim(), items: [] }))
      // O marcador DERBY (5 caracteres) é a pendência NOMEADA: some do texto, mas
      // não pode sumir da tela. Filtro por tamanho escondia a pendência do visitante.
      .filter((block) => block.text.length > 0);
    return { title: page.title, kicker: page.kicker, lead: page.lead.replace(/\s+/g, " ").trim(), blocks };
  });

export const readSectionPage = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => {
    if (!/^[a-z0-9-]{1,80}$/.test(slug)) throw new Error("Seção inválida.");
    return slug;
  })
  .handler(async ({ data: slug }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const pages = await sql<{ slug: string; kicker: string; title: string; lead: string; kind: "pages" | "contact" | "enter" | "subscribe" }>`
      select page.slug, page.kicker, page.title, page.lead, page.kind
      from section_page as page
      join content_object as object on object.origin_path = ${`/secao/${slug}`}
      where page.slug = ${slug}
    `;
    const page = pages[0];
    if (!page) return null;
    const blocks = await sql<{ position: number; block_id: string; title: string; body: string }>`
      select position, block_id, title, body from section_block where slug = ${slug} order by position
    `;
    const links = await sql<{ block_position: number; position: number; item_id: string; title: string; text: string; dest_kind: string | null; dest_slug: string | null; dest_hash: string | null; dest_to: string | null; dest_model: string | null; live: unknown }>`
      select link.block_position, link.position, link.item_id, link.title, link.text, link.live,
        dest.kind as dest_kind,
        case dest.kind when 'section' then dest.place_id when 'tool' then dest.tool_slug else null end as dest_slug,
        nullif(dest.hash, '') as dest_hash,
        nullif(dest.page_to, '') as dest_to,
        nullif(dest.model_id, '') as dest_model
      from section_link as link
      left join screen_dest as dest on dest.id = link.dest_id
      where link.slug = ${slug}
      order by link.position
    `;
    return {
      slug: page.slug,
      kicker: page.kicker,
      title: page.title,
      lead: page.lead,
      kind: page.kind,
      blocks: blocks.map((block) => ({
        id: block.block_id,
        title: block.title,
        text: block.body,
        items: links
          .filter((link) => link.block_position === block.position)
          .map((link) => ({
            id: link.item_id,
            title: link.title,
            text: link.text,
            ...(on(link.live) ? { live: true as const } : {}),
            dest: destOf({
              id: link.item_id,
              parent_id: null,
              position: link.position,
              label: link.title,
              dest_kind: link.dest_kind,
              dest_slug: link.dest_slug,
              dest_hash: link.dest_hash,
              dest_to: link.dest_to,
              dest_model: link.dest_model,
              tone: null,
              live: link.live,
            }),
          })),
      })),
    };
  });

export const readLiveSection = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => {
    if (!/^[a-z0-9-]{1,80}$/.test(slug)) throw new Error("Seção inválida.");
    return slug;
  })
  .handler(async ({ data: slug }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const pages = await sql<{ slug: string; kicker: string; title: string; lead: string; kind: "pages" | "contact" | "enter" | "subscribe" }>`
      select page.slug, page.kicker, page.title, page.lead, page.kind
      from section_page as page
      join content_object as object on object.origin_path = ${`/secao/${slug}`}
      where page.slug = ${slug}
    `;
    const page = pages[0];
    let section: {
      slug: string;
      kicker: string;
      title: string;
      lead: string;
      kind: "pages" | "contact" | "enter" | "subscribe";
      blocks: { id: string; title: string; text: string; items: { id: string; title: string; text: string; live?: true; dest?: Dest }[] }[];
    } | null = null;
    if (page) {
      const blocks = await sql<{ position: number; block_id: string; title: string; body: string }>`
        select position, block_id, title, body from section_block where slug = ${slug} order by position
      `;
      const links = await sql<{ block_position: number; position: number; item_id: string; title: string; text: string; dest_kind: string | null; dest_slug: string | null; dest_hash: string | null; dest_to: string | null; dest_model: string | null; live: unknown }>`
        select block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live
        from section_link where slug = ${slug} order by position
      `;
      section = {
        slug: page.slug,
        kicker: page.kicker,
        title: page.title,
        lead: page.lead,
        kind: page.kind,
        blocks: blocks.map((block) => ({
          id: block.block_id,
          title: block.title,
          text: block.body,
          items: links
            .filter((link) => link.block_position === block.position)
            .map((link) => ({
              id: link.item_id,
              title: link.title,
              text: link.text,
              ...(on(link.live) ? { live: true as const } : {}),
              dest: destOf({
                id: link.item_id,
                parent_id: null,
                position: link.position,
                label: link.title,
                dest_kind: link.dest_kind,
                dest_slug: link.dest_slug,
                dest_hash: link.dest_hash,
                dest_to: link.dest_to,
                dest_model: link.dest_model,
                tone: null,
                live: link.live,
              }),
            })),
        })),
      };
    } else {
      const instRows = await sql<{ path: string; title: string; kicker: string; lead: string }>`
        select path, title, kicker, lead from inst_page where kind = 'page'
      `;
      const inst = instRows.find((item) => item.path === slug || item.path.endsWith(`/${slug}`));
      if (inst) {
        const parts = await sql<{ title: string; body: string }>`
          select title, body from inst_section where path = ${inst.path} order by position
        `;
        section = {
          slug,
          kicker: inst.kicker,
          title: inst.title,
          lead: inst.lead.replace(/\s+/g, " ").trim(),
          kind: "pages",
          blocks: parts
            .map((item, index) => ({
              id: `${slug}-${index + 1}`,
              title: item.title,
              text: item.body.replace(/\s+/g, " ").trim(),
              items: [],
            }))
            .filter((block) => block.text.length > 0),
        };
      }
    }
    if (!section) return null;
    const instPages = await sql<{ path: string; title: string; lead: string; kind: string }>`
      select path, title, lead, kind from inst_page
    `;
    const children = await sql<{ path: string; child_path: string }>`
      select path, child_path from inst_child order by position
    `;
    const inst = instPages.find((item) => item.kind === "page" && (item.path === slug || item.path.endsWith(`/${slug}`)));
    const parentPath = inst ? children.find((child) => child.child_path === inst.path && child.path !== "")?.path : undefined;
    const parent = parentPath ? instPages.find((item) => item.path === parentPath) : undefined;
    const siblings = parent
      ? children
          .filter((child) => child.path === parent.path)
          .flatMap((child) => {
            const item = instPages.find((page) => page.path === child.child_path && page.kind === "page");
            const childSlug = item?.path.split("/").pop();
            if (!item || !childSlug || childSlug === slug) return [];
            return [{ slug: childSlug, label: item.title, text: item.lead.replace(/\s+/g, " ").trim() }];
          })
      : [];
    const framed = Boolean(inst) || section.kicker === "Institucional" || slug === "contato" || slug === "compromisso";
    let related = siblings;
    if (related.length === 0 && framed) {
      const same = await sql<{ slug: string; title: string; lead: string; kicker: string }>`
        select slug, title, lead, kicker from section_page order by title
      `;
      related = same
        .filter((row) => row.kicker === section.kicker && row.slug !== slug)
        .map((row) => ({ slug: row.slug, label: row.title, text: row.lead.replace(/\s+/g, " ").trim() }));
    }
    const trail = parent ? [{ label: parent.title }] : framed ? [{ label: section.kicker }] : [];
    return { section, framed, trail, related };
  });

export const readEditorial = createServerFn({ method: "GET" })
  .inputValidator((id: string) => {
    if (!/^[A-Za-z0-9-]{1,40}$/.test(id)) throw new Error("Peça inválida.");
    return id;
  })
  .handler(async ({ data: id }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string; type: string; name: string; category: string; description: string }>`
      select id, type, name, category, description from editorial_template where lower(id) = lower(${id})
    `;
    const template = rows[0];
    if (!template) return null;
    const lines = await sql<{ path: string; text: string }>`
      select path, text from editorial_line where template_id = ${template.id} order by position
    `;
    return {
      ...template,
      lines: lines.map((line) => ({ path: line.path, text: line.text })),
    };
  });
