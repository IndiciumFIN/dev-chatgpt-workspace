/** Fórmulas SINTÉTICAS: provam o mecanismo do gate de testes de referência. Não são conteúdo clínico.
 *  Fórmulas reais devem ser objetos versionados, com origem, unidades e validador técnico/clínico. */
export type Formula = { label: string; unit: string; required: string[]; run: (i: Record<string, number>) => number };
export const FORMULAS: Record<string, Formula> = {
  'SINT-MG-PARA-G': { label: 'Conversão sintética mg → g', unit: 'g', required: ['mg'], run: i => i.mg / 1000 },
  'SINT-REGRA-DE-TRES': { label: 'Regra de três sintética a·b/c', unit: '', required: ['a', 'b', 'c'], run: i => (i.a * i.b) / i.c },
};
export type TestOutcome = { result: 'passou' | 'falhou' | 'erro'; actual?: number; message: string };

export function runReferenceTest(t: { formulaId: string; inputsJson: string; expected: number; tolerance: number }): TestOutcome {
  const f = FORMULAS[t.formulaId];
  if (!f) return { result: 'erro', message: 'Fórmula não registrada.' };
  let inputs: Record<string, number>;
  try { inputs = JSON.parse(t.inputsJson) as Record<string, number>; } catch { return { result: 'erro', message: 'Entradas não são JSON válido.' }; }
  const missing = f.required.filter(k => typeof inputs[k] !== 'number' || !Number.isFinite(inputs[k]));
  if (missing.length) return { result: 'erro', message: `Entradas ausentes ou não numéricas: ${missing.join(', ')}.` };
  if (t.formulaId === 'SINT-REGRA-DE-TRES' && inputs.c === 0) return { result: 'erro', message: 'Divisão por zero.' };
  const actual = f.run(inputs);
  const diff = Math.abs(actual - t.expected);
  if (diff <= t.tolerance) return { result: 'passou', actual, message: `Obtido ${actual}; diferença ${diff}.` };
  const ratio = t.expected !== 0 ? Math.abs(actual / t.expected) : Infinity;
  const unitHint = ratio >= 10 || ratio <= 0.1 ? ' Diferença de ordem de grandeza: possível erro de unidade.' : '';
  return { result: 'falhou', actual, message: `Obtido ${actual}; esperado ${t.expected} ± ${t.tolerance}.${unitHint}` };
}
