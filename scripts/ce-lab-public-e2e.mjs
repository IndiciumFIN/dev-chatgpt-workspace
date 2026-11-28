import assert from "node:assert/strict";
import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:4173/exames-laboratoriais",{waitUntil:"domcontentloaded"});
  const search=page.getByRole("searchbox",{name:"Buscar exame"});await search.waitFor();
  await page.waitForLoadState("networkidle");
  await search.fill("Hemácias");
  const toggle=page.locator('button[aria-controls="exame-hemacias-painel"]');await toggle.focus();await page.keyboard.press("Enter");
  await page.locator("#valor-hemacias").waitFor();
  assert.equal(await page.locator("#sexo-hemacias").inputValue(),"");
  await page.locator("#valor-hemacias").fill("5,5");
  await page.locator("#resultado-hemacias").filter({hasText:"Selecione o sexo de referência"}).waitFor();
  await page.locator("#sexo-hemacias").selectOption("M");
  await page.locator("#resultado-hemacias").filter({hasText:"Acima do limite superior informado."}).waitFor();
  await page.locator("#sexo-hemacias").selectOption("H");
  await page.locator("#resultado-hemacias").filter({hasText:"Dentro dos limites históricos informados."}).waitFor();
  await page.locator("#valor-hemacias").fill("5abc");
  await page.locator("#resultado-hemacias").filter({hasText:"Número inválido."}).waitFor();
  assert.equal(await page.locator("#valor-hemacias").getAttribute("aria-invalid"),"true");
  await search.fill("Colesterol HDL");
  await page.locator('button[aria-controls="exame-hdl-painel"]').click();
  await page.locator("#sexo-hdl").selectOption("H");
  await page.locator("#valor-hdl").fill("40");
  await page.locator("#resultado-hdl").filter({hasText:"No mínimo informado ou acima; sem limite superior."}).waitFor();
  assert.equal(errors.length,0,errors.join(";"));
  await page.close();
 }
 console.log("CE_LAB_PUBLIC_E2E PASS desktop/mobile keyboard input, no assumed sex, partial and malformed values");
}finally{await browser.close();}
