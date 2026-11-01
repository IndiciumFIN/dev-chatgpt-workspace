#!/usr/bin/env node
/**
 * CE Curiosidades / MEM — extração local READ_ONLY para revisão editorial.
 *
 * Requer CE_CURIOSIDADES_READONLY_DATABASE_URL apontando para conta com SELECT
 * apenas no schema ce_curiosidades_v1. Nunca usar service_role no frontend.
 *
 * Saída apenas em .curiosidades-private-draft/ (gitignored), fora do build e
 * do diretório public/. Não publica conteúdo bloqueado.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outputDirectory = ".curiosidades-private-draft";
const url = process.env.CE_CURIOSIDADES_READONLY_DATABASE_URL?.trim();
if (!url) {
  console.error("BLOCKED: configure CE_CURIOSIDADES_READONLY_DATABASE_URL (somente leitura).");
  process.exit(2);
}
const { Pool } = await import("pg");
const pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 15000 });
try {
  await pool.query("BEGIN READ ONLY");
  const [pages, sources, pageSources, media] = await Promise.all([
    pool.query("SELECT slug, title, category, content_json, content_status, source_sha256, source_package, updated_at FROM ce_curiosidades_v1.pages ORDER BY slug"),
    pool.query("SELECT source_id, organization, title, url, doi, rights_status, web_status FROM ce_curiosidades_v1.sources ORDER BY source_id"),
    pool.query("SELECT slug, source_id, declared_in FROM ce_curiosidades_v1.page_sources ORDER BY slug, source_id"),
    pool.query("SELECT slug, media_key, rights_status, production_status, file_sha256 FROM ce_curiosidades_v1.media_registry ORDER BY slug, media_key"),
  ]);
  // O código nunca altera dados: BEGIN READ ONLY e apenas SELECT.
  await pool.query("COMMIT");
  const rows = pages.rows;
  if (rows.length !== 87 || new Set(rows.map((row) => row.slug)).size !== rows.length) {
    throw new Error("HOLD: baseline divergiu; não exportar pacote parcial/duplicado");
  }
  await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
  const payload = {
    schemaVersion: "1.0.0",
    provenance: { databaseSchema: "ce_curiosidades_v1", sourceTable: "pages", mode: "READ_ONLY" },
    publicationState: "DRAFT_ONLY_NOT_PUBLISHED",
    counts: { pages: rows.length, sources: sources.rows.length, pageSources: pageSources.rows.length, media: media.rows.length },
    pages: rows,
    sources: sources.rows,
    pageSources: pageSources.rows,
    media: media.rows,
  };
  const target = join(outputDirectory, "curiosidades-editorial.json");
  await writeFile(target, JSON.stringify(payload, null, 2) + "\n", { encoding: "utf8", mode: 0o600, flag: "w" });
  console.log(JSON.stringify({ status: "EXPORTED_PRIVATE_DRAFT", target, counts: payload.counts, published: 0 }));
} catch (error) {
  try { await pool.query("ROLLBACK"); } catch { /* conexão pode ter sido encerrada */ }
  console.error("HOLD: extração de Curiosidades não concluída: " + String(error instanceof Error ? error.message : error));
  process.exitCode = 1;
} finally {
  await pool.end();
}
