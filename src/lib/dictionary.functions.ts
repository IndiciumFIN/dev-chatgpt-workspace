import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export type DictionaryColumn = {
  entity: string;
  name: string;
  data_type: string;
  required: boolean;
  definition: string;
  syntax: string;
};

export type DictionaryTerm = {
  domain: string;
  code: string;
  label: string;
  definition: string;
};

export type DictionaryRelation = {
  from_entity: string;
  name: string;
  to_entity: string;
  cardinality: string;
  definition: string;
};

export type BusinessRuleRow = {
  id: string;
  from_entity: string;
  to_entity: string | null;
  statement: string;
  status: string;
};

export const readDictionary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ columns: DictionaryColumn[]; terms: DictionaryTerm[]; relations: DictionaryRelation[]; rules: BusinessRuleRow[] }> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const role = await sql<{ role: string }>`select role from member where user_id = ${context.userId}`;
    if (role[0]?.role !== "admin") throw new Error("Só o administrador lê o dicionário.");
    const columns = await sql<{ entity: string; name: string; data_type: string; required: unknown; definition: string; syntax: string }>`
      select entity, name, data_type, required, definition, syntax
      from schema_column
      order by entity, name
    `;
    const terms = await sql<DictionaryTerm>`
      select domain, code, label, definition from schema_term order by domain, code
    `;
    const relations = await sql<DictionaryRelation>`
      select from_entity, name, to_entity, cardinality, definition
      from schema_relation
      order by from_entity, name
    `;
    const rules = await sql<BusinessRuleRow>`
      select id, from_entity, to_entity, statement, status
      from business_rule
      order by id
    `;
    const on = (value: unknown) => value === true || value === "t" || value === "true" || value === 1;
    return {
      columns: columns.map((row) => ({
        entity: row.entity,
        name: row.name,
        data_type: row.data_type,
        required: on(row.required),
        definition: row.definition,
        syntax: row.syntax,
      })),
      terms,
      relations,
      rules,
    };
  });
