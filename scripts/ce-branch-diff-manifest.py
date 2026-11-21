#!/usr/bin/env python3
"""CE read-only per-branch Git tree reconciliation; NEVER merge, seal, or deploy.

Full manifest records every path, Git object SHA/type/mode at source and main,
classification, decision, rationale and test evidence. Private textual patches
are opt-in, local-only and never part of a public manifest.
"""
from __future__ import annotations
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import gzip
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys

PROTO = "CE.BRANCH.PATH.MANIFEST.v1"
COHORT = "CE.BRANCH.COHORT.v1"
SHA = re.compile(r"^[a-f0-9]{40}$")
ALLOWED_REVIEW = {"SUPERSEDED_WITH_PROOF", "INTEGRATE_WITH_PR", "REJECTED_WITH_PROOF", "HOLD_HUMAN", "HOLD_EVIDENCE"}


def git(repo: Path, *args: str) -> bytes:
    out = subprocess.run(["git", "-C", str(repo), *args], capture_output=True, check=False)
    if out.returncode:
        raise ValueError("git operation failed (exit %s): %s" % (out.returncode, out.stderr.decode("utf-8", "replace")[:180]))
    return out.stdout


def sha_commit(repo: Path, ref: str) -> str:
    resolved = git(repo, "rev-parse", "--verify", ref + "^{commit}").decode("ascii").strip()
    if not SHA.fullmatch(resolved):
        raise ValueError("not a commit SHA-1: " + ref)
    return resolved


def tree(repo: Path, commit: str) -> str:
    value = git(repo, "rev-parse", "--verify", commit + "^{tree}").decode("ascii").strip()
    if not SHA.fullmatch(value):
        raise ValueError("invalid tree SHA")
    return value


def entries(repo: Path, commit: str) -> dict[str, dict[str, str | None]]:
    """Git's NUL mode handles spaces, unicode, TAB, and quotes in paths."""
    out = {}
    for record in git(repo, "ls-tree", "-r", "-z", "--full-tree", commit).split(b"\0"):
        if not record:
            continue
        head, name = record.split(b"\t", 1)
        mode, typ, oid = head.decode("ascii").split(" ")
        if not SHA.fullmatch(oid) or typ not in ("blob", "commit"):
            raise ValueError("unexpected ls-tree entry type/sha")
        path = name.decode("utf-8", "surrogateescape")
        if path in out:
            raise ValueError("duplicate path")
        out[path] = {"object_sha": oid, "blob_sha": oid if typ == "blob" else None,
                     "mode": mode, "type": typ}
    return out


def changes(repo: Path, src: str, main: str) -> dict[str, dict]:
    out = {}
    raw = git(repo, "-c", "core.quotePath=false", "diff", "--no-ext-diff", "--no-renames", "--numstat", "-z", src, main)
    for block in raw.split(b"\0"):
        if not block:
            continue
        ins, outs, name = block.split(b"\t", 2)
        path = name.decode("utf-8", "surrogateescape")
        out[path] = {"lines_added_to_main": None if ins == b"-" else int(ins),
                     "lines_removed_from_source": None if outs == b"-" else int(outs),
                     "binary": ins == b"-" or outs == b"-"}
    return out


def safe_name(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_.-]", "-", name).strip(".-")[:65] or "branch"
    return cleaned + "-" + hashlib.sha256(name.encode("utf-8")).hexdigest()[:12]


def git_ref(name: str, remote: str) -> str:
    if name.startswith("refs/"):
        return name
    if not name or name.startswith("-") or name.startswith("/") or ".." in name or "\\" in name:
        raise ValueError("unsafe branch name")
    return "refs/remotes/" + remote + "/" + name


def cite(side: dict | None) -> dict | None:
    return dict(side) if side else None


