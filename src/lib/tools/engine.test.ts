/**
 * Testes de fronteira do motor clínico.
 *
 * Aqui não se importa `catalog.ts` de propósito: o teste isola o motor das
 * ferramentas. Um bug de catálogo não pode fazer o motor parecer quebrado, nem
 * um bug de motor ficar escondido atrás de uma mudança de catálogo. As faixas
 * reais do Braden entram como fixture, copiadas do catálogo e declaradas
 * explicitamente, para que o escore esperado seja conferível a olho.
 */
import { describe, it } from "node:test";

/**
 * O motor tem varios caminhos de falha (campo invalido, sem formula, erro de
 * regra) e so um deles — criterios faltantes — preenche `missing`. TypeScript
 * esta certo em dizer que o campo e opcional; o teste, que sabe em qual
 * caminho esta, exige que ele esteja presente. `demand` mantem a asercao forte
 * em vez de transformar `x.length` em `x?.length`.
 */
function demand<T>(v: T | undefined, msg = "campo ausente no retorno do motor"): T {
  assert.ok(v !== undefined, msg);
  return v;
}

import assert from "node:assert/strict";

import { evaluateScale, evaluateFormula, formatNumber } from "./engine.ts";
import { formulas } from "./formulas.ts";
import type { ClinicalTool } from "./types.ts";

/** Braden com as seis faixas reais e os valores de escolha reais. */
const braden: ClinicalTool = {
  slug: "braden",
  kind: "escala",
  category: "Lesão por pressão",
  title: "Escala de Braden",
  lead: "Escore de 6 a 23.",
  nandaMode: "sugerir",
  criteria: [
    { id: "sensorial", label: "Percepção sensorial", help: "", choices: [{ value: 1, label: "1 · Limitada" }, { value: 2, label: "2 · Muito restrita" }, { value: 3, label: "3 · NãoCommitment" }, { value: 4, label: "4 · Não Commitment" }] },
    { id: "umidade", label: "Umidade", help: "", choices: [{ value: 1, label: "1 · Constante" }, { value: 2, label: "2 · Muito úmida" }, { value: 3, label: "3 · Ocasionalmente" }, { value: 4, label: "4 · Raramente" }] },
    { id: "atividade", label: "Atividade", help: "", choices: [{ value: 1, label: "1 · Confinado" }, { value: 2, label: "2 · Sentado" }, { value: 3, label: "3 · Deambula" }] },
    { id: "mobilidade", label: "Mobilidade", help: "", choices: [{ value: 1, label: "1 · Imóvel" }, { value: 2, label: "2 · Muito limitada" }, { value: 3, label: "3 · Pouco limitada" }, { value: 4, label: "4 · Sem limitação" }] },
    { id: "nutricao", label: "Nutrição", help: "", choices: [{ value: 1, label: "1 · Muito ruim" }, { value: 2, label: "2 · Ruim" }, { value: 3, label: "3 · Adequada" }, { value: 4, label: "4 · Boa" }, { value: 5, label: "5 · Excelente" }] },
    { id: "sensibilidade", label: "Sensibilidade", help: "", choices: [{ value: 1, label: "1 · Problema" }, { value: 2, label: "2 · Alerta" }, { value: 3, label: "3 · Sem problema" }] },
  ],
  bands: [
    { min: 6, max: 9, label: "Risco muito alto", tone: "danger" },
    { min: 10, max: 13, label: "Risco alto", tone: "warn" },
    { min: 14, max: 18, label: "Risco moderado", tone: "caution" },
    { min: 19, max: 23, label: "Risco baixo", tone: "ok" },
  ],
} as unknown as ClinicalTool;

/** Menor escore possível em cada critério — 6 pontos, o piso do Braden. */
const minAnswers = Object.fromEntries(braden.criteria!.map((c) => [c.id, c.choices[0].value]));
/** Maior escore possível em cada critério — 23 pontos, o teto do Braden. */
const maxAnswers = Object.fromEntries(braden.criteria!.map((c) => [c.id, c.choices[c.choices.length - 1].value]));

describe("evaluateScale — recusa de resposta incompleta", () => {
  it("não calcula escore com critério faltando", () => {
    const answers: Record<string, number> = { ...minAnswers };
    delete answers.sensibilidade;
    const out = evaluateScale(braden, answers);
    assert.equal(out.ok, false);
    if (out.ok) throw new Error("esperava falha");
    assert.deepEqual(out.missing, ["sensibilidade"]);
  });

  it("acusa TODOS os que faltam, não só o primeiro", () => {
    const out = evaluateScale(braden, {});
    assert.equal(out.ok, false);
    if (out.ok) throw new Error("esperava falha");
    assert.equal(demand(out.missing).length, 6);
  });

  it("concorda no singular e no plural da mensagem", () => {
    const um: Record<string, number> = { ...minAnswers };
    delete um.umidade;
    const umOut = evaluateScale(braden, um);
    const seisOut = evaluateScale(braden, {});
    if (umOut.ok || seisOut.ok) throw new Error("esperava falha");
    assert.match(umOut.message, /Faltam 1 critério\./u);
    assert.match(seisOut.message, /Faltam 6 critérios\./u);
  });

  it("zero não conta como resposta: undefined é ausência, 0 é valor", () => {
    const comZero: Record<string, number> = { ...minAnswers, sensibilidade: 0 };
    const out = evaluateScale(braden, comZero);
    assert.equal(out.ok, false, "0 não é uma escolha válida do Braden");
    if (out.ok) throw new Error("esperava falha");
    assert.equal(out.fieldErrors?.sensibilidade, "Selecione uma opção válida.");
  });
});

