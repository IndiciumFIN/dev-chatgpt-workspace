import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { byVilaKind, vilaCatalog, vilaKinds, type VilaEntry, type VilaKind } from "@/lib/vila-canonical";
import "./vila.css";
import { VilaAsset } from "./vila-asset";
type Filter = VilaKind | "all";
export function VilaPage() {
  const [filter,setFilter] = useState<Filter>("all");
  const [chosen,setChosen] = useState<VilaEntry | null>(null);
  const [step,setStep] = useState(0);
  const options: Filter[] = ["all","mission","story","emotion"];
  function open(item: VilaEntry) {setChosen(item);setStep(0);}
  return <main className="vila">
    <a className="vila-skip" href="#vila-conteudo">Ir para atividades</a>
    <header className="vila-head"><Link to="/" className="vila-back">← Calculadoras de Enfermagem</Link><span className="vila-identity"><VilaAsset assetId="brand.vila" alt="Vila do Cuidado" fallback="🌻 Vila do Cuidado" /></span><span className="vila-version">Piloto editorial · v0.1.0</span></header>
    <section className="vila-hero"><div className="vila-hero-copy"><p className="vila-kicker">Descobrir · Sentir · Cuidar</p><h1>Uma vila cheia de descobertas!</h1><p>Explore pequenas missões, histórias e emoções com curiosidade e gentileza. Aprender pode ser uma aventura.</p><a className="vila-cta" href="#vila-conteudo">Vamos explorar <span aria-hidden="true">→</span></a></div><div className="vila-scene" aria-hidden="true"><VilaAsset assetId="hero.scene" alt="Cena da Vila do Cuidado" fallback="🏡" className="vila-official-hero" /></div></section>
    <section className="vila-main" id="vila-conteudo"><div className="vila-intro"><p className="vila-kicker">Sua próxima descoberta</p><h2>O que vamos fazer hoje?</h2><p>Escolha um caminho. Você pode mudar de ideia quando quiser.</p></div>
    <div className="vila-filters" aria-label="Filtrar atividades">{options.map(opt=><button key={opt} type="button" aria-pressed={filter===opt} onClick={()=>setFilter(opt)}>{opt==="all"?"Tudo":vilaKinds[opt]}</button>)}</div>
    <div className="vila-grid">{byVilaKind(filter).map(item=><article className="vila-card" key={item.id}><div className="vila-illustration"><VilaAsset assetId={item.kind === "mission" ? "featured.maos_lia" : item.kind === "emotion" ? "char.lia" : "char.caue"} alt={item.title} fallback={item.symbol} /></div><p className="vila-kind">{vilaKinds[item.kind]} · conteúdo candidato</p><h3>{item.title}</h3><p>{item.summary}</p><button type="button" onClick={()=>open(item)}>Explorar <span aria-hidden="true">→</span></button></article>)}</div>
    <p className="vila-note">Este é um espaço educativo experimental. As atividades ainda não foram homologadas e não substituem orientação de responsáveis ou profissionais de saúde.</p></section>
    <footer className="vila-footer"><strong>Vila do Cuidado</strong><p>Conteúdo editorial candidato · sem cadastro · sem coleta de dados pessoais · {vilaCatalog.length} experiências</p></footer>
    {chosen&&<div className="vila-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setChosen(null)}}><section className="vila-dialog" role="dialog" aria-modal="true" aria-labelledby="vila-dialog-title"><button className="vila-close" autoFocus type="button" aria-label="Fechar atividade" onClick={()=>setChosen(null)}>✕</button><span className="vila-dialog-icon" aria-hidden="true">{chosen.symbol}</span><p className="vila-kicker">{vilaKinds[chosen.kind]} · {step+1} de {chosen.steps.length}</p><h2 id="vila-dialog-title">{chosen.title}</h2><p className="vila-step">{chosen.steps[step]}</p><div className="vila-dialog-actions"><button type="button" disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))}>Anterior</button>{step<chosen.steps.length-1?<button type="button" onClick={()=>setStep(s=>s+1)}>Próximo passo</button>:<button type="button" onClick={()=>setChosen(null)}>Concluir atividade ✓</button>}</div><p className="vila-note">Converse com um adulto de confiança quando precisar.</p></section></div>}
  </main>;
}
