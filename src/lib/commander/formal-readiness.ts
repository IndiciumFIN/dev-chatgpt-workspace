/** Advisory only: PMO entries are not formal WO admissions. */
export const formalWoEvidenceFields = ['objective','scope','approver','sourceRef','policySet','riskLevel','dataClassification','securityImpact','environment','manifestId','approvals'] as const;

export function inspectFormalWoEvidence(item: object) {
  const data = item as Record<string, unknown>;
  const missing = formalWoEvidenceFields.filter(key => {
    const value = data[key];
    return value === undefined || value === null || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0);
  });
  return {missing, admission: 'NOT_VERIFIED' as const, executionAllowed: false as const};
}
