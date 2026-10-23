import fs from 'node:fs';
import assert from 'node:assert/strict';
const shell=fs.readFileSync('src/components/site/shell.tsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const tests={
  escape_handler: shell.includes('function onEscape(event: KeyboardEvent)'),
  escape_language_focus: shell.includes('setLangOpen(false); langBtn.current?.focus()'),
  escape_accessibility_focus: shell.includes('setA11yOpen(false); a11yBtn.current?.focus()'),
  escape_mobile_menu_focus: shell.includes('setMenu(false); menuBtn.current?.focus()'),
  outside_click_cleanup: shell.includes('removeEventListener("pointerdown", onOutside)'),
  language_trigger_ref: shell.includes('ref={langBtn} className="lang-trigger"'),
  language_focus_selection: shell.includes('header-language-menu button[aria-current'),
  mobile_touch_target: css.includes('P0 header interaction and small viewport hardening') && css.includes('min-height: 44px'),
  rtl_language_menu: css.includes('[dir="rtl"] .header-utility .lang-menu'),
};
for (const [name,ok] of Object.entries(tests)) { console.log(`${ok?'PASS':'FAIL'} ${name}`); assert.ok(ok,name); }
console.log(`${Object.keys(tests).length} static assertions passed; browser interaction NOT verified`);
