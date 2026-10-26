import handoffs from '../../../registers/commander/lanes.v1.json';
import queue from '../../../registers/pmo/queue.v1.json';
import { useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  Bot,
  Cpu,
  Database,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

type CommanderDraft = {
  objective: string;
  scope: string;
  preparedAt: string;
};

type CapabilityCard = {
  label: string;
  detail: string;
  icon: LucideIcon;
};

const capabilityCards: CapabilityCard[] = [
  {
    label: 'LLM',
    detail: 'Nenhum provedor está conectado a esta tela. O texto não é enviado a modelos.',
    icon: Sparkles,
  },
  {
    label: 'Kernel',
    detail: 'Há um avaliador determinístico no código; o Commander não o invoca nem autoriza execução.',
    icon: Cpu,
  },
  {
    label: 'Agentes e equipes',
    detail: 'As instruções em agents/ são documentos de orientação, não executores registrados.',
    icon: UsersRound,
  },
  {
    label: 'Persistência e acesso',
    detail: 'Este rascunho fica somente na memória desta página; não usa banco nem endpoint remoto.',
    icon: Database,
  },
];

export function CommanderPanel() {
  const [objective, setObjective] = useState('');
  const [scope, setScope] = useState('');
  const [draft, setDraft] = useState<CommanderDraft | null>(null);
  const [feedback, setFeedback] = useState('Preencha o objetivo para preparar um rascunho local.');

  function prepareDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedObjective = objective.trim();
    if (normalizedObjective.length < 24) {
      setFeedback('Descreva o objetivo com pelo menos 24 caracteres.');
      return;
    }

    setDraft({
      objective: normalizedObjective,
      scope: scope.trim(),
      preparedAt: new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date()),
    });
    setFeedback('Rascunho preparado nesta página. Nenhum agente ou serviço foi acionado.');
  }

  function clearDraft() {
    setObjective('');
    setScope('');
    setDraft(null);
    setFeedback('Rascunho removido da memória desta página.');
  }

  return (
    <div className="ce-commander">
      <section className="ce-admin-panel" aria-labelledby="commander-heading">
        <div className="ce-admin-panel-heading">
          <div>
            <h2 id="commander-heading">Commander · preparação governada</h2>
            <p>Organize a solicitação e visualize os limites de integração antes de qualquer execução.</p>
          </div>
          <span className="ce-admin-indicator ce-admin-indicator--warn">Somente preparação local</span>
        </div>
        <div className="ce-commander-notice" role="note">
          <AlertTriangle size={19} aria-hidden="true" />
          <p>
            Este protótipo não conversa com LLM, Kernel ou agentes e não cria ordem de serviço. O envio apenas monta
            um rascunho em memória para revisão; ao sair ou recarregar a página, ele desaparece.
          </p>
        </div>
      </section>

      <section className="ce-commander-grid" aria-label="Condições atuais de integração">
        {capabilityCards.map(({ label, detail, icon: Icon }) => (
          <article className="ce-commander-capability" key={label}>
            <span className="ce-commander-icon"><Icon size={18} aria-hidden="true" /></span>
            <div>
              <h3>{label}</h3>
              <p>{detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="ce-admin-panel" data-testid="commander-handoff-inbox" aria-labelledby="commander-handoff-heading">
        <div className="ce-admin-panel-heading">
          <div>
            <h2 id="commander-handoff-heading">Atividades especializadas · entregas</h2>
            <p>Ordens do PMO canônico. O GitHub recebe artefatos; ainda não existe despacho remoto de agentes.</p>
          </div>
          <span className="ce-admin-indicator ce-admin-indicator--warn">Não despachadas</span>
        </div>
        <div className="ce-commander-grid">
          {handoffs.lanes.map(lane => {
            const item = queue.items.find(wo => wo.id === lane.workOrderId);
            return <article className="ce-commander-capability" key={lane.id}>
              <span className="ce-commander-icon"><UsersRound size={18} aria-hidden="true" /></span>
              <div>
                <h3>{lane.id} · {lane.workOrderId}</h3>
                <p>{lane.expectedArtifact}</p>
                <small>PMO: {item?.status ?? 'WO ausente'} · Agente: não despachado · Papel: {lane.role}</small>
                <p><a href={lane.issueUrl} target="_blank" rel="noopener noreferrer">Ver instruções e entregar artefatos no GitHub</a></p>
              </div>
            </article>;
          })}
        </div>
      </section>

      <section className="ce-admin-panel" aria-labelledby="commander-draft-heading">
        <div className="ce-admin-panel-heading">
          <div>
            <h2 id="commander-draft-heading">Nova solicitação</h2>
            <p>Exemplos: analisar impacto de uma alteração, preparar extração editorial ou revisar metadados de publicação.</p>
          </div>
          <Workflow size={20} aria-hidden="true" />
        </div>
        <form className="ce-commander-form" onSubmit={prepareDraft}>
          <label className="ce-admin-field" htmlFor="commander-objective">
            <span>Objetivo da solicitação <em>Obrigatório</em></span>
            <textarea
              id="commander-objective"
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              minLength={24}
              maxLength={800}
              rows={4}
              required
              aria-describedby="commander-objective-help"
              aria-invalid={objective.trim().length > 0 && objective.trim().length < 24}
            />
            <small id="commander-objective-help">{objective.length}/800 caracteres. Não inclua dados de pacientes, credenciais ou material restrito.</small>
          </label>
          <label className="ce-admin-field" htmlFor="commander-scope">
            <span>Escopo ou resultado esperado <em>Opcional</em></span>
            <textarea
              id="commander-scope"
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              maxLength={800}
              rows={3}
            />
            <small>{scope.length}/800 caracteres. O conteúdo não é salvo nem transmitido.</small>
          </label>
          <div className="ce-commander-actions">
            <button className="ce-admin-btn ce-admin-btn--primary" type="submit">
              <Bot size={16} aria-hidden="true" /> Preparar rascunho local
            </button>
            <button className="ce-admin-btn" type="button" onClick={clearDraft} disabled={!objective && !scope && !draft}>
              <LockKeyhole size={16} aria-hidden="true" /> Limpar da sessão
            </button>
          </div>
        </form>
        <p className="ce-commander-feedback" role="status" aria-live="polite">{feedback}</p>
        {draft && (
          <article className="ce-commander-draft" aria-label="Rascunho preparado">
            <div className="ce-commander-draft-heading">
              <strong>Rascunho local · não enviado</strong>
              <small>Preparado em {draft.preparedAt}</small>
            </div>
            <p><strong>Objetivo:</strong> {draft.objective}</p>
            <p><strong>Escopo:</strong> {draft.scope || 'Não informado'}</p>
            <div className="ce-commander-notice ce-commander-notice--compact">
              <ShieldCheck size={17} aria-hidden="true" />
              <p>Uma futura execução deve passar por autorização explícita, política aplicável, avaliação do Kernel, agente registrado e revisão humana quando exigida.</p>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
