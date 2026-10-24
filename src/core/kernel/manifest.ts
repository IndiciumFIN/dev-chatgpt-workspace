export type Manifest = {
  id: string;
  version: string;
  workflowId: string;
  workOrderId: string;
  status: "draft" | "approved" | "rejected" | "archived";
  hash: string;
  createdAt: string;
  approvedBy: string;
  artifactIds: string[];
};
