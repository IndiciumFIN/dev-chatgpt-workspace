import type { Sql } from "@/lib/db";

const packageId = "acesso";

export async function decide(
  sql: Sql,
  input: { action: string; role: string; actorId: string },
) {
  const rules = await sql.query<{ id: string; effect: string }>(
    `select id, effect
     from policy_rule
     where package_id = $1 and action = $2 and subject_role = $3
     order by case effect when 'deny' then 0 else 1 end
     limit 1`,
    [packageId, input.action, input.role],
  );
  const effect = rules[0]?.effect === "allow" ? "allow" : "deny";
  const ruleId = rules[0]?.id ?? null;
  const decisionId = crypto.randomUUID();
  await sql.query(
    `insert into policy_decision (id, package_id, rule_id, action, subject_role, effect, actor_id)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [decisionId, packageId, ruleId, input.action, input.role, effect, input.actorId],
  );
  if (effect === "deny") throw new Error("A regra de acesso nega esta ação.");
  return { effect, ruleId, decisionId };
}
