import type { DeskModule } from "./normative-desk";
import { contractOf } from "./template-contract";

/** A área logada usa o frame que já existe. Este contrato só diz o que cada módulo pode montar. */

export const adminBase = contractOf("area");

export const adminRegions = ["toolbar", "list", "detail", "form"] as const;

export type AdminRegion = (typeof adminRegions)[number];

export type AdminContract = {
  id: DeskModule;
  layout: "central" | "registro";
  regions: readonly AdminRegion[];
  components: readonly string[];
  forms: readonly string[];
  reads: readonly string[];
  writes: readonly string[];
};

export const adminContracts: Record<DeskModule, AdminContract> = {
  inicio: {
    id: "inicio",
    layout: "central",
    regions: [],
    components: ["CommandCenter"],
    forms: ["CommandComposer"],
    reads: ["readCommandDesk", "replayCommand"],
    writes: ["submitCommand", "controlRun"],
  },
  modelo: {
    id: "modelo",
    layout: "registro",
    regions: ["toolbar", "list"],
    components: ["ModelDesk"],
    forms: ["RecordToolbar"],
    reads: ["metamodel"],
    writes: [],
  },
  fila: {
    id: "fila",
    layout: "registro",
    regions: ["toolbar", "list", "detail"],
    components: ["QueueDesk"],
    forms: ["RecordToolbar"],
    reads: ["extractionQueue", "lineageSteps", "atomQueue"],
    writes: [],
  },
  normas: {
    id: "normas",
    layout: "registro",
    regions: ["toolbar", "list", "detail"],
    components: ["NormsModule"],
    forms: ["RecordToolbar"],
    reads: ["fundamentosNormas"],
    writes: [],
  },
  politicas: {
    id: "politicas",
    layout: "registro",
    regions: ["toolbar", "list", "detail", "form"],
    components: ["PoliciesModule", "PolicyDetail"],
    forms: ["RecordToolbar", "DraftForm"],
    reads: ["readGovernance"],
    writes: ["saveGovernanceDraft", "approveGovernanceItem", "assumePolicy"],
  },
  dados: {
    id: "dados",
    layout: "registro",
    regions: ["toolbar", "list", "detail"],
    components: ["DataModule"],
    forms: ["RecordToolbar"],
    reads: ["readGovernance"],
    writes: ["approveSpecification", "exportContent", "restoreContent"],
  },
  conteudo: {
    id: "conteudo",
    layout: "registro",
    regions: ["toolbar", "list"],
    components: ["ContentModule"],
    forms: ["RecordToolbar"],
    reads: ["pages", "listTemplates", "adminDesk"],
    writes: [],
  },
  instrumentos: {
    id: "instrumentos",
    layout: "registro",
    regions: ["toolbar", "list", "form"],
    components: ["InstrumentModule", "ToolEditor"],
    forms: ["RecordToolbar", "CoverForm"],
    reads: ["adminDesk"],
    writes: ["saveTool", "saveClinicalSheet"],
  },
  pessoas: {
    id: "pessoas",
    layout: "registro",
    regions: ["toolbar", "list", "form"],
    components: ["PeopleModule"],
    forms: ["RecordToolbar", "RoleForm"],
    reads: ["adminDesk"],
    writes: ["setMemberRole"],
  },
  sistema: {
    id: "sistema",
    layout: "registro",
    regions: ["toolbar", "list"],
    components: ["SystemModule"],
    forms: ["RecordToolbar"],
    reads: ["templateContracts", "listMedia", "agents"],
    writes: [],
  },
};

export function adminContract(id: DeskModule) {
  return adminContracts[id];
}
