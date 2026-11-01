// Pilot: estado da experiência — guest-first, sem login obrigatório.
// Invariante do registo: "Guest baseline must not require authentication unless policy explicitly says so".

export type SessionScope = 'SESSION' | 'LOCAL_DEVICE' | 'ACCOUNT_SYNC';

export type ExperienceState = {
  readonly scope: SessionScope;
  readonly favorites: readonly string[];
  readonly later: readonly string[];
  readonly recents: readonly string[];
  readonly collections: readonly string[];
  readonly preferences: Readonly<Record<string, string>>;
};

export function emptyState(scope: SessionScope = 'SESSION'): ExperienceState {
  return { scope, favorites: [], later: [], recents: [], collections: [], preferences: {} };
}

/**
 * Guest-first: favorito/later/recents/preferências funcionam sem conta.
 * Só promoções (coleções sincronizadas, multi-dispositivo) exigem account+sync.
 */
export function localOnlyOperations(state: ExperienceState): readonly string[] {
  return ['favorite', 'unfavorite', 'later', 'unlater', 'recent', 'preference'];
}

export function requiresSync(operation: string): boolean {
  return !localOnlyOperations(emptyState()).includes(operation);
}
