import { describe,it } from "node:test";
import assert from "node:assert/strict";
import { checkAgentToolPreflight, type AgentToolRequest } from "./agent-authorization.ts";
const base:AgentToolRequest = {
  agent: {
    canonicalId:"agent-A",reads:["source-read"],writes:[],toolAllowlist:["source-read"],
    makerCheckerAuditorRole:"SPECIALIST" as never,
    failurePolicy:"FAIL_CLOSED",
  },
  grant: {
    agentId:"agent-A",toolRef:"source-read",workOrderId:"WO-1",policyId:"POLICY-1",
    readAllowed:true,writeAllowed:false,enabled:true,
    expiresAt:"2026-11-27T00:00:00Z",approvalDecisionRef:"APPROVAL-1",
  },
  toolRef:"source-read",workOrderId:"WO-1",operation:"read",
  admission:{outcome:"admit",reason:"test",evidenceHash:"a".repeat(64),policyDecisionRef:"OPA-1"},
  decisionEvidenceRef:"OPA-1",evaluatedAt:"2026-10-26T12:00:00Z",
};
const decide=(patch:Partial<AgentToolRequest>={})=>checkAgentToolPreflight({...base,...patch});
describe("agent fail-closed preflight",()=>{
  it("allows only a proven, scoped preflight, never execution",()=>assert.deepEqual(decide(),{
    allowed:true,reason:"preflight-only-never-execute-without-server",admissionRef:"OPA-1",
  }));
  it("blocks missing grants",()=>assert.equal(decide({grant:null}).allowed,false));
  it("blocks different work orders",()=>assert.equal(decide({workOrderId:"WO-2"}).allowed,false));
  it("blocks expired grants",()=>assert.equal(decide({evaluatedAt:"2026-11-28T00:00:00Z"}).allowed,false));
  it("blocks a tool not in allowlist",()=>assert.equal(decide({toolRef:"remote-write"}).allowed,false));
  it("blocks fake or missing admission",()=>assert.equal(decide({admission:{outcome:"hold",reason:"hold"}}).allowed,false));
  it("blocks mismatched OPA decision evidence",()=>assert.equal(decide({decisionEvidenceRef:"OPA-2"}).allowed,false));
  it("blocks any write without explicit grant and maker role",()=>assert.equal(decide({operation:"write"}).allowed,false));
  it("blocks unsafe failure policies",()=>assert.equal(decide({agent:{...base.agent,failurePolicy:"CONTINUE_SCOPED_LIMITATION"}}).allowed,false));
});
