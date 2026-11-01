type Tx = <T>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T[]>;

type ItemRow = { id: string; title: string; body: string; status: string; approved_by: string | null };

async function freezeVersion(sql: Tx, item: ItemRow, userId: string | null) {
  const existing = await sql<{ version: number }>`select version from document_version where item_id = ${item.id}`;
  if (existing.length > 0) return;
  await sql`
    insert into document_version (item_id, version, title, body, status, approved_by, approved_at, reason)
    values (${item.id}, ${1}, ${item.title}, ${item.body}, ${"aprovado"}, ${item.approved_by ?? userId}, now(), ${"aprovação"})
  `;
}

export async function approveItemTx(sql: Tx, id: string, userId: string) {
  const rows = await sql<ItemRow>`select id, title, body, status, approved_by from governance_item where id = ${id}`;
  const item = rows[0];
  if (!item) throw new Error("Item fora da governança.");
  if (item.status === "aprovado") {
    await freezeVersion(sql, item, item.approved_by);
    return { status: "aprovado" as const };
  }
  await sql`
    update governance_item
    set status = ${"aprovado"}, approved_by = ${userId}, approved_at = now()
    where id = ${id} and status = ${"rascunho"}
  `;
  await sql`
    insert into audit_event (id, actor_id, action, entity, entity_id)
    values (${crypto.randomUUID()}, ${userId}, ${"aprovar"}, ${"governance_item"}, ${id})
  `;
  await freezeVersion(sql, { ...item, status: "aprovado", approved_by: userId }, userId);
  return { status: "aprovado" as const };
}

export async function approveSpecificationTx(sql: Tx, id: string, userId: string) {
  const rows = await sql<{ status: string }>`select status from data_specification where id = ${id}`;
  if (!rows[0]) throw new Error("Característica fora do dicionário.");
  if (rows[0].status === "aprovado") return { status: "aprovado" as const };
  await sql`
    update data_specification
    set status = ${"aprovado"}, approved_by = ${userId}, approved_at = now()
    where id = ${id} and status = ${"rascunho"}
  `;
  await sql`
    insert into audit_event (id, actor_id, action, entity, entity_id)
    values (${crypto.randomUUID()}, ${userId}, ${"aprovar"}, ${"data_specification"}, ${id})
  `;
  return { status: "aprovado" as const };
}

const governanceKinds = new Set(["objetivo", "escopo", "risco", "politica"]);

export async function saveGovernanceDraftTx(
  sql: Tx,
  input: { id: string; kind: string; title: string; body: string; actorId: string },
) {
  if (!governanceKinds.has(input.kind)) throw new Error("Tipo inválido.");
  if (!/^[a-z0-9-]{1,80}$/.test(input.id)) throw new Error("Identificador inválido.");
  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < 3 || title.length > 160) throw new Error("O título precisa ter de 3 a 160 caracteres.");
  if (body.length < 10 || body.length > 4000) throw new Error("O texto precisa ter de 10 a 4000 caracteres.");
  const rows = await sql<{ status: string }>`select status from governance_item where id = ${input.id}`;
  if (rows[0]?.status === "aprovado") throw new Error("Item aprovado não se edita. Vale a versão congelada.");
  if (!rows[0]) {
    await sql`
      insert into governance_item (id, kind, title, body, status)
      values (${input.id}, ${input.kind}, ${title}, ${body}, ${"rascunho"})
    `;
  } else {
    await sql`
      update governance_item
      set kind = ${input.kind}, title = ${title}, body = ${body}
      where id = ${input.id} and status = ${"rascunho"}
    `;
  }
  await sql`
    insert into audit_event (id, actor_id, action, entity, entity_id)
    values (${crypto.randomUUID()}, ${input.actorId}, ${"gravar"}, ${"governance_item"}, ${input.id})
  `;
  return { id: input.id, status: "rascunho" as const };
}
