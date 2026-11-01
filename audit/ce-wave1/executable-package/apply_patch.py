#!/usr/bin/env python3
"""Non-mutating candidate verifier and placement plan.

No WO string, issue label or local file can attest Kernel admission. Consequently
this installer refuses --apply; only the authorized external kernel executor may
perform writes after verifying its independently trusted admission decision.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
BRANCH = 'integration/structural-overlay-20261101'
BASE = '081c61ac6c6ea674934d1cad3c310e96476fc9a1'

def sh(repo: Path, *args: str) -> str:
    p = subprocess.run(['git', *args], cwd=repo, text=True,
                       capture_output=True, check=False)
    if p.returncode:
        raise RuntimeError(f"git {args[0]} failed: {p.stderr.strip()[:400]}")
    return p.stdout.strip()

def verify_package(manifest: dict) -> None:
    seen = set()
    for item in manifest['files']:
        relative = item['path']
        path = Path(relative)
        if (path.is_absolute() or '..' in path.parts or not path.parts or
            relative in seen or not re.fullmatch(r'[a-f0-9]{64}', item['sha256'])):
            raise RuntimeError(f'UNSAFE_OR_DUPLICATE_PATH: {relative}')
        seen.add(relative)
        source = ROOT / path
        if not source.is_file() or source.is_symlink():
            raise RuntimeError(f'MISSING_OR_SYMLINK: {relative}')
        if hashlib.sha256(source.read_bytes()).hexdigest() != item['sha256']:
            raise RuntimeError(f'PATCH_HASH_MISMATCH: {relative}')

def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--repo', type=Path)
    p.add_argument('--verify-package', action='store_true')
    p.add_argument('--apply', action='store_true', help='Blocked until trusted Kernel execution is available')
    p.add_argument('--work-order', help='Information only: NOT proof of authorization')
    a = p.parse_args()
    manifest = json.loads((ROOT/'PATCH_MANIFEST.json').read_text(encoding='utf8'))
    verify_package(manifest)
    if a.apply:
        raise RuntimeError('EXTERNAL_KERNEL_ADMISSION_VERIFIER_NOT_CONFIGURED:LOCAL_WRITE_DENIED')
    if a.verify_package:
        print(json.dumps({'verdict': 'PACKAGE_INTEGRITY_OK', 'files': len(manifest['files']),
                          'kernelAdmission': 'NOT_VERIFIED', 'writes': False}))
        return 0
    if a.repo is None:
        p.error('--repo required for read-only placement plan')
    repo = a.repo.resolve(strict=True)
    if not (repo/'.git').exists():
        raise RuntimeError('NOT_A_FULL_GIT_CHECKOUT')
    branch = sh(repo,'branch','--show-current')
    if branch != BRANCH:
        raise RuntimeError(f'NOT_ISOLATED_BRANCH:{branch}')
    sh(repo,'merge-base','--is-ancestor',BASE,'HEAD')
    if sh(repo,'status','--porcelain'):
        raise RuntimeError('DIRTY_CHECKOUT_NO_PLACEMENT_PLAN')
    actions = []
    for item in manifest['files']:
        rel = item['path']
        dst = repo / rel
        if any(x.is_symlink() for x in [dst, *dst.parents] if x != repo and repo in x.parents):
            raise RuntimeError('SYMLINK_TARGET_OR_PARENT:'+rel)
        if dst.exists():
            if not dst.is_file():
                raise RuntimeError('NONFILE_TARGET:'+rel)
            if dst.read_bytes() == (ROOT/rel).read_bytes():
                status = 'IDENTICAL'
            else:
                expected = item.get('original_git_blob')
                actual = sh(repo,'hash-object','--',rel)
                if expected is None or actual != expected:
                    raise RuntimeError('BLOB_DRIFT_OR_UNEXPECTED_TARGET:'+rel)
                status = 'CANDIDATE_REPLACEMENT'
        else:
            if item.get('original_git_blob'):
                raise RuntimeError('EXPECTED_EXISTING_TARGET_MISSING:'+rel)
            status = 'CANDIDATE_ADDITION'
        actions.append({'path':rel,'action':status})
    print(json.dumps({'verdict':'DRY_RUN_ONLY', 'branch': branch,
                      'head': sh(repo,'rev-parse','HEAD'), 'baseline': BASE,
                      'kernelAdmission':'NOT_VERIFIED','writeAllowed':False,
                      'actions':actions},indent=2))
    return 0

if __name__ == '__main__':
    try: sys.exit(main())
    except Exception as exc:
        print('HOLD: '+str(exc),file=sys.stderr)
        sys.exit(2)
