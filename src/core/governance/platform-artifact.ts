export type PlatformArtifact =
  | { kind: "source"; value: any }
  | { kind: "api"; value: any }
  | { kind: "directory"; value: any }
  | { kind: "template"; value: any }
  | { kind: "work-order"; value: any }
  | { kind: "manifest"; value: any }
  | { kind: "evidence"; value: any };

export async function validateGovernedArtifact(artifact: PlatformArtifact): Promise<boolean> {
  const resource = artifact.value;

  if (!resource?.id) return false;
  if (!resource?.templateId && artifact.kind !== "template") return false;
  if (!resource?.normativeIds?.length) return false;
  if (!resource?.validators?.length) return false;
  if (!resource?.hash) return false;

  if (artifact.kind === "directory" && !resource.path) return false;
  if (artifact.kind === "api" && (!resource.path || !resource.method)) return false;
  if (artifact.kind === "work-order" && (!resource.owner || !resource.approver)) return false;

  return true;
}