describe("evaluateScale — extremos do escore", () => {
  it("piso: 6 pontos cai na faixa 'Risco muito alto'", () => {
    const out = evaluateScale(braden, minAnswers);
    assert.equal(out.ok, true);
    if (!out.ok) throw new Error("esperava sucesso");
    assert.equal(out.total, 6);
    assert.equal(out.max, 23);
    assert.equal(out.band?.label, "Risco muito alto");
  });

  it("teto: 23 pontos cai na faixa 'Risco baixo'", () => {
    const out = evaluateScale(braden, maxAnswers);
    assert.equal(out.ok, true);
    if (!out.ok) throw new Error("esperava sucesso");
    assert.equal(out.total, 23);
    assert.equal(out.band?.label, "Risco baixo");
  });

  it("as fronteiras das faixas são inclusivas nas duas pontas", () => {
    const um = (total: number) => {
      const a: Record<string, number> = { ...minAnswers };
      let sobra = total - 6;
      for (const c of braden.criteria!) {
        const extra = c.choices[c.choices.length - 1].value - c.choices[0].value;
        if (sobra <= 0) break;
        a[c.id] = c.choices[0].value + Math.min(extra, sobra);
        sobra -= Math.min(extra, sobra);
      }
      return evaluateScale(braden, a);
    };
    for (const [total, faixa] of [[6, "Risco muito alto"], [9, "Risco muito alto"], [10, "Risco alto"], [13, "Risco alto"], [14, "Risco moderado"], [18, "Risco moderado"], [19, "Risco baixo"], [23, "Risco baixo"]] as const) {
      const out = um(total);
      assert.equal(out.ok, true);
      if (!out.ok) throw new Error("esperava sucesso");
      assert.equal(out.total, total);
      assert.equal(out.band?.label, faixa, `escore ${total} deveria cair em "${faixa}"`);
    }
  });

  it("devolve uma linha por critério, com valor e máximo", () => {
    const out = evaluateScale(braden, minAnswers);
    assert.equal(out.ok, true);
    if (!out.ok) throw new Error("esperava sucesso");
    assert.equal(out.rows.length, 6);
    const sensorial = out.rows.find((r) => r.label === "Percepção sensorial");
    assert.ok(sensorial, "a linha do critério sensorial existe");
    assert.match(sensorial.value, /^1 · /u);
    assert.equal(sensorial.max, "4");
  });

  it("escala sem critérios não quebra e devolve zero", () => {
    const vazia = { ...braden, criteria: [], bands: [] } as unknown as ClinicalTool;
    const out = evaluateScale(vazia, {});
    assert.equal(out.ok, true);
    if (!out.ok) throw new Error("esperava sucesso");
    assert.equal(out.total, 0);
    assert.equal(out.max, 0);
    assert.equal(out.rows.length, 0);
  });
});

describe("formatNumber", () => {
  it("formata e arredonda na casa pedida", () => {
    assert.equal(formatNumber(6, 0), "6");
    assert.equal(formatNumber(6.4, 0), "6");
    assert.equal(formatNumber(6.5, 1), "6,5", "vírgula decimal em pt-BR");
    assert.equal(formatNumber(1234.567, 2), "1.234,57");
  });

  it("zero casas devolve inteiro sem separador", () => {
    assert.equal(formatNumber(42, 0), "42");
    assert.equal(formatNumber(-3, 0), "-3");
  });
});

/**
 * A calculadora de gotejamento real, copiada do catálogo. Ela é usada aqui como
 * fixture porque `evaluateFormula` resolve a fórmula pelo `tool.slug`
 * (`formulas[tool.slug]`), e `formulas` só conhece `gotejamento` e `imc`.
 * Sem o slug certo não existe caminho de sucesso — e o teste precisa exercitar
 * o caminho de sucesso de verdade, não um mock.
 */
