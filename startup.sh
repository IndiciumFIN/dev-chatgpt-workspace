#!/bin/sh
set -e
# O package.json do app está no repositório, não na raiz da sandbox.
cd /workspace/workspace-repo
if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >/tmp/dev-server.log 2>&1 &
exit 0
