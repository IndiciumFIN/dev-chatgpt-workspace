/** Enumerações do catálogo de dados mestres do CKO (masterDataCatalog em catalog.ts). */
export const master = {
  status: ['draft', 'normalized', 'admitted', 'preview', 'approved', 'deployed', 'rejected', 'revoked'],
  risk: ['low', 'medium', 'high', 'critical'],
  dataClassification: ['public', 'internal', 'confidential', 'restricted'],
  environment: ['planning', 'pilot', 'dev', 'test', 'prod'],
  sourceType: ['api', 'file', 'database', 'feed', 'manual'],
  apiMethod: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  workOrderType: ['planning', 'pilot', 'development', 'test', 'production', 'rollback'],
  framework: ['ISO9001', 'ISO27001', 'ISO19650', 'COSO', 'COBIT', 'COSO-IA'],
} as const;

/** Inventário de templates canônicos (templateCatalog em catalog.ts). Somente leitura. */
export const templateCatalog = [
  { id: 'template.source.api.v1', kind: 'source', owner: 'platform-governance' },
  { id: 'template.source.file.v1', kind: 'source', owner: 'platform-governance' },
  { id: 'template.api.rest.v1', kind: 'api', owner: 'platform-governance' },
  { id: 'template.directory.v1', kind: 'directory', owner: 'platform-governance' },
  { id: 'template.wo.planning.v1', kind: 'work-order', owner: 'governance' },
  { id: 'template.wo.pilot.v1', kind: 'work-order', owner: 'governance' },
  { id: 'template.wo.development.v1', kind: 'work-order', owner: 'governance' },
  { id: 'template.wo.test.v1', kind: 'work-order', owner: 'governance' },
  { id: 'template.wo.production.v1', kind: 'work-order', owner: 'governance' },
  { id: 'template.policy.bundle.v1', kind: 'policy', owner: 'governance' },
  { id: 'template.manifest.v1', kind: 'manifest', owner: 'governance' },
  { id: 'template.evidence.v1', kind: 'evidence', owner: 'governance' },
  { id: 'template.template.contract.v1', kind: 'template', owner: 'governance' },
  { id: 'template.tool.http.v1', kind: 'tool', owner: 'governance' },
] as const;
