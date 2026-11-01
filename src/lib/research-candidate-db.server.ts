export type CandidateDb={query<T=Record<string,unknown>>(text:string,params?:unknown[]):Promise<T[]>};
const g=globalThis as typeof globalThis&{__researchDb?:Promise<CandidateDb>};
function migration(){const f=import.meta.glob("/migrations/0004_research_participation_candidate.sql",{query:"?raw",import:"default",eager:true}) as Record<string,string>;const sql=Object.values(f)[0];if(!sql)throw new Error("RESEARCH_CANDIDATE_MIGRATION_MISSING");return sql}
export function getResearchCandidateDb():Promise<CandidateDb>{
 g.__researchDb??=(async()=>{const {PGlite}=await import("@electric-sql/pglite");const pg=new PGlite();await pg.waitReady;await pg.exec(migration());return{async query<T=Record<string,unknown>>(text:string,params:unknown[]=[]){const r=await pg.query<T>(text,params);return r.rows}}})().catch(e=>{g.__researchDb=undefined;throw e});
 return g.__researchDb;
}
