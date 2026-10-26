/** Mapeamento de interface para schemas CKO já versionados. Não duplica propriedades.
 * Templates são projeções de formulário para rascunho; não concedem admissão/homologação.
 */
import workflow from '../../contracts/cko-schemas/workflow.schema.json';
import monitoring from '../../contracts/cko-schemas/monitoring.schema.json';
import task from '../../contracts/cko-schemas/task.schema.json';
import workOrder from '../../contracts/cko-schemas/work_order.schema.json';
import riskControl from '../../contracts/cko-schemas/risk_control.schema.json';
import canonicalObject from '../../contracts/cko-schemas/canonical_object.schema.json';
import fieldDefinition from '../../contracts/cko-schemas/field_definition.schema.json';
import source from '../../contracts/cko-schemas/source.schema.json';
import claim from '../../contracts/cko-schemas/claim.schema.json';
import clinicalRule from '../../contracts/cko-schemas/clinical_rule.schema.json';
import tool from '../../contracts/cko-schemas/tool.schema.json';
import formula from '../../contracts/cko-schemas/formula.schema.json';
import publication from '../../contracts/cko-schemas/publication.schema.json';
import reference from '../../contracts/cko-schemas/reference.schema.json';
import component from '../../contracts/cko-schemas/component.schema.json';
import mediaAsset from '../../contracts/cko-schemas/media_asset.schema.json';
import i18n from '../../contracts/cko-schemas/i18n.schema.json';
import accessibility from '../../contracts/cko-schemas/accessibility.schema.json';
import userState from '../../contracts/cko-schemas/user_state.schema.json';
import privacy from '../../contracts/cko-schemas/privacy.schema.json';
import analyticsEvent from '../../contracts/cko-schemas/analytics_event.schema.json';
import metadataSeo from '../../contracts/cko-schemas/metadata_seo.schema.json';
import runtimeTest from '../../contracts/cko-schemas/runtime_test.schema.json';
import releaseGate from '../../contracts/cko-schemas/release_gate.schema.json';
import authorityBinding from '../../contracts/cko-schemas/authority_binding.schema.json';
import applicability from '../../contracts/cko-schemas/applicability.schema.json';
import safetyCheck from '../../contracts/cko-schemas/safety_check.schema.json';
import agent from '../../contracts/cko-schemas/agent.schema.json';
import auditEvidence from '../../contracts/cko-schemas/audit_evidence.schema.json';
import finding from '../../contracts/cko-schemas/find.schema.json';
import type { AdminModuleId } from '@/lib/admin-module-registry';

export type JsonField = {
  type?: string; title?: string; description?: string; format?: string; pattern?: string;
  enum?: unknown[]; const?: unknown; minLength?: number; maxLength?: number;
  minimum?: number; maximum?: number; items?: JsonField; properties?: Record<string,JsonField>;
  required?: string[]; additionalProperties?: boolean | JsonField;
};
export type CkoSchema = { $id:string;title?:string;type:string;required?:string[];properties:Record<string,JsonField> };
export type FormTemplate = { key:string;label:string;schema:CkoSchema;scope:string;gap?:string };
const s=(raw:unknown)=>raw as CkoSchema;
const template=(key:string,label:string,raw:unknown,scope:string,gap?:string):FormTemplate=>({key,label,schema:s(raw),scope,gap});

