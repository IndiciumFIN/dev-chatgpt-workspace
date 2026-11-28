#!/usr/bin/env python3
"""Authorized local retirement executor, dry-run by default. Never changes main."""
import argparse
import json
import re
import runpy
import subprocess
from pathlib import Path
from urllib.parse import quote

REPO = "IndiciumFIN/dev-chatgpt-workspace"
COHORT = "registers/governance/ce-branch-live-cohort-20261121.v1.json"
PRIORITY = {"archivamento", "planning", "fix/ce-admin-e2e-hierarchy-20261101"}
SHA = re.compile(r"^[a-f0-9]{40}$")
ORIGINS = {"https://github.com/" + REPO + suffix for suffix in ("", ".git")} | {
    "git@github.com:" + REPO + ".git", "ssh://git@github.com/" + REPO + ".git"}
def must(ok, message):
    if not ok:
        raise ValueError(message)
def cmd(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout.strip()
def git(*args):
    return cmd("git", *args)
def gh(route, paginate=False):
    flags = ["--paginate", "--slurp"] if paginate else []
    return json.loads(cmd("gh", "api", *flags, "repos/" + REPO + route))
def refs():
    rows = {}
    for line in git("ls-remote", "--heads", "origin").splitlines():
        sha, ref = line.split("\t")
        must(SHA.fullmatch(sha) and ref.startswith("refs/heads/") and ref not in rows, "invalid remote ref")
        rows[ref] = sha
    return rows
def eligible_rows(ledger, selected):
    must(bool(selected) and len(selected) == len(set(selected)) and set(selected) <= PRIORITY, "outside priority allowlist")
    by_name = {r["branch"]:r for r in ledger["technical_retirement"]["rows"]}
    rows = []
    for name in selected:
        row = by_name.get(name)
        must(row and row["state"] == "RETIREMENT_ELIGIBLE" and row["blocking_checks"] == [], "not eligible: " + name)
        must(SHA.fullmatch(row["source_sha"]), "invalid source SHA")
        rows.append(row)
    return rows
def deletion_args(rows):
    must(bool(rows) and len(rows) <= len(PRIORITY), "invalid batch")
    names = [r["branch"] for r in rows]
    must(len(names) == len(set(names)) and set(names) <= PRIORITY, "invalid deletion targets")
    for r in rows:
        must(SHA.fullmatch(r["source_sha"]), "invalid lease SHA")
    return ["push", "--atomic", *["--force-with-lease=refs/heads/"+r["branch"]+":"+r["source_sha"] for r in rows],
            "origin", *[":refs/heads/"+r["branch"] for r in rows]]
def assert_no_prs(rows):
    names = {r["branch"] for r in rows}
    pages = gh("/pulls?state=open&per_page=100", True)
    must(isinstance(pages,list) and all(isinstance(page,list) for page in pages), "invalid PR census")
    for page in pages:
        for p in page:
            must(p["head"]["ref"] not in names and p["base"]["ref"] not in names, "open PR dependency #"+str(p["number"]))
def assert_no_runs(rows):
    names = {r["branch"] for r in rows}
    for status in ("queued","in_progress","requested","waiting","pending"):
        pages = gh("/actions/runs?status="+status+"&per_page=100", True)
        must(isinstance(pages,list) and pages, "invalid workflow census")
        actual = sum(len(p["workflow_runs"]) for p in pages)
        must(actual == pages[0]["total_count"], "incomplete workflow census")
        for page in pages:
            for run in page["workflow_runs"]:
                must(run.get("head_branch") not in names, "active workflow dependency")
def assert_ci(main):
    pages = gh("/commits/"+main+"/check-runs?per_page=100", True)
    must(isinstance(pages,list) and bool(pages), "invalid check census")
    checks = [c for page in pages for c in page["check_runs"]]
    must(all(page["total_count"] == len(checks) for page in pages) and len({c["id"] for c in checks}) == len(checks), "incomplete or unstable check census")
    must(any(c["name"]=="verify" and c["status"]=="completed" and c["conclusion"]=="success" for c in checks), "main verify not passed")
    must(all(c["status"]=="completed" and c["conclusion"] in ("success","neutral","skipped") for c in checks), "main checks pending/failing")
def run(args):
    root = Path(git("rev-parse","--show-toplevel")).resolve()
    must(Path.cwd().resolve() == root, "run at repository root")
    must(git("remote","get-url","origin") in ORIGINS and git("remote","get-url","--push","origin") in ORIGINS, "wrong origin")
    must(git("status","--porcelain") == "", "working tree not clean")
    must(git("symbolic-ref","--short","HEAD") == "main", "checkout main required")
    main = git("rev-parse","HEAD")
    before = refs()
    must(before.get("refs/heads/main") == main, "local main not current")
    ledger = json.loads((root/COHORT).read_text(encoding="utf-8"))
    runpy.run_path(str(root/"scripts/ce-branch-closure.py"))["validate_retirement"](ledger,root)
    rows = eligible_rows(ledger,args.branch)
    baseline = ledger["technical_retirement"]["main_sha"]
    git("merge-base","--is-ancestor",baseline,main)
    for row in rows:
        name,sha = row["branch"],row["source_sha"]
        must(before.get("refs/heads/"+name)==sha,"remote SHA drift: "+name)
        git("merge-base","--is-ancestor",sha,main)
        remote = gh("/branches/"+quote(name,safe=""))
        must(remote["commit"]["sha"]==sha and remote["protected"] is False,"protected or changed branch: "+name)
    assert_no_prs(rows)
    assert_no_runs(rows)
    assert_ci(main)
    must(refs()==before,"remote refs moved during preflight")
    plan = {"mode":"EXECUTE" if args.execute else "DRY_RUN","main_sha":main,
            "targets":[{"branch":r["branch"],"source_sha":r["source_sha"]} for r in rows]}
    print(json.dumps(plan,indent=2),flush=True)
    if not args.execute:
        return
    must(args.execution_ref and re.fullmatch(r"https://github[.]com/IndiciumFIN/dev-chatgpt-workspace/issues/33#issuecomment-[0-9]+",args.execution_ref),"execution authorization record required")
    must(args.receipt_dir is not None,"receipt directory required")
    dest = args.receipt_dir.resolve()
    must(dest!=root and root not in dest.parents,"receipt directory outside repository required")
    dest.mkdir(parents=True,exist_ok=False)
    # Repeat dependency checks immediately before conditional atomic delete.
    assert_no_prs(rows)
    assert_no_runs(rows)
    must(refs()==before,"remote refs moved before deletion")
    git(*deletion_args(rows))
    after = refs()
    must(after.get("refs/heads/main")==main,"main changed concurrently: manual readback required")
    for row in rows:
        must("refs/heads/"+row["branch"] not in after,"remote ref still present")
    for row in rows:
        receipt = {"protocol":"CE.BRANCH.RETIREMENT.RECEIPT.v1","branch":row["branch"],
                   "expected_sha":row["source_sha"],"eligibility_sha256":row["eligibility_evidence"]["sha256"],
                   "method":"GIT_FORCE_WITH_LEASE_DELETE","remote_ref_absent":True,"main_preserved":True,
                   "post_main_sha":main,"execution_ref":args.execution_ref}
        (dest/(row["branch"].replace("/","_")+".json")).write_text(json.dumps(receipt,indent=2)+"\n",encoding="utf-8")
    print("Deletion readback confirmed; receipts require review and ledger integration.")
def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--branch",action="append",required=True)
    parser.add_argument("--execute",action="store_true")
    parser.add_argument("--execution-ref")
    parser.add_argument("--receipt-dir",type=Path)
    args = parser.parse_args()
    try:
        run(args)
        return 0
    except (ValueError,KeyError,TypeError,OSError,subprocess.CalledProcessError) as e:
        print("RETIREMENT HOLD: "+str(e))
        return 2
if __name__ == "__main__":
    raise SystemExit(main())
