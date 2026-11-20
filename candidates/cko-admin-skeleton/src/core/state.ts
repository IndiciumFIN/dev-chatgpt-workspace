import { useEffect, useMemo, useState } from 'react';
import queue from '../data/queue.v1.json';
import { deriveAttention, type AttentionItem } from '../lib/attention.ts';
import { verifyChain } from '../lib/hash-chain.ts';
import { emptyLedger, type ChangeEvent, type DependencyEdge, type EventLedger } from '../lib/impact-engine.ts';
import type { ImpactDecision } from '../lib/impact-engine.ts';
import { useAudit, useCollection, useKey, type Row } from '../lib/local-db.ts';

export { queue };
export type QueueItem = (typeof queue.items)[number];
export const EMPTY_EDGES: DependencyEdge[] = [];
export const EMPTY_EVENTS: ChangeEvent[] = [];
export const EMPTY_DECISIONS: ImpactDecision[] = [];
export const EMPTY_LEDGER: EventLedger = emptyLedger();
export const useEdges = () => useKey<DependencyEdge[]>('impact:edges', EMPTY_EDGES);
export const useChangeEvents = () => useKey<ChangeEvent[]>('impact:events', EMPTY_EVENTS);
export const useDecisions = () => useKey<ImpactDecision[]>('impact:decisions', EMPTY_DECISIONS);
export const useLedger = () => useKey<EventLedger>('impact:ledger', EMPTY_LEDGER);
export const todayISO = () => new Date().toISOString().slice(0, 10);

export function useAuditStatus() {
  const audit = useAudit();
  const [status, setStatus] = useState<{ ok: boolean; checked: number; brokenAt?: number; reason?: string } | null>(null);
  useEffect(() => { let live = true; void verifyChain(audit).then(r => { if (live) setStatus(r); }); return () => { live = false; }; }, [audit]);
  return { audit, status };
}

export function useAttention(): AttentionItem[] {
  const atoms = useCollection<Row>('atoms', 'ATM').rows; const apis = useCollection<Row>('apis', 'API').rows;
  const sources = useCollection<Row>('sources', 'FONTE').rows; const reviews = useCollection<Row>('reviews', 'REV').rows;
  const controls = useCollection<Row>('controls', 'CTL').rows; const pages = useCollection<Row>('pages', 'PAG').rows;
  const [ledger] = useLedger(); const [decisions] = useDecisions(); const { status } = useAuditStatus();
  return useMemo(() => {
    const decided = new Set(decisions.map(d => d.candidateKey));
    return deriveAttention({
      today: todayISO(),
      queue: queue.items.map(i => ({ id: i.id, title: i.title, status: i.status, priority: i.priority, evidence: i.evidence })),
      collections: { atoms, apis, sources, reviews, controls, pages },
      impact: {
        openCandidates: Object.values(ledger.candidates).filter(c => !decided.has(c.idempotencyKey)).map(c => ({ key: c.idempotencyKey, asset: `${c.asset.kind}:${c.asset.id}`, severity: c.severity })),
        failedEvents: Object.values(ledger.events).filter(e => e.state === 'falhou').map(e => e.eventId),
      },
      auditChainOk: status ? status.ok : null,
    });
  }, [atoms, apis, sources, reviews, controls, pages, ledger, decisions, status]);
}
