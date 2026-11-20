import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const shell = readFileSync(new URL("../src/components/site/shell.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const checks = {
  font_down_disabled_when_small: /disabled=\{chrome\.font === "sm"\}/.test(shell),
  font_up_disabled_when_large: /disabled=\{chrome\.font === "lg"\}/.test(shell),
  focus_color_has_pressed_state: /aria-pressed=\{chrome\.focus === color\.id\}/.test(shell),
  focus_color_localized: /aria-label=\{focusColorName\(chrome\.locale, color\.id\)\}/.test(shell),
  all_utility_touch_targets: /\.header-utility button,\s*\.header-utility a\s*\{\s*min-height:\s*44px/.test(css),
  focus_dot_touch_target: /\.header-utility \.focus-dot\s*\{[^}]*width:\s*44px;[^}]*min-height:\s*44px/.test(css),
  rtl_menu_alignment: /\[dir="rtl"\] \.header-utility \.lang-menu/.test(css),
  visible_keyboard_focus: /\.header-utility button:focus-visible/.test(css),
};
for (const [name, pass] of Object.entries(checks)) {
  console.log((pass ? "PASS " : "FAIL ") + name);
  assert.ok(pass, name);
}
console.log(Object.keys(checks).length + " a11y static invariants pass; visual E2E is not asserted.");
