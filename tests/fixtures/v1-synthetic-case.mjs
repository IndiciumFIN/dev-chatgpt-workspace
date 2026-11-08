import {CONTRACT,nfeDigit} from '../../src/v1/vertical-core.mjs';
const prefix=index => '352611'+'00000000000000'+'55'+'001' + String(index).padStart(9,'0') + '1'+'00000000';
export const accessKey=index=>{
  // Deliberately synthetic. Check-digit syntactic validity does not mean SEFAZ authorization.
  const pre=prefix(index);
  if(pre.length!==43)throw Error('Fixture base must have 43 digits: '+pre.length);
  return pre+nfeDigit(pre);
};
export const keys=Object.freeze({a:accessKey(1001),b:accessKey(1002),c:accessKey(1003),d:accessKey(1004)});
export const context=Object.freeze({
 contract:CONTRACT,syntheticOnly:true,organization:'SYNTH-WUTRIB-LAB',
 period:'2026-11',codVer:'020',uf:'SP',erpRelease:'SYNTH-12.1.2510',
 sourceClassification:'UNREAL_MOCK_DATA_NOT_AUTHORIZED_TAX_DOCUMENTS'
});
export const nfe=(key,amount,sourceId)=>({
 sourceType:'NORMALIZED_SYNTHETIC_NFE',organization:context.organization,period:context.period,
 key,amount,sourceId,status:'SYNTHETIC_NO_SEFAZ_AUTHORIZATION'
});
export const erp=(key,amount,table='SD2',idtrib=null,extra={})=>({
 sourceType:'PROTHEUS_SYNTHETIC_SNAPSHOT',organization:context.organization,
 period:context.period,release:context.erpRelease,
 key,amount,table,field:({SD1:'D1_IDTRIB',SD2:'D2_IDTRIB',SFT:'FT_IDTRIB'})[table],
 idtrib,...extra
});
export const efdHeader=()=>`|0000|${context.codVer}|0|01112026|30112026|CNPJ FICTICIO NAO AUTORIZADO|00000000000000|SP|999|`;
export const c100=(key,amount,{direction='1',issuer='0',status='00',model='55'}={})=>
  `|C100|${direction}|${issuer}|P001|${model}|${status}|1|1001|${key}|08112026|08112026|${amount.replace(".",",")}|0|0|0|`;
export const c190=()=> '|C190|000|5102|18,00|120,00|120,00|21,60|0|0|0|0|0|';
export const baseEfd=()=>[
 efdHeader(),
 c100(keys.a,'120.00'),c190(),
 c100(keys.b,'249.00'),c190(),
 c100(keys.d,'75.00'),c190(),
 '|9999|8|'
].join('\n');
export const casefile=()=>({
 context:{...context},
 nfe:[nfe(keys.a,'120.00','NFE-SYN-001'),nfe(keys.b,'250.00','NFE-SYN-002'),nfe(keys.c,'100.00','NFE-SYN-003')],
 efdText:baseEfd(),
 erp:[
  erp(keys.a,'120.00','SD2','RULEA',{f2dRuleRef:'F2D-SYN-A',f2bRuleRef:'F2B-SYN-A'}),
  erp(keys.b,'250.00'),
  erp(keys.c,'100.00'),
  erp(keys.d,'75.00')
 ]
});