def decision_for(status: str, src: dict | None, main: dict | None) -> dict:
    if status == "EXACT_BLOB_MODE_TYPE":
        return {"status": "EXACT_IN_MAIN_PROVEN", "justification": "Mesmo Git object SHA, tipo e mode nos dois trees imutaveis.",
                "tests_evidence": [{"type": "GIT_LS_TREE_IDENTITY", "status": "PASS", "source": src, "main": main}]}
    return {"status": "HOLD_SEMANTIC_REVIEW",
            "justification": "Diferenca de inventario Git: revisar conteudo/contrato, riscos, direitos e testes antes de concluir.",
            "tests_evidence": [{"type": "GIT_LS_TREE_DIFFERENCE", "status": "PASS", "source": src, "main": main},
                               {"type": "SEMANTIC_TEST_AND_PR_SHA", "status": "NOT_EXECUTED"}]}


def classify(src: dict | None, main: dict | None) -> str:
    if src is None:
        return "MAIN_ONLY"
    if main is None:
        return "SOURCE_ONLY"
    if src == main:
        return "EXACT_BLOB_MODE_TYPE"
    if src["type"] != main["type"]:
        return "TYPE_DIFFERENT"
    diffmode = src["mode"] != main["mode"]
    diffblob = src["object_sha"] != main["object_sha"]
    return "BLOB_AND_MODE_DIFFERENT" if diffmode and diffblob else "MODE_DIFFERENT" if diffmode else "BLOB_DIFFERENT"


def review_row(row: dict, review: dict | None) -> None:
    if review is None:
        return
    identity = ["source_blob_sha", "main_blob_sha", "source_mode", "main_mode"]
    actual = [row["source"]["blob_sha"] if row["source"] else None,
              row["main"]["blob_sha"] if row["main"] else None,
              row["source"]["mode"] if row["source"] else None,
              row["main"]["mode"] if row["main"] else None]
    if [review.get(k) for k in identity] != actual:
        row["decision"] = {"status": "HOLD_STALE_REVIEW", "justification": "Revisao invalida: blob/mode do source ou da main mudou.",
                           "tests_evidence": [{"type": "GIT_PINNED_REVIEW", "status": "FAIL"}]}
        return
    proposed = review.get("decision")
    justification = review.get("justification", "")
    evidence = review.get("tests_evidence", [])
    if proposed not in ALLOWED_REVIEW or not isinstance(justification, str) or len(justification) < 30 or not isinstance(evidence, list) or not evidence:
        row["decision"] = {"status": "HOLD_INCOMPLETE_REVIEW", "justification": "Decisao proposta sem justificativa >= 30 caracteres e provas enumeradas.",
                           "tests_evidence": [{"type": "REVIEW_SCHEMA", "status": "FAIL"}]}
        return
    if any(not isinstance(e, dict) or not e.get("ref") or not e.get("type") for e in evidence):
        row["decision"] = {"status": "HOLD_INVALID_EVIDENCE", "justification": "Teste/evidencia sem tipo e referencia independente.",
                           "tests_evidence": [{"type": "EVIDENCE_REFERENCE", "status": "FAIL"}]}
        return
    row["review_proposal"] = {"decision": proposed, "justification": justification, "tests_evidence": evidence}
    row["decision"] = {"status": "HOLD_EXTERNAL_EVIDENCE_VERIFICATION",
                       "justification": "Proposta vinculada a blobs exatos; links, CI, direitos e aprovacao nao foram verificados por esta ferramenta offline.",
                       "tests_evidence": [{"type": "GIT_PINNED_REVIEW", "status": "PASS"},
                                          {"type": "INDEPENDENT_EVIDENCE_AND_GATES", "status": "PENDING"}]}


