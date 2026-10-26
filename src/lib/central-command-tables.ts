/** Inventário lógico proposto no documento v1.0; não constitui migração ou schema existente. */
export type TablePhase = 'B0' | 'B1';
export type ProposedTable = {name:string; domain:string; phase:TablePhase};
export const proposedTables: ProposedTable[] = [
  {
    "name": "core.organizations",
    "domain": "core",
    "phase": "B0"
  },
  {
    "name": "core.sites",
    "domain": "core",
    "phase": "B0"
  },
  {
    "name": "core.environments",
    "domain": "core",
    "phase": "B0"
  },
  {
    "name": "core.modules",
    "domain": "core",
    "phase": "B0"
  },
  {
    "name": "core.capabilities",
    "domain": "core",
    "phase": "B1"
  },
  {
    "name": "core.entity_types",
    "domain": "core",
    "phase": "B0"
  },
  {
    "name": "core.entity_registry",
    "domain": "core",
    "phase": "B1"
  },
  {
    "name": "core.relationship_types",
    "domain": "core",
    "phase": "B1"
  },
  {
    "name": "core.object_links",
    "domain": "core",
    "phase": "B1"
  },
  {
    "name": "core.taxonomies",
    "domain": "core",
    "phase": "B1"
  },
  {
    "name": "core.taxonomy_terms",
    "domain": "core",
    "phase": "B1"
  },
  {
    "name": "core.data_contracts",
    "domain": "core",
    "phase": "B0"
  },
  {
    "name": "core.contract_versions",
    "domain": "core",
    "phase": "B0"
  },
  {
    "name": "core.schema_registry",
    "domain": "core",
    "phase": "B1"
  },
  {
    "name": "core.settings_versions",
    "domain": "core",
    "phase": "B1"
  },
  {
    "name": "core.correlation_contexts",
    "domain": "core",
    "phase": "B0"
  },
  {
    "name": "iam.profiles",
    "domain": "iam",
    "phase": "B0"
  },
  {
    "name": "iam.teams",
    "domain": "iam",
    "phase": "B1"
  },
  {
    "name": "iam.team_members",
    "domain": "iam",
    "phase": "B1"
  },
  {
    "name": "iam.roles",
    "domain": "iam",
    "phase": "B0"
  },
  {
    "name": "iam.permissions",
    "domain": "iam",
    "phase": "B0"
  },
  {
    "name": "iam.role_permissions",
    "domain": "iam",
    "phase": "B0"
  },
  {
    "name": "iam.role_assignments",
    "domain": "iam",
    "phase": "B0"
  },
  {
    "name": "iam.service_principals",
    "domain": "iam",
    "phase": "B0"
  },
  {
    "name": "iam.access_reviews",
    "domain": "iam",
    "phase": "B1"
  },
  {
    "name": "iam.user_consents",
    "domain": "iam",
    "phase": "B1"
  },
  {
    "name": "iam.user_preferences",
    "domain": "iam",
    "phase": "B1"
  },
  {
    "name": "gov.frameworks",
    "domain": "gov",
    "phase": "B1"
  },
  {
    "name": "gov.normatives",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.normative_versions",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.requirements",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.requirement_scopes",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.processes",
    "domain": "gov",
    "phase": "B1"
  },
  {
    "name": "gov.process_steps",
    "domain": "gov",
    "phase": "B1"
  },
  {
    "name": "gov.risks",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.risk_assessments",
    "domain": "gov",
    "phase": "B1"
  },
  {
    "name": "gov.controls",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.requirement_controls",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.risk_controls",
    "domain": "gov",
    "phase": "B1"
  },
  {
    "name": "gov.policies",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.policy_versions",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.policy_test_cases",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.policy_decisions",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.validators",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.validator_versions",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.workflows",
    "domain": "gov",
    "phase": "B1"
  },
  {
    "name": "gov.workflow_versions",
    "domain": "gov",
    "phase": "B1"
  },
  {
    "name": "gov.workflow_transitions",
    "domain": "gov",
    "phase": "B1"
  },
  {
    "name": "gov.approvals",
    "domain": "gov",
    "phase": "B0"
  },
  {
    "name": "gov.exceptions",
    "domain": "gov",
    "phase": "B1"
  },
  {
    "name": "gov.control_evidences",
    "domain": "gov",
    "phase": "B1"
  },
  {
    "name": "pmo.portfolios",
    "domain": "pmo",
    "phase": "B1"
  },
  {
    "name": "pmo.programs",
    "domain": "pmo",
    "phase": "B1"
  },
  {
    "name": "pmo.projects",
    "domain": "pmo",
    "phase": "B0"
  },
  {
    "name": "pmo.waves",
    "domain": "pmo",
    "phase": "B0"
  },
  {
    "name": "pmo.milestones",
    "domain": "pmo",
    "phase": "B1"
  },
  {
    "name": "pmo.backlog_items",
    "domain": "pmo",
    "phase": "B0"
  },
  {
    "name": "pmo.tasks",
    "domain": "pmo",
    "phase": "B0"
  },
  {
    "name": "pmo.task_assignments",
    "domain": "pmo",
    "phase": "B1"
  },
  {
    "name": "pmo.work_orders",
    "domain": "pmo",
    "phase": "B0"
  },
  {
    "name": "pmo.work_order_tasks",
    "domain": "pmo",
    "phase": "B0"
  },
  {
    "name": "pmo.dependencies",
    "domain": "pmo",
    "phase": "B0"
  },
  {
    "name": "pmo.checkpoints",
    "domain": "pmo",
    "phase": "B1"
  },
  {
    "name": "pmo.handoffs",
    "domain": "pmo",
    "phase": "B1"
  },
  {
    "name": "src.sources",
    "domain": "src",
    "phase": "B0"
  },
  {
    "name": "src.source_versions",
    "domain": "src",
    "phase": "B1"
  },
  {
    "name": "src.usage_rights",
    "domain": "src",
    "phase": "B0"
  },
  {
    "name": "src.connectors",
    "domain": "src",
    "phase": "B1"
  },
  {
    "name": "src.ingestion_requests",
    "domain": "src",
    "phase": "B0"
  },
  {
    "name": "src.captures",
    "domain": "src",
    "phase": "B0"
  },
  {
    "name": "src.raw_artifacts",
    "domain": "src",
    "phase": "B0"
  },
  {
    "name": "src.extraction_runs",
    "domain": "src",
    "phase": "B0"
  },
  {
    "name": "src.extraction_units",
    "domain": "src",
    "phase": "B1"
  },
  {
    "name": "src.quarantine_items",
    "domain": "src",
    "phase": "B0"
  },
  {
    "name": "src.duplicate_candidates",
    "domain": "src",
    "phase": "B1"
  },
  {
    "name": "kn.atoms",
    "domain": "kn",
    "phase": "B0"
  },
  {
    "name": "kn.atom_versions",
    "domain": "kn",
    "phase": "B0"
  },
  {
    "name": "kn.evidence_items",
    "domain": "kn",
    "phase": "B0"
  },
  {
    "name": "kn.claims",
    "domain": "kn",
    "phase": "B0"
  },
  {
    "name": "kn.claim_evidence",
    "domain": "kn",
    "phase": "B0"
  },
  {
    "name": "kn.rules",
    "domain": "kn",
    "phase": "B0"
  },
  {
    "name": "kn.rule_versions",
    "domain": "kn",
    "phase": "B0"
  },
  {
    "name": "kn.rule_claims",
    "domain": "kn",
    "phase": "B0"
  },
  {
    "name": "kn.provenance_edges",
    "domain": "kn",
    "phase": "B0"
  },
  {
    "name": "kn.admission_decisions",
    "domain": "kn",
    "phase": "B0"
  },
  {
    "name": "kn.concept_schemes",
    "domain": "kn",
    "phase": "B1"
  },
  {
    "name": "kn.concepts",
    "domain": "kn",
    "phase": "B1"
  },
  {
    "name": "kn.concept_links",
    "domain": "kn",
    "phase": "B1"
  },
  {
    "name": "clin.instruments",
    "domain": "clin",
    "phase": "B0"
  },
  {
    "name": "clin.instrument_versions",
    "domain": "clin",
    "phase": "B0"
  },
  {
    "name": "clin.clinical_parameters",
    "domain": "clin",
    "phase": "B0"
  },
  {
    "name": "clin.validation_cases",
    "domain": "clin",
    "phase": "B0"
  },
  {
    "name": "clin.validation_runs",
    "domain": "clin",
    "phase": "B0"
  },
  {
    "name": "clin.review_assignments",
    "domain": "clin",
    "phase": "B1"
  },
  {
    "name": "clin.clinical_reviews",
    "domain": "clin",
    "phase": "B0"
  },
  {
    "name": "clin.safety_notices",
    "domain": "clin",
    "phase": "B1"
  },
  {
    "name": "clin.regulatory_assessments",
    "domain": "clin",
    "phase": "B0"
  },
  {
    "name": "prd.products",
    "domain": "prd",
    "phase": "B0"
  },
  {
    "name": "prd.product_versions",
    "domain": "prd",
    "phase": "B1"
  },
  {
    "name": "prd.features",
    "domain": "prd",
    "phase": "B1"
  },
  {
    "name": "prd.tools",
    "domain": "prd",
    "phase": "B0"
  },
  {
    "name": "prd.tool_versions",
    "domain": "prd",
    "phase": "B0"
  },
  {
    "name": "prd.tool_rule_bindings",
    "domain": "prd",
    "phase": "B0"
  },
  {
    "name": "prd.product_content_links",
    "domain": "prd",
    "phase": "B1"
  },
  {
    "name": "cms.content_items",
    "domain": "cms",
    "phase": "B0"
  },
  {
    "name": "cms.content_versions",
    "domain": "cms",
    "phase": "B0"
  },
  {
    "name": "cms.content_claims",
    "domain": "cms",
    "phase": "B0"
  },
  {
    "name": "cms.citations",
    "domain": "cms",
    "phase": "B0"
  },
  {
    "name": "cms.editorial_reviews",
    "domain": "cms",
    "phase": "B0"
  },
  {
    "name": "cms.publication_requests",
    "domain": "cms",
    "phase": "B1"
  },
  {
    "name": "cms.pages",
    "domain": "cms",
    "phase": "B0"
  },
  {
    "name": "cms.routes",
    "domain": "cms",
    "phase": "B0"
  },
  {
    "name": "cms.page_sections",
    "domain": "cms",
    "phase": "B1"
  },
  {
    "name": "cms.navigation_items",
    "domain": "cms",
    "phase": "B1"
  },
  {
    "name": "cms.seo_metadata",
    "domain": "cms",
    "phase": "B1"
  },
  {
    "name": "cms.redirects",
    "domain": "cms",
    "phase": "B1"
  },
  {
    "name": "ds.token_sets",
    "domain": "ds",
    "phase": "B0"
  },
  {
    "name": "ds.tokens",
    "domain": "ds",
    "phase": "B0"
  },
  {
    "name": "ds.components",
    "domain": "ds",
    "phase": "B0"
  },
  {
    "name": "ds.component_versions",
    "domain": "ds",
    "phase": "B0"
  },
  {
    "name": "ds.templates",
    "domain": "ds",
    "phase": "B0"
  },
  {
    "name": "ds.template_versions",
    "domain": "ds",
    "phase": "B1"
  },
  {
    "name": "ds.template_slots",
    "domain": "ds",
    "phase": "B0"
  },
  {
    "name": "ds.assets",
    "domain": "ds",
    "phase": "B1"
  },
  {
    "name": "ds.asset_variants",
    "domain": "ds",
    "phase": "B1"
  },
  {
    "name": "ds.component_usage",
    "domain": "ds",
    "phase": "B1"
  },
  {
    "name": "i18n.locales",
    "domain": "i18n",
    "phase": "B0"
  },
  {
    "name": "i18n.message_keys",
    "domain": "i18n",
    "phase": "B1"
  },
  {
    "name": "i18n.message_translations",
    "domain": "i18n",
    "phase": "B1"
  },
  {
    "name": "i18n.content_translations",
    "domain": "i18n",
    "phase": "B0"
  },
  {
    "name": "i18n.translation_reviews",
    "domain": "i18n",
    "phase": "B1"
  },
  {
    "name": "i18n.a11y_audits",
    "domain": "i18n",
    "phase": "B1"
  },
  {
    "name": "i18n.a11y_findings",
    "domain": "i18n",
    "phase": "B1"
  },
  {
    "name": "biz.plans",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.subscriptions",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.entitlements",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.external_billing_refs",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.campaigns",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.analytics_metrics",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.analytics_events",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.feedback",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.vendors",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.contracts",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.cost_centers",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.budgets",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.competencies",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "biz.professional_qualifications",
    "domain": "biz",
    "phase": "B1"
  },
  {
    "name": "ai.providers",
    "domain": "ai",
    "phase": "B0"
  },
  {
    "name": "ai.models",
    "domain": "ai",
    "phase": "B0"
  },
  {
    "name": "ai.model_versions",
    "domain": "ai",
    "phase": "B0"
  },
  {
    "name": "ai.agents",
    "domain": "ai",
    "phase": "B0"
  },
  {
    "name": "ai.agent_versions",
    "domain": "ai",
    "phase": "B0"
  },
  {
    "name": "ai.agent_tool_bindings",
    "domain": "ai",
    "phase": "B0"
  },
  {
    "name": "ai.prompt_templates",
    "domain": "ai",
    "phase": "B0"
  },
  {
    "name": "ai.prompt_versions",
    "domain": "ai",
    "phase": "B0"
  },
  {
    "name": "ai.agent_evaluation_suites",
    "domain": "ai",
    "phase": "B1"
  },
  {
    "name": "ai.agent_evaluation_cases",
    "domain": "ai",
    "phase": "B1"
  },
  {
    "name": "ai.agent_evaluation_runs",
    "domain": "ai",
    "phase": "B1"
  },
  {
    "name": "ai.model_usage_ledger",
    "domain": "ai",
    "phase": "B0"
  },
  {
    "name": "cmd.sessions",
    "domain": "cmd",
    "phase": "B0"
  },
  {
    "name": "cmd.threads",
    "domain": "cmd",
    "phase": "B0"
  },
  {
    "name": "cmd.messages",
    "domain": "cmd",
    "phase": "B0"
  },
  {
    "name": "cmd.message_attachments",
    "domain": "cmd",
    "phase": "B1"
  },
  {
    "name": "cmd.commands",
    "domain": "cmd",
    "phase": "B0"
  },
  {
    "name": "cmd.command_contexts",
    "domain": "cmd",
    "phase": "B0"
  },
  {
    "name": "cmd.command_policy_checks",
    "domain": "cmd",
    "phase": "B0"
  },
  {
    "name": "cmd.command_artifacts",
    "domain": "cmd",
    "phase": "B0"
  },
  {
    "name": "cmd.wo_launch_requests",
    "domain": "cmd",
    "phase": "B0"
  },
  {
    "name": "cmd.workspace_views",
    "domain": "cmd",
    "phase": "B1"
  },
  {
    "name": "ops.integrations",
    "domain": "ops",
    "phase": "B0"
  },
  {
    "name": "ops.integration_secret_refs",
    "domain": "ops",
    "phase": "B1"
  },
  {
    "name": "ops.runners",
    "domain": "ops",
    "phase": "B0"
  },
  {
    "name": "ops.queues",
    "domain": "ops",
    "phase": "B0"
  },
  {
    "name": "ops.jobs",
    "domain": "ops",
    "phase": "B0"
  },
  {
    "name": "ops.runs",
    "domain": "ops",
    "phase": "B0"
  },
  {
    "name": "ops.run_steps",
    "domain": "ops",
    "phase": "B0"
  },
  {
    "name": "ops.run_events",
    "domain": "ops",
    "phase": "B0"
  },
  {
    "name": "ops.run_artifacts",
    "domain": "ops",
    "phase": "B0"
  },
  {
    "name": "ops.run_leases",
    "domain": "ops",
    "phase": "B0"
  },
  {
    "name": "ops.telemetry_spans",
    "domain": "ops",
    "phase": "B1"
  },
  {
    "name": "ops.metric_samples",
    "domain": "ops",
    "phase": "B1"
  },
  {
    "name": "ops.notifications",
    "domain": "ops",
    "phase": "B1"
  },
  {
    "name": "ops.subscriptions",
    "domain": "ops",
    "phase": "B1"
  },
  {
    "name": "ops.health_checks",
    "domain": "ops",
    "phase": "B1"
  },
  {
    "name": "ops.backup_runs",
    "domain": "ops",
    "phase": "B1"
  },
  {
    "name": "ops.restore_drills",
    "domain": "ops",
    "phase": "B1"
  },
  {
    "name": "qms.test_suites",
    "domain": "qms",
    "phase": "B0"
  },
  {
    "name": "qms.test_cases",
    "domain": "qms",
    "phase": "B0"
  },
  {
    "name": "qms.test_runs",
    "domain": "qms",
    "phase": "B0"
  },
  {
    "name": "qms.test_results",
    "domain": "qms",
    "phase": "B0"
  },
  {
    "name": "qms.findings",
    "domain": "qms",
    "phase": "B0"
  },
  {
    "name": "qms.corrective_actions",
    "domain": "qms",
    "phase": "B0"
  },
  {
    "name": "qms.homologations",
    "domain": "qms",
    "phase": "B0"
  },
  {
    "name": "qms.release_gates",
    "domain": "qms",
    "phase": "B0"
  },
  {
    "name": "qms.audit_plans",
    "domain": "qms",
    "phase": "B1"
  },
  {
    "name": "qms.audit_engagements",
    "domain": "qms",
    "phase": "B1"
  },
  {
    "name": "qms.audit_procedures",
    "domain": "qms",
    "phase": "B1"
  },
  {
    "name": "qms.audit_conclusions",
    "domain": "qms",
    "phase": "B1"
  },
  {
    "name": "rel.channels",
    "domain": "rel",
    "phase": "B1"
  },
  {
    "name": "rel.releases",
    "domain": "rel",
    "phase": "B0"
  },
  {
    "name": "rel.release_items",
    "domain": "rel",
    "phase": "B0"
  },
  {
    "name": "rel.deployments",
    "domain": "rel",
    "phase": "B0"
  },
  {
    "name": "rel.deployment_checks",
    "domain": "rel",
    "phase": "B0"
  },
  {
    "name": "rel.rollbacks",
    "domain": "rel",
    "phase": "B1"
  },
  {
    "name": "rel.published_objects",
    "domain": "rel",
    "phase": "B0"
  },
  {
    "name": "rel.policy_deployments",
    "domain": "rel",
    "phase": "B0"
  },
  {
    "name": "sec.classifications",
    "domain": "sec",
    "phase": "B0"
  },
  {
    "name": "sec.data_processing_purposes",
    "domain": "sec",
    "phase": "B1"
  },
  {
    "name": "sec.retention_policies",
    "domain": "sec",
    "phase": "B1"
  },
  {
    "name": "sec.security_incidents",
    "domain": "sec",
    "phase": "B1"
  },
  {
    "name": "sec.incident_actions",
    "domain": "sec",
    "phase": "B1"
  },
  {
    "name": "sec.access_exceptions",
    "domain": "sec",
    "phase": "B1"
  },
  {
    "name": "sec.privacy_requests",
    "domain": "sec",
    "phase": "B1"
  },
  {
    "name": "sec.security_assessments",
    "domain": "sec",
    "phase": "B1"
  },
  {
    "name": "sec.immutable_audit_events",
    "domain": "sec",
    "phase": "B0"
  }
];
export const tableDomains = ["core","iam","gov","pmo","src","kn","clin","prd","cms","ds","i18n","biz","ai","cmd","ops","qms","rel","sec"];
