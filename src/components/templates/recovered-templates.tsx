import { useState, type FormEvent, type ReactNode } from "react";
import { ArticlePage } from "@/components/article/article-page";
import { Callout } from "@/components/site/callout";

function Frame({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <ArticlePage
      kind="editorial"
      crumbs={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: title }]}
      eyebrow="Template recuperado"
      title={title}
      lead={lead}
    >
      <Callout>Os campos ficam só nesta tela. Nada é enviado e nada entra no banco.</Callout>
      {children}
    </ArticlePage>
  );
}

function Tabs({ tabs, current, onChange }: { tabs: { id: string; label: string }[]; current: string; onChange: (id: string) => void }) {
  return (
    <div className="admin-tabs" role="tablist">
      {tabs.map((tab) => (
        <button key={tab.id} type="button" role="tab" aria-selected={current === tab.id} className={current === tab.id ? "is-on" : ""} onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

const sourceTypes = ["Lei", "Regulador", "Norma técnica", "Terminologia", "Estudo", "Diretriz", "Livro", "Base de dados", "Software", "Imagem", "Documento interno"];

export function ResearchTemplate() {
  const [tab, setTab] = useState("citacao");
  const [line, setLine] = useState("");

  function cite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLine([data.get("autor"), data.get("titulo"), data.get("ano"), data.get("local")].filter(Boolean).join(". ") + ".");
  }

  function pico(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLine(`Em ${data.get("p")}, ${data.get("i")} comparado com ${data.get("c")} altera ${data.get("o")}?`);
  }

  return (
    <Frame title="Ferramentas de pesquisa" lead="Três ferramentas do backup: citação, biblioteca de fontes e caderno PICO.">
      <Tabs tabs={[{ id: "citacao", label: "Citações" }, { id: "fontes", label: "Fontes" }, { id: "pico", label: "Caderno PICO" }]} current={tab} onChange={setTab} />
      {tab === "citacao" ? (
        <form onSubmit={cite}>
          <section className="inst-sec">
            <h2>Citação</h2>
            <div className="patient-grid">
              <label className="field"><span>Tipo</span><select name="tipo">{sourceTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="field"><span>Autor</span><input name="autor" required autoComplete="off" /></label>
              <label className="field"><span>Título</span><input name="titulo" required autoComplete="off" /></label>
              <label className="field"><span>Ano</span><input name="ano" inputMode="numeric" autoComplete="off" /></label>
              <label className="field"><span>Local ou página</span><input name="local" autoComplete="off" /></label>
            </div>
            <button className="btn-navy" type="submit">Montar nesta tela</button>
          </section>
        </form>
      ) : null}
      {tab === "fontes" ? (
        <form onSubmit={(event) => event.preventDefault()}>
          <section className="inst-sec">
            <h2>Biblioteca de fontes</h2>
            <div className="patient-grid">
              <label className="field"><span>Tipo</span><select name="tipo">{sourceTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="field"><span>Título</span><input name="titulo" required autoComplete="off" /></label>
              <label className="field"><span>Instituição</span><input name="instituicao" autoComplete="off" /></label>
              <label className="field"><span>Ano</span><input name="ano" inputMode="numeric" autoComplete="off" /></label>
            </div>
            <button className="btn-navy" type="submit">Anotar nesta tela</button>
          </section>
        </form>
      ) : null}
      {tab === "pico" ? (
        <form onSubmit={pico}>
          <section className="inst-sec">
            <h2>Caderno PICO</h2>
            <div className="patient-grid">
              <label className="field"><span>População</span><input name="p" required autoComplete="off" /></label>
              <label className="field"><span>Intervenção</span><input name="i" required autoComplete="off" /></label>
              <label className="field"><span>Comparação</span><input name="c" required autoComplete="off" /></label>
              <label className="field"><span>Desfecho</span><input name="o" required autoComplete="off" /></label>
              <label className="field"><span>Tempo</span><input name="tempo" autoComplete="off" /></label>
              <label className="field"><span>Cenário</span><input name="cenario" autoComplete="off" /></label>
            </div>
            <button className="btn-navy" type="submit">Montar a pergunta</button>
          </section>
        </form>
      ) : null}
      {line ? <p className="tpl-note">{line}</p> : null}
    </Frame>
  );
}

const career = ["Dados pessoais", "Resumo", "Formação", "Experiência", "Publicações", "Certificações", "Competências", "Idiomas", "Prêmios", "Filiações", "Eventos", "Prévia"];

export function CareerTemplate() {
  const [tab, setTab] = useState(career[0]);
  const [name, setName] = useState("");
  return (
    <Frame title="Carreira e currículo" lead="Gerador de currículo do backup: dados, formação, experiência, publicações e prévia. Os formatos Lattes e ABNT ficam para a exportação, que ainda não sai desta tela.">
      <Tabs tabs={career.map((item) => ({ id: item, label: item }))} current={tab} onChange={setTab} />
      <form onSubmit={(event) => event.preventDefault()}>
        <section className="inst-sec">
          <h2>{tab}</h2>
          {tab === "Dados pessoais" ? (
            <div className="patient-grid">
              <label className="field"><span>Nome</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
              <label className="field"><span>Registro</span><input autoComplete="off" /></label>
              <label className="field"><span>Cidade</span><input autoComplete="off" /></label>
            </div>
          ) : null}
          {tab === "Resumo" ? <label className="field"><span>Resumo profissional</span><textarea rows={4} /></label> : null}
          {tab === "Formação" ? (
            <div className="patient-grid">
              <label className="field"><span>Curso</span><input autoComplete="off" /></label>
              <label className="field"><span>Instituição</span><input autoComplete="off" /></label>
              <label className="field"><span>Ano</span><input inputMode="numeric" autoComplete="off" /></label>
            </div>
          ) : null}
          {tab === "Experiência" ? (
            <div className="patient-grid">
              <label className="field"><span>Cargo</span><input autoComplete="off" /></label>
              <label className="field"><span>Local</span><input autoComplete="off" /></label>
              <label className="field"><span>Período</span><input autoComplete="off" /></label>
            </div>
          ) : null}
          {tab === "Publicações" || tab === "Certificações" || tab === "Prêmios" || tab === "Filiações" || tab === "Eventos" ? (
            <label className="field"><span>Título</span><input autoComplete="off" /></label>
          ) : null}
          {tab === "Competências" || tab === "Idiomas" ? <label className="field"><span>Nome</span><input autoComplete="off" /></label> : null}
          {tab === "Prévia" ? <p>{name || "O nome ainda não foi preenchido."} A prévia lista só o que foi digitado nesta visita.</p> : null}
        </section>
      </form>
    </Frame>
  );
}

export function StudyTemplate() {
  const [tab, setTab] = useState("quiz");
  return (
    <Frame title="Estudo" lead="Plataforma do backup: quiz, flashcard e simulado. A peça visual de cada um continua em Templates.">
      <Tabs tabs={[{ id: "quiz", label: "Quiz" }, { id: "flashcard", label: "Flashcard" }, { id: "simulado", label: "Simulado" }]} current={tab} onChange={setTab} />
      {tab === "quiz" ? (
        <section className="inst-sec">
          <h2>Questão</h2>
          <label className="field"><span>Enunciado</span><textarea rows={3} /></label>
          <div className="patient-grid">
            {["A", "B", "C", "D"].map((letter) => (
              <label className="field" key={letter}><span>Alternativa {letter}</span><input autoComplete="off" /></label>
            ))}
          </div>
        </section>
      ) : null}
      {tab === "flashcard" ? (
        <section className="inst-sec">
          <h2>Cartão</h2>
          <label className="field"><span>Frente</span><input autoComplete="off" /></label>
          <label className="field"><span>Verso</span><input autoComplete="off" /></label>
        </section>
      ) : null}
      {tab === "simulado" ? (
        <section className="inst-sec">
          <h2>Prova</h2>
          <div className="patient-grid">
            <label className="field"><span>Banca</span><input autoComplete="off" /></label>
            <label className="field"><span>Tempo em minutos</span><input inputMode="numeric" autoComplete="off" /></label>
            <label className="field"><span>Nota de corte</span><input inputMode="decimal" autoComplete="off" /></label>
          </div>
        </section>
      ) : null}
    </Frame>
  );
}

const albumFilters = ["Histórico", "Equipamento", "Procedimento", "Retrato", "Ambiente", "Educacional", "Comemorativo"];

export function AlbumTemplate() {
  const [filter, setFilter] = useState("Histórico");
  return (
    <Frame title="Álbum" lead="Grelha do álbum do backup, com busca e as sete categorias. As fotos curadas não vieram com licença verificada, então a grade é a do molde.">
      <label className="field"><span>Busca</span><input type="search" autoComplete="off" /></label>
      <Tabs tabs={albumFilters.map((item) => ({ id: item, label: item }))} current={filter} onChange={setFilter} />
      <ul className="lib-figures">
        {["Peça 1", "Peça 2", "Peça 3", "Peça 4"].map((item) => (
          <li key={item}><span><b>{filter}</b> {item}</span></li>
        ))}
      </ul>
    </Frame>
  );
}

export function SbarTemplate() {
  const [text, setText] = useState("");
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setText(["Situação", "Contexto", "Avaliação", "Recomendação"].map((label) => `${label}: ${data.get(label) || "—"}`).join("\n"));
  }
  return (
    <Frame title="SBAR" lead="Passagem de plantão do backup, nos quatro blocos. Identificação de paciente não é gravada.">
      <form onSubmit={onSubmit}>
        <section className="inst-sec">
          <div className="patient-grid">
            <label className="field"><span>Turno de origem</span><input name="de" autoComplete="off" /></label>
            <label className="field"><span>Turno de destino</span><input name="para" autoComplete="off" /></label>
            <label className="field"><span>Local</span><input name="local" autoComplete="off" /></label>
          </div>
          {["Situação", "Contexto", "Avaliação", "Recomendação"].map((label) => (
            <label className="field" key={label}><span>{label}</span><textarea name={label} rows={3} /></label>
          ))}
          <button className="btn-navy" type="submit">Montar a passagem</button>
        </section>
      </form>
      {text ? <pre className="tpl-note">{text}</pre> : null}
    </Frame>
  );
}

const labor = [
  { id: "ferias", title: "Férias", fields: ["Salário base mensal", "Dias de férias", "Faltas"], base: "CLT art. 129 a 153 e CF art. 7º, XVII" },
  { id: "noturno", title: "Adicional noturno", fields: ["Salário base mensal", "Horas noturnas", "Percentual"], base: "CLT art. 73" },
  { id: "extras", title: "Horas extras", fields: ["Salário base mensal", "Horas a 50%", "Horas em domingo ou feriado"], base: "CLT art. 59 a 62" },
  { id: "rescisao", title: "Rescisão", fields: ["Salário base", "Meses trabalhados", "Tipo de desligamento"], base: "CLT art. 477 a 482" },
];

export function LaborTemplate() {
  const [id, setId] = useState(labor[0].id);
  const item = labor.find((row) => row.id === id) ?? labor[0];
  return (
    <Frame title="Calculadoras trabalhistas" lead="Quatro formulários do backup. A conta não roda aqui: a base legal está citada, a fórmula ainda não foi homologada.">
      <Tabs tabs={labor.map((row) => ({ id: row.id, label: row.title }))} current={id} onChange={setId} />
      <form onSubmit={(event) => event.preventDefault()}>
        <section className="inst-sec">
          <h2>{item.title}</h2>
          <p>{item.base}</p>
          <div className="patient-grid">
            {item.fields.map((field) => (
              <label className="field" key={field}><span>{field}</span><input autoComplete="off" /></label>
            ))}
          </div>
        </section>
      </form>
    </Frame>
  );
}

const recovered: Record<string, () => ReactNode> = {
  "ferramentas-pesquisa": ResearchTemplate,
  "carreira-concursos": CareerTemplate,
  estudo: StudyTemplate,
  album: AlbumTemplate,
  sbar: SbarTemplate,
  "calculadoras-trabalhistas": LaborTemplate,
};

export function recoveredTemplate(id: string) {
  return recovered[id] ?? null;
}
