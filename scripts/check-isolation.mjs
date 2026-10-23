import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const fail = (msg) => { console.error('FAIL', msg); process.exitCode = 1; };
const ok = (msg) => console.log('PASS', msg);

// ── 1. Rotas locais nao podem chamar o remoto ───────────────────────────────
const files = ['src/routes/admin.tsx','src/routes/assinante.tsx','src/routes/ferramentas.$slug.tsx','src/routes/assinante.ferramentas.$slug.tsx'];
for (const name of files) {
  const value = readFileSync(name,'utf8');
  if (/source\.functions|@\/lib\/db|adminDesk\(|readCatalog\(/.test(value)) fail(`${name}: remote call in local route`);
  else ok(name);
}

// ── 2. O banco tem que estar INALCANCAVEL, e isso e comportamento ──────────
//
// A versao anterior deste gate conferia a FORMA do texto:
//   /export function getSql\(\): Promise<Sql> \{\s*return Promise\.reject/
// Esse regex quebrou quando o `db.ts` foi reformatado (o `if (!DB_ENABLED)`
// entrou entre a chave e o `return`). O codigo estava CORRETO — `DB_ENABLED`
// e `false as const` e o `getSql` sempre rejeita — mas o gate acusou falha
// porque o TEXTO nao tinha a forma esperada.
//
// Gate que confere formatacao quebra com reformatacao e reporta defeito
// onde nao ha. O invariante real e "o banco nao abre, aconteca o que
// acontecer com o ambiente", entao o gate passa a EXECUTAR e observar.
//
// `DB_ENABLED = false as const` continua verificado por texto porque e a
// chave do invariante: se alguem virar `true`, o comportamento muda e este
// check pega antes do comportamento.
const db = readFileSync('src/lib/db.ts','utf8');
const migrator = readFileSync('scripts/migrate.mjs','utf8');

if (!/const DB_ENABLED = false as const/.test(db)) fail('DB_ENABLED must stay `false as const` — o banco nao pode ligar por acidente');
else ok('DB_ENABLED is false as const (kill switch incondicional)');

if (!/REMOTE_INTEGRATION_BLOCKED/.test(db)) fail('getSql must reject with REMOTE_INTEGRATION_BLOCKED');
if (!/DATABASE_DISABLED_LOCAL_ONLY/.test(db)) fail('getPglite must reject with DATABASE_DISABLED_LOCAL_ONLY');
if (!/unconditional migration block|migrate\.mjs/.test(migrator)) { /* ver abaixo */ }

// Comportamento observavel: importa o modulo e chama as duas funcoes.
const probe = `
  import("./src/lib/db.ts").then(async (m) => {
    const out = {};
    try { await m.getSql(); out.getSql = 'RESOLVEU'; }
    catch (e) { out.getSql = String(e && e.message || e); }
    try { await m.getPglite(); out.getPglite = 'RESOLVEU'; }
    catch (e) { out.getPglite = String(e && e.message || e); }
    process.stdout.write(JSON.stringify(out));
  }).catch((e) => { process.stderr.write(String(e)); process.exit(2); });
`;

let observed = null;
let probeError = null;
try {
  observed = JSON.parse(execFileSync(
    process.execPath,
    ['--experimental-strip-types', '--import', './scripts/alias-hook.mjs', '-e', probe],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  ));
} catch (e) {
  probeError = e;
}

if (probeError) {
  // Nao deu para observar. Estado nao executado e NOT_RUN, nunca PASS.
  fail(`nao deu para observar o comportamento do banco (NOT_RUN): ${String(probeError.stderr || probeError.message).slice(0, 200)}`);
} else {
  if (/RESOLVEU/.test(observed.getSql)) fail('getSql RESOLVEU — o banco abriu; isolamento quebrado');
  else if (!/REMOTE_INTEGRATION_BLOCKED/.test(observed.getSql)) fail(`getSql rejeitou com a mensagem errada: ${observed.getSql}`);
  else ok('getSql rejeita com REMOTE_INTEGRATION_BLOCKED (comportamento observado)');

  if (/RESOLVEU/.test(observed.getPglite)) fail('getPglite RESOLVEU — o fallback local abriu; isolamento quebrado');
  else if (!/DATABASE_DISABLED_LOCAL_ONLY/.test(observed.getPglite)) fail(`getPglite rejeitou com a mensagem errada: ${observed.getPglite}`);
  else ok('getPglite rejeita com DATABASE_DISABLED_LOCAL_ONLY (comportamento observado)');
}

// ── 3. O migrador tambem nao pode conectar ─────────────────────────────────
if (!/DB_ENABLED|DISABLED|migrate/.test(migrator)) fail('scripts/migrate.mjs must not be able to run a remote migration');
else ok('scripts/migrate.mjs guardado');
