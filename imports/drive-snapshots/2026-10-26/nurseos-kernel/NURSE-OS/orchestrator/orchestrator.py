#!/usr/bin/env python3
"""
ORCHESTRATOR — EVENT → CHECKPOINT → ORCHESTRATOR (distributed semantics)
=========================================================================
- EVENT SOURCING: o log de eventos é a fonte da verdade; estado é derivado.
- IDEMPOTÊNCIA: entrega at-least-once + dedup por chave => effectively-once.
- RETRIES: máx 3 tentativas com backoff; falha persistente => DEAD-LETTER QUEUE.
- CHECKPOINT: offset persistido por stream; replay seguro após crash.
- EVENTUAL CONSISTENCY: views (checkpoint/state) são projeções do log.
- SAGAS: multi-step com compensação — registrado como universo desconhecido
  até existir um fluxo de negócio real de múltiplos passos para compensar.
"""
import json, os, time, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
EV, CKPT, DLQ = f"{HERE}/events.json", f"{HERE}/checkpoint.json", f"{HERE}/dlq.json"

def read(p, default): 
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else json.loads(json.dumps(default))

def write(p, d): json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

def emit(stream, etype, payload, idem):
    log = read(EV, {"events": []})
    log["events"].append({"seq": len(log["events"]) + 1, "stream": stream, "type": etype,
                          "payload": payload, "idem": idem, "attempts": 0, "status": "pending"})
    write(EV, log)

# ---- handlers (ORCHESTRATOR): cada evento tem um efeito verificável ----
def h_traceability(payload):
    import subprocess
    r = subprocess.run(["python3", os.path.join(HERE, "..", "traceability", "check_links.py")],
                       capture_output=True, text=True)
    if r.returncode != 0: raise RuntimeError(f"traceability check falhou: {r.stdout[:200]}")
    return "grafo verificado"
def h_frontend(payload):
    import subprocess
    r = subprocess.run(["python3", os.path.join(HERE, "..", "traceability", "build_frontend.py")],
                       capture_output=True, text=True)
    if r.returncode != 0: raise RuntimeError("frontend rebuild falhou")
    return "frontend regenerado do grafo"
def h_run_registered(payload):
    if not payload.get("run_id"): raise RuntimeError("run sem run_id")
    return f"run {payload['run_id']} aceita no stream (validação de contrato)"

HANDLERS = {"traceability_check": h_traceability, "frontend_rebuild": h_frontend,
            "run_registered": h_run_registered}

def run(stream, max_attempts=3, backoff=0):
    log, ckpt = read(EV, {"events": []}), read(CKPT, {"streams": {}})
    offset = ckpt["streams"].get(stream, 0)
    seen_idems, dlq, stats = set(), read(DLQ, {"dead_letters": []}), {"processed": 0, "deduped": 0, "dlq": 0}
    # dedup usa TODO o log já processado (idempotência global por stream)
    for e in log["events"]:
        if e["stream"] == stream and e["seq"] <= offset: seen_idems.add(e["idem"])
    for e in log["events"]:
        if e["stream"] != stream or e["seq"] <= offset or e["status"] != "pending": continue
        if e["idem"] in seen_idems:
            e["status"] = "deduped"; stats["deduped"] += 1
        else:
            h = HANDLERS.get(e["type"])
            for attempt in range(1, max_attempts + 1):
                e["attempts"] = attempt
                try:
                    e["result"] = h(e["payload"]) if h else f"sem handler para {e['type']}"
                    e["status"] = "done"; stats["processed"] += 1
                    time.sleep(backoff)  # backoff simulado
                    break
                except Exception as ex:
                    if attempt == max_attempts:
                        e["status"] = "dead"; e["error"] = str(ex)
                        dlq["dead_letters"].append({"seq": e["seq"], "type": e["type"], "idem": e["idem"],
                                                     "error": str(ex), "attempts": attempt})
                        stats["dlq"] += 1
                    else:
                        time.sleep(backoff * attempt)
        seen_idems.add(e["idem"])
        ckpt["streams"][stream] = e["seq"]          # CHECKPOINT após cada evento
        write(CKPT, ckpt); write(EV, log); write(DLQ, dlq)  # estado persistido por evento
    return stats

def state(stream):  # EVENT SOURCING: estado derivado do log, nunca mutado à mão
    log = read(EV, {"events": []})
    return [e for e in log["events"] if e["stream"] == stream]

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "demo":
        for f in (EV, CKPT, DLQ):
            if os.path.exists(f): os.remove(f)
        emit("gov", "run_registered", {"run_id": "RUN-2026-0005"}, "idem:run:0005")
        emit("gov", "run_registered", {"run_id": "RUN-2026-0005"}, "idem:run:0005")  # duplicado (replay de rede)
        emit("gov", "traceability_check", {}, "idem:trace:2026-09-03")
        emit("gov", "frontend_rebuild", {}, "idem:frontend:2026-09-03")
        emit("gov", "poison", {"crash": True}, "idem:poison:1")  # evento envenenado
        stats = run("gov")
        print("ORCHESTRATOR — EVENT → CHECKPOINT → ORCHESTRATOR")
        print(f"  eventos processados: {stats['processed']}")
        print(f"  duplicados deduplicados (effectively-once): {stats['deduped']}")
        print(f"  eventos em DEAD-LETTER QUEUE (3 tentativas esgotadas): {stats['dlq']}")
        ckpt = read(CKPT, {}); dlq = read(DLQ, {})
        print(f"  checkpoint do stream 'gov': seq {ckpt['streams'].get('gov')}")
        print(f"  DLQ: {[(d['type'], d['attempts']) for d in dlq['dead_letters']]}")
        print(f"  estado derivado do log (event sourcing): {len(state('gov'))} eventos no stream")
        print("  semântica: at-least-once + dedup por idem => effectively-once; retry máx 3; checkpoint por evento; replay seguro")