def reconcile(repo: Path, source_name: str, source_ref: str, main_ref: str, expected: str | None = None,
              expected_main: str | None = None, review: dict | None = None) -> dict:
    main_sha = sha_commit(repo, main_ref)
    source_sha = sha_commit(repo, source_ref)
    source_tree, main_tree = tree(repo, source_sha), tree(repo, main_sha)
    a, b = entries(repo, source_sha), entries(repo, main_sha)
    stats = changes(repo, source_sha, main_sha)
    merge_base = subprocess.run(["git", "-C", str(repo), "merge-base", source_sha, main_sha], capture_output=True, check=False)
    if merge_base.returncode not in (0, 1):
        raise ValueError("git merge-base error")
    mb = merge_base.stdout.decode("ascii").strip() if merge_base.returncode == 0 else None
    status = subprocess.run(["git", "-C", str(repo), "rev-list", "--left-right", "--count", main_sha + "..." + source_sha], capture_output=True, check=False)
    if status.returncode == 0:
        behind, ahead = [int(x) for x in status.stdout.split()]
    else:
        behind, ahead = None, None
    reviews = {}
    stale_overall = False
    if review is not None:
        if review.get("branch") != source_name or review.get("source_sha") != source_sha or review.get("main_sha") != main_sha:
            stale_overall = True
        else:
            for item in review.get("decisions", []):
                if not isinstance(item, dict) or not isinstance(item.get("path"), str) or item["path"] in reviews:
                    raise ValueError("duplicate/invalid review path")
                reviews[item["path"]] = item
    records=[]
    for path in sorted(set(a) | set(b)):
        src, target = cite(a.get(path)), cite(b.get(path))
        kind = classify(src, target)
        record = {"path": path, "source": src, "main": target, "diff_class": kind,
                  "diff_stat_source_to_main": stats.get(path), "decision": decision_for(kind, src, target)}
        if stale_overall and kind != "EXACT_BLOB_MODE_TYPE":
            record["decision"]={"status":"HOLD_STALE_REVIEW", "justification":"SHA global da fonte ou da main divergiu do arquivo de revisao.",
                                "tests_evidence":[{"type":"GIT_COMMIT_PIN", "status":"FAIL"}]}
        elif path in reviews and kind != "EXACT_BLOB_MODE_TYPE":
            review_row(record, reviews[path])
        records.append(record)
    if reviews and set(reviews) - {x["path"] for x in records}:
        raise ValueError("review references paths absent from pinned source/main")
    c=Counter(x["diff_class"] for x in records)
    statuses=Counter(x["decision"]["status"] for x in records)
    result={"protocol": PROTO, "generated_at": datetime.now(timezone.utc).isoformat(),
            "branch":source_name,
            "source":{"ref":source_ref,"sha":source_sha,"tree_sha":source_tree,"expected_sha":expected,
                      "head_drift":bool(expected and expected!=source_sha)},
            "main":{"ref":main_ref,"sha":main_sha,"tree_sha":main_tree,"expected_sha":expected_main,
                    "head_drift":bool(expected_main and expected_main!=main_sha)},
            "merge_base_sha":mb,"main_only_commits":behind,"source_only_commits":ahead,
            "scope":{"source_paths":len(a),"main_paths":len(b),"union_paths":len(records),
                     "identical":c["EXACT_BLOB_MODE_TYPE"],"divergent":len(records)-c["EXACT_BLOB_MODE_TYPE"],
                     "categories":dict(sorted(c.items())),"decisions":dict(sorted(statuses.items()))},
            "review_state":"HOLD_STALE_REVIEW" if stale_overall else "NOT_SUPPLIED" if review is None else "REVIEW_PROPOSALS_ONLY",
            "controls":{"all_paths_compared":True,"actual_source_tree_pinned":True,"actual_main_tree_pinned":True,
                        "auto_merge":False,"seal_branch":False,"delete_branch":False,"clinical_release":False,
                        "licensing_approved":False,"remote_db_write":False,"cross_source_drive_supabase":"NOT_EXECUTED",
                        "protected_main_ci":"NOT_VERIFIED"},
            "paths":records}
    return result


def dump(path: Path, data: bytes) -> None:
    fd=os.open(path, os.O_CREAT|os.O_EXCL|os.O_WRONLY, 0o600)
    with os.fdopen(fd,"wb") as stream:
        stream.write(data)


