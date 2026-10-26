export type CareerCandidateDb={query<T=Record<string,unknown>>(text:string,params?:unknown[]):Promise<T[]>};
const g=globalThis as typeof globalThis&{__careerDb?:Promise<CareerCandidateDb>};
function migrations(){
 const files=import.meta.glob("/migrations/000{4,5}_career_*.sql",{query:"?raw",import:"default",eager:true}) as Record<string,string>;
 const ordered=Object.entries(files).sort(([a],[b])=>a.localeCompare(b)).map(([,sql])=>sql);
 if(ordered.length!==2)throw new Error(`CAREER_CANDIDATE_MIGRATIONS_MISSING:${ordered.length}`);
 return ordered;
}
export function getCareerCandidateDb():Promise<CareerCandidateDb>{
 g.__careerDb??=(async()=>{const {PGlite}=await import("@electric-sql/pglite");const pg=new PGlite();await pg.waitReady;for(const sql of migrations())await pg.exec(sql);return{async query<T=Record<string,unknown>>(text:string,params:unknown[]=[]){const r=await pg.query<T>(text,params);return r.rows}}})().catch(e=>{g.__careerDb=undefined;throw e});
 return g.__careerDb;
}
