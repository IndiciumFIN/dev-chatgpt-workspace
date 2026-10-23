import fs from "node:fs";
import assert from "node:assert/strict";
const rows=JSON.parse(fs.readFileSync("registers/i18n/country-icon-contract.v1.json","utf8")).items;
const validate=(items)=>{
 assert.equal(items.length,19,"Exactly 19 locales required");
 assert.equal(new Set(items.map(x=>x.locale)).size,19,"Duplicate locale");
 for(const item of items){
  assert.equal(item.approval,"HOLD_HUMAN","No unsupported approval");
  if(item.verifiedArtwork) assert(item.sourceUrl && item.licenseVerified,"Artwork requires original source and license");
  assert.equal(item.uiLabelRequired,true,"Visible label required");
 }
};
validate(rows);
assert.throws(()=>validate([...rows.slice(0,18),{...rows[18],verifiedArtwork:true}]), /Artwork requires/);
assert.throws(()=>validate([...rows.slice(0,18),{...rows[18],approval:"APPROVED"}]), /No unsupported approval/);
const shell=fs.readFileSync("src/components/site/shell.tsx","utf8");
assert(shell.includes('className="a11y-action-label">{hw.fontDown}'));
assert(shell.includes('className="a11y-action-label">{hw.fontUp}'));
console.log("PASS: 19 evidence gates, negative tests and translated visible labels");
