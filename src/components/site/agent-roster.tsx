import { useStored } from "@/lib/stored";

const checks = [
  "O cálculo aparece antes de tutorial, vista e feedback.",
  "Não há escore antes de calcular.",
  "No celular, Imprimir, DOCX e Limpar continuam com nome.",
  "O banner de cookies não cobre o botão Calcular.",
  "Paciente não vai para cookie. NANDA não entra na tela.",
];

export function AgentRoster() {
  const { agents } = useStored();
  return (
    <section className="tool-block" id="agentes">
      <h2>Agentes da ferramenta</h2>
      <p className="tool-help">Oito agentes desbloqueados revisam a ferramenta. Quatro estão planejados e ainda não alteram a página. Nenhum entra no menu público.</p>
      <ul className="plain-list">
        {checks.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <div className="agent-grid">
        {agents.map((agent) => (
          <article key={agent.id} className="paper agent-card">
            <h3>{agent.name}</h3>
            <p className="tool-help">{agent.status}. {agent.mission}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
