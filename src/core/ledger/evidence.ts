export type EvidenceRecord = {
  id: string;
  workOrderId: string;
  artifactId: string;
  artifactType: string;
  title: string;
  payloadHash: string;
  signature: string;
  createdAt: string;
};

export function recordEvidence(record: Omit<EvidenceRecord, "signature">): EvidenceRecord {
  return {
    ...record,
    signature: `evidence:${record.workOrderId}:${record.artifactId}:${record.payloadHash}`,
  };
}
