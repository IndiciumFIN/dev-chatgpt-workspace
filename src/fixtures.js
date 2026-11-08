// Fully fictional keys. Do not use for fiscal filing or validate as actual NF-e.
export const keys={
  ok:'35261100000000000000550010000010011000000001',
  diff:'35261100000000000000550010000010021000000002',
  xmlOnly:'35261100000000000000550010000010031000000003',
  efdOnly:'35261100000000000000550010000010041000000004'
};
export function syntheticNFe(key,number,amount,product='Produto sintético') {
  return `<?xml version="1.0" encoding="utf-8"?><NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe Id="NFe${key}" versao="4.00"><ide><nNF>${number}</nNF><dhEmi>2026-11-08T09:00:00-03:00</dhEmi></ide><emit><xNome>EMITENTE EXEMPLO LTDA</xNome></emit><dest><xNome>CLIENTE EXEMPLO LTDA</xNome></dest><det nItem="1"><prod><cProd>SKU-${number}</cProd><xProd>${product}</xProd><NCM>84713012</NCM><CFOP>5102</CFOP><vProd>${amount.toFixed(2)}</vProd></prod></det><total><ICMSTot><vNF>${amount.toFixed(2)}</vNF></ICMSTot></total></infNFe></NFe>`;
}
export const demoXMLs=[
  syntheticNFe(keys.ok,1001,120,'Produto A'),
  syntheticNFe(keys.diff,1002,250,'Produto B'),
  syntheticNFe(keys.xmlOnly,1003,100,'Produto C')
];
export const demoEFD=[
 '|0000|019|0|01012026|31012026|EMPRESA FICTICIA|00000000000000|SP|000000000||',
 `|C100|1|0|PARC|55|00|1|1001|${keys.ok}|08012026|08012026|120,00|0|0|0|120,00|0|0|0|0|120,00|21,60|`,
 `|C100|1|0|PARC|55|00|1|1002|${keys.diff}|08012026|08012026|249,00|0|0|0|249,00|0|0|0|0|249,00|44,82|`,
 `|C100|1|0|PARC|55|00|1|1004|${keys.efdOnly}|08012026|08012026|75,00|0|0|0|75,00|0|0|0|0|75,00|13,50|`,
 '|9999|5|'
].join('\n');