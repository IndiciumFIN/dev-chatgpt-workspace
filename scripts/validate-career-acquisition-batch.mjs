#!/usr/bin/env node
import { readFileSync } from "node:fs";

const arg = process.argv[2];
if (!arg || arg === "--help") {
  console.log("Uso: node scripts/validate-career-acquisition-batch.mjs <batch.json>");
  console.log("Valida fonte, integridade, deduplicacao e campos obrigatorios. Nao grava no banco.");
  process.exit(0);
}

const batch = JSON.parse(readFileSync(arg, "utf8"));
const errors = [];
const req = (obj, key, path) => {
  if (obj?.[key] === undefined || obj?.[key] === null || obj?.[key] === "") errors.push(`${path}.${key}: obrigatorio`);
};
const isUri = (value) => {
  try { new URL(value); return true; } catch { return false; }
};

if (batch.schemaVersion !== "0.1.0") errors.push("schemaVersion: esperado 0.1.0");
if (!["OPPORTUNITY","LEARNING_RESOURCE","MARKET_OBSERVATION","JURISDICTION_REQUIREMENT","EDITORIAL_SOURCE"].includes(batch.objectFamily)) {
  errors.push("objectFamily: invalido");
}
if (!Array.isArray(batch.records)) errors.push("records: array obrigatorio");

const source = batch.source ?? {};
for (const key of ["id","source_type","title","authority","uri","pinpoint","rights","jurisdiction","retrieved_at","sha256","snapshot_ref","status"]) req(source,key,"source");
if (source.uri && !isUri(source.uri)) errors.push("source.uri: URI invalida");
if (source.sha256 && !/^[a-f0-9]{64}$/.test(source.sha256)) errors.push("source.sha256: SHA-256 hexadecimal obrigatorio");
if (source.status && source.status !== "SOURCE_QUALIFIED") errors.push("source.status: lote de aquisicao exige SOURCE_QUALIFIED");

const seen = new Set();
for (const [index, record] of (batch.records ?? []).entries()) {
  const path = `records[${index}]`;
  req(record,"id",path);
  req(record,"dedupeKey",path);
  if (record.dedupeKey) {
    if (seen.has(record.dedupeKey)) errors.push(`${path}.dedupeKey: duplicado no lote`);
    seen.add(record.dedupeKey);
  }
  if (batch.objectFamily === "OPPORTUNITY") {
    for (const key of ["typeId","title","organization","jurisdiction","sourceLocator","status"]) req(record,key,path);
    if (record.sourceLocator && !isUri(record.sourceLocator)) errors.push(`${path}.sourceLocator: URI invalida`);
    if (record.publishedAt && record.expiresAt && new Date(record.expiresAt) < new Date(record.publishedAt)) errors.push(`${path}: expiresAt anterior a publishedAt`);
  }
  if (batch.objectFamily === "LEARNING_RESOURCE") {
    for (const key of ["resourceTypeId","title","provider","jurisdiction","sourceLocator","status"]) req(record,key,path);
    if (record.sourceLocator && !isUri(record.sourceLocator)) errors.push(`${path}.sourceLocator: URI invalida`);
    if (record.availableFrom && record.availableUntil && new Date(record.availableUntil) < new Date(record.availableFrom)) errors.push(`${path}: availableUntil anterior a availableFrom`);
  }
  if (batch.objectFamily === "MARKET_OBSERVATION") {
    for (const key of ["signalId","jurisdiction","statisticKind","observedValue","unit","methodologyNote","status"]) req(record,key,path);
    if (!["POSTED_SALARY","OFFICIAL_STATISTIC","SURVEY_ESTIMATE","MARKET_INDEX"].includes(record.statisticKind)) errors.push(`${path}.statisticKind: invalido`);
    if (typeof record.observedValue !== "number" || !Number.isFinite(record.observedValue)) errors.push(`${path}.observedValue: numero finito obrigatorio`);
  }
}

if (errors.length) {
  console.error(JSON.stringify({ valid:false, errorCount:errors.length, errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  valid:true,
  sourceId:source.id,
  objectFamily:batch.objectFamily,
  recordCount:batch.records.length,
  dedupeKeys:seen.size,
  writesPerformed:false
}, null, 2));
