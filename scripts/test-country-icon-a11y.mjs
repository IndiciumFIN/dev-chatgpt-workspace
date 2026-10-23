import {readFileSync} from 'node:fs';import assert from 'node:assert/strict';
const s=readFileSync(new URL('../src/components/site/shell.tsx',import.meta.url),'utf8');const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
for(const v of ['disabled={chrome.font === "sm"}','disabled={chrome.font === "lg"}','aria-pressed={chrome.focus === color.id}','focusColorName(chrome.locale, color.id)'])assert.ok(s.includes(v),v);
for(const v of ['min-width: 44px','min-height: 44px','[dir="rtl"] .a11y-bar',':focus-visible'])assert.ok(css.includes(v),v);
console.log('PASS: 8 accessibility invariants; runtime/visual unverified');
