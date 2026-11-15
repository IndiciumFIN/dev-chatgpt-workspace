// NCOS responsive header contract, matching the current source rather than
// an obsolete component markup snapshot. Every check remains blocking.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const shell = readFileSync(new URL("../src/components/site/shell.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const checks = {
  "menu takes initial focus": shell.includes('const initialFocus = requestAnimationFrame(') && shell.includes('panel?.querySelector<HTMLElement>("header button")?.focus()'),
  "menu search focuses input": shell.includes('target === "search" ? ".off-search input"') && shell.includes('pendingNav.current = "search"'),
  "mobile closes and restores focus after navigate": shell.includes('onNavigate={() => { setMenu(false); menuBtn.current?.focus(); }}'),
  "mobile prevents background scroll": shell.includes('document.body.style.overflow = "hidden"'),
  "body scrolling restored on cleanup": shell.includes("document.body.style.overflow = previous"),
  "mobile tab cycles": shell.includes('panel?.addEventListener("keydown", trap)') && shell.includes("event.shiftKey &&") && shell.includes("!event.shiftKey &&"),
  "escape restores trigger": /if \(menu\)[\s\S]{0,130}setMenu\(false\);[\s\S]{0,80}menuBtn\.current\?\.focus\(\)/.test(shell),
  "mobile utility buttons have min touch target": css.includes(".header-utility a {\n  min-height: 44px;") && css.includes('.a11y-tools > button:not(.focus-dot) { min-height: 44px; }'),
  "mobile dialog traps keyboard semantically": shell.includes('role="dialog" aria-modal="true"') && shell.includes('cancelAnimationFrame(initialFocus)'),
};
for (const [name, passed] of Object.entries(checks)) {
  console.log((passed ? "PASS " : "FAIL ") + name);
  assert.ok(passed, name);
}
console.log(Object.keys(checks).length + " blocking header contracts passed; browser QA is separate.");
