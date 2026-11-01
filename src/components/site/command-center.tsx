import { useEffect, useState } from "react";
import { useStored } from "@/lib/stored";
import { controlRun, readCommandDesk, replayCommand, submitCommand } from "@/lib/command.functions";
import { atomQueue, deskGates, extractionQueue, statusTone } from "@/lib/normative-desk";

type Order = { id: string; project: string; environment: string; title: string; status: string; gateOpen: boolean; blockReason: string | null; createdAt: string };
type Run = { id: string; workOrderId: string; attempt: number; status: string; createdAt: string };
type Command = { id: string; workOrderId: string | null; mode: string; status: string; reason: string; correlationId: string; createdAt: string };
type EventRow = { id: string; runId: string; seq: number; eventType: string; detail: string };
type Desk = { orders: Order[]; runs: Run[]; commands: Command[]; events: EventRow[]; readAt: string };

function Status({ value }: { value: string }) {
  return <span className={`status-${statusTone(value)}`}>{value}</span>;
}

export function CommandCenter() {
  const { agents } = useStored();
  const [panel, setPanel] = useState<"monitor" | "comunicacao">("monitor");
  const [channel, setChannel] = useState<"llm" | "agentes" | "kernel">("kernel");
  const [mode, setMode] = useState<"consulta" | "preparacao" | "execucao">("consulta");
  const [prompt, setPrompt] = useState("");
  const [decision, setDecision] = useState("Nenhum pedido enviado.");
  const [card, setCard] = useState("ordens");
  const [project, setProject] = useState("");
  const [environment, setEnvironment] = useState("");
  const [days, setDays] = useState(0);
  const [desk, setDesk] = useState<Desk | null>(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("wo-leitura");
  const [pending, setPending] = useState(false);
  const [droppedAt, setDroppedAt] = useState<number | null>(null);
  const [recovered, setRecovered] = useState<EventRow[] | null>(null);

  function load(next = { project, environment, days }) {
    return readCommandDesk({ data: next })
      .then((row) => {
        setDesk(row);
        setError("");
      })
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    void load();
  }, []);

  const orders = desk?.orders ?? [];
  const selected = orders.find((order) => order.id === selectedId) ?? orders[0] ?? null;
  const runs = desk?.runs.filter((run) => run.workOrderId === selected?.id) ?? [];
  const active = runs.find((run) => run.status === "em_curso" || run.status === "pausada") ?? null;
  const latest = active ?? runs[runs.length - 1] ?? null;
  const events = desk?.events.filter((event) => event.runId === latest?.id) ?? [];
  const thread = desk?.commands.filter((command) => command.workOrderId === selected?.id) ?? [];
  const eligible = Boolean(selected && selected.status === "pronta" && selected.gateOpen && !active);
  const running = (desk?.runs ?? []).filter((run) => run.status === "em_curso" || run.status === "pausada");
  const cards = [
    { id: "ordens", label: "Ordens homologadas", value: orders.length, note: "Ordens já nascidas depois da homologação, no filtro atual." },
    { id: "prontas", label: "Prontas para executar", value: orders.filter((order) => order.status === "pronta" && order.gateOpen).length, note: "Portão aberto e nenhuma corrida ativa." },
    { id: "execucao", label: "Em execução", value: running.length, note: "Corridas em curso ou pausadas. Não é soma de ordens." },
    { id: "bloqueios", label: "Bloqueios", value: orders.filter((order) => !order.gateOpen || order.status === "bloqueada").length, note: "Ordem com portão fechado ou estado bloqueado." },
    { id: "agentes", label: "Agentes disponíveis", value: agents.filter((agent) => agent.status === "Desbloqueado").length, note: "Tabela agent. Não publica." },
    { id: "achados", label: "Achados abertos", value: (desk?.commands ?? []).filter((command) => command.status === "recusado").length + extractionQueue.filter((item) => /não executado|espera/i.test(item.state)).length + atomQueue.filter((item) => statusTone(item.state) === "stop").length, note: "Recusas gravadas mais a fila local. Não é registro formal de qualidade." },
    { id: "portoes", label: "Portões pendentes", value: orders.filter((order) => !order.gateOpen).length + deskGates.filter((gate) => statusTone(gate.state) !== "ok").length, note: "Portão da ordem e portões já conhecidos da mesa." },
    { id: "falhas", label: "Falhas recentes", value: (desk?.runs ?? []).filter((run) => run.status === "cancelada" || run.status === "falhou").length, note: "Corridas canceladas no filtro. Não há corrida marcada como falha enquanto nenhuma existir." },
  ];
  const currentCard = cards.find((item) => item.id === card) ?? cards[0];

  async function send(nextMode: typeof mode, body: string) {
    setPending(true);
    setRecovered(null);
    setDroppedAt(null);
    try {
      const result = await submitCommand({ data: { workOrderId: selected?.id ?? null, mode: nextMode, body, idempotencyKey: crypto.randomUUID() } });
      setDecision(`${result.reason} Correlação ${result.correlationId}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar.");
    } finally {
      setPending(false);
    }
  }

  async function control(action: "pausar" | "retomar" | "cancelar" | "concluir") {
    if (!active) return;
    setPending(true);
    try {
      await controlRun({ data: { runId: active.id, action } });
      setDecision(`Ação ${action} gravada na corrida ${active.attempt}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na corrida.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="cmd">
      <p className="tool-help">Central ligada à mesa local. Consulta não publica. Executar só aparece habilitado quando a ordem está pronta e o portão abre. Lido em {desk?.readAt ?? "…"}.</p>
      {error ? <p className="err">{error}</p> : null}
      <div className="cmd-row">
        <label className="field">Projeto
          <select value={project} onChange={(event) => { setProject(event.target.value); void load({ project: event.target.value, environment, days }); }}>
            <option value="">Todos</option>
            <option value="mesa">Mesa</option>
          </select>
        </label>
        <label className="field">Ambiente
          <select value={environment} onChange={(event) => { setEnvironment(event.target.value); void load({ project, environment: event.target.value, days }); }}>
            <option value="">Todos</option>
            <option value="local">Local</option>
          </select>
        </label>
        <label className="field">Período
          <select value={days} onChange={(event) => { const next = Number(event.target.value); setDays(next); void load({ project, environment, days: next }); }}>
            <option value={0}>Tudo</option>
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
          </select>
        </label>
      </div>
      <div className="admin-tabs cmd-switch" role="tablist" aria-label="Faixa superior">
        <button type="button" role="tab" aria-selected={panel === "monitor"} onClick={() => setPanel("monitor")}>Monitor</button>
        <button type="button" role="tab" aria-selected={panel === "comunicacao"} onClick={() => setPanel("comunicacao")}>Comunicação</button>
      </div>
      <div className="cmd-top">
        <section className={`cmd-band ${panel === "monitor" ? "" : "cmd-aside"}`} aria-label="Monitor">
          <h3>Monitor</h3>
          <p className="tool-help">{selected ? `${selected.title} · ${selected.project} · ${selected.environment}` : "Nenhuma ordem no filtro."}</p>
          {selected ? <p><Status value={selected.status} /> {selected.blockReason ?? "Portão aberto para a leitura local."}</p> : null}
          {latest ? <p className="tool-help">Tentativa {latest.attempt} · <Status value={latest.status} /></p> : <p className="tool-help">Sem corrida. Sem percentual.</p>}
          <ol className="cmd-list">
            {(droppedAt === null ? events : []).map((event) => <li key={event.id}>{event.seq}. {event.eventType}: {event.detail}</li>)}
          </ol>
          {recovered ? <p className="next-act">Recuperados após {droppedAt}: {recovered.length ? recovered.map((event) => `${event.seq}. ${event.eventType}`).join(" · ") : "nenhum evento novo."}</p> : null}
          <div className="cmd-actions">
            <button className="btn-line btn-sm" type="button" disabled={!latest} onClick={() => { setDroppedAt(events.at(-1)?.seq ?? 0); setRecovered(null); }}>Simular queda</button>
            <button className="btn-line btn-sm" type="button" disabled={!latest || droppedAt === null} onClick={() => void replayCommand({ data: { runId: latest!.id, after: droppedAt ?? 0 } }).then((row) => setRecovered(row.events.map((event) => ({ id: `${event.seq}`, runId: latest!.id, seq: event.seq, eventType: event.event_type, detail: event.detail })))).catch((err: Error) => setError(err.message))}>Recuperar</button>
          </div>
        </section>
        <section className={`cmd-band ${panel === "comunicacao" ? "" : "cmd-aside"}`} aria-label="Comunicação">
          <h3>Comunicação</h3>
          <div className="admin-tabs" role="tablist" aria-label="Canal">
            <button type="button" role="tab" aria-selected={channel === "llm"} onClick={() => setChannel("llm")}>LLM</button>
            <button type="button" role="tab" aria-selected={channel === "agentes"} onClick={() => setChannel("agentes")}>Agentes</button>
            <button type="button" role="tab" aria-selected={channel === "kernel"} onClick={() => setChannel("kernel")}>Kernel</button>
          </div>
          {channel === "llm" ? <p className="tool-help">Canal fechado. O pedido fica na mesa e não vai a um modelo.</p> : null}
          {channel === "agentes" ? <ul className="cmd-list">{agents.map((agent) => <li key={agent.id}><Status value={agent.status} /> {agent.name}</li>)}</ul> : null}
          {channel === "kernel" ? <ul className="cmd-list">{thread.length ? thread.map((item) => <li key={item.id}><Status value={item.status} /> {item.mode} · {item.correlationId}</li>) : <li>Nenhuma mensagem desta ordem.</li>}</ul> : null}
        </section>
      </div>
      <form className="cmd-band" onSubmit={(event) => { event.preventDefault(); void send(mode, prompt); }}>
        <h3>Caixa de comando</h3>
        <label className="field">Modo
          <select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
            <option value="consulta">Consulta</option>
            <option value="preparacao">Preparação</option>
            <option value="execucao">Execução controlada</option>
          </select>
        </label>
        <label className="field">Pedido
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} />
        </label>
        <button className="btn-navy btn-sm" type="submit" disabled={pending}>Validar</button>
        <p className="next-act" role="status">{decision}</p>
      </form>
      <section className="cmd-band" aria-label="Ordens homologadas">
        <h3>Ordens homologadas</h3>
        {orders.length ? orders.map((order) => (
          <button key={order.id} type="button" className={`model-card ${selected?.id === order.id ? "is-on" : ""}`} onClick={() => { setSelectedId(order.id); setRecovered(null); setDroppedAt(null); }}>
            <b>{order.title}</b>
            <span><Status value={order.status} /> {order.gateOpen && order.status === "pronta" ? "pode executar" : "não executa"}</span>
          </button>
        )) : <p className="next-act">Nenhuma ordem neste filtro.</p>}
        <div className="cmd-actions">
          <button className="btn-navy btn-sm" type="button" disabled={!eligible || pending} onClick={() => void send("execucao", "Executar a leitura local")}>Executar</button>
          <button className="btn-line btn-sm" type="button" disabled={!active || active.status !== "em_curso" || pending} onClick={() => void control("pausar")}>Pausar</button>
          <button className="btn-line btn-sm" type="button" disabled={!active || active.status !== "pausada" || pending} onClick={() => void control("retomar")}>Retomar</button>
          <button className="btn-line btn-sm" type="button" disabled={!active || pending} onClick={() => void control("cancelar")}>Cancelar</button>
          <button className="btn-line btn-sm" type="button" disabled={!active || active.status !== "em_curso" || pending} onClick={() => void control("concluir")}>Concluir</button>
        </div>
      </section>
      <div className="cmd-cards">
        {cards.map((item) => (
          <button key={item.id} type="button" className={`kpi ${card === item.id ? "is-on" : ""}`} aria-pressed={card === item.id} onClick={() => setCard(item.id)}>
            <span>{item.label}</span>
            <b>{item.value}</b>
          </button>
        ))}
      </div>
      <section className="cmd-band" aria-live="polite">
        <h3>{currentCard.label}</h3>
        <p className="tool-help">{currentCard.note} Total {currentCard.value}. Leitura {desk?.readAt ?? "pendente"}.</p>
      </section>
    </div>
  );
}
