import { Link } from "@tanstack/react-router";
import { vilaSourceHome, type VilaContentItem } from "@/lib/vila-source-home";
import { VilaAsset } from "./vila-asset";
import "./vila.css";

function Collection({id,title,items}:{id:string;title:string;items:readonly VilaContentItem[]}) {
 return <section className="vila-source-section" aria-labelledby={id}>
 <h2 id={id}>{title}</h2><div className="vila-source-grid">
 {items.map(item=><article className="vila-source-card" key={item.id}>
 <div className="vila-source-illustration"><VilaAsset assetId={item.assetId} alt={item.title} fallback="✦" /></div>
 <h3>{item.title}</h3><p>{item.description}</p>
 <Link to={item.url} className="vila-source-link">Explorar seção</Link>
 </article>)}
 </div></section>;
}
export function VilaSourceHome(){
 const d=vilaSourceHome;
 return <main className="vila" id="vila-conteudo">
  <section className="vila-source-hero"><div><p className="vila-kicker">{d.hero.ribbon}</p><h1>{d.hero.title}</h1><p>{d.hero.body}</p><div className="vila-source-actions"><a className="vila-cta" href="#vila-acesso">Começar agora</a><Link to="/kids/jogos">Ver jogos</Link><Link to="/kids/colorir">Desenhos para colorir</Link></div></div><div className="vila-source-hero-art"><VilaAsset assetId="hero.scene" alt="Ilustração da Vila do Cuidado" fallback="Vila do Cuidado" /></div></section>
  <div className="vila-source-content"><Collection id="vila-acesso" title="Acesso rápido" items={d.quick}/><Collection id="vila-destaques" title="Conteúdos em destaque" items={d.featured}/><Collection id="vila-jogos" title="Jogos para aprender e brincar" items={d.games}/><Collection id="vila-imprimir" title="Atividades para imprimir" items={d.printables}/>
  <section className="vila-trust" aria-label="Compromissos da Vila">{d.trust.map(item=><div key={item.title}><h3>{item.title}</h3><p>{item.description}</p></div>)}</section>
  <p className="vila-note">Interface candidata reconstruída da referência original. Textos históricos não representam atividades publicadas nem revisão clínica concluída.</p>
  </div></main>;
}
