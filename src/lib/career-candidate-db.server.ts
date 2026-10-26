export type CareerCandidateDb={query<T=Record<string,unknown>>(text:string,params?:unknown[]):Promise<T[]>};
const g=globalThis as typeof globalThis&{__careerDb?:Promise<CareerCandidateDb>};
function migration(){const f=import.meta.glob("/migrations/0004_career_youth_candidate.sql",{query:"?raw",import:"default",eager:true}) as Record<string,string>;const sql=Object.values(f)[0];if(!sql)throw new Error("CAREER_CANDIDATE_MIGRATION_MISSING");return sql}
export function getCareerCandidateDb():Promise<CareerCandidateDb>{
 g.__careerDb??=(async()=>{const {PGlite}=await import("@electric-sql/pglite");const pg=new PGlite();await pg.waitReady;await pg.exec(migration());return{async query<T=Record<string,unknown>>(text:string,params:unknown[]=[]){const r=await pg.query<T>(text,params);return r.rows}}})().catch(e=>{g.__careerDb=undefined;throw e});
 return g.__careerDb;
}
