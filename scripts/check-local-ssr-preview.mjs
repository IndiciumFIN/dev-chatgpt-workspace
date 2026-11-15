#!/usr/bin/env node
/**
 * Safe local SSR smoke test of the reviewed Nitro output.
 * No external endpoints, tokens, DB migrations or production deploys.
 */
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const url = "http://127.0.0.1:8081/";
const command = process.platform === "win32" ? "npm.cmd" : "npm";
const child = spawn(command, ["run", "preview"], {
  env: { ...process.env, DATABASE_URL: "", VITE_AUTH_ENABLED: "false", CI: "true" },
  stdio: ["ignore", "pipe", "pipe"],
  // npm may spawn a Vite child; isolate a process group to stop both safely.
  detached: process.platform !== "win32"
});
let diagnostics = "";
for (const stream of [child.stdout, child.stderr]) {
  stream.setEncoding("utf8");
  stream.on("data", chunk => {
    // Keep only a bounded internal buffer; never print secrets or HTTP bodies.
    diagnostics = (diagnostics + chunk).slice(-2400);
  });
}
let verified = false;
let lastError = "SERVER_NOT_READY";
try {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (child.exitCode !== null) throw new Error("SSR_PREVIEW_EXITED_" + child.exitCode);
    try {
      const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(1400) });
      const mediaType = response.headers.get("content-type") || "";
      if (response.status !== 200 || !mediaType.includes("text/html")) {
        throw new Error("SSR_PREVIEW_WRONG_RESPONSE_" + response.status + "_" + mediaType.slice(0, 40));
      }
      const body = await response.text();
      if (!/<!doctype html|<html[\s>]/i.test(body)) {
        throw new Error("SSR_PREVIEW_NOT_HTML");
      }
      verified = true;
      console.log("CE_SSR_PREVIEW_SMOKE " + JSON.stringify({
        status: response.status, contentType: mediaType.split(";")[0],
        htmlBytes: Buffer.byteLength(body), valid: true, localOnly: true
      }));
      break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await delay(600);
    }
  }
  if (!verified) throw new Error("HOLD_LOCAL_SSR_PREVIEW_" + lastError);
} finally {
  if (process.platform !== "win32" && child.pid) {
    try { process.kill(-child.pid, "SIGTERM"); } catch { child.kill("SIGTERM"); }
  } else {
    child.kill("SIGTERM");
  }
  child.stdout.destroy();
  child.stderr.destroy();
  child.unref();
}
