/** Temporary publication veto; remove only with verified rights and clinical admission. */
export function isClinicalRightsHeld(slug: string): boolean {
  return slug === "braden" || slug === "morse";
}