export const moduleFormTemplates:Record<AdminModuleId,readonly FormTemplate[]> = {
 M02:[template('workflow','Processo e fluxo de planejamento',workflow,'Etapas, responsáveis e restrições','Objetivos estratégicos e orçamento ainda exigem contratos próprios.')],
 M03:[template('task','Tarefa do PMO',task,'Planejamento da tarefa'),
      template('work_order','Ordem de Trabalho (WO)',workOrder,'WO, controles e admissão','Sem autorização para execução ou gravação no PMO.')],
 M04:[template('risk_control','Matriz de risco e controle',riskControl,'Risco, controle, teste e resposta')],
 M05:[template('canonical_object','Objeto canônico',canonicalObject,'Entidades e master data'),
      template('field_definition','Definição de campo',fieldDefinition,'Tipos, semantic binding e privacidade')],
 M06:[template('source','Registro de fonte',source,'Proveniência, direitos e integridade')],
 M07:[template('claim','Claim e evidência',claim,'Vínculos entre evidências e afirmações'),
      template('clinical_rule','Regra clínica',clinicalRule,'Regras condicionadas a evidências')],
 M08:[template('tool','Ferramenta',tool,'Contratos de calculadoras e simuladores'),
      template('formula','Fórmula',formula,'Entradas, precisão e fórmula versionada')],
 M09:[template('reference','Referência',reference,'Referência e citação'),
      template('publication','Pacote de publicação',publication,'Evidências e gates editoriais')],
 M10:[template('component','Componente reutilizável',component,'Tokens e estados do Design System'),
      template('media_asset','Ativo de mídia',mediaAsset,'Imagem, licença, acessibilidade e reutilização')],
 M11:[template('i18n','Mensagem e tradução',i18n,'Idiomas e variantes'),
      template('accessibility','Acessibilidade',accessibility,'Critérios de acessibilidade')],
 M12:[template('user_state','Estado do usuário',userState,'Preferências não sensíveis'),
      template('privacy','Política de privacidade',privacy,'Consentimento e persistência','Acesso/assinaturas exigem contratos IAM e billing específicos.')],
 M13:[template('analytics_event','Evento analítico',analyticsEvent,'Telemetria e analytics'),
      template('metadata_seo','Metadados SEO',metadataSeo,'SEO e roteamento canônico')],
 M14:[template('runtime_test','Caso e execução de teste',runtimeTest,'Testes e evidências'),
      template('release_gate','Gate de homologação',releaseGate,'Decisões e verificações determinísticas')],
 M15:[template('publication','Publicação',publication,'Release e artefatos'),
      template('release_gate','Gate de release',releaseGate,'Evidências de promoção')],
 M16:[template('monitoring','Monitoramento e alerta',monitoring,'Telemetria e remediação'),
      template('workflow','Workflow automatizado',workflow,'Filas e etapas')],
 M17:[template('authority_binding','Vínculo normativo',authorityBinding,'Autoridade, exigência e fonte'),
      template('applicability','Aplicabilidade',applicability,'Jurisdição, população e escopo')],
 M18:[template('clinical_rule','Regra clínica',clinicalRule,'Segurança e validação clínica'),
      template('safety_check','Verificação de segurança',safetyCheck,'Controles e alertas')],
 M19:[template('agent','Agente controlado',agent,'Capacidades, permissões e falhas')],
 M20:[template('privacy','Privacidade e persistência',privacy,'Políticas de dados'),
      template('safety_check','Verificação de segurança',safetyCheck,'Controle preventivo')],
 M21:[template('audit_evidence','Evidência de auditoria',auditEvidence,'Testes de controle e resultados'),
      template('find','Achado (FIND)',finding,'Registro de exceções e evidências')],
 M22:[template('canonical_object','Registro corporativo genérico',canonicalObject,'Identificação canônica','Não é contrato suficiente para fornecedores, RH ou finanças: implantação específica bloqueada.')],
};
export const FIELD_LABELS:Record<string,string>={
 schema_version:'Versão do schema',canonical_id:'Identificador canônico',version:'Versão do objeto',status:'Estado governado',updated_at:'Data da atualização',provenance_refs:'Referências de proveniência',source_type:'Tipo da fonte',title:'Título',name:'Nome',description:'Descrição',authority:'Órgão ou autoridade',jurisdiction:'Jurisdição',retrieved_at:'Data da captura',rights:'Direitos de uso',locator:'Localização da fonte',uri:'Endereço (URL)',pinpoint:'Localização exata na fonte',integrity:'Integridade',sha256:'Hash SHA-256',snapshot_ref:'Referência do snapshot',license_ref:'Identificador da licença',effective_from:'Início da vigência',effective_until:'Fim da vigência',language:'Idioma',locale:'Idioma/localidade',find_id:'FIND relacionado',policy_ref:'Política aplicável',validator_ref:'Validador correspondente',task_ref:'Tarefa relacionada',kernel_admission:'Admissão no Kernel',scope:'Escopo',execution_status:'Estado de execução',admission_evidence_ref:'Evidência de admissão',assurance_refs:'Referências de auditoria',risk_id:'Identificador do risco',assertion_ref:'Afirmação/objetivo de auditoria',control_objective:'Objetivo do controle',control_kind:'Natureza do controle',test_procedure_ref:'Procedimento de teste',evidence_population_ref:'População de evidências',owner_ref:'Responsável (ID)',frequency:'Periodicidade',response_policy:'Resposta ao risco',framework_refs:'Referenciais aplicáveis',residual_risk_ref:'Risco residual',object_type:'Tipo de objeto',localized_title_keys:'Chaves dos títulos traduzidos',field_binding_ids:'Campos associados',relationship_ids:'Relacionamentos',clinical_claim_ids:'Claims clínicos',visibility:'Visibilidade',classification_ids:'Classificações',source_of_truth:'Fonte da verdade',asset_refs:'Ativos relacionados',human_review:'Revisão humana',agent_type:'Tipo de agente',reads:'Fontes de leitura permitidas',writes:'Destinos de escrita permitidos',depends_on:'Dependências',control_scope:'Escopo de controle',failure_policy:'Conduta em falha',maker_checker_auditor_role:'Papel na segregação',prompt_contract_ref:'Contrato de prompt',tool_allowlist:'Ferramentas permitidas',output_schema_ref:'Schema de saída',validators:'Validadores',privacy_policy:'Política de privacidade',applicability_ref:'Regra de aplicabilidade',field_path:'Caminho do campo',semantic_concept_ref:'Conceito semântico',value_type:'Tipo do valor',authority_binding_ref:'Vínculo com autoridade',unit_ref:'Unidade',validation_rule_ids:'Validadores do campo',message_key:'Chave do label',allowed_values_ref:'Fonte das opções',tool_kind:'Tipo de ferramenta',input_bindings:'Campos de entrada',engine_ref:'Motor de cálculo',result_schema_ref:'Schema de resultado',privacy_profile:'Perfil de privacidade',safety_profile:'Perfil de segurança',test_vector_refs:'Casos-ouro de teste',release_gate:'Gate de publicação',artifact_id:'Identificador do artefato',resolved_projection_id:'Projeção resolvida',required_gate_ids:'Gates obrigatórios',gate_results:'Resultados dos gates',human_approval:'Aprovação humana',output_sha256:'SHA-256 de saída',deployment_target:'Ambiente de implantação',release_ref:'Versão/release',component_key:'Chave do componente',owner_module:'Módulo proprietário',semantic_role:'Papel semântico',props_schema_ref:'Schema de propriedades',state_machine_ref:'Máquina de estados',design_system_token_refs:'Tokens do DS',a11y_profile_ref:'Perfil de acessibilidade',reusability_scope:'Escopo de reutilização',object_ref:'Objeto referenciado',route_registry_ref:'Rota canônica',title_key:'Chave do título',description_key:'Chave da descrição',og_media_ref:'Imagem de compartilhamento',structured_data_type_ref:'Tipo de dado estruturado',consent_id:'Consentimento',source_ref:'Fonte associada',reviewed_by:'Revisor',decision:'Decisão',required_approvals:'Aprovações necessárias',evidence_bundle_refs:'Conjunto de evidências',run_at:'Data/hora de execução',validator_id:'ID do validador',test_case_id:'ID do teste',result:'Resultado',sensitive_capture:'Captura de dados sensíveis',allowed_persistence:'Persistência permitida',analytics_allowlist:'Eventos analíticos autorizados',advertising_policy:'Política de publicidade',privacy_class:'Classificação de privacidade'
};
/** Dicionário complementar de labels: UI apenas, valores e tipos seguem o schema original. */
export const EXTRA_FIELD_LABELS:Record<string,string>={
 workflow_kind:'Tipo de workflow',stages:'Etapas do workflow',publication_restriction:'Restrição de publicação',
 pmo_item_ref:'Item do PMO',monitor_kind:'Tipo de monitoramento',check_schedule_ref:'Agenda de verificações',trigger_conditions:'Condições de disparo',alert_owner_ref:'Responsável pelos alertas',remediation_workflow_ref:'Fluxo de remediação',fail_state:'Estado em falha',previous_version_ref:'Versão anterior',
 task_kind:'Tipo de tarefa',find_ref:'Achado relacionado',acceptance_tests:'Testes de aceite',executor_role:'Papel executor',work_order_ref:'Ordem de trabalho',estimated_effort_label:'Estimativa de esforço',
 object_id:'ID do objeto',assertion_key:'Chave da afirmação',source_ids:'IDs de fontes',binding_ids:'IDs de vínculos',applicability:'Aplicabilidade',review:'Revisão',claim_type:'Tipo de claim',confidence_framework_ref:'Referencial de confiança',
 rule_kind:'Tipo de regra',antecedents:'Condições antecedentes',consequences:'Consequências e saídas',authority_binding_refs:'Vínculos normativos',fail_mode:'Comportamento em falha',
 expression_ast_ref:'Expressão estruturada (AST)',input_field_refs:'Campos de entrada',output_quantity_ref:'Grandeza de saída',rounding_mode:'Modo de arredondamento',rounding_stage:'Etapa do arredondamento',calculation_precision:'Precisão de cálculo',display_precision:'Precisão exibida',source_binding_refs:'Vínculos com fontes',override_justification_ref:'Justificativa de exceção',
 source_id:'ID da fonte',citation_style:'Estilo da referência',direct_uri:'URL direta',citation_type:'Tipo da citação',accessed_at:'Data de acesso',rights_status:'Situação dos direitos',citation_text_key:'Chave do texto de citação',
 original_source_ref:'Origem do ativo',media_type:'Formato de mídia',alt_key:'Chave do texto alternativo',extended_description_key:'Descrição estendida',fidelity:'Fidelidade ao original',variants:'Variantes',accessibility_status:'Estado de acessibilidade',creator_ref:'Criador (ID)',medical_validation_ref:'Validação clínica',publication_allowlist:'Destinos permitidos para publicação',notes:'Observações',
 key:'Chave de tradução',value:'Texto traduzido',source_locale:'Idioma de origem',translation_status:'Estado da tradução',clinical_review:'Revisão clínica',fallback_key:'Chave fallback',
 target_standard:'Norma de acessibilidade',keyboard_contract_ref:'Contrato de teclado',focus_ref:'Critério de foco',contrast_test_ref:'Teste de contraste',alt_text_ref:'Texto alternativo',responsive_breakpoints:'Larguras de responsividade',test_evidence_refs:'Evidências dos testes',reduced_motion_ref:'Política de movimento reduzido',screenreader_test_ref:'Teste de leitor de tela',
 user_state_kind:'Tipo de estado do usuário',target_object_id:'Objeto vinculado',payload_class:'Classe do dado',persistence_policy:'Política de persistência',
 event_kind:'Tipo de evento',property_allowlist:'Propriedades permitidas',sensitive_exclusion:'Exclusão de dados sensíveis',consent_ref:'Consentimento (ID)',retention_policy_ref:'Política de retenção',redaction_policy_ref:'Política de anonimização',
 canonical_derived:'Canonical derivada automaticamente',hreflang_refs:'Idiomas alternativos',review_policy_ref:'Política de revisão',
 target_ref:'Objeto testado',test_kind:'Tipo de teste',viewport:'Dimensão de tela',steps:'Etapas',assertions:'Asserções',source_version_refs:'Versões das fontes',run_status:'Estado da execução',evidence_ref:'Evidência',runner_ref:'Executor do teste',browser_ref:'Navegador',
 upstream_gate_refs:'Gates anteriores',replay_hash:'Hash de reprodução',deployment_scope:'Escopo de implantação',
 requirement_id:'ID do requisito',authority_class:'Classe da autoridade',validity:'Vigência ou validade',validator_ids:'IDs dos validadores',evidence_bundle_ids:'IDs dos dossiês',exception_reason:'Justificativa da exceção',
 population_ref:'População de aplicação',indications:'Indicações',exclusions:'Exclusões',source_refs:'Fontes relacionadas',scope_limitations:'Limitações de escopo',
 rule_refs:'Regras referenciadas',severity:'Severidade',trigger_states:'Estados de disparo',actions:'Ações previstas',disclosure_policy:'Política de divulgação',
 artifact_ref:'Artefato relacionado',input_sha256:'SHA-256 de entrada',runner_version:'Versão do executor',logs_ref:'Logs referenciados',limit_statement:'Declaração de limitações',
 applicable_from:'Início da aplicabilidade',applicable_until:'Fim da aplicabilidade',conditions:'Condições',deprecated_aliases:'Aliases descontinuados',exceptions:'Exceções documentadas',export_profile_ref:'Perfil de exportação',height:'Altura',width:'Largura',inference_policy_ref:'Política de inferência',output_precision_policy_ref:'Política de precisão da saída',ui_profile_ref:'Perfil de interface',
 finding_type:'Tipo de achado',fact:'Fato constatado',evidence_refs:'Evidências referenciadas',root_cause_status:'Estado da análise de causa-raiz',remediation_task_refs:'Tarefas de remediação',blocking_policy_refs:'Políticas bloqueantes',
};
export function displayLabel(name:string):string{
 if(FIELD_LABELS[name])return FIELD_LABELS[name];
 if(EXTRA_FIELD_LABELS[name])return EXTRA_FIELD_LABELS[name];
 const normalized=name.replace(/_/g,' ');
 return normalized[0].toLocaleUpperCase('pt-BR')+normalized.slice(1);
}
export function getTemplate(moduleId:AdminModuleId,key:string):FormTemplate{
 return moduleFormTemplates[moduleId].find(t=>t.key===key)??moduleFormTemplates[moduleId][0];
}
