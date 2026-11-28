import assert from "node:assert/strict";
import test from "node:test";
import { tools, candidateTools, toolRecord, getTool } from "./catalog.ts";
import { evaluateScale, evaluateFormula } from "./engine.ts";
import { isClinicalRightsHeld } from "./rights-boundary.ts";
import { selectExames } from "./exames-laboratoriais.ts";

const all = [...tools, ...candidateTools];
test("catalog inventory: seven tools, rights veto stays separate", () => {
  assert.deepEqual(all.map(t => t.slug).sort(), ["aldrete","apgar","braden","exames-laboratoriais","gotejamento","imc","morse"]);
  for (const slug of ["braden", "morse"]) {
    assert.ok(toolRecord(slug));
    assert.ok(isClinicalRightsHeld(slug));
    assert.equal(getTool(slug), undefined);
  }
});
for (const tool of all.filter(t => t.kind === "escala")) {
  test(tool.slug + ": all allowed answer combinations and invalid inputs", () => {
    const criteria = tool.criteria!;
    assert.ok(criteria.length);
    let count = 0;
    function visit(index: number, answers: Record<string, number>, total: number) {
      if (index === criteria.length) {
        const result = evaluateScale(tool, answers);
        assert.equal(result.ok, true);
        if (result.ok) {
          assert.equal(result.total, total);
          assert.equal(result.max, criteria.reduce((sum, c) => sum + Math.max(...c.choices.map(v => v.value)), 0));
          assert.ok(result.band);
        }
        count++;
        return;
      }
      const c = criteria[index];
      for (const choice of c.choices) visit(index + 1, { ...answers, [c.id]: choice.value }, total + choice.value);
    }
    visit(0, {}, 0);
    assert.equal(count, criteria.reduce((n, c) => n * c.choices.length, 1));
    const valid = Object.fromEntries(criteria.map(c => [c.id, c.choices[0].value]));
    for (const c of criteria) {
      const missing = { ...valid }; delete missing[c.id];
      assert.equal(evaluateScale(tool, missing).ok, false);
      for (const bad of [999999, -999999, NaN, Infinity, 0.125]) {
        assert.equal(evaluateScale(tool, { ...valid, [c.id]: bad }).ok, false);
      }
    }
  });
}
test("drip formula: macro, micro, rounding, zero time, malformed input", () => {
  const tool = toolRecord("gotejamento")!;
  for (const fator of [20,60]) {
    for (const [volume, horas, minutos] of [[500,2,0],[100,0,30],[123,1,17],[1,0,1]]) {
      const result = evaluateFormula(tool, {volume:String(volume),horas:String(horas),minutos:String(minutos),fator:String(fator)});
      assert.ok(result.ok);
      assert.equal(result.outputs?.find(x => x.id === "mlh")?.value, volume / ((horas*60+minutos)/60));
      assert.equal(result.outputs?.find(x => x.id === "gotas")?.value, Math.round(volume*fator/(horas*60+minutos)));
    }
  }
  const valid = {volume:"500",horas:"2",minutos:"0",fator:"20"};
  for (const bad of [{horas:"0"},{fator:""},{fator:"15"},{volume:"Infinity"},{volume:"0"},{minutos:"60"},{volume:"x"}]) assert.equal(evaluateFormula(tool,{...valid,...bad}).ok,false);
});
test("adult BMI: actual cutoffs, decimal gaps, unsupported extremes", () => {
  const tool = toolRecord("imc")!;
  for (const cut of [18.5,25,30,35,40]) {
    for (const delta of [-0.005,0,0.005]) {
      // Height 100 cm makes raw BMI equal to weight, no approximation.
      const value = cut + delta;
      const result = evaluateFormula(tool,{peso:String(value),altura:"100"});
      assert.ok(result.ok);
      const expected = Math.max(...tool.bands!.filter(b => b.min <= value).map(b => b.min));
      assert.equal(result.band?.min,expected);
    }
  }
  assert.equal(evaluateFormula(tool,{peso:"400",altura:"50"}).ok,false);
});
test("all lab options: no blank selector and no nonfinite result", () => {
  const tool = toolRecord("exames-laboratoriais")!;
  assert.equal(selectExames.length,149);
  for (const option of selectExames) for (const sexo of ["0","1","2"]) {
    const result = evaluateFormula(tool,{exame:String(option.value),sexo,valor:"1"});
    assert.ok(result.ok);
    assert.ok(result.outputs?.[0].text);
  }
  for (const invalid of [{exame:""},{sexo:""},{valor:"NaN"},{valor:"Infinity"}]) assert.equal(evaluateFormula(tool,{exame:"0",sexo:"0",valor:"1",...invalid}).ok,false);
});
test("missing computed output is rejected rather than silently zeroed", () => {
  const tool = toolRecord("gotejamento")!;
  assert.equal(evaluateFormula({...tool,outputs:[{id:"unknown",label:"x",unit:"x",digits:0}]},{volume:"500",horas:"2",minutos:"0",fator:"20"}).ok,false);
});
