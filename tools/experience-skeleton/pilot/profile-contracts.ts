// Perfis transversais exigidos pelo plano: Settings scopes, Output formats, Preview profiles.
// Registos vazios por agora: são PROPOSTOS, e o gate reprova se alguém os declarar prontos.
export type SettingsScope = 'GLOBAL' | 'USER' | 'WORKSPACE' | 'CONTENT' | 'DEVICE';
export type OutputFormat = 'HTML' | 'PDF' | 'PRINT' | 'DOCX' | 'MARKDOWN' | 'JSON';
export type PreviewProfile = 'QUICK' | 'DETAIL' | 'DRAWER' | 'INLINE' | 'MODAL';

export const SETTINGS_SCOPES: readonly SettingsScope[] = [];
export const OUTPUT_FORMATS: readonly OutputFormat[] = [];
export const PREVIEW_PROFILES: readonly PreviewProfile[] = [];

export const PROFILE_REGISTRY_STATUS = 'CANDIDATE_HOLD' as const;
