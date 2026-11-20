import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const shell = readFileSync(new URL("../src/components/site/shell.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const checks = {
  initial_focus_inside_dialog: /panel\?\.querySelector<HTMLButtonElement>\("header button"\)\?\.focus\(\)/.test(shell),
  search_focuses_input: /target === "search" \? "\.off-search input"/.test(shell),
  mobile_navigation_restores_focus: /onNavigate=\{\(\) => \{\s*setMenu\(false\);\s*menuBtn\.current\?\.focus\(\);\s*\}\}/.test(shell),
  body_scroll_blocked_and_restored: /document\.body\.style\.overflow = "hidden"/.test(shell) &&
    /document\.body\.style\.overflow = previous/.test(shell),
  trap_registered_and_removed: /panel\?\.addEventListener\("keydown", trap\)/.test(shell) &&
    /panel\?\.removeEventListener\("keydown", trap\)/.test(shell),
  escape_restores_focus: /if \(menu\)\s*\{\s*setMenu\(false\);\s*menuBtn\.current\?\.focus\(\)/.test(shell),
  modal_named_in_locale: /role="dialog" aria-modal="true" className="off-canvas" aria-label=\{chrome\.t\("menu"\)\}/.test(shell),
  touch_utility_min_44px: /\.header-utility button,\s*\.header-utility a\s*\{\s*min-height:\s*44px/.test(css),
  focus_visible: /\.header-utility button:focus-visible/.test(css) && /\.off-canvas :focus-visible/.test(css),
};
for (const [name, pass] of Object.entries(checks)) {
  console.log((pass ? "PASS " : "FAIL ") + name);
  assert.ok(pass, name);
}
console.log(Object.keys(checks).length + " static interaction checks passed; browser validation remains required.");