def write_bundle(repo: Path, out: Path, manifest: dict, private_diff: bool=False) -> dict:
    slug=safe_name(manifest["branch"])
    raw=json.dumps(manifest,ensure_ascii=True,sort_keys=True,separators=(",",":")).encode("utf-8")
    filename=slug+".manifest.json.gz"
    dump(out/filename,gzip.compress(raw,mtime=0))
    counts=manifest["scope"]
    summary={"protocol":"CE.BRANCH.SUMMARY.v1","branch":manifest["branch"],"main_sha":manifest["main"]["sha"],
             "source_sha":manifest["source"]["sha"],"source_tree_sha":manifest["source"]["tree_sha"],
             "main_tree_sha":manifest["main"]["tree_sha"],"manifest_file":filename,
             "manifest_uncompressed_sha256":hashlib.sha256(raw).hexdigest(),"coverage":counts,
             "head_drift":manifest["source"]["head_drift"] or manifest["main"]["head_drift"],
             "decisions_require_review":counts["divergent"],"sealed_for_release":False,"cross_source":"NOT_EXECUTED"}
    dump(out/(slug+".summary.json"),(json.dumps(summary,indent=2,ensure_ascii=True)+"\n").encode())
    diffrows=[p for p in manifest["paths"] if p["diff_class"]!="EXACT_BLOB_MODE_TYPE"]
    md=["# Branch diff: "+manifest["branch"].replace("|","/"),"",
        "Source "+manifest["source"]["sha"]+" to main "+manifest["main"]["sha"], "",
        "Identical: %s / Divergent: %s / SEALED: NO"%(counts["identical"],counts["divergent"]),"",
        "Metadata-only summary; private textual diff requires explicit flag.","",
        "| Path | Difference | Decision | Test |","|---|---|---|---|"]
    for p in diffrows:
        label=p["path"].replace("|","\\|").replace("\n"," ")
        md.append("| "+label+" | "+p["diff_class"]+" | "+p["decision"]["status"]+" | "+p["decision"]["tests_evidence"][-1]["status"]+" |")
    dump(out/(slug+".diff-summary.md"),("\n".join(md)+"\n").encode("utf-8"))
    if private_diff:
        patch=out/(slug+".PRIVATE.patch")
        fd=os.open(patch,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
        with os.fdopen(fd,"wb") as f:
            proc=subprocess.run(["git","-C",str(repo),"diff","--no-ext-diff","--no-renames","--binary","--no-color",
                                 manifest["source"]["sha"],manifest["main"]["sha"]],stdout=f,stderr=subprocess.PIPE,check=False)
        if proc.returncode:
            patch.unlink(missing_ok=True)
            raise ValueError("private git diff command failed")
        summary["private_patch_written_local_only"]=True
    return summary


def main(argv: list[str] | None=None) -> int:
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--repo",type=Path,default=Path.cwd())
    ap.add_argument("--main",default="main",help="main Git ref; e.g. refs/remotes/origin/main")
    ap.add_argument("--remote",default="origin")
    ap.add_argument("--branch",action="append",help="repeatable branch name/ref")
    ap.add_argument("--cohort",type=Path,help="versioned JSON cohort with 54 CE branch SHA observations")
    ap.add_argument("--out",type=Path,required=True,help="directory OUTSIDE checkout; private 0700")
    ap.add_argument("--private-diff",action="store_true",help="write PRIVATE patch with actual source content, never upload")
    ap.add_argument("--decisions-dir",type=Path,help="per-branch proposed decisions; never auto-approved")
    ap.add_argument("--strict-heads",action="store_true",help="exit 2 if snapshot moved or an expected branch is missing")
    ap.add_argument("--jobs",type=int,default=4,help="parallel read-only branch jobs, 1..8 (default 4)")
    a=ap.parse_args(argv)
    os.umask(0o077)
    try:
        if not 1 <= a.jobs <= 8:
            raise ValueError("--jobs must be between 1 and 8")
        root=Path(git(a.repo.resolve(),"rev-parse","--show-toplevel").decode().strip()).resolve()
        out=a.out.resolve()
        if out==root or root in out.parents:
            raise ValueError("output must be outside the Git checkout")
        if out.exists() and (out.stat().st_mode & 0o077):
            raise ValueError("output directory permissions must already be private 0700")
        out.mkdir(parents=True,exist_ok=True,mode=0o700)
        rows={}
        expected_main=None
        if a.cohort:
            scope=json.loads(a.cohort.read_text("utf-8"))
            if scope.get("protocol")!=COHORT or not isinstance(scope.get("branches"),list):
                raise ValueError("invalid CE cohort schema")
            expected_main=scope.get("main_sha")
            declared=scope.get("counts",{}).get("ce")
            if type(declared) is not int or declared != len(scope["branches"]):
                raise ValueError("CE cohort branch count disagrees with its declared coverage")
            for x in scope["branches"]:
                name=x.get("name")
                if not isinstance(name,str) or not SHA.fullmatch(str(x.get("sha"))) or name=="main" or name.startswith("wutrib/") or name in rows:
                    raise ValueError("invalid/duplicate or non-CE branch in cohort")
                rows[name]=x["sha"]
        selected=a.branch if a.branch is not None else list(rows)
        if not selected:
            raise ValueError("give --branch or --cohort: no global branch discovery without scope")
        if a.branch and rows and any(name not in rows for name in a.branch):
            raise ValueError("selected branch not in explicit CE cohort")
        main_ref=git_ref(a.main,a.remote)
        main_sha=sha_commit(root,main_ref)
        census_missing=[]
        census_extra=[]
        if rows:
            live_lines=git(root,"for-each-ref","--format=%(refname:strip=3)","refs/remotes/"+a.remote).decode("utf-8").splitlines()
            live_ce={n for n in live_lines if n and n not in ("main","HEAD") and not n.startswith("wutrib/")}
            census_missing=sorted(set(rows)-live_ce)
            census_extra=sorted(live_ce-set(rows))
            if census_missing or census_extra:
                print("HOLD_COHORT_COVERAGE missing=%d extra=%d"%(len(census_missing),len(census_extra)),file=sys.stderr)
        if a.strict_heads and expected_main and main_sha!=expected_main:
            raise ValueError("main SHA drift from cohort")
        summaries=[]
        incomplete=bool(census_missing or census_extra)
        def reconcile_one(name):
            ref=git_ref(name,a.remote)
            review=None
            if a.decisions_dir:
                decisionfile=a.decisions_dir/(safe_name(name)+".decisions.json")
                if decisionfile.is_file():
                    review=json.loads(decisionfile.read_text("utf-8"))
            try:
                result=reconcile(root,name,ref,main_ref,rows.get(name),expected_main,review)
            except ValueError as error:
                return None, False, str(error)
            drift=result["source"]["head_drift"] or result["main"]["head_drift"]
            return write_bundle(root,out,result,a.private_diff), drift, None
        with ThreadPoolExecutor(max_workers=a.jobs) as pool:
            futures={pool.submit(reconcile_one,name):name for name in selected}
            for i,future in enumerate(as_completed(futures),1):
                name=futures[future]
                summary,drift,error=future.result()
                print("[%d/%d] %s %s"%(i,len(selected),name,"HOLD" if error or drift else "INVENTORIED"),flush=True)
                if error:
                    incomplete=True
                    print("HOLD_MISSING_SOURCE_REF: "+name+" "+error,file=sys.stderr)
                elif summary is not None:
                    summaries.append(summary)
                    incomplete=incomplete or drift
        summaries.sort(key=lambda x:x["branch"])
        index={"protocol":"CE.BRANCH.RUN.INDEX.v1","main_sha":main_sha,"cohort_count":len(rows) if rows else None,
               "local_remote_ref_coverage_checked":bool(rows),
               "cohort_missing_remote_refs":census_missing,"cohort_new_remote_refs":census_extra,
               "requested":len(selected),"generated":len(summaries),"incomplete":incomplete or len(summaries)!=len(selected),
               "total_union_path_instances":sum(x["coverage"]["union_paths"] for x in summaries),
               "total_divergent_path_instances":sum(x["coverage"]["divergent"] for x in summaries),
               "branches":summaries,"seal_branch":False,"cross_source":"NOT_EXECUTED"}
        dump(out/"index.json",(json.dumps(index,indent=2,ensure_ascii=True)+"\n").encode())
        print("REPORT",str(out/"index.json"),"generated",len(summaries),"of",len(selected),"HOLD" if index["incomplete"] else "INVENTORY_COMPLETE_NOT_SEALED")
        return 2 if a.strict_heads and index["incomplete"] else 0
    except (OSError,ValueError,KeyError,json.JSONDecodeError,UnicodeError) as e:
        print("CE_BRANCH_MANIFEST_HOLD: "+str(e),file=sys.stderr)
        return 2

if __name__=="__main__":
    sys.exit(main())
