import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  exames,
  categoriasExames,
  examePorId,
  examePorIndice,
  selectExames,
  interpretar,
} from "@/lib/tools/exames-laboratoriais";

describe("base de exames laboratoriais", () => {
  it("traz os 149 exames e as 21 categorias do site publicado", () => {
    assert.equal(exames.length, 149);
    assert.equal(categoriasExames.length, 21);
  });

  it("todo exame tem id unico e nome", () => {
    assert.equal(new Set(exames.map((e) => e.id)).size, exames.length);
    for (const e of exames) assert.ok(e.nome.length > 0);
  });

  it("todo exame do select resolve de volta para o mesmo exame", () => {
    for (const op of selectExames) {
      const peloIndice = examePorIndice(op.value);
      const peloId = examePorId(peloIndice!.id);
      assert.ok(peloId);
      assert.equal(peloId, peloIndice);
    }
  });

  it("o select cobre a base inteira, sem exame fora dele", () => {
    assert.equal(selectExames.length, exames.length);
  });

  it("indice fora da base devolve indefinido em vez de estourar", () => {
    assert.equal(examePorIndice(-1), undefined);
    assert.equal(examePorIndice(99999), undefined);
  });
});

describe("leitura da faixa de referencia", () => {
  // Hemácias so tem faixa POR SEXO (4.5-5.9 H / 4.0-5.2 M). VCM tem faixa
  // geral (80-100 fL). Os dois caminhos existem de verdade na base.
  const hemacias = examePorId("hemacias")!;
  const vcm = examePorId("vcm")!;

  it("usa a faixa geral quando a base declara faixa sem sexo", () => {
    assert.equal(vcm.ref.porSexo, false);
    assert.equal(vcm.ref.min, 80);
    assert.equal(vcm.ref.max, 100);
  });

  it("usa a faixa do sexo quando a base declara", () => {
    assert.equal(vcm.ref.porSexo, false);
    const porSexo = exames.find((e) => e.ref.porSexo)!;
    const h = interpretar(porSexo, 1, "homem");
    const m = interpretar(porSexo, 1, "mulher");
    assert.notEqual(h.min, m.min);
  });

  it("classifica abaixo, na faixa e acima", () => {
    assert.equal(interpretar(vcm, 60, "nao-informado").situacao, "abaixo");
    assert.equal(interpretar(vcm, 90, "nao-informado").situacao, "na-faixa");
    assert.equal(interpretar(vcm, 120, "nao-informado").situacao, "acima");
  });

  it("com faixa so por sexo, o sexo escolhido muda o resultado", () => {
    // homem 4.5-5.9 | mulher 4.0-5.2. 5.5 está dentro da do homem e ACIMA da da mulher.
    assert.equal(interpretar(hemacias, 5.5, "homem").situacao, "na-faixa");
    assert.equal(interpretar(hemacias, 5.5, "mulher").situacao, "acima");
    // 4.2 está dentro da da mulher e ABAIXO da do homem.
    assert.equal(interpretar(hemacias, 4.2, "mulher").situacao, "na-faixa");
    assert.equal(interpretar(hemacias, 4.2, "homem").situacao, "abaixo");
  });

  it("as bordas sao dentro da faixa, nao fora", () => {
    assert.equal(interpretar(vcm, 80, "nao-informado").situacao, "na-faixa");
    assert.equal(interpretar(vcm, 100, "nao-informado").situacao, "na-faixa");
  });

  it("'indisponivel' quando nao ha faixa nenhuma — nunca estima", () => {
    // A base real cobre todos os 149. O caminho 'indisponivel' e testado com um
    // exame sintetico, para o contrato ficar provado mesmo sem caso real.
    assert.equal(exames.every((e) => Object.values(e.ref).some((v) => typeof v === "number")), true);
    const semFaixa = { ...vcm, id: "sintetico", ref: { ...vcm.ref, min: null, max: null, minH: null, maxH: null, minM: null, maxM: null } };
    assert.equal(interpretar(semFaixa, 1, "homem").situacao, "indisponivel");
    assert.equal(interpretar(semFaixa, 1, "mulher").situacao, "indisponivel");
  });

  it("sexo so por sexo, com sexo nao informado, devolve indisponivel em vez de faixa errada", () => {
    // Hemácias nao tem faixa geral. Sem o sexo, a ferramenta NAO pode
    // inventar uma faixa — precisa dizer que nao sabe.
    assert.equal(interpretar(hemacias, 5.0, "nao-informado").situacao, "indisponivel");
  });

  it("a base marca porSexo mas nao traz faixa completa para os dois sexos", () => {
    // ACHADO NA BASE, NAO NO CODIGO: o Colesterol HDL vem com genero:true e
    // so um dos lados preenchido. A ferramenta nao pode inventar o outro —
    // precisa cair em 'indisponivel' quando falta o lado do sexo pedido.
    const incompletos = exames.filter((e) =>
      e.ref.porSexo && (["minH","maxH","minM","maxM"] as const).some((k) => e.ref[k] === null));
    assert.ok(incompletos.length > 0, "a base tem exame porSexo sem faixa completa");
    for (const e of incompletos) {
      const semH = e.ref.minH === null || e.ref.maxH === null;
      const semM = e.ref.minM === null || e.ref.maxM === null;
      // HDL: min 40/50, SEM maximo nos dois sexos. A ferramenta nao pode dizer
      // "na faixa" — diz "acima do minimo, sem maximo declarado".
      const acima = (e.ref.minH ?? e.ref.minM ?? 0) + 1;  // acima do minimo, onde o bug aparecia
      const h = interpretar(e, acima, "homem");
      const m = interpretar(e, acima, "mulher");
      if (e.ref.maxH === null) assert.ok(["parcial", "parcial-sem-maximo"].includes(h.cobertura), `${e.nome}: cobertura ${h.cobertura}`);
      if (e.ref.maxM === null) assert.ok(["parcial", "parcial-sem-maximo"].includes(m.cobertura), `${e.nome}: cobertura ${m.cobertura}`);
      assert.notEqual(h.situacao, "na-faixa");
      assert.notEqual(m.situacao, "na-faixa");
    }
  });
});