import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const shell = readFileSync(new URL("../src/components/site/shell.tsx", import.meta.url), "utf8");
const checks = {
  "mobile dialog semantics": /className="off-canvas" role="dialog" aria-modal="true" aria-label=\{chrome\.t\("menu"\)\}/.test(shell),
  "localized navigation name": shell.includes('aria-label={chrome.t("menu")} tabIndex={-1}'),
  "keyboard trap handles shift tab": shell.includes('event.shiftKey && (document.activeElement === first'),
  "keyboard trap handles forward tab": shell.includes('!event.shiftKey && (document.activeElement === last'),
  "keyboard trap attached and removed": shell.includes('panel?.addEventListener("keydown", trap)') && shell.includes('panel?.removeEventListener("keydown", trap)'),
  "overlay removed from tab order": shell.includes('className="menu-overlay" tabIndex={-1} aria-hidden="true"'),
  "escape handler remains": /if \(menu\)[\s\S]{0,130}setMenu\(false\);[\s\S]{0,80}menuBtn\.current\?\.focus\(\)/.test(shell),
  "first keyboard focus is assigned": shell.includes('panel?.querySelector<HTMLElement>("header button")?.focus()'),
  "focus restored after navigation": shell.includes('onNavigate={() => { setMenu(false); menuBtn.current?.focus(); }}'),
};
for (const [name, passed] of Object.entries(checks)) {
  console.log((passed ? "PASS " : "FAIL ") + name);
  assert.ok(passed, name);
}
console.log(Object.keys(checks).length + " blocking keyboard checks passed; browser QA is separate.");
