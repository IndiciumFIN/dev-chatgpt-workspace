// Metamodelo mínimo (plano canónico, secção 2) — Types + validação fail-closed.
// O registo candidato da PR #21 é a FONTE; este ficheiro expõe o contrato que o registo
// tem de satisfazer. Divergências entre os dois são FIND, não se resolvem por inferência.
export type ReleaseStatus = 'CANDIDATE' | 'ADMITTED' | 'DEPRECATED' | 'RETIRED';

export type ExperienceCapability = {
  readonly capability_id: string;
  readonly name: string;
  readonly family: string;
  readonly kind: string;
  readonly state_contract_ref?: string;
  readonly action_contract_ref?: string;
  readonly supported_channels: readonly string[];
  readonly guest_support: string;
  readonly authenticated_support: string;
  readonly storage_policy: string;
  readonly sync_policy: string;
  readonly privacy_class: string;
  readonly permission_policy: string;
  readonly offline_behavior: string;
  readonly accessibility_contract_ref: string;
  readonly telemetry_contract_ref: string;
  readonly help_profile_ref?: string;
  readonly preview_profile_ref?: string;
  readonly output_profile_refs?: readonly string[];
  readonly release_status: ReleaseStatus;
};

export type ObjectCapabilityBinding = {
  readonly object_type: string;
  readonly capability_id: string;
  readonly support: string;
  readonly resolver: string;
  readonly channels: readonly string[];
  readonly audiences?: readonly string[];
  readonly permissions?: readonly string[];
  readonly state_constraints?: Readonly<Record<string, unknown>>;
  readonly format_constraints?: Readonly<Record<string, unknown>>;
  readonly policy_refs?: readonly string[];
};

const CAPABILITY_REQUIRED = [
  'capability_id','name','family','kind','supported_channels','guest_support','authenticated_support',
  'storage_policy','sync_policy','privacy_class','permission_policy','offline_behavior',
  'accessibility_contract_ref','telemetry_contract_ref','release_status',
] as const;

const BINDING_REQUIRED = ['object_type','capability_id','support','resolver','channels'] as const;

/** Devolve os campos em falta. Vazio = conforme. Fail-closed por omissão. */
export function missingCapabilityFields(cap: Partial<ExperienceCapability>): string[] {
  return CAPABILITY_REQUIRED.filter((f) => (cap as Record<string, unknown>)[f] === undefined);
}

export function missingBindingFields(binding: Partial<ObjectCapabilityBinding>): string[] {
  return BINDING_REQUIRED.filter((f) => (binding as Record<string, unknown>)[f] === undefined);
}
