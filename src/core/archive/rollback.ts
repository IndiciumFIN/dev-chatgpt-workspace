export type RollbackRecord = {
  id: string;
  workOrderId: string;
  fromVersion: string;
  toVersion: string;
  triggeredBy: string;
  reason: string;
  approvedBy: string;
  createdAt: string;
};

export function createRollback(input: RollbackRecord): RollbackRecord {
  return input;
}
