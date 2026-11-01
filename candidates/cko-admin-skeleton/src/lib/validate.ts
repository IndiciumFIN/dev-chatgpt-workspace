export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'number' | 'bool' | 'url';
export type FieldDef = {
  key: string; label: string; type: FieldType; required?: boolean; options?: readonly string[]; help?: string;
  min?: number; max?: number; minLen?: number; maxLen?: number; pattern?: RegExp; patternMessage?: string;
  /** Rejeita valores com cara de segredo (token/chave). Credenciais NUNCA são guardadas neste console. */
  noSecret?: boolean; listColumn?: boolean;
};
export type Values = Record<string, unknown>;

const SECRET = /(^|\s)(sk-[\w-]{8,}|bearer\s+\S{8,}|ghp_\w{10,}|AKIA[0-9A-Z]{12,})|\b[A-Za-z0-9+/_-]{32,}={0,2}\b/;
export const looksLikeSecret = (value: string) => SECRET.test(value);

export function validateRecord(fields: readonly FieldDef[], values: Values): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const raw = values[f.key];
    if (f.type === 'bool') continue;
    const empty = raw === undefined || raw === null || raw === '';
    if (empty) { if (f.required) errors[f.key] = 'Campo obrigatório.'; continue; }
    if (f.type === 'number') {
      const n = Number(raw);
      if (!Number.isFinite(n)) { errors[f.key] = 'Informe um número.'; continue; }
      if (f.min !== undefined && n < f.min) errors[f.key] = `Mínimo ${f.min}.`;
      if (f.max !== undefined && n > f.max) errors[f.key] = `Máximo ${f.max}.`;
      continue;
    }
    const s = String(raw);
    if (f.type === 'select' && f.options && !f.options.includes(s)) errors[f.key] = 'Opção inválida.';
    else if (f.type === 'date' && !(/^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)))) errors[f.key] = 'Data inválida (AAAA-MM-DD).';
    else if (f.type === 'url' && !/^https:\/\/[^\s]+$/.test(s)) errors[f.key] = 'Use um endereço https://.';
    else if (f.minLen && s.trim().length < f.minLen) errors[f.key] = `Mínimo de ${f.minLen} caracteres.`;
    else if (f.maxLen && s.length > f.maxLen) errors[f.key] = `Máximo de ${f.maxLen} caracteres.`;
    else if (f.pattern && !f.pattern.test(s)) errors[f.key] = f.patternMessage ?? 'Formato inválido.';
    else if (f.noSecret && looksLikeSecret(s)) errors[f.key] = 'Parece um segredo/credencial. Não é aceito aqui: use o cofre do ambiente.';
  }
  return errors;
}
