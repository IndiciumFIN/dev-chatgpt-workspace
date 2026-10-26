/** Service boundary: this module is NOT wired to an HTTP route, Supabase,
 * browser, executor or Kernel. It specifies a read-only repository contract.
 *
 * Authentication and role assignment must be VERIFIED by the host backend.
 * Do not construct VerifiedActor from browser-submitted JSON.
 */
import { catalogLookupSql, type CatalogLookupResponse, type ReadOnlyCatalogLookup } from './bulk-import-reconciliation';
import type { ImportProfile } from './bulk-import';

export type ServerVerifiedActor = {
  actorId:string;
  authentication:'SERVER_SESSION_VERIFIED';
  permissions:readonly string[];
};
export type ReadOnlyQueryConnection={
  /** Must be a readonly transaction/snapshot; never a client API key. */
  snapshotRef:string;
  query(sql:string,params:readonly [readonly string[]]):Promise<Array<Record<string,unknown>>>;
};
export type ReadOnlyQueryFactory=(scope:{actorId:string;destination:string})=>Promise<ReadOnlyQueryConnection>;
const idsValid=(ids:readonly string[])=>Array.isArray(ids)&&ids.length>0&&ids.length<=250&&
  ids.every(id=>typeof id==='string' && /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/.test(id))&&
  new Set(ids).size===ids.length;

/** Instantiate only inside an authenticated server-controlled call.
 * Returned snapshots are still PROPOSALS; Kernel admission is NOT granted.
 */
export function createCatalogReconciliationReader(
  actor:ServerVerifiedActor,
  profile:ImportProfile,
  getConnection:ReadOnlyQueryFactory,
):ReadOnlyCatalogLookup{
  if(!actor || actor.authentication!=='SERVER_SESSION_VERIFIED' ||
     !actor.actorId?.trim() || !actor.permissions?.includes('governance:imports:reconcile'))
    throw new Error('Leitura não autorizada: sessão e permissão verificadas exigidas.');
  const sql=catalogLookupSql(profile);
  return async ({destination,primaryKey,identifiers}):Promise<CatalogLookupResponse>=>{
    if(destination!==profile.destination||primaryKey!==profile.primaryKey||!idsValid(identifiers))
      throw new Error('Solicitação de leitura fora do contrato.');
    const connection=await getConnection({actorId:actor.actorId,destination});
    if(!connection?.snapshotRef?.trim()||typeof connection.query!=='function')
      throw new Error('Snapshot de leitura não disponível.');
    const rows=await connection.query(sql,[identifiers]);
    if(!Array.isArray(rows)||rows.length>identifiers.length)
      throw new Error('Resposta do catálogo excedeu os identificadores solicitados.');
    return {
      destination,primaryKey,requestedIds:[...identifiers],
      snapshotRef:connection.snapshotRef,
      capturedAt:new Date().toISOString(),
      rows:rows.map(row=>{
        const identifier=row[profile.primaryKey];
        if(typeof identifier!=='string'||!identifiers.includes(identifier))
          throw new Error('Resposta contém identidade fora do escopo.');
        return {identifier,data:row,versionRef:typeof row.version==='string'?row.version:undefined};
      }),
    };
  };
}
