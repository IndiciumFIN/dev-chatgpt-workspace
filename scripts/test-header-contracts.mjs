import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const shell = readFileSync(new URL('../src/components/site/shell.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const checks = {
  'menu takes initial focus': shell.includes('target === "menu" ?') && shell.includes('".off-canvas header button"'),
  'menu search focuses input': shell.includes('target === "search" ? ".off-search input"'),
  'mobile closes and restores focus after navigate': shell.includes('onNavigate={() => { setMenu(false); menuBtn.current?.focus(); }}'),
  'mobile prevents background scroll': shell.includes('document.body.style.overflow = "hidden"'),
  'body scrolling restored on cleanup': shell.includes('document.body.style.overflow = previousOverflow'),
  'mobile tab cycles': shell.includes('panel.addEventListener("keydown", trapTab)'),
  'escape restores trigger': shell.includes('if (menu) { setMenu(false); menuBtn.current?.focus();'),
  'mobile utility buttons have min touch target': css.includes('.header-utility .lang-trigger { min-width: 44px; }'),
};
for (const [label,pass] of Object.entries(checks)) { console.log(`${pass?'PASS':'FAIL'} ${label}`); assert.ok(pass,label) }
console.log('8/8 static checks passed; browser validation not performed.');
