import assert from "node:assert/strict";
import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:4173/exames-laboratoriais",{waitUntil:"domcontentloaded"});
  const search=page.getByRole("searchbox",{name:"Buscar exame"});await search.waitFor();
  await search.fill("Hemácias");
  const toggle=page.getByRole("button",{name:/Hemácias/}).first();await toggle.focus();await page.keyboard.press("Enter");
  await page.locator("#valor-hemacias").waitFor();
  assert.equal(await page.locator("#sexo-hemacias").inputValue(),"");
  await page.locator("#valor-hemacias").fill("5,5");
  await page.locator("#resultado-hemacias").getByText("Selecione o sexo de referência",{exact:false}).waitFor();
  await page.locator("#sexo-hemacias").selectOption("M");
  await page.locator("#resultado-hemacias").getByText("Acima do limite superior informado.",{exact:true}).waitFor();
  await page.locator("#sexo-hemacias").selectOption("H");
  await page.locator("#resultado-hemacias").getByText("Dentro dos limites históricos informados.",{exact:true}).waitFor();
  await page.locator("#valor-hemacias").fill("5abc");
  await page.locator("#resultado-hemacias").getByText("Número inválido.",{exact:false}).waitFor();
  assert.equal(await page.locator("#valor-hemacias").getAttribute("aria-invalid"),"true");
  await search.fill("Colesterol HDL");
  await page.getByRole("button",{name:/Colesterol HDL/}).first().click();
  await page.locator("#sexo-hdl").selectOption("H");
  await page.locator("#valor-hdl").fill("40");
  await page.locator("#resultado-hdl").getByText("No mínimo informado ou acima; sem limite superior.",{exact:true}).waitFor();
  assert.equal(errors.length,0,errors.join(";"));
  await page.close();
 }
 console.log("CE_LAB_PUBLIC_E2E PASS desktop/mobile keyboard input, no assumed sex, partial and malformed values");
}finally{await browser.close();}
