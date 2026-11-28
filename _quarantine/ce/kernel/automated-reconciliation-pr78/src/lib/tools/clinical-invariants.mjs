// @ts-check
/**
 * Pure fail-closed checks for numeric clinical results.
 * These operate on runtime values, not on assumptions about UI input types.
 */

/** @param {import('./types.ts').Criterion[]} criteria
 *  @param {Record<string, number>} answers */
export function inspectScaleAnswers(criteria, answers) {
  /** @type {string[]} */
  const missing = [];
  /** @type {string[]} */
  const invalid = [];
  for (const criterion of criteria) {
    const value = answers[criterion.id];
    if (value === undefined) {
      missing.push(criterion.id);
    } else if (!Number.isFinite(value) ||
      !criterion.choices.some((choice) => choice.value === value)) {
      invalid.push(criterion.id);
    }
  }
  return { missing, invalid };
}

/** @param {import('./types.ts').Band[] | undefined} bands
 *  @param {number} value */
export function findClinicalBand(bands, value) {
  if (!Number.isFinite(value) || !bands?.length) return undefined;
  // When two closed intervals touch, select the higher-threshold band.
  for (let i = bands.length - 1; i >= 0; i--) {
    const band = bands[i];
    if (value >= band.min && value <= band.max) return band;
  }
  return undefined;
}

/** @param {import('./types.ts').ClinicalTool} tool
 *  @param {Record<string, number>} values */
export function invalidFormulaOutputIds(tool, values) {
  const ids = new Set((tool.outputs ?? []).map((output) => output.id));
  if (tool.bandFrom) ids.add(tool.bandFrom);
  return [...ids].filter((id) => !Number.isFinite(values[id]));
}
