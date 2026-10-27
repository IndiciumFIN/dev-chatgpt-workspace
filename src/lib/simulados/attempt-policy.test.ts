import { canRevealAnswers, maySubmit, type AttemptContext } from "./attempt-policy.ts";
const baseline: AttemptContext = {
  mode: "SIMULADO", state: "IN_PROGRESS", visibility: "HIDDEN",
  ownerId: "owner", requesterId: "owner", ownershipVerified: true, policyVersion: "0.1.0"
};
function assert(v: boolean, message: string) { if (!v) throw new Error(message); }
assert(!canRevealAnswers(baseline).allow,"no answer reveal during simulation");
assert(!canRevealAnswers({...baseline,state:"SUBMITTED",visibility:"POST_COMPLETION"}).allow,"not before grade");
assert(canRevealAnswers({...baseline,state:"GRADED",visibility:"POST_COMPLETION"}).allow,"complete owner may review");
assert(!canRevealAnswers({...baseline,state:"GRADED",visibility:"POST_COMPLETION",requesterId:"other"}).allow,"no other owner");
assert(!canRevealAnswers({...baseline,state:"GRADED",visibility:"POST_COMPLETION",ownershipVerified:false}).allow,"no client-side ownership assertion");
assert(!canRevealAnswers({...baseline,mode:"ESTUDO",visibility:"STUDY_EXPLICIT"}).allow,"no study permissions in simulation");
assert(canRevealAnswers({...baseline,mode:"ESTUDO",visibility:"STUDY_EXPLICIT"}).allow,"explicit study access");
assert(!maySubmit("CREATED").allow && maySubmit("IN_PROGRESS").allow,"submit state check");
