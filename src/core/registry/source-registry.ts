export type SourceKind = "api" | "file" | "database" | "feed" | "manual";

export type SourceContract = {
  id: string;
  kind: SourceKind;
  owner: string;
  sourceType: string;
  templateId: string;
  normativeIds: string[];
  validators: string[];
  status: "draft" | "admitted" | "rejected";
  hash: string;
  sourceRef: string;
  createdAt: string;
  updatedAt: string;
};
