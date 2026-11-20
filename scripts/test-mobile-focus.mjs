import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const shell = readFileSync(new URL("../src/components/site/shell.tsx", import.meta.url), "utf8");
const checks = {
  modal_dialog_semantics: /role="dialog"\s+aria-modal="true"\s+className="off-canvas"\s+aria-label=\{chrome\.t\("menu"\)\}/.test(shell),
  initial_close_focus: /if \(!pendingNav\.current\) panel\?\.querySelector<HTMLButtonElement>\("header button"\)\?\.focus\(\)/.test(shell),
  search_shortcut_focus: /target === "search" \? "\.off-search input"/.test(shell),
  keyboard_trap_shift_tab: /event\.shiftKey &&[\s\S]*?last\.focus\(\)/.test(shell),
  keyboard_trap_tab: /!event\.shiftKey &&[\s\S]*?first\.focus\(\)/.test(shell),
  keyboard_trap_cleanup: /panel\?\.addEventListener\("keydown", trap\)/.test(shell) &&
    /panel\?\.removeEventListener\("keydown", trap\)/.test(shell),
  background_scroll_restoration: /document\.body\.style\.overflow = "hidden"/.test(shell) &&
    /document\.body\.style\.overflow = previous/.test(shell),
  overlay_excluded_from_tab_order: /<button type="button" tabIndex=\{-1\} aria-hidden="true" className="menu-overlay"/.test(shell),
  escape_restores_trigger: /if \(menu\)\s*\{\s*setMenu\(false\);\s*menuBtn\.current\?\.focus\(\)/.test(shell),
  navigation_restores_trigger: /onNavigate=\{\(\) => \{\s*setMenu\(false\);\s*menuBtn\.current\?\.focus\(\);\s*\}\}/.test(shell),
};
for (const [name, pass] of Object.entries(checks)) {
  console.log((pass ? "PASS " : "FAIL ") + name);
  assert.ok(pass, name);
}
console.log(Object.keys(checks).length + " mobile static gates passed; a browser keyboard test is still required.");
