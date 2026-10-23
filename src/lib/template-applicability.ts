/**
 * Aplicabilidade dos kinds de template.
 *
 * A politica (CKO-POL-UT-001, "Explicit non-applicability") exige:
 * "A domain not applicable uses NOT_APPLICABLE_JUSTIFIED and evidence; not a
 * silent null." Um kind declarado no contrato e que nenhuma pagina renderiza
 * e um nulo silencioso — e proibido.
 *
 * `aviso` e o caso: em `component-contract.ts` ele e a "Faixa de erro do
 * calculo", um BLOCO dentro da ferramenta, nao um tipo de pagina. O
 * `template-contract.ts` herdou o nome e o declarou como kind de pagina, sem
 * pagina que o cumpra. Aqui a nao aplicabilidade e declarada, com evidencia.
 */
export type Aplicabilidade = {
  aplicavel: boolean;
  justificativa?: string;
  evidencia?: string;
};

export const templateApplicability: Record<string, Aplicabilidade> = {
  aviso: {
    aplicavel: false,
    justificativa:
      "`aviso` e a faixa de erro do calculo, um BLOCO dentro da ferramenta — nao um tipo de pagina. Declarado como kind em template-contract.ts sem pagina que o renderize.",
    evidencia: "src/lib/component-contract.ts:18 — `{ id: \"aviso\", papel: \"Faixa de erro do calculo\" }`",
  },
};

/** Kinds declarados no contrato que NAO tem pagina, com a justificativa. */
export function kindsNaoAplicaveis(): string[] {
  return Object.entries(templateApplicability)
    .filter(([, v]) => !v.aplicavel)
    .map(([k]) => k);
}
