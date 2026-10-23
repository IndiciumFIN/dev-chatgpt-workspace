import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const source = readFileSync(new URL('../src/components/site/shell.tsx', import.meta.url), 'utf8');
const checks = {
  'mobile dialog semantics': /className="off-canvas"[^>]+aria-modal="true"[^>]+role="dialog"/.test(source),
  'localized navigation name': source.includes('aria-label={chrome.t("menu")} aria-modal'),
  'keyboard trap handles shift tab': source.includes('event.shiftKey &&'),
  'keyboard trap handles forward tab': source.includes('!event.shiftKey &&'),
  'keyboard trap attached and removed': source.includes('panel.addEventListener("keydown", trapTab)') && source.includes('panel.removeEventListener("keydown", trapTab)'),
  'overlay removed from tab order': source.includes('tabIndex={-1} className="menu-overlay"'),
  'escape handler remains': source.includes('if (menu) { setMenu(false); menuBtn.current?.focus();'),
};
for(const [name,pass] of Object.entries(checks)) {console.log(`${pass?'PASS':'FAIL'} ${name}`);assert.ok(pass,name)}
console.log('7/7 static checks passed; browser keyboard test remains required.');
