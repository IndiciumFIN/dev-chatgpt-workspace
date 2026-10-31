// ExperienceState CANÓNICO (metamodelo mínimo do plano, secção 2).
// Regra dura: o estado é POLIMÓRFICO por object_ref + capability_id.
// Nunca criar course_favorite / article_favorite / calculator_favorite.
export type OwnerScope = 'SESSION' | 'LOCAL_DEVICE' | 'ACCOUNT' | 'WORKSPACE';
export type SyncState = 'LOCAL_ONLY' | 'PENDING' | 'SYNCED' | 'CONFLICT' | 'REJECTED';

export type ExperienceStateRecord = {
  readonly state_id: string;
  readonly owner_scope: OwnerScope;
  readonly owner_ref: string | null;
  readonly object_ref: string;
  readonly object_type: string;
  readonly capability_id: string;
  readonly state_payload: Readonly<Record<string, unknown>>;
  readonly created_at: string;
  readonly updated_at: string;
  readonly sync_state: SyncState;
  readonly privacy_class: string;
  readonly retention_policy_ref: string | null;
};

/** Guest-first: o baseline não exige autenticação; sync é opt-in e sempre explícito. */
export const GUEST_SCOPES: readonly OwnerScope[] = ['SESSION', 'LOCAL_DEVICE'];

export function scopeFor(authenticated: boolean, wantsSync: boolean): OwnerScope {
  if (!authenticated) return 'SESSION';
  return wantsSync ? 'ACCOUNT' : 'LOCAL_DEVICE';
}

export function requiresAccount(state: ExperienceStateRecord): boolean {
  return state.owner_scope === 'ACCOUNT' || state.owner_scope === 'WORKSPACE';
}

/** Constrói um estado sem inventar campos: o payload é genérico e polimórfico. */
export function makeState(input: {
  state_id: string;
  object_ref: string;
  object_type: string;
  capability_id: string;
  owner_scope: OwnerScope;
  now: string;
  payload?: Record<string, unknown>;
  privacy_class?: string;
  owner_ref?: string | null;
  retention_policy_ref?: string | null;
}): ExperienceStateRecord {
  return {
    state_id: input.state_id,
    owner_scope: input.owner_scope,
    owner_ref: input.owner_ref ?? null,
    object_ref: input.object_ref,
    object_type: input.object_type,
    capability_id: input.capability_id,
    state_payload: input.payload ?? {},
    created_at: input.now,
    updated_at: input.now,
    sync_state: input.owner_scope === 'ACCOUNT' || input.owner_scope === 'WORKSPACE' ? 'PENDING' : 'LOCAL_ONLY',
    privacy_class: input.privacy_class ?? 'PERSONAL',
    retention_policy_ref: input.retention_policy_ref ?? null,
  };
}
