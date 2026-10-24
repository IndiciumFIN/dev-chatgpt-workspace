export type VersionRecord = {
  id: string;
  entityType: string;
  entityId: string;
  version: string;
  createdAt: string;
  createdBy: string;
  previousVersion?: string;
  hash: string;
};

export function createVersion(input: Omit<VersionRecord, "hash">): VersionRecord {
  return {
    ...input,
    hash: `version:${input.entityType}:${input.entityId}:${input.version}`,
  };
}
