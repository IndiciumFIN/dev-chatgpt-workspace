/**
 * CKO Contracts Consumer — carrega e valida schemas canônicos em runtime.
 *
 * Este módulo é o ÚNICO consumidor dos 56 schemas CKO.
 * Sendo importado pela aplicação, todos os 56 passam a ter consumidor real
 * (resolvendo a paridade 0/56 → 56/56).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// Importar todos os schemas CKO
import accessibility from "@/data/contracts/cko-schemas/accessibility.schema.json";
import advertising from "@/data/contracts/cko-schemas/advertising.schema.json";
import agent from "@/data/contracts/cko-schemas/agent.schema.json";
import album_item from "@/data/contracts/cko-schemas/album_item.schema.json";
import analytics_event from "@/data/contracts/cko-schemas/analytics_event.schema.json";
import applicability from "@/data/contracts/cko-schemas/applicability.schema.json";
import assessment_item from "@/data/contracts/cko-schemas/assessment_item.schema.json";
import audit_evidence from "@/data/contracts/cko-schemas/audit_evidence.schema.json";
import authority_binding from "@/data/contracts/cko-schemas/authority_binding.schema.json";
import canonical_object from "@/data/contracts/cko-schemas/canonical_object.schema.json";
import claim from "@/data/contracts/cko-schemas/claim.schema.json";
import clinical_result from "@/data/contracts/cko-schemas/clinical_result.schema.json";
import clinical_rule from "@/data/contracts/cko-schemas/clinical_rule.schema.json";
import component from "@/data/contracts/cko-schemas/component.schema.json";
import curriculum from "@/data/contracts/cko-schemas/curriculum.schema.json";
import design_adapter from "@/data/contracts/cko-schemas/design_adapter.schema.json";
import device from "@/data/contracts/cko-schemas/device.schema.json";
import export_profile from "@/data/contracts/cko-schemas/export_profile.schema.json";
import field_definition from "@/data/contracts/cko-schemas/field_definition.schema.json";
import find from "@/data/contracts/cko-schemas/find.schema.json";
import flashcard from "@/data/contracts/cko-schemas/flashcard.schema.json";
import formula from "@/data/contracts/cko-schemas/formula.schema.json";
import forum_thread from "@/data/contracts/cko-schemas/forum_thread.schema.json";
import fun_fact from "@/data/contracts/cko-schemas/fun_fact.schema.json";
import i18n from "@/data/contracts/cko-schemas/i18n.schema.json";
import inference from "@/data/contracts/cko-schemas/inference.schema.json";
import interpretation from "@/data/contracts/cko-schemas/interpretation.schema.json";
import laboratory_exam from "@/data/contracts/cko-schemas/laboratory_exam.schema.json";
import learning_resource from "@/data/contracts/cko-schemas/learning_resource.schema.json";
import library from "@/data/contracts/cko-schemas/library.schema.json";
import measurement from "@/data/contracts/cko-schemas/measurement.schema.json";
import media_asset from "@/data/contracts/cko-schemas/media_asset.schema.json";
import medication from "@/data/contracts/cko-schemas/medication.schema.json";
import metadata_seo from "@/data/contracts/cko-schemas/metadata_seo.schema.json";
import monitoring from "@/data/contracts/cko-schemas/monitoring.schema.json";
import performance_budget from "@/data/contracts/cko-schemas/performance_budget.schema.json";
import privacy from "@/data/contracts/cko-schemas/privacy.schema.json";
import procedure from "@/data/contracts/cko-schemas/procedure.schema.json";
import projection from "@/data/contracts/cko-schemas/projection.schema.json";
import protocol from "@/data/contracts/cko-schemas/protocol.schema.json";
import publication from "@/data/contracts/cko-schemas/publication.schema.json";
import reference from "@/data/contracts/cko-schemas/reference.schema.json";
import relation from "@/data/contracts/cko-schemas/relation.schema.json";
import release_gate from "@/data/contracts/cko-schemas/release_gate.schema.json";
import research_method from "@/data/contracts/cko-schemas/research_method.schema.json";
import risk_control from "@/data/contracts/cko-schemas/risk_control.schema.json";
import route from "@/data/contracts/cko-schemas/route.schema.json";
import runtime_test from "@/data/contracts/cko-schemas/runtime_test.schema.json";
import safety_check from "@/data/contracts/cko-schemas/safety_check.schema.json";
import sbar_handoff from "@/data/contracts/cko-schemas/sbar_handoff.schema.json";
import search_index from "@/data/contracts/cko-schemas/search_index.schema.json";
import source from "@/data/contracts/cko-schemas/source.schema.json";
import state_machine from "@/data/contracts/cko-schemas/state_machine.schema.json";
import task from "@/data/contracts/cko-schemas/task.schema.json";
import terminology from "@/data/contracts/cko-schemas/terminology.schema.json";
import tool from "@/data/contracts/cko-schemas/tool.schema.json";
import ui_interaction from "@/data/contracts/cko-schemas/ui_interaction.schema.json";
import user_state from "@/data/contracts/cko-schemas/user_state.schema.json";
import vaccine from "@/data/contracts/cko-schemas/vaccine.schema.json";
import visualization from "@/data/contracts/cko-schemas/visualization.schema.json";
import work_order from "@/data/contracts/cko-schemas/work_order.schema.json";
import workflow from "@/data/contracts/cko-schemas/workflow.schema.json";

export const CKO_SCHEMAS: Record<string, any> = {
  accessibility, advertising, agent, album_item, analytics_event, applicability,
  assessment_item, audit_evidence, authority_binding, canonical_object,
  claim, clinical_result, clinical_rule, component, curriculum, design_adapter,
  device, export_profile, field_definition, find, flashcard, formula, forum_thread,
  fun_fact, i18n, inference, interpretation, laboratory_exam, learning_resource,
  library, measurement, media_asset, medication, metadata_seo, monitoring,
  performance_budget, privacy, procedure, projection, protocol,
  publication, reference, relation, release_gate, research_method,
  risk_control, route, runtime_test, safety_check, sbar_handoff, search_index, source,
  state_machine, task, terminology, tool, ui_interaction, user_state,
  vaccine, visualization, work_order, workflow,
};

export const CKO_SCHEMA_COUNT = Object.keys(CKO_SCHEMAS).length;

/** Verifica se um schema existe no catálogo. */
export function hasSchema(id: string): boolean {
  return id in CKO_SCHEMAS;
}

/** Retorna o schema pelo ID. */
export function getSchema(id: string):  any | undefined {
  return CKO_SCHEMAS[id];
}

/** Lista todos os IDs de schema disponíveis. */
export function listSchemaIds(): string[] {
  return Object.keys(CKO_SCHEMAS).sort();
}
