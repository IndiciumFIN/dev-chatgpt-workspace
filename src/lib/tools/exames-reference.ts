import type { Exame } from "./exames-laboratoriais.data";
export type SexoReferencia = "homem" | "mulher" | "nao-binario" | "nao-informado";
export type SituacaoReferencia = "indisponivel" | "abaixo" | "acima" | "na-faixa" | "acima-do-minimo" | "abaixo-do-maximo";
export type CoberturaReferencia = "nenhuma" | "parcial" | "completa" | "parcial-sem-maximo" | "parcial-sem-minimo";
// Only decimal input; reject partial parses, thousands separators, exponent and Infinity.
export function parseResultado(raw: string): number | undefined {
  const value = raw.trim();
  if (!/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(value)) return undefined;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}
export function interpretar(exame: Exame, valor: number, genero: SexoReferencia): {situacao: SituacaoReferencia; cobertura: CoberturaReferencia; min:number|null; max:number|null; unidade:string} {
  const r=exame.ref;
  const unknownSex=r.porSexo && genero!=="homem" && genero!=="mulher";
  const min=unknownSex?null:r.porSexo?(genero==="homem"?r.minH:r.minM):r.min;
  const max=unknownSex?null:r.porSexo?(genero==="homem"?r.maxH:r.maxM):r.max;
  const base={min,max,unidade:r.unidade};
  if (!Number.isFinite(valor) || unknownSex || (min===null&&max===null) ||
      (min!==null&&!Number.isFinite(min)) || (max!==null&&!Number.isFinite(max)) ||
      (min!==null&&max!==null&&min>max)) return {...base,situacao:"indisponivel",cobertura:"nenhuma"};
  const cobertura=min===null||max===null?"parcial":"completa";
  if(min!==null&&valor<min)return {...base,situacao:"abaixo",cobertura};
  if(max!==null&&valor>max)return {...base,situacao:"acima",cobertura};
  if(max===null)return {...base,situacao:"acima-do-minimo",cobertura:"parcial-sem-maximo"};
  if(min===null)return {...base,situacao:"abaixo-do-maximo",cobertura:"parcial-sem-minimo"};
  return {...base,situacao:"na-faixa",cobertura:"completa"};
}
export const mensagensReferencia: Record<SituacaoReferencia,string> = {
 indisponivel:"Comparação indisponível: confira a referência do laboratório e os dados informados.",
 abaixo:"Abaixo do limite inferior informado.",
 acima:"Acima do limite superior informado.",
 "na-faixa":"Dentro dos limites históricos informados.",
 "acima-do-minimo":"No mínimo informado ou acima; sem limite superior.",
 "abaixo-do-maximo":"No máximo informado ou abaixo; sem limite inferior.",
};
