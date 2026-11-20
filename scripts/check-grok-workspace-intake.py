#!/usr/bin/env python3
"""Deterministic CI gate for the complete user-provided Grok workspace ZIP.

The source ZIP is not committed. CI verifies every source path has a decision,
exact sha256 for restored files, and no unapproved/ephemeral file is tracked.
With --source-zip it also verifies all 102 original files byte-for-byte.
--release-gate is intentionally fail-closed while eligibility reviews remain.
"""
import argparse
import base64
from collections import Counter
from hashlib import sha256
import json
from pathlib import Path
import re
import subprocess
import sys
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = 'registers/governance/grok-workspace-intake.v1.json'
CODES = {
    'R': 'RESTORED', 'C': 'RECONCILED_CONFIG', 'X': 'EXCLUDE_EPHEMERAL',
    'F': 'HOLD_FONT_LICENSE', 'A': 'HOLD_ART_ASSET',
    'D': 'CANDIDATE_PLATFORM_DOC', 'S': 'CANDIDATE_PLATFORM_SKILL',
    'B': 'HOLD_SERVICE_BINDING', 'L': 'CANDIDATE_GAME_LICENSED',
    'G': 'CANDIDATE_GAME_OR_PLATFORM',
}

def stop(message):
    raise SystemExit('FAIL workspace ZIP CI gate: ' + message)

def file_digest(path):
    return sha256(Path(path).read_bytes()).digest()

def decode_digest(value):
    try:
        digest = base64.urlsafe_b64decode(value + '=' * (-len(value) % 4))
    except Exception:
        stop('bad checksum encoding in manifest')
    if len(digest) != 32:
        stop('checksum must contain full SHA256')
    return digest

def tracked_files(root):
    try:
        out = subprocess.check_output(['git', 'ls-files', '-z', '--', '.grok'], cwd=root)
    except (OSError, subprocess.CalledProcessError) as exc:
        stop('cannot check Git tracked paths: ' + str(exc))
    return {x.decode() for x in out.split(b'\0') if x}

def validate(root, archive_path=None, release=False):
    try:
        data = json.loads((root / MANIFEST).read_text(encoding='utf8'))
    except (OSError, ValueError) as exc:
        stop('manifest unreadable: ' + str(exc))
    files = data.get('files')
    if data.get('v') != '1.0' or data.get('entries') != 137 or not isinstance(files, dict) or len(files) != 102:
        stop('manifest must classify all 137 ZIP entries / 102 real files')
    expected_zip = data.get('zip', '')
    if not re.fullmatch(r'[a-f0-9]{64}', expected_zip):
        stop('missing pinned source ZIP SHA256')
    tracked = tracked_files(root)
    unexpected = tracked - set(files)
    if unexpected:
        stop('unclassified tracked .grok paths: ' + ', '.join(sorted(unexpected)[:12]))
    counts = Counter()
    for name, item in files.items():
        if not name.startswith('.grok/') or '..' in Path(name).parts or Path(name).is_absolute():
            stop('unsafe archive filename: ' + name)
        if not isinstance(item, list) or len(item) != 3:
            stop('invalid inventory entry: ' + name)
        encoded, size, code = item
        digest = decode_digest(encoded)
        if not isinstance(size, int) or size < 0 or code not in CODES:
            stop('invalid size or disposition: ' + name)
        counts[code] += 1
        target = root / name
        if code == 'R':
            if name not in tracked or not target.is_file() or target.is_symlink():
                stop('restored file missing or untracked: ' + name)
            if target.stat().st_size != size or file_digest(target) != digest:
                stop('restored source checksum drift: ' + name)
        elif code == 'C':
            if name != '.grok/app-env.json' or name not in tracked:
                stop('invalid canonical configuration reconciliation: ' + name)
            try:
                value = json.loads(target.read_text(encoding='utf8'))
            except (OSError, ValueError) as exc:
                stop('invalid canonical configuration: ' + str(exc))
            if value != {'VITE_AUTH_ENABLED': 'false'}:
                stop('source deploy.database setting must not override canonical auth-off')
        elif name in tracked:
            stop('pending/ephemeral archived file was committed without review: ' + name)
    if counts['R'] != 7 or counts['C'] != 1:
        stop('restored/reconciled baseline changed without promotion evidence')
    if archive_path:
        archive_path = Path(archive_path)
        if file_digest(archive_path).hex() != expected_zip:
            stop('original ZIP archive SHA256 mismatch')
        with ZipFile(archive_path) as z:
            info = z.infolist()
            names = {x.filename for x in info if not x.is_dir()}
            if len(info) != 137 or names != set(files):
                stop('source ZIP filenames differ from inventory')
            for name, (encoded, size, _) in files.items():
                raw = z.read(name)
                if len(raw) != size or sha256(raw).digest() != decode_digest(encoded):
                    stop('source ZIP byte mismatch at ' + name)
        print('PASS ZIP source reconciliation: 102/102 exact file hashes')
    pending = sum(counts[k] for k in 'FADSB LG'.replace(' ','') if k in counts)
    # Excluded ephemeral X is not a pending promotion; all other unresolved are.
    print('PASS full source classification: 102/102 source files')
    print('PASS restored content: 7/7 unchanged, plus 1 reconciled configuration')
    print('Dispositions:', ', '.join(f'{CODES[k]}={counts[k]}' for k in sorted(counts)))
    print(f'PENDING rights/functional/source reviews: {pending} files; NO-GO production')
    if release and pending:
        stop(f'release not eligible: {pending} candidates or HOLD items')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--source-zip', type=Path)
    parser.add_argument('--release-gate', action='store_true')
    args = parser.parse_args()
    validate(args.root.resolve(), args.source_zip, args.release_gate)

if __name__ == '__main__':
    main()
