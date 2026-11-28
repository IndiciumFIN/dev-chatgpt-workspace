import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
test('retirement executor refuses candidate, protected scope and duplicates; only conditional atomic deletion',()=>{
 const code=String.raw`import runpy
m=runpy.run_path("scripts/ce-retirement-executor.py")
sha="a"*40
row={"branch":"archivamento","source_sha":sha,"state":"RETIREMENT_CANDIDATE","blocking_checks":["DEPENDENCIES_FULL"]}
ledger={"technical_retirement":{"rows":[row]}}
def reject(fn):
 try: fn()
 except ValueError: return
 raise AssertionError("unexpected admission")
reject(lambda:m["eligible_rows"](ledger,["archivamento"]))
reject(lambda:m["eligible_rows"](ledger,["main"]))
reject(lambda:m["eligible_rows"](ledger,["archivamento","archivamento"]))
row.update(state="RETIREMENT_ELIGIBLE",blocking_checks=[])
assert m["eligible_rows"](ledger,["archivamento"])==[row]
assert m["deletion_args"]([row])==["push","--atomic","--force-with-lease=refs/heads/archivamento:"+sha,"origin",":refs/heads/archivamento"]
reject(lambda:m["deletion_args"]([dict(row,branch="wutrib/test")]))
reject(lambda:m["deletion_args"]([dict(row,source_sha="bad")]))
`;
 assert.doesNotThrow(()=>execFileSync('python3',['-c',code],{encoding:'utf8'}));
});
