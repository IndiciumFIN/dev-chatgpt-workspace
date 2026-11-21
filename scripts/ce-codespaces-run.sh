#!/usr/bin/env bash
# Read-only CE/W2.5 Codespaces and GitHub Actions launcher.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
command -v node >/dev/null || { echo 'Node.js 22 required' >&2; exit 2; }
out="$(printenv CE_REPORT_DIR || true)"
if [[ -z "$out" ]]; then out="$HOME/ce-relatorios"; fi
mkdir -p "$out"
echo '[1/3] Validate SHA-pinned W2.4 manifests and the W2.5 queue'
node scripts/ce-w2-5-action-queue.mjs --limit=100 > "$out/CE_P0_FILA_100.json"
echo '[2/3] Project four-wave preliminary evidence without admission'
node scripts/ce-w2-5-p0-evidence-reuse.mjs > "$out/CE_EVIDENCIAS.json"
echo '[3/3] Validate counters and publish summary (read-only)'
CE_REPORT_DIR="$out" node --input-type=module <<'JS'
import {readFileSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import {loadActionQueue} from "./scripts/ce-w2-5-action-queue.mjs";
import {projectEvidenceReuse} from "./scripts/ce-w2-5-p0-evidence-reuse.mjs";
const dir=process.env.CE_REPORT_DIR;
const q=loadActionQueue(100),r=projectEvidenceReuse();
if(q.p0_unique_objects!==359||r.total_p0_unique_objects!==359||r.total_p0_occurrences!==842||
   q.source_counts.branches!==23||r.source_manifest_batches!==6||r.independent_approvals!==0||
   q.merge_authorized!==false||r.merge_authorized!==false)throw Error("W2_5_CHECKPOINT_HOLD");
const summary={status:"PRELIMINARY_ONLY_NOT_RELEASED",branches:q.source_counts.branches,
  commits:q.source_counts.unique_commits,batches:r.source_manifest_batches,
  objects_total:q.distinct_review_objects,p0_unique:q.p0_unique_objects,
  p0_occurrences:r.total_p0_occurrences,p0_preliminarily_reviewed:r.reviewed_p0_unique_objects,
  p0_baseline_projectable:r.projectable_p0_unique_objects,
  p0_baseline_hold:r.unprojected_baseline_hold_objects,
  p0_pending:r.remaining_p0_unique_objects,approval_count:0,branches_sealed:0,
  exported_queue_items:q.queue.length,export_note:"Top 100 P0; 359 P0 inventoried; no semantic admission."};
writeFileSync(join(dir,"CE_RESUMO.json"),JSON.stringify(summary,null,2)+"\n");
const md=["# CE/NCOS - Codespaces W2.5 (read-only)","",
 "Manifestos verificados: "+r.source_manifest_batches+"/6",
 "Objetos P0: "+r.reviewed_p0_unique_objects+"/359 preliminares ("+r.unique_p0_preliminary_progress_percent+"%).",
 "Projetaveis com base compativel: "+r.projectable_p0_unique_objects+"/359.",
 "Pendentes primeira revisao: "+r.remaining_p0_unique_objects+".",
 "Fila exportada: 100 primeiros de 359, nao toda a fila.",
 "Aprovacoes independentes: 0. Branches SEALED: 0.",
 "HOLD: sem autorizacao de merge, publicacao clinica ou alteracao de banco."];
writeFileSync(join(dir,"CE_RELATORIO.md"),md.join("\n")+"\n");
console.log(JSON.stringify(summary));
JS
echo "Reports: $out"
echo 'No Git write, DB modification, deploy, clinical approval or branch closure.'
