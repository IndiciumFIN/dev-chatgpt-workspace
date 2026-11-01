import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Heart, Printer, Search, ArrowRight, ShieldCheck, Layers3, CircleHelp, Image as ImageIcon, Share2, FileDown, Bookmark } from "lucide-react";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { PageHero } from "@/components/site/page-hero";
import { getLibrary, getAssets, heroOf, idOf, assetById, titleOf, libraryDefinitions, type LibraryAsset, type LibraryDefinition } from "@/lib/bibliotecas";
import "@/styles/library-canonical.css";

const heartSource = "/bibliotecas/anatomia/referencia/";
const anatomySystems = [
 { label:"Sistema Esquelético", description:"Ossos, cartilagens e articulações.", name:"anatomical_structures_collection.png" },
 { label:"Sistema Muscular", description:"Músculos e movimentos corporais.", name:"anatomy_models_and_educational_charts.png" },
 { label:"Sistema Cardiovascular", description:"Coração e vasos sanguíneos.", name:"glossy_3d_anatomical_heart.png", link:"/bibliotecas/anatomia/coracao-humano" },
 { label:"Sistema Respiratório", description:"Pulmões e vias respiratórias.", name:"glossy_3d_human_lungs_illustration.png" },
 { label:"Sistema Nervoso", description:"Encéfalo e vias de comunicação neural.", name:"glossy_purple_brain_icon.png" },
 { label:"Sistema Digestório", description:"Digestão e absorção de nutrientes.", name:"educational_anatomy_organ_models.png" },
];
const heartStructures = [
 { title:"Átrio direito", img:"heart-atrium-right", text:"Recebe sangue venoso sistêmico." },
 { title:"Átrio esquerdo", img:"heart-atrium-left", text:"Recebe sangue proveniente dos pulmões." },
 { title:"Ventrículo direito", img:"heart-ventricle-right", text:"Impulsiona sangue para o circuito pulmonar." },
 { title:"Ventrículo esquerdo", img:"heart-ventricle-left", text:"Impulsiona sangue para a circulação sistêmica." },
 { title:"Valva tricúspide", img:"heart-tricuspid", text:"Entre átrio e ventrículo direitos." },
 { title:"Valva mitral", img:"heart-mitral", text:"Entre átrio e ventrículo esquerdos." },
 { title:"Aorta", img:"heart-aorta", text:"Artéria principal da circulação sistêmica." },
 { title:"Artéria pulmonar", img:"heart-pulmonary", text:"Conduz sangue aos pulmões." },
];
function LibraryImage({asset, alt, className="", eager=false}:{asset?:LibraryAsset;alt:string;className?:string;eager?:boolean}) {
 return asset ? <img className={className} src={asset.url} width={asset.width} height={asset.height} alt={alt} loading={eager?"eager":"lazy"} decoding="async"/> : null;
}
function Card({children,heading,id}:{children:ReactNode;heading?:string;id?:string}){return <section id={id} className="ce-lib-card">{heading?<h2 className="ce-lib-card-title">{heading}</h2>:null}{children}</section>}
function LibraryFrame({lib,objectTitle,description,hero,children,stats}:{lib:LibraryDefinition;objectTitle?:string;description:string;hero?:LibraryAsset;children:ReactNode;stats?:{label:string;value:string}[]}){
 return <div className="artigo ce-lib"><div className="ce-lib-container">
 <Breadcrumb items={[{label:"Início",to:"/"},{label:"Bibliotecas",href:"/bibliotecas"},{label:lib.short,href:objectTitle?`/bibliotecas/${lib.slug}`:undefined},...(objectTitle?[{label:objectTitle}]:[])]}/>
 <PageHero eyebrow={undefined} title={objectTitle||lib.title} lead={description} image={lib.slug==="anatomia"?(objectTitle==="Coração Humano"?"/bibliotecas/anatomia/referencia/object-hero-heart.avif": "/bibliotecas/anatomia/referencia/hub-hero-anatomy.avif"):hero?.url} imageAlt={objectTitle?`Imagem ilustrativa de ${objectTitle}`:`Capa visual da biblioteca ${lib.short}`} badges={["BIBLIOTECA",lib.short.toUpperCase(),objectTitle?"CONTEÚDO VISUAL":"ESTUDO VISUAL","PT-BR"]} badgesBeforeTitle facts={stats}/>
 <div className="ce-lib-integrity"><ShieldCheck size={16} aria-hidden="true"/><span><strong>Integridade editorial:</strong> imagens ilustrativas para estudo. Identificação, terminologia e aplicações clínicas exigem verificação de fonte antes de publicação assistencial.</span></div>
 {children}
 <p className="ce-lib-tail">Calculadoras de Enfermagem · Bibliotecas · Template canônico local · Imagens AVIF com proveniência</p>
 </div></div>
}
function LibraryActions({hash,highlight}:{hash?:string;highlight?:string}) {
 const [saved,setSaved]=useState(false);
 const [copied,setCopied]=useState(false);
 async function share() {
   try { await navigator.clipboard.writeText(window.location.href); setCopied(true); }
   catch { setCopied(false); }
 }
 return <div className="ce-lib-actions" aria-label="Ações desta biblioteca">
  <a className="ce-lib-action-primary" href={hash||"#explorar"}><BookOpen size={14}/>{highlight||"Explorar sistemas"}</a>
  <a href="#atlas"><ImageIcon size={14}/>Atlas visual</a>
  <button type="button" onClick={()=>setSaved(v=>!v)} aria-pressed={saved}><Heart size={14} fill={saved?"currentColor":"none"}/>{saved?"Favorito nesta sessão":"Favoritos"}</button>
  <button type="button" onClick={()=>window.print()}><Printer size={14}/>Imprimir / PDF</button>
  <button type="button" onClick={share} aria-live="polite"><Share2 size={14}/>{copied?"Link copiado":"Compartilhar"}</button>
  <a href="/bibliotecas"><Bookmark size={14}/>Coleções</a>
  <a className="ce-lib-action-emphasis" href="#fontes"><ShieldCheck size={14}/>Situação editorial</a>
 </div>
}
function SearchFilter({onQuery,query,onScope}:{onQuery:(v:string)=>void;query:string;onScope?:(scope:"all"|"objects")=>void}) {
 return <form className="ce-lib-search" role="search" onSubmit={e=>e.preventDefault()}>
  <label className="ce-lib-search-field" htmlFor="lib-query"><Search size={16} aria-hidden="true"/><span className="sr-only">Pesquisar no acervo</span><input id="lib-query" type="search" value={query} onChange={e=>onQuery(e.target.value)} placeholder="Buscar estrutura, sistema, órgão ou material…"/></label>
  <select aria-label="Escopo da busca" defaultValue="all" onChange={e=>onScope?.(e.target.value as "all"|"objects")}><option value="all">Toda a biblioteca</option>{onScope?<option value="objects">Objetos e imagens</option>:null}</select>
  <button type="submit">Buscar</button><button type="button" onClick={()=>onQuery("")}>Limpar</button>
 </form>
}
function Tile({asset,to,caption}:{asset?:LibraryAsset;to:string;caption?:string}){return <a className="ce-lib-tile" href={to}>
  <div className="ce-lib-tile-image"><LibraryImage asset={asset} alt={asset?`Ilustração de ${caption??titleOf(asset)}`:"Ilustração indisponível"}/></div>
  <div className="ce-lib-tile-text"><h3>{caption|| (asset?titleOf(asset):"Item visual")}</h3><span>Ver conteúdo <ArrowRight size={13}/></span></div>
 </a>}
