import {executeSyntheticSlice} from '../src/v1/vertical-core.mjs';
import {casefile} from '../tests/fixtures/v1-synthetic-case.mjs';
const result=executeSyntheticSlice(casefile());
console.log(JSON.stringify(result,null,2));
if(result.fiscalConformity!=='NOT_EVALUATED'||result.noAutomaticApproval!==true){
 console.error('DEMO_FAIL_CLOSED: unexpected regulatory status');
 process.exitCode=1;
}
