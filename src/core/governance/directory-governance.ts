export type DirectoryGovernance = {
  id: string;
  path: string;
  owner: string;
  templateId: string;
  normativeIds: string[];
  validators: string[];
  status: "draft" | "admitted" | "rejected";
  hash: string;
  createdAt: string;
  updatedAt: string;
};