function Sidebar({lib,assets,search,object=false,onView,view}:{lib:LibraryDefinition;assets:LibraryAsset[];search:(s:string)=>void;object?:boolean;onView?:(v:string)=>void;view?:string}) {
 return <aside className="ce-lib-column">
  <Card heading={object?"NAVEGAÇÃO DO OBJETO":"NAVEGAÇÃO RÁPIDA"}>
   <nav className="ce-lib-side-links" aria-label="Navegação interna">
    {object?<>
     <a href="#explorar"><Layers3 size={14}/>Visão geral <span>›</span></a>
     <a href="#coracao-partes"><ImageIcon size={14}/>Partes e estruturas <span>›</span></a>
     <a href="#vascularizacao"><Layers3 size={14}/>Vascularização <span>›</span></a>
     <a href="#inervacao"><Layers3 size={14}/>Inervação <span>›</span></a>
     <a href="#clinicas"><CircleHelp size={14}/>Relações clínicas <span>›</span></a>
     <a href="#atlas"><ImageIcon size={14}/>Atlas visual <span>›</span></a>
    </>:<>
     <button type="button" aria-pressed={view==="catalog"} onClick={()=>onView?.("catalog")}><Layers3 size={14}/>{lib.slug==="anatomia"?"Sistemas":"Objetos"}<span>›</span></button>
     {lib.slug==="anatomia"?<button type="button" aria-pressed={view==="regions"} onClick={()=>onView?.("regions")}><Layers3 size={14}/>Regiões <span>›</span></button>:null}
     <button type="button" aria-pressed={view==="gallery"} onClick={()=>onView?.("gallery")}><ImageIcon size={14}/>Atlas visual <span>›</span></button>
     <a href="#sobre"><CircleHelp size={14}/>Glossário e fontes <span>›</span></a>
    </>}
   </nav>
  </Card>
  <Card heading="PROGRESSO DE ESTUDO"><div className="ce-lib-progress"><div style={{width:"0%"}}/></div><small>0% explorado · não sincronizado</small></Card>
  {object?<Card heading="STATUS DE ESTUDO"><p>Não iniciado · progresso não sincronizado.</p></Card>:<Card heading="BUSCAR NESTA BIBLIOTECA"><div className="ce-lib-chips" style={{justifyContent:"flex-start",margin:0}}>{lib.tags.map(t=><button key={t} type="button" onClick={()=>search(t)}>{t}</button>)}</div></Card>}
  <Card heading="METADADOS"><dl className="ce-lib-metadata"><dt>Domínio</dt><dd>{lib.short}</dd><dt>Imagens</dt><dd>{assets.length} AVIF</dd><dt>Curadoria</dt><dd>Pendente</dd><dt>Origem</dt><dd>Google Drive / CKO</dd></dl></Card>
 </aside>
}
function Related({lib,assets,object=false}:{lib:LibraryDefinition;assets:LibraryAsset[];object?:boolean}) {
 const anatomy=lib.slug==="anatomia";
 const picture=anatomy?"/bibliotecas/anatomia/referencia/heart-highlight.avif":heroOf(lib)?.url;
 const caption=anatomy?"Coração humano":lib.short;
 return <aside className="ce-lib-column">
  <Card heading="DESTAQUE VISUAL"><div className="ce-lib-highlight"><img src={picture} alt={caption} loading="lazy" width={164} height={118}/><div><strong>{caption}</strong><p>{anatomy?"Vista anatômica do coração.":"Imagem ilustrativa do acervo."}</p><a href={anatomy?(object?"#atlas":"/bibliotecas/anatomia/coracao-humano"):`/bibliotecas/${lib.slug}/${assets[0]?idOf(assets[0]):""}`}>{anatomy&&object?"Ver atlas →":"Ver detalhes →"}</a></div></div></Card>
  <Card heading="CONTEÚDO RELACIONADO"><div className="ce-lib-links">{(anatomy?["Sistema cardiovascular","Circulação pulmonar","Terminologia anatômica","Planos e eixos"]:libraryDefinitions.filter(x=>x.slug!==lib.slug&&x.slug!=="acervo-a-classificar").slice(0,4).map(x=>x.short)).map(t=>anatomy?<span key={t} className="ce-lib-related-label"><BookOpen size={12}/>{t}</span>:<a key={t} href={`/bibliotecas/${libraryDefinitions.find(x=>x.short===t)?.slug||lib.slug}`}><BookOpen size={12}/>{t}</a>)}</div></Card>
  <Card heading="TRILHA DE ESTUDO"><ol className="ce-lib-study"><li>Introdução e conceitos</li><li>Estruturas e objetos</li><li>Atlas e correlações</li><li>Aplicações clínicas</li></ol></Card>
  <Card heading="RECURSOS"><div className="ce-lib-links"><a href="#atlas"><ImageIcon size={12}/>Atlas visual</a><a href="#fontes"><BookOpen size={12}/>Fontes e proveniência</a></div></Card>
 </aside>
}
export function LibrariesIndex(){const [q,setQ]=useState("");const libs=libraryDefinitions.filter(l=>l.slug!=="acervo-a-classificar"&&`${l.title} ${l.subtitle}`.toLowerCase().includes(q.toLowerCase()));const lib=libraryDefinitions[0];return <LibraryFrame lib={lib} objectTitle="Bibliotecas de Enfermagem" description="Um único padrão de navegação, componentes e conteúdo para o acervo visual de enfermagem." hero={getAssets("anatomia").find(a=>a.original==="human_body_systems_anatomy_display.png")} stats={[{label:"Bibliotecas",value:String(libraryDefinitions.length-1)},{label:"Imagens AVIF",value:"240"},{label:"Padronização",value:"Única"}]}><LibraryActions/><SearchFilter query={q} onQuery={setQ}/><div className="ce-lib-grid-wide" id="atlas">{libs.map(l=><Link key={l.slug} className="ce-lib-collection" to="/bibliotecas/$slug" params={{slug:l.slug}}><LibraryImage asset={heroOf(l)} alt={`Capa ${l.short}`}/><div><h2>{l.title}</h2><p>{l.subtitle}</p><span>{getAssets(l.category).length} imagens · Explorar <ArrowRight size={14}/></span></div></Link>)}</div><p id="fontes" className="ce-lib-note">66 arquivos aguardam classificação temática; permanecem preservados no pacote local, fora das bibliotecas publicáveis.</p></LibraryFrame>}
export function LibraryHub({slug}:{slug:string}){
 const lib=getLibrary(slug);const [q,setQ]=useState("");const [mode,setMode]=useState("catalog");if(!lib||slug==="acervo-a-classificar")return <p>Biblioteca indisponível para publicação; classificação editorial pendente.</p>;
 const assets=getAssets(lib.category);const anatomy=slug==="anatomia";const filtered=assets.filter(a=>titleOf(a).toLowerCase().includes(q.toLowerCase()));
 const sysCards=anatomy?anatomySystems.filter(c=>`${c.label} ${c.description}`.toLowerCase().includes(q.toLowerCase())):[];
 return <LibraryFrame lib={lib} description={lib.subtitle} hero={heroOf(lib)} stats={[{label:"Acervo",value:`${assets.length} imagens`},{label:"Explorar",value:anatomy?"Sistemas":"Objetos"},{label:"Recurso",value:"Atlas visual"},{label:"Revisão",value:"Editorial"}]}><LibraryActions highlight={anatomy?"Explorar sistemas":"Explorar objetos"}/><SearchFilter query={q} onQuery={setQ} onScope={scope=>setMode(scope==="objects"?"gallery":"catalog")}/>
 <div className="ce-lib-layout"><Sidebar lib={lib} assets={assets} search={setQ} onView={setMode} view={mode}/><main className="ce-lib-center" id="explorar"><Card heading={anatomy?"Explorar anatomia":"Explorar biblioteca"}>
 <div role="group" className="ce-lib-tabs" aria-label="Visualização do acervo">
 {([{id:"catalog",label:anatomy?"Sistemas do corpo":"Todos os objetos"},...(anatomy?[{id:"regions",label:"Regiões anatômicas"},{id:"structures",label:"Estruturas"}]:[]),{id:"gallery",label:"Atlas visual"},...(anatomy?[{id:"clinical",label:"Relações clínicas"}]:[])]).map(item=><button key={item.id} type="button" aria-pressed={mode===item.id} onClick={()=>setMode(item.id)}>{item.label}</button>)}
 </div>
 {mode==="regions"?<div className="ce-lib-assets" id="regioes">{assets.filter(a=>/region|body.systems|anatomy.models/i.test(a.original)).map(a=><Tile key={a.url} asset={a} to={`/bibliotecas/${lib.slug}/${idOf(a)}`}/>)}</div>:null}
 {mode==="structures"?<div className="ce-lib-assets">{assets.filter(a=>/structure|tissue|organ/i.test(a.original)).map(a=><Tile key={a.url} asset={a} to={`/bibliotecas/${lib.slug}/${idOf(a)}`}/>)}</div>:null}
 {mode==="clinical"?<p>Relações clínicas e nomenclaturas vinculadas a fontes estão em revisão editorial. A navegação para o Coração Humano já possui estrutura de estudo e atlas visual.</p>:null}
 {mode==="catalog"&&anatomy?<div className="ce-lib-systems">{sysCards.map(s=>{const mini=["system-skeletal","system-muscular","system-heart","system-lungs","system-brain","system-digestive"][anatomySystems.indexOf(s)];return <a href={s.link||"#atlas"} key={s.label} className="ce-lib-system"><img src={`/bibliotecas/anatomia/referencia/${mini}.avif`} alt={s.label} width="80" height="88" loading="lazy"/><div><h3>{s.label}</h3><p>{s.description}</p><span>{s.link?"Ver conteúdo":"Consultar atlas"} <ArrowRight size={14}/></span></div></a>})}</div>:mode==="gallery"||(mode==="catalog"&&!anatomy)?<div className="ce-lib-assets" id="atlas-galeria">{filtered.map(a=><Tile key={a.url} asset={a} to={`/bibliotecas/${lib.slug}/${idOf(a)}`}/>)}</div>:null}
 {mode==="catalog"&&anatomy?<a href="#atlas" className="ce-lib-full-link" onClick={()=>setMode("gallery")}>Abrir galeria de imagens <ArrowRight size={15}/></a>:null}
 {filtered.length===0&&sysCards.length===0?<p>Nenhum resultado para a busca.</p>:null}
 </Card><details id="atlas" className="ce-lib-card ce-lib-disclosure"><summary>Atlas visual <span>Explorar imagens do acervo</span></summary><div className="ce-lib-assets">{assets.slice(0,6).map(a=><Tile key={a.url} asset={a} to={`/bibliotecas/${lib.slug}/${idOf(a)}`}/>)}</div></details><details id="fontes" className="ce-lib-card ce-lib-disclosure"><summary id="sobre">Sobre o acervo e fontes <span>Proveniência e curadoria</span></summary><div><p>As imagens vieram do acervo documental fornecido por Google Drive. Nomenclatura, licenças e aplicações clínicas exigem validação humana.</p><p>Integridade por arquivo registrada no manifesto SHA-256. Este conteúdo ilustrativo não substitui referências clínicas verificadas.</p></div></details></main><Related lib={lib} assets={assets}/></div>
 </LibraryFrame>
}
function HeartContent({lib}:{lib:LibraryDefinition}){const [tab,setTab]=useState("visao");const [q,setQ]=useState("");const cover=getAssets("anatomia").find(a=>a.original==="glossy_3d_anatomical_heart.png");return <LibraryFrame lib={lib} objectTitle="Coração Humano" description="Órgão muscular central do sistema cardiovascular, responsável pelo bombeamento do sangue para a circulação pulmonar e sistêmica." hero={cover} stats={[{label:"Sistema",value:"Cardiovascular"},{label:"Câmaras",value:"4 câmaras"},{label:"Valvas",value:"4 valvas"},{label:"Recurso",value:"Atlas visual"}]}><LibraryActions hash="#explorar" highlight="Ler conteúdo"/><SearchFilter query={q} onQuery={setQ}/><nav className="ce-lib-object-jumps" aria-label="Atalhos do conteúdo"><a href="#explorar">Resumo</a><a href="#coracao-partes">Estruturas</a><a href="#vascularizacao">Vascularização</a><a href="#inervacao">Inervação</a><a href="#clinicas">Clínica</a><a href="#atlas">Atlas</a></nav><div className="ce-lib-layout"><Sidebar lib={lib} assets={getAssets("anatomia")} search={setQ} object/><main id="explorar" className="ce-lib-center"><Card heading="Conteúdo anatômico"><div className="ce-lib-tabs" role="group" aria-label="Seções do coração"><button type="button" aria-pressed={tab==="visao"} onClick={()=>setTab("visao")}>Visão geral</button><button type="button" aria-pressed={tab==="estruturas"} onClick={()=>setTab("estruturas")}>Estruturas</button><button type="button" aria-pressed={tab==="atlas"} onClick={()=>setTab("atlas")}>Atlas visual</button><button type="button" onClick={()=>document.getElementById("vascularizacao")?.scrollIntoView()}>Vascularização</button><button type="button" onClick={()=>document.getElementById("inervacao")?.scrollIntoView()}>Inervação</button><button type="button" onClick={()=>document.getElementById("clinicas")?.scrollIntoView()}>Relações clínicas</button></div>
 {tab==="visao"?<div className="ce-lib-heart-overview"><section><h3>Resumo anatômico</h3><p>O coração humano é um órgão muscular oco, situado no mediastino, entre os pulmões. Sua organização inclui quatro câmaras: dois átrios e dois ventrículos.</p><p>As quatro principais valvas cardíacas orientam o fluxo sanguíneo: tricúspide, pulmonar, mitral e aórtica.</p></section><div className="ce-lib-fact-grid">{[{name:"Localização",text:"Mediastino"},{name:"Função",text:"Bombear sangue"},{name:"Camadas",text:"Endocárdio, miocárdio e epicárdio"},{name:"Câmaras",text:"2 átrios e 2 ventrículos"},{name:"Valvas",text:"Tricúspide, pulmonar, mitral e aórtica"},{name:"Grandes vasos",text:"Aorta, veias cavas e vasos pulmonares"}].map(x=><div key={x.name}><strong>{x.name}</strong><p>{x.text}</p></div>)}</div></div>:null}
 {tab==="estruturas"?<p>Estruturas representadas nas ilustrações abaixo. Clique nas figuras para ampliar a visualização no navegador.</p>:null}
 {tab==="atlas"?<div className="ce-lib-zoom"><LibraryImage asset={cover} alt="Ilustração do coração humano obtida do acervo do Drive"/></div>:null}
 </Card><Card id="coracao-partes" heading="Estruturas principais"><div className="ce-lib-structures">{heartStructures.filter(s=>`${s.title} ${s.text}`.toLowerCase().includes(q.toLowerCase())).map(s=><a key={s.img} href={heartSource+s.img+".avif"} target="_blank" rel="noreferrer"><img src={heartSource+s.img+".avif"} width="120" height="100" alt={`Ilustração: ${s.title}`} loading="lazy"/><div><strong>{s.title}</strong><p>{s.text}</p><span>Ampliar imagem →</span></div></a>)}</div></Card><Card id="vascularizacao" heading="Vascularização"><p>As artérias coronárias irrigam o miocárdio. A drenagem venosa retorna principalmente pelo seio coronário. A descrição detalhada depende da revisão do conteúdo científico.</p></Card><Card id="inervacao" heading="Inervação"><p>A regulação cardíaca envolve o sistema nervoso autônomo e o sistema de condução. Relações clínicas detalhadas exigem referências verificadas.</p></Card><Card id="clinicas" heading="Relações clínicas"><div className="ce-lib-structures">{[{name:"Insuficiência cardíaca",img:"clinical-heart-failure"},{name:"Infarto do miocárdio",img:"clinical-mi"},{name:"Sopros valvares",img:"clinical-murmur"},{name:"Arritmias",img:"clinical-arrhythmia"}].map(s=><div key={s.img} className="ce-lib-mini"><img src={heartSource+s.img+".avif"} width="96" height="72" alt={s.name}/><strong>{s.name}</strong></div>)}</div><p className="ce-lib-disclaimer">Tópicos de estudo: não são orientação diagnóstica ou terapêutica.</p></Card><details className="ce-lib-card ce-lib-disclosure" id="atlas"><summary>Atlas visual <span>Expandir vista anatômica</span></summary><div className="ce-lib-zoom"><LibraryImage asset={cover} alt="Representação ilustrativa do coração humano proveniente do Drive"/></div></details><Card id="fontes" heading="Referências e proveniência"><p>Imagem principal: acervo do Google Drive. Miniaturas anatômicas: pacote CKO de referência. Referências bibliográficas clínicas: ainda não fornecidas para homologação.</p></Card></main><Related lib={lib} assets={getAssets("anatomia")} object/></div></LibraryFrame>}
