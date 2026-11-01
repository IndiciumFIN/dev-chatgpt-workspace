import assert from "node:assert/strict";
import test from "node:test";
import { getTool } from "./catalog.ts";
import { evaluateFormula, evaluateScale } from "./engine.ts";

test("escala incompleta não produz escore", () => {
  const tool = getTool("braden");
  assert.ok(tool);
  const result = evaluateScale(tool, { sensorial: 1 });
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok((result.missing?.length ?? 0) > 0);
});

test("número fora do limite não calcula", () => {
  const tool = getTool("imc");
  assert.ok(tool);
  const result = evaluateFormula(tool, { peso: "900", altura: "170" });
  assert.equal(result.ok, false);
});

test("gotejamento de 500 mL em 2 horas no equipo 20", () => {
  const tool = getTool("gotejamento");
  assert.ok(tool);
  const result = evaluateFormula(tool, { volume: "500", horas: "2", minutos: "0", fator: "20" });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.outputs?.find((item) => item.id === "mlh")?.value, 250);
    assert.equal(result.outputs?.find((item) => item.id === "gotas")?.value, 83);
  }
});

test("IMC de 70 kg e 170 cm fica na faixa adequada", () => {
  const tool = getTool("imc");
  assert.ok(tool);
  const result = evaluateFormula(tool, { peso: "70", altura: "170" });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.ok(Math.abs((result.outputs?.[0].value ?? 0) - 24.22) < 0.02);
    assert.equal(result.band?.label, "Adequado");
  }
});
