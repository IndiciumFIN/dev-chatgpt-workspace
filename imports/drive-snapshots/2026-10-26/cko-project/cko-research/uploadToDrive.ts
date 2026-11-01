import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Uploads a file to Google Drive inside the CKO-Project folder structure.
// Expected body: { url, path, mimeType, rootName? }
//   - url: public URL of the file content (fetched server-side)
//   - path: relative path inside root, e.g. "cko-schemas/CKO-DIS-000001.json"
//   - mimeType: e.g. "application/json", "text/markdown", "text/plain"
//   - rootName: root Drive folder name (default "CKO-Project")
export default async function (req) {
  const body = await req.json();
  const { url, path, mimeType, rootName } = body;

  if (!url || !path) {
    return Response.json({ error: "Missing url or path" }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledrive");
  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  const DRIVE_API = "https://www.googleapis.com/drive/v3";
  const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3";

  // 1. Find or create a folder by name inside a parent (or root)
  const findOrCreateFolder = async (name, parentId) => {
    const q = [`name='${name}'`, "mimeType='application/vnd.google-apps.folder'", "trashed=false"];
    if (parentId) q.push(`'${parentId}' in parents`);
    else q.push("'root' in parents");

    const listRes = await fetch(
      `${DRIVE_API}/files?q=${encodeURIComponent(q.join(" and "))}&fields=files(id,name)`,
      { headers: authHeaders }
    );
    if (listRes.ok) {
      const found = (await listRes.json()).files || [];
      if (found.length > 0) return found[0].id;
    }

    const meta = { name, mimeType: "application/vnd.google-apps.folder" };
    if (parentId) meta.parents = [parentId];
    const createRes = await fetch(`${DRIVE_API}/files`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(meta),
    });
    if (!createRes.ok) {
      throw new Error(`Folder create failed: ${createRes.status} ${await createRes.text()}`);
    }
    return (await createRes.json()).id;
  };

  try {
    // 2. Ensure root folder
    const root = rootName || "CKO-Project";
    let currentParent = await findOrCreateFolder(root, null);

    // 3. Ensure nested folders from path
    const parts = path.split("/");
    const fileName = parts.pop();
    for (const folder of parts) {
      if (folder) currentParent = await findOrCreateFolder(folder, currentParent);
    }

    // 4. Fetch file content from the public URL
    const contentRes = await fetch(url);
    if (!contentRes.ok) {
      return Response.json({ error: `Failed to fetch source: ${contentRes.status}` }, { status: 502 });
    }
    const buf = new Uint8Array(await contentRes.arrayBuffer());

    // 5. Multipart upload to Drive
    const boundary = "cko_boundary_" + Date.now();
    const metadata = JSON.stringify({
      name: fileName,
      mimeType: mimeType || "application/octet-stream",
      parents: [currentParent],
    });

    const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${
      mimeType || "application/octet-stream"
    }\r\n\r\n`;
    const tail = `\r\n--${boundary}--`;

    const headBytes = new TextEncoder().encode(head);
    const tailBytes = new TextEncoder().encode(tail);
    const payload = new Uint8Array(headBytes.length + buf.length + tailBytes.length);
    payload.set(headBytes, 0);
    payload.set(buf, headBytes.length);
    payload.set(tailBytes, headBytes.length + buf.length);

    const upRes = await fetch(`${DRIVE_UPLOAD}/files?uploadType=multipart&fields=id,name,webViewLink,size`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: payload,
    });

    if (!upRes.ok) {
      return Response.json(
        { error: `Drive upload failed: ${upRes.status}`, detail: await upRes.text() },
        { status: 502 }
      );
    }

    const result = await upRes.json();
    return Response.json({
      ok: true,
      path: `${root}/${path}`,
      fileName,
      fileId: result.id,
      webViewLink: result.webViewLink,
      size: result.size,
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