/** Every object page uses the same frame, actions, 3-column layout, tabs and document sections.
 * Clinical assertions require reviewed, structured sources; missing claims remain explicit HOLD_HUMAN.
 */
function GenericObjectContent({lib,asset}:{lib:LibraryDefinition;asset:LibraryAsset}) {
 const [tab,setTab]=useState<"visao"|"atlas"|"dados">("visao");
 const [query,setQuery]=useState("");
 const siblingAssets=getAssets(lib.category).filter(a=>a.url!==asset.url).slice(0,6);
 const caption=titleOf(asset);
 return <LibraryFrame lib={lib} objectTitle={caption} description="Prancha visual do acervo. Informações clínicas e técnicas específicas aguardam revisão documental." hero={asset} stats={[{label:"Biblioteca",value:lib.short},{label:"Formato",value:"AVIF"},{label:"Proveniência",value:"Google Drive"},{label:"Revisão",value:"Pendente"}]}>
 <LibraryActions hash="#explorar" highlight="Ler conteúdo"/>
 <SearchFilter query={query} onQuery={setQuery}/>
 <div className="ce-lib-layout">
 <aside className="ce-lib-column">
   <Card heading="NAVEGAÇÃO DO OBJETO"><nav className="ce-lib-side-links" aria-label="Seções do objeto">
     <a href="#explorar"><Layers3 size={14}/>Visão geral <span>›</span></a>
     <a href="#atlas"><ImageIcon size={14}/>Atlas e imagem <span>›</span></a>
     <a href="#sobre"><BookOpen size={14}/>Dados de origem <span>›</span></a>
     <a href="#fontes"><ShieldCheck size={14}/>Referências <span>›</span></a>
   </nav></Card>
   <Card heading="STATUS DE ESTUDO"><p>Não iniciado · progresso não sincronizado.</p></Card>
   <Card heading="METADADOS"><dl className="ce-lib-metadata"><dt>Domínio</dt><dd>{lib.short}</dd><dt>Formato</dt><dd>AVIF</dd><dt>Fonte</dt><dd>Google Drive</dd><dt>Curadoria</dt><dd>{asset.review}</dd></dl></Card>
 </aside>
 <main className="ce-lib-center" id="explorar">
   <Card heading="Conteúdo do objeto"><div role="group" className="ce-lib-tabs" aria-label="Visualizações do objeto">
     <button type="button" aria-pressed={tab==="visao"} onClick={()=>setTab("visao")}>Visão geral</button>
     <button type="button" aria-pressed={tab==="atlas"} onClick={()=>setTab("atlas")}>Atlas visual</button>
     <button type="button" aria-pressed={tab==="dados"} onClick={()=>setTab("dados")}>Ficha técnica</button>
   </div>
   {tab==="visao"?<div className="ce-lib-object-intro"><div className="ce-lib-object-preview"><LibraryImage asset={asset} alt={caption} eager/></div><div><h3>{caption}</h3><p>Material ilustrativo para estudo, ainda sem descrição técnica ou indicação clínica homologada.</p><p>Consulte a imagem ampliada no atlas e os dados de proveniência antes de utilizar o material em outros contextos.</p></div></div>:null}
   {tab==="atlas"?<div className="ce-lib-detail-image"><LibraryImage asset={asset} alt={caption} eager/></div>:null}
   {tab==="dados"?<dl className="ce-lib-metadata"><dt>Arquivo</dt><dd>{asset.original}</dd><dt>Resolução</dt><dd>{asset.width} × {asset.height}</dd><dt>Parte</dt><dd>{asset.part} de 5</dd><dt>Curadoria</dt><dd>{asset.review}</dd></dl>:null}
   </Card>
   <details className="ce-lib-card ce-lib-disclosure" id="atlas"><summary>Atlas visual <span>Ampliar imagem</span></summary><div className="ce-lib-detail-image"><LibraryImage asset={asset} alt={caption}/></div></details>
   <Card id="sobre" heading="Descrição e metadados"><p>Este registro contém uma imagem do acervo ilustrativo. Descrição anatômica, materiais, técnicas e eventuais relações clínicas exigem fontes específicas verificadas antes de homologação.</p><dl className="ce-lib-metadata"><dt>Arquivo original</dt><dd>{asset.original}</dd><dt>Parte</dt><dd>{asset.part} de 5</dd><dt>Resolução</dt><dd>{asset.width} × {asset.height}</dd><dt>Revisão</dt><dd>{asset.review}</dd></dl></Card>
   <Card heading="Conteúdo relacionado"><div className="ce-lib-assets">{siblingAssets.filter(a=>!query||titleOf(a).toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))).slice(0,3).map(a=><Tile key={a.url} asset={a} to={`/bibliotecas/${lib.slug}/${idOf(a)}`}/>)}</div>{siblingAssets.length===0?<p>Nenhum outro item catalogado.</p>:null}</Card>
   <Card heading="Referências e proveniência" id="fontes"><p>Origem: imagens fornecidas por meio do Google Drive. Integridade SHA-256 registrada no manifesto; licença de reutilização e homologação editorial ainda pendentes.</p><a href={asset.url} download className="ce-lib-download"><FileDown size={16}/>Abrir arquivo AVIF</a></Card>
 </main>
 <Related lib={lib} assets={getAssets(lib.category)} object/>
 </div>
 </LibraryFrame>;
}
export function LibraryObject({slug,object}:{slug:string;object:string}){
 const lib=getLibrary(slug);
 if(!lib||slug==="acervo-a-classificar")return <p>Biblioteca indisponível para publicação; classificação editorial pendente.</p>;
 if(slug==="anatomia"&&object==="coracao-humano")return <HeartContent lib={lib}/>;
 const asset=assetById(lib.category,object);
 if(!asset)return <p>Objeto não encontrado nesta biblioteca.</p>;
 return <GenericObjectContent lib={lib} asset={asset}/>;
}
