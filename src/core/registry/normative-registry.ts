export type NormativeAtom = {
  id: string;
  framework: string;
  code: string;
  title: string;
  version: string;
  scope: string;
  validator: string;
  owner: string;
  status: "draft" | "active" | "deprecated";
  sourceRef: string;
  hash: string;
};
