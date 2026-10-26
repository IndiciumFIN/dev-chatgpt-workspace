/** Dedicated PostgreSQL READ ONLY catalog connection.
 * NO Supabase service_role, browser key, migrations or canonical writes.
 * A separately provisioned DB role must have SELECT only on the three
 * allowed source tables. The expected database role is verified at runtime.
 */
import { Pool, type PoolClient } from 'pg';
import type { ImportProfile, ImportReview } from './bulk-import';
import { createCatalogReconciliationReader, type ServerVerifiedActor } from './import-read-service';
import { reconcileImportReview, type ReconciliationReport } from './bulk-import-reconciliation';

export type ReadCatalogSettings={
  databaseUrl:string; expectedRole:string;
};
export type QueryClient=Pick<PoolClient,'query'|'release'>;
export type AcquireQueryClient=()=>Promise<QueryClient>;
const pools=new Map<string,Pool>();
function allowedDatabaseUrl(value:string):boolean{
 try{
  const url=new URL(value);
  return ['postgres:','postgresql:'].includes(url.protocol)&&Boolean(url.username)&&Boolean(url.hostname);
 }catch{return false;}
}
export function importDbSettings():ReadCatalogSettings|null{
  const databaseUrl=process.env.CKO_IMPORT_READ_DATABASE_URL?.trim()??'';
  const expectedRole=process.env.CKO_IMPORT_READ_DB_ROLE?.trim()??'';
  if(!allowedDatabaseUrl(databaseUrl)||!/^[a-z_][a-z0-9_]{2,62}$/.test(expectedRole))return null;
  return {databaseUrl,expectedRole};
}
/** Pool is used ONLY inside a server route, never a component. */
export async function acquireImportDbClient(settings:ReadCatalogSettings):Promise<QueryClient>{
  if(!allowedDatabaseUrl(settings.databaseUrl))throw Error('PostgreSQL de leitura inválido.');
  let pool=pools.get(settings.databaseUrl);
  if(!pool){
    pool=new Pool({
      connectionString:settings.databaseUrl,max:2,
      idleTimeoutMillis:5000,connectionTimeoutMillis:3000,allowExitOnIdle:true,
      ssl:{rejectUnauthorized:true},
    });
    pools.set(settings.databaseUrl,pool);
  }
  return pool.connect();
}
export async function withImportReadOnlySnapshot(
  actor:ServerVerifiedActor,
  profile:ImportProfile,
  review:ImportReview,
  settings:ReadCatalogSettings,
  acquire:AcquireQueryClient=()=>acquireImportDbClient(settings),
):Promise<ReconciliationReport>{
  if(!actor||actor.authentication!=='SERVER_SESSION_VERIFIED'||
    !actor.permissions?.includes('governance:imports:reconcile')||
    !allowedDatabaseUrl(settings.databaseUrl)||!settings.expectedRole?.trim())
    throw Error('Leitura não autorizada.');
  const client=await acquire();
  let transaction=false;
  try{
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ, READ ONLY');
    transaction=true;
    await client.query("SET LOCAL statement_timeout = '3000ms'");
    await client.query("SET LOCAL idle_in_transaction_session_timeout = '10000ms'");
    const proof=await client.query('select current_user::text as reader_role, txid_current_snapshot()::text as snapshot_ref');
    const proofRow=proof.rows?.[0] as Record<string,unknown>|undefined;
    if(proofRow?.reader_role!==settings.expectedRole||typeof proofRow.snapshot_ref!=='string'||
       !proofRow.snapshot_ref.trim())throw Error('Identidade ou snapshot da conexão de leitura não verificado.');
    const snapshotRef=proofRow.snapshot_ref;
    const reader=createCatalogReconciliationReader(actor,profile,async()=>({
      snapshotRef,
      query:async(sql,params)=>{
        // Runtime invariant: import-read-service only hands this callback
        // allowlisted SELECTs and text[] parameter arrays.
        if(!/^select [a-z_,\s]+ from cko_(?:evidence\.sources|orch\.policy_registry|validation\.validators) where [a-z_]+ = any\(\$1::text\[\]\)$/i.test(sql))
          throw Error('SQL fora da allowlist.');
        const result=await client.query(sql,[params[0]]);
        return result.rows as Array<Record<string,unknown>>;
      },
    }));
    const report=await reconcileImportReview(review,profile,reader);
    // If a chunk fails or catalog claims are incomplete, report is HOLD.
    await client.query('COMMIT');
    transaction=false;
    return report;
  }catch(error){
    if(transaction){try{await client.query('ROLLBACK');}catch{ /* fail-closed */ }}
    throw error;
  }finally{
    client.release();
  }
}
