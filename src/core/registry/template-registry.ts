export type TemplateDefinition = {
  id: string;
  name: string;
  version: string;
  kind: "workflow" | "source" | "api" | "tool" | "manifest" | "evidence" | "release";
  fields: Array<{
    name: string;
    type: "string" | "number" | "boolean" | "date" | "enum" | "object" | "array";
    required: boolean;
    description: string;
  }>;
  schemaRef: string;
  validatorRefs: string[];
  normativeIds: string[];
  status: "draft" | "active" | "archived";
  hash: string;
};
