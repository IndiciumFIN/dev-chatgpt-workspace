import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { vilaSections, getVilaSection } from "@/lib/vila-navigation";
import { vilaCatalog, vilaKinds } from "@/lib/vila-canonical";
import { VilaPage } from "./vila-page";
import "./vila.css";
const placeholders: Record<string,string> = {
 discover:"Aqui serão vinculadas as descobertas aprovadas da Lia.",
 notebook:"O caderno de atividades será composto de templates e objetos canônicos.",
 games:"Jogos serão apresentados após a validação de regras, acessibilidade e conteúdo.",
 coloring:"As ilustrações oficiais para colorir serão vinculadas a partir do registro de assets.",
 adults:"Espaço de mediação adulta: segurança, objetivos pedagógicos e orientações sobre as atividades."
};
export function VilaHub({section}: {section?:string}) {
 const selected = section ? getVilaSection(section) : vilaSections[0];
 const [menuOpen,setMenuOpen] = useState(false);
 if (!selected) return <main className="vila"><div className="vila-main"><h1>Espaço não encontrado</h1><Link to="/kids">Voltar à Vila</Link></div></main>;
 const mappedKind = selected.id==="missions"?"mission":selected.id==="stories"?"story":selected.id==="emotions"?"emotion":null;
 const entries = mappedKind ? vilaCatalog.filter(e=>e.kind===mappedKind):[];
 return <div className="vila">
 <header className="vila-head">
 <Link to="/" className="vila-back">Calculadoras de Enfermagem</Link>
 <Link to="/kids" className="vila-identity">Vila do Cuidado</Link>
 <button className="vila-mobile-menu" type="button" aria-expanded={menuOpen} aria-controls="vila-nav" onClick={()=>setMenuOpen(v=>!v)}>Menu</button>
 </header>
 <nav id="vila-nav" className={"vila-global-nav"+(menuOpen?" vila-global-nav-open":"")} aria-label="Navegação da Vila">
 {vilaSections.map(item=><a key={item.id} href={item.path} aria-current={item.id===selected.id?"page":undefined}>{item.label}</a>)}
 </nav>
 {selected.id==="home" ? <VilaPage/> : <main className="vila-main" id="vila-conteudo">
 <p className="vila-kicker">Vila do Cuidado · {selected.label}</p><h1>{selected.label}</h1>
 <p className="vila-section-lead">{placeholders[selected.id]??"Conheça as atividades da Vila."}</p>
 {entries.length>0 ? <div className="vila-grid">{entries.map(entry=><article className="vila-card" key={entry.id}><div className="vila-illustration" aria-hidden="true">{entry.symbol}</div><p className="vila-kind">{vilaKinds[entry.kind]} · candidato</p><h2>{entry.title}</h2><p>{entry.summary}</p><ol>{entry.steps.map(s=><li key={s}>{s}</li>)}</ol></article>)}</div> : <p className="vila-note">Conteúdo ainda não qualificado. Não exibir atividades fictícias como se fossem homologadas.</p>}
 </main>}
 <footer className="vila-footer"><strong>Vila do Cuidado</strong><p>Espaço educativo candidato · sem cadastro de crianças · não publicado</p></footer>
 </div>;
}
