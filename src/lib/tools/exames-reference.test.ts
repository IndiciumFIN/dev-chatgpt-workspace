import {test} from "node:test";
import assert from "node:assert/strict";
import {examesData} from "./exames-laboratoriais.data.ts";
import {interpretar,parseResultado} from "./exames-reference.ts";
test("decimal parser rejects partial, nonfinite, ambiguous and blank inputs",()=>{
 for(const x of [""," ","1abc","1,2,3","1.2.3","1 000","1e4","0x10","Infinity","NaN","12mg","1,000.0"])assert.equal(parseResultado(x),undefined,x);
 for(const [raw,n] of [["4,5",4.5],["4.5",4.5],[" 0 ",0],[".5",0.5],["-1",-1]] as const)assert.equal(parseResultado(raw),n);
});
test("all 149 entries: compare only declared limits, no default sex or normality for incomplete bounds",()=>{
 assert.equal(examesData.length,149);
 for(const e of examesData){
  if(e.ref.porSexo)assert.equal(interpretar(e,1,"nao-informado").situacao,"indisponivel",e.id);
  for(const sexo of ["homem","mulher"] as const){
   const min=e.ref.porSexo?(sexo==="homem"?e.ref.minH:e.ref.minM):e.ref.min;
   const max=e.ref.porSexo?(sexo==="homem"?e.ref.maxH:e.ref.maxM):e.ref.max;
   for(const x of [NaN,Infinity,-Infinity])assert.equal(interpretar(e,x,sexo).situacao,"indisponivel");
   if(min!==null&&max!==null&&min>max){assert.equal(interpretar(e,min,sexo).situacao,"indisponivel");continue;}
   if(min===null&&max===null){assert.equal(interpretar(e,0,sexo).situacao,"indisponivel");continue;}
   if(min!==null)assert.equal(interpretar(e,min-1,sexo).situacao,"abaixo",e.id);
   if(max!==null)assert.equal(interpretar(e,max+1,sexo).situacao,"acima",e.id);
   const expected=min===null?"abaixo-do-maximo":max===null?"acima-do-minimo":"na-faixa";
   if(min!==null)assert.equal(interpretar(e,min,sexo).situacao,expected,e.id);
   if(max!==null)assert.equal(interpretar(e,max,sexo).situacao,expected,e.id);
  }
 }
});
test("synthetic maximum-only and invalid bounds fail safely",()=>{
 const e=examesData.find(x=>x.id==="vcm")!;
 assert.equal(interpretar({...e,ref:{...e.ref,min:null,max:100}},99,"nao-informado").situacao,"abaixo-do-maximo");
 assert.equal(interpretar({...e,ref:{...e.ref,min:101,max:100}},100,"nao-informado").situacao,"indisponivel");
 assert.equal(interpretar({...e,ref:{...e.ref,min:NaN}},99,"nao-informado").situacao,"indisponivel");
});
