export type ArchiveRecord = {
  id: string;
  entityType: string;
  entityId: string;
  archivedBy: string;
  archivedAt: string;
  reason: string;
  snapshotHash: string;
  version: string;
};

export function archiveEntity(input: Omit<ArchiveRecord, "snapshotHash"> & { snapshotHash?: string }): ArchiveRecord {
  return {
    ...input,
    snapshotHash: input.snapshotHash ?? `archive:${input.entityType}:${input.entityId}:${input.version}`,
  };
}
