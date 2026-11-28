/** Veto de publicação. Só sai com licença verificada e admissão clínica. Não é release. */
export function isClinicalRightsHeld(slug: string): boolean {
  return slug === "braden" || slug === "morse";
}
