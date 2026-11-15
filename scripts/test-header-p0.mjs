// Static behavior contracts for the current NCOS header implementation.
// These remain blocking; browser interaction is checked by the visual workflow.
import fs from "node:fs";
import assert from "node:assert/strict";
const shell = fs.readFileSync("src/components/site/shell.tsx", "utf8");
const css = fs.readFileSync("src/styles.css", "utf8");
const checks = {
  escape_handler: shell.includes("function onEscape(event: KeyboardEvent)"),
  escape_language_focus: /if \(langOpen\)[\s\S]{0,170}setLangOpen\(false\);[\s\S]{0,100}langBtn\.current\?\.focus\(\)/.test(shell),
  escape_accessibility_focus: /if \(a11yOpen\)[\s\S]{0,170}setA11yOpen\(false\);[\s\S]{0,100}a11yBtn\.current\?\.focus\(\)/.test(shell),
  escape_mobile_menu_focus: /if \(menu\)[\s\S]{0,170}setMenu\(false\);[\s\S]{0,100}menuBtn\.current\?\.focus\(\)/.test(shell),
  outside_click_cleanup: shell.includes('document.addEventListener("pointerdown", onOutside)') && shell.includes('document.removeEventListener("pointerdown", onOutside)'),
  language_trigger_ref: /ref=\{langBtn\}\s+className="lang-trigger"/.test(shell),
  language_focus_selection: shell.includes("langWrap.current?.querySelector<HTMLElement>") && shell.includes("button[aria-current='true']"),
  mobile_touch_target: css.includes(".header-utility a {\n  min-height: 44px;") && css.includes(".header-utility .focus-dot { width: 44px;"),
  rtl_language_menu: css.includes('[dir="rtl"] .header-utility .lang-menu'),
};
for (const [name, passed] of Object.entries(checks)) {
  console.log((passed ? "PASS " : "FAIL ") + name);
  assert.ok(passed, name);
}
console.log(Object.keys(checks).length + " blocking header checks passed; behavioral browser QA remains separate.");
