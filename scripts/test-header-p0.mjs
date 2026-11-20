import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const shell = readFileSync(new URL("../src/components/site/shell.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const checks = {
  escape_listener_with_cleanup: /function onEscape\(event: KeyboardEvent\)/.test(shell) &&
    /document\.addEventListener\("keydown", onEscape\)/.test(shell) &&
    /document\.removeEventListener\("keydown", onEscape\)/.test(shell),
  escape_language_focus: /if \(langOpen\)\s*\{\s*setLangOpen\(false\);\s*langBtn\.current\?\.focus\(\)/.test(shell),
  escape_accessibility_focus: /if \(a11yOpen\)\s*\{\s*setA11yOpen\(false\);\s*a11yBtn\.current\?\.focus\(\)/.test(shell),
  escape_mobile_menu_focus: /if \(menu\)\s*\{\s*setMenu\(false\);\s*menuBtn\.current\?\.focus\(\)/.test(shell),
  outside_click_cleanup: /removeEventListener\("pointerdown", onOutside\)/.test(shell),
  language_trigger_ref: /ref=\{langBtn\}\s*className="lang-trigger"\s*type="button"\s*aria-expanded=\{langOpen\}/.test(shell),
  language_selection_focus: /querySelector<HTMLElement>\("button\[aria-current='true'\]"\)\?\.focus\(\)/.test(shell),
  modal_and_focus: /role="dialog"\s+aria-modal="true"\s+className="off-canvas"/.test(shell) &&
    /if \(!pendingNav\.current\) panel\?\.querySelector<HTMLButtonElement>\("header button"\)\?\.focus\(\)/.test(shell),
  mobile_touch_target: /\.header-utility button,\s*\.header-utility a\s*\{\s*min-height:\s*44px/.test(css) &&
    /\.header-utility \.focus-dot\s*\{[^}]*min-height:\s*44px/.test(css),
  rtl_language_menu: /\[dir="rtl"\] \.header-utility \.lang-menu\s*\{[^}]*right:\s*0;\s*left:\s*auto/.test(css),
};
for (const [name, ok] of Object.entries(checks)) {
  console.log((ok ? "PASS " : "FAIL ") + name);
  assert.ok(ok, name);
}
console.log(Object.keys(checks).length + " static header checks passed; E2E keyboard/browser still required.");
