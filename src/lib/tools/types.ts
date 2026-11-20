import type { EstadoContrato } from "./contracts";

export type ToolKind = "escala" | "calculadora";

export type Choice = { value: number; label: string };

export type Criterion = {
  id: string;
  label: string;
  help: string;
  choices: Choice[];
};

export type NumericField = {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
};

export type SelectField = {
  id: string;
  label: string;
  options: Choice[];
};

export type MetaField = {
  id: string;
  label: string;
  options: { value: string; label: string }[];
};

export type Band = {
  min: number;
  max: number;
  label: string;
  tone: "ok" | "info" | "warn" | "danger";
  note: string;
  nanda: string[];
};

export type OutputSpec = { id: string; label: string; unit: string; digits: number };


export type ComputeResult = { outputs: Record<string, number> } | { error: string };

export type ClinicalTool = {
  slug: string;
  kind: ToolKind;
  category: string;
  title: string;
  lead: string;
  criteria?: Criterion[];
  fields?: NumericField[];
  selects?: SelectField[];
  metaFields?: MetaField[];
  outputs?: OutputSpec[];
  bandFrom?: string;
  bands?: Band[];
  nandaMode: "sugerir" | "nao-fechar";
  howTo: string[];
  faqs: { q: string; a: string }[];
  references: string[];
  /**
   * Estado de PUBLICACAO da ferramenta.
   *
   *   "publicada"  — homologada e no indice. As cinco ferramentas herdadas.
   *   "candidata"  — governada, com fonte e bindings, mas ainda sem a
   *                  homologacao humana que a politica exige. Fica
   *                  ALCANCAVEL para revisao e FORA do indice.
   *
   * A Aldrete e a primeira "candidata": seu proprio relatorio de validacao
   * carrega 7 HOLDs (FIND-CTR-009) e a politica diz que exemplares servem de
   * testes, nao de autoridade.
   */
  publicacao?: "publicada" | "candidata";
  /**
   * Os HOLDs que impedem a homologacao. Declarados aqui porque a ferramenta
   * candidata nao pode ser promovida sem eles — o gate exige que a lista
   * exista e nao esteja vazia.
   */
  holds?: string[];
  /**
   * Estado do contrato, no vocabulario do CKO (`CANDIDATE` … `RELEASED`, com
   * `HOLD_HUMAN` bloqueando). A camada Clinical Calculators/Scales herda HOLD
   * enquanto o gate de MD do CKO-MD estiver fechado — ver `POLITICA_FERRAMENTAS`.
   */
  status?: EstadoContrato;
  /**
   * `canonical_id` das fontes normativas que sustentam o uso (ver
   * `src/lib/tools/governance.ts`). A autoridade mora em `FonteNormativa`, com
   * jurisdiction, rights, locator com pinpoint e integridade — nunca aqui.
   */
  sourceIds?: string[];
  related: string[];
  version?: string;
  evidence?: string;
  specific?: string[];
};

export const disclaimer =
  "Cálculo e escore têm caráter consultivo e didático. Confira a prescrição, o protocolo da instituição e as referências antes de qualquer conduta. A decisão permanece com a equipe responsável.";
