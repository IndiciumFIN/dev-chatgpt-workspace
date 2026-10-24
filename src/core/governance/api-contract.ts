export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiContract = {
  id: string;
  kind: "api";
  path: string;
  method: ApiMethod;
  owner: string;
  templateId: string;
  normativeIds: string[];
  validators: string[];
  status: "draft" | "admitted" | "rejected";
  hash: string;
  createdAt: string;
  updatedAt: string;
};