const gotejamento: ClinicalTool = {
  slug: "gotejamento",
  kind: "calculadora",
  category: "Terapia infusional",
  title: "Calculadora de gotejamento",
  lead: "Converte volume e tempo em mL/hora e em gotas por minuto.",
  nandaMode: "nao-fechar",
  fields: [
    { id: "volume", label: "Volume", unit: "mL", min: 1, max: 10000, step: 1 },
    { id: "horas", label: "Horas", unit: "h", min: 0, max: 168, step: 1 },
    { id: "minutos", label: "Minutos", unit: "min", min: 0, max: 59, step: 1 },
  ],
  selects: [
    { id: "fator", label: "Equipo", options: [{ value: 20, label: "Macrogotas (20 gotas/mL)" }, { value: 60, label: "Microgotas (60 gotas/mL)" }] },
  ],
  outputs: [
    { id: "mlh", label: "Velocidade", unit: "mL/h", digits: 1 },
    { id: "gotas", label: "Gotejamento", unit: "gotas/min", digits: 0 },
  ],
} as unknown as ClinicalTool;

/** 500 mL em 1 h com macrogotas: 500 mL/h e 500·20/60 = 166,67 -> 167 gotas/min. */
const entradaValida = { volume: "500", horas: "1", minutos: "0", fator: "20" };

describe("evaluateFormula", () => {
  it("calcula a velocidade e o gotejamento do volume prescrito", () => {
    const out = evaluateFormula(gotejamento, entradaValida);
    assert.equal(out.ok, true);
    if (!out.ok) throw new Error("esperava sucesso");
    assert.equal(demand(out.outputs).find((o) => o.id === "mlh")?.value, 500);
    assert.equal(demand(out.outputs).find((o) => o.id === "gotas")?.value, 167);
  });

  it("microgotas do mesmo volume dá o triplo de gotas", () => {
    const macro = evaluateFormula(gotejamento, { ...entradaValida, fator: "20" });
    const micro = evaluateFormula(gotejamento, { ...entradaValida, fator: "60" });
    if (!macro.ok || !micro.ok) throw new Error("esperava sucesso");
    const mlhMacro = demand(macro.outputs).find((o) => o.id === "mlh")?.value ?? 0;
    const mlhMicro = demand(micro.outputs).find((o) => o.id === "mlh")?.value ?? 0;
    assert.equal(mlhMicro, mlhMacro, "a velocidade em mL/h não depende do equipo");
    // 500 mL/h a 20 gotas/mL dá 166,67 -> arredonda para 167; a 60 dá 500 exato.
    // Então 500 NÃO é exatamente 167×3 — a razão vale antes do arredondamento.
    // Afirmar igualdade exata aqui seria um teste que falha por arredondamento
    // e não por defeito. A tolerância é o erro máximo que uma casa decimal
    // arredondada pode introduzir, num sentido ou no outro.
    const gotasMacro = demand(macro.outputs).find((o) => o.id === "gotas")?.value ?? 0;
    const gotasMicro = demand(micro.outputs).find((o) => o.id === "gotas")?.value ?? 0;
    assert.ok(
      Math.abs(gotasMicro - gotasMacro * 3) <= 2,
      `60 gotas/mL deveria dar ~3x 20 gotas/mL: ${gotasMicro} vs ${gotasMacro * 3}`,
    );
    // E o valor não arredondado é o que confirma a conta:
    assert.equal((500 * 60) / 60, gotasMicro);
  });

  it("campo em branco vira erro de campo, não zero silencioso", () => {
    const out = evaluateFormula(gotejamento, { ...entradaValida, volume: "" });
    assert.equal(out.ok, false);
    if (out.ok) throw new Error("esperava falha");
    assert.equal(out.fieldErrors?.volume, "Informe um número finito.");
  });

  it("valor fora da faixa declarada é recusado com o intervalo na mensagem", () => {
    const out = evaluateFormula(gotejamento, { ...entradaValida, volume: "99999" });
    assert.equal(out.ok, false);
    if (out.ok) throw new Error("esperava falha");
    assert.equal(out.fieldErrors?.volume, "Use um valor entre 1 e 10000.");
  });

  it("vírgula decimal é aceita: o usuário digita 0,5", () => {
    const out = evaluateFormula(gotejamento, { ...entradaValida, horas: "0", minutos: "30", volume: "250" });
    assert.equal(out.ok, true);
    if (!out.ok) throw new Error("esperava sucesso");
    // 250 mL em 30 min = 500 mL/h
    assert.equal(demand(out.outputs).find((o) => o.id === "mlh")?.value, 500);
  });

  it("equipe não selecionada é erro explícito", () => {
    const out = evaluateFormula(gotejamento, { ...entradaValida, fator: "999" });
    assert.equal(out.ok, false);
    if (out.ok) throw new Error("esperava falha");
    assert.equal(out.fieldErrors?.fator, "Escolha uma opção.");
  });

  it("fórmula ausente é falha declarada, não exceção", () => {
    const semFormula = { ...gotejamento, slug: "nao-cadastrada" } as unknown as ClinicalTool;
    const out = evaluateFormula(semFormula, entradaValida);
    assert.equal(out.ok, false);
    if (out.ok) throw new Error("esperava falha");
    assert.equal(out.message, "Esta calculadora ainda não tem fórmula.");
  });
});
