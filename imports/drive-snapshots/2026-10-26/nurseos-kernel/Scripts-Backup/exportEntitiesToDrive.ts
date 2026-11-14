Deno.serve(async (req) => {
  try {
    const { createClientFromRequest } = await import("npm:@base44/sdk@0.8.31");
    const base44 = createClientFromRequest(req);

    const ROOT_ID = "1jSVF8iR8K1bKxoK16pyynxAxzrmvdcyF";
    const ENTITY_NAMES = [
      "Agent", "AgentPolicy", "AgentRun", "SafetyEvent", "PolicyEvidence",
      "PatientTwin", "NurseTwin", "UnitTwin", "Capability", "KnowledgeLicense",
      "TwinEvent", "OrganizationTwin", "WorkforceTwin", "Outcome", "Contradiction",
      "KnowledgeChange", "RegulatoryItem", "SafetyCase", "CausalHypothesis",
      "ThreatEvent", "BehaviorProfile", "DelegationRequest", "NormSource",
      "NormDocument", "NormAtom", "DictionaryTerm", "ExtractionRun", "ServiceOrder",
    ];

    // Token do Google Drive via conector autorizado
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledrive");
    if (!accessToken) return Response.json({ error: "sem token googledrive" }, { status: 500 });
    const auth = { Authorization: `Bearer ${accessToken}` };

    // Pasta "Dados-Banco-Agentes" no root do backup
    const mk = (name, parent) =>
      fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parent] }),
      }).then(r => r.json());

    const folder = await mk("Dados-Banco-Agentes", ROOT_ID);
    const folderId = folder.id;

    const upload = async (name, parent, content) => {
      const boundary = "b44dump";
      const payload =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify({ name, parents: [parent] }) + `\r\n` +
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n` + content + `\r\n` +
        `--${boundary}--`;
      const res = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
        {
          method: "POST",
          headers: { ...auth, "Content-Type": `multipart/related; boundary=${boundary}` },
          body: payload,
        }
      );
      if (!res.ok) throw new Error(`upload ${name}: ${res.status} ${await res.text()}`);
      return (await res.json()).id;
    };

    const results = {};
    for (const en of ENTITY_NAMES) {
      try {
        const records = await base44.asServiceRole.entities[en].list();
        results[en] = records.length;
        await upload(`${en}.json`, folderId, JSON.stringify(records, null, 2));
      } catch (e) {
        results[en] = `ERRO: ${String(e).slice(0, 120)}`;
      }
    }

    return Response.json({ folderId, results });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
});
