import {useEffect,useMemo,useState,type Dispatch,type FormEvent,type ReactNode,type SetStateAction} from "react";
import {Breadcrumb} from "@/components/site/breadcrumb";
import {Callout} from "@/components/site/callout";
import {PageHero} from "@/components/site/page-hero";
import {addCareerApplication,addCareerMilestone,getCareerSnapshot,saveCareerProfile,saveCareerSkill,setCareerCredential,updateCareerApplication,type CareerAudience,type CareerSnapshot} from "@/lib/career.functions";
import "@/styles/career.css";

const stageLabels:Record<string,string>={EXPLORING:"Explorando",STUDENT:"Estudante",FIRST_JOB:"Primeiro emprego",PROFESSIONAL:"Profissional",SPECIALIST:"Especialização",LEADERSHIP:"Liderança",RESEARCH:"Pesquisa",INTERNATIONAL:"Internacional"};
const appStageLabels:Record<string,string>={SAVED:"Salva",APPLIED:"Candidatura enviada",INTERVIEW:"Entrevista",TECHNICAL_STAGE:"Etapa técnica",OFFER:"Proposta",APPROVED:"Aprovado",DECLINED:"Encerrado/recusado",CLOSED:"Fechado"};
const credentialLabels:Record<string,string>={PLANNED:"Planejada",IN_PROGRESS:"Em andamento",COMPLETED:"Concluída",RENEWAL_REVIEW:"Revisar renovação"};

function participantKey(){if(typeof window==="undefined")return"";const k="ce.career.participant.v1";let v=localStorage.getItem(k);if(!v){v=`anon-${crypto.randomUUID()}`;localStorage.setItem(k,v)}return v}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="ce-career-field"><span>{label}</span>{children}</label>}
function Stat({value,label,note}:{value:string|number;label:string;note:string}){return <article className="ce-career-card ce-career-stat"><strong>{value}</strong><h3>{label}</h3><span>{note}</span></article>}

export function CareerHub({audience}:{audience:CareerAudience}){
 const[snapshot,setSnapshot]=useState<CareerSnapshot|null>(null);const[active,setActive]=useState("");const[status,setStatus]=useState("Carregando domínio de carreira do banco candidato…");
 const key=useMemo(()=>participantKey(),[]);
 const refresh=()=>getCareerSnapshot({data:{audience,participantKey:key}}).then(x=>{setSnapshot(x);setStatus("Banco candidato PGLite sincronizado.");return x}).catch((e:Error)=>{setStatus(`Falha no candidato: ${e.message}`);throw e});
 useEffect(()=>{void refresh()},[audience]);
 useEffect(()=>{if(!snapshot)return;const h=location.hash.slice(1);const slug=snapshot.modules.some(m=>m.slug===h)?h:snapshot.modules[0]?.slug??"";setActive(slug);const f=()=>{const n=location.hash.slice(1);if(snapshot.modules.some(m=>m.slug===n))setActive(n)};addEventListener("hashchange",f);return()=>removeEventListener("hashchange",f)},[snapshot]);
 const mod=snapshot?.modules.find(m=>m.slug===active)??snapshot?.modules[0];
 const choose=(slug:string)=>{setActive(slug);history.replaceState(null,"",`#${slug}`)};
 if(!snapshot||!mod)return <main id="conteudo" className="ce-career"><Breadcrumb items={[{label:"Início",to:"/"},{label:audience==="YOUTH"?"Jovens":"Carreira"}]}/><PageHero eyebrow="Carreira · candidato DB-first" title={audience==="YOUTH"?"Portal do Jovem":"Carreira e Desenvolvimento"} lead={status}/></main>;
 return <main id="conteudo" className="ce-career" tabIndex={-1}>
  <Breadcrumb items={[{label:"Início",to:"/"},{label:snapshot.projection.title}]}/>
  <PageHero eyebrow={audience==="YOUTH"?"Jovens · descoberta e carreira":"Carreira · DB-first"} title={snapshot.projection.title} lead={snapshot.projection.lead}/>
  <div className="ce-career-meta"><span className="ce-career-chip">CANDIDATE · branch isolada</span><span className="ce-career-chip">Fonte da interface: PGLite</span><span className="ce-career-chip">{audience==="YOUTH"?"projeção YOUTH":"projeção PROFESSIONAL"}</span></div>
  <Callout tone="warn"><b>Ambiente candidato.</b> Conteúdo editorial, requisitos profissionais, salários, vagas, concursos, credenciais e regras por jurisdição só podem ser promovidos quando a fonte correspondente for qualificada. Dados pessoais identificáveis não são armazenados neste workspace.</Callout>
  <div className="ce-career-shell">
   <nav className="ce-career-nav" aria-label={audience==="YOUTH"?"Portal do Jovem":"Módulos de Carreira"}>{snapshot.modules.map(m=><button key={m.id} type="button" aria-current={mod.slug===m.slug?"page":undefined} onClick={()=>choose(m.slug)}><small>{m.objectClass} · {m.family}</small>{m.title}</button>)}</nav>
   <section className="ce-career-main"><article className="ce-career-screen"><header className="ce-career-head"><div><p className="ce-career-kicker">{mod.objectClass} · {mod.family}</p><h2>{mod.title}</h2><p>{mod.description}</p></div><span className="ce-career-badge">{mod.objectClass}</span></header><CareerModule module={mod.slug} audience={audience} snapshot={snapshot} refresh={refresh} status={status}/></article></section>
  </div>
 </main>
}

function CareerModule({module,audience,snapshot,refresh,status}:{module:string;audience:CareerAudience;snapshot:CareerSnapshot;refresh:()=>Promise<CareerSnapshot>;status:string}){
 if(module==="visao-geral")return <Overview snapshot={snapshot} status={status}/>;
 if(module==="passaporte")return <Passport snapshot={snapshot} refresh={refresh}/>;
 if(module==="skills")return <Skills snapshot={snapshot} refresh={refresh}/>;
 if(module==="trilhas")return <Paths snapshot={snapshot}/>;
 if(module==="oportunidades"||module==="primeiros-passos")return <Opportunities snapshot={snapshot}/>;
 if(module==="candidaturas")return <Applications snapshot={snapshot} refresh={refresh}/>;
 if(module==="credenciais")return <Credentials snapshot={snapshot} refresh={refresh}/>;
 if(module==="documentos")return <Documents snapshot={snapshot}/>;
 if(module==="mercado")return <Market snapshot={snapshot}/>;
 if(module==="conteudos-carreira"||module==="conteudos-jovens")return <Editorial snapshot={snapshot}/>;
 if(module==="descobrir"||module==="enfermagem-carreira")return <Roles snapshot={snapshot}/>;
 if(module==="autoconhecimento")return <Reflection snapshot={snapshot}/>;
 if(module==="jogos-quizzes")return <YouthActivities snapshot={snapshot}/>;
 if(module==="aprendizagem")return <Learning snapshot={snapshot}/>;
 if(module==="comparador")return <RoleComparator snapshot={snapshot}/>;
 if(module==="entrevistas")return <InterviewScenarios snapshot={snapshot}/>;
 if(module==="vida-profissional")return <Worklife snapshot={snapshot}/>;
 if(module==="rede")return <Network snapshot={snapshot}/>;
 if(module==="exterior")return <International snapshot={snapshot}/>;
 if(module==="saude-jovem")return <YouthHealth snapshot={snapshot}/>;
 if(module==="empreendedorismo")return <DatabaseModule snapshot={snapshot} slug={module}/>;
 return <DatabaseModule snapshot={snapshot} slug={module} audience={audience}/>;
}

function Overview({snapshot,status}:{snapshot:CareerSnapshot;status:string}){
 const gapCount=useMemo(()=>{if(!snapshot.profile?.targetRoleId)return 0;const levels=new Map(snapshot.profileSkills.map(x=>[x.skillId,x.selfLevel]));return snapshot.roleSkills.filter(x=>x.roleId===snapshot.profile?.targetRoleId&&(levels.get(x.skillId)??0)<x.requiredLevel).length},[snapshot]);
 return <><div className="ce-career-grid is-4"><Stat value={snapshot.roles.length} label="Papéis" note="taxonomia candidata"/><Stat value={snapshot.skills.length} label="Skills" note="grafo de competências"/><Stat value={snapshot.opportunityTypes.length} label="Tipos de oportunidade" note="família unificada"/><Stat value={gapCount} label="Gaps do alvo" note="quando há papel-alvo"/></div><div className="ce-career-grid" style={{marginTop:12}}><article className="ce-career-card"><h3>Orquestração</h3><p>Pessoa → skill → nível → requisito → gap → trilha → oportunidade → candidatura → marco. A interface é projeção desse modelo.</p></article><article className="ce-career-card"><h3>Estado técnico</h3><p>{status}</p><p style={{marginTop:8}}>Nenhuma vaga real ou salário é inventado: sinais externos permanecem SOURCE_REQUIRED até aquisição qualificada.</p></article></div></>
}

function Passport({snapshot,refresh}:{snapshot:CareerSnapshot;refresh:()=>Promise<CareerSnapshot>}){
 const[p,setP]=useState({targetRoleId:snapshot.profile?.targetRoleId??"",stage:snapshot.profile?.stage??"EXPLORING",goal:snapshot.profile?.goal??""});const[msg,setMsg]=useState("");
 useEffect(()=>setP({targetRoleId:snapshot.profile?.targetRoleId??"",stage:snapshot.profile?.stage??"EXPLORING",goal:snapshot.profile?.goal??""}),[snapshot.profile]);
 async function save(e:FormEvent){e.preventDefault();try{await saveCareerProfile({data:{participantKey:participantKey(),targetRoleId:p.targetRoleId||null,stage:p.stage,goal:p.goal}});setMsg("Passaporte candidato atualizado.");await refresh()}catch(e){setMsg((e as Error).message)}}
 const role=snapshot.roles.find(x=>x.id===p.targetRoleId);
 return <form className="ce-career-form" onSubmit={save}><div className="ce-career-grid"><Field label="Etapa da jornada"><select value={p.stage} onChange={e=>setP(v=>({...v,stage:e.target.value}))}>{Object.entries(stageLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Field><Field label="Papel-alvo"><select value={p.targetRoleId} onChange={e=>setP(v=>({...v,targetRoleId:e.target.value}))}><option value="">Ainda não definido</option>{snapshot.roles.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></Field></div><Field label="Objetivo — sem dados de contato"><textarea rows={4} maxLength={600} value={p.goal} onChange={e=>setP(v=>({...v,goal:e.target.value}))}/></Field>{role?<article className="ce-career-card"><h3>{role.title}</h3><p>{role.summary}</p><p style={{marginTop:8}}>{role.educationPath}</p></article>:null}<button className="ce-career-btn">Salvar no banco candidato</button>{msg?<p className="ce-career-status">{msg}</p>:null}<Milestones snapshot={snapshot} refresh={refresh}/></form>
}

function Milestones({snapshot,refresh}:{snapshot:CareerSnapshot;refresh:()=>Promise<CareerSnapshot>}){
 const[label,setLabel]=useState("");async function add(){if(label.trim().length<3)return;await addCareerMilestone({data:{participantKey:participantKey(),milestoneType:"CAREER",label}});setLabel("");await refresh()}
 return <div><h3>Linha do tempo</h3><div className="ce-career-grid"><Field label="Novo marco"><input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Ex.: concluí uma etapa de formação"/></Field><button type="button" className="ce-career-btn" onClick={()=>void add()}>Adicionar marco</button></div>{snapshot.milestones.length?<div className="ce-career-list">{snapshot.milestones.map(m=><div className="ce-career-row" key={m.id}><div><h3>{m.label}</h3><p>{m.milestoneType}</p></div><span className="ce-career-badge">{m.achievedOn??"registrado"}</span></div>)}</div>:<div className="ce-career-empty">Nenhum marco registrado nesta sessão candidata.</div>}</div>
}

function Skills({snapshot,refresh}:{snapshot:CareerSnapshot;refresh:()=>Promise<CareerSnapshot>}){
 const levels=new Map(snapshot.profileSkills.map(x=>[x.skillId,x.selfLevel]));const role=snapshot.roles.find(x=>x.id===snapshot.profile?.targetRoleId);const reqs=snapshot.roleSkills.filter(x=>x.roleId===role?.id);
 async function set(skillId:string,level:number){await saveCareerSkill({data:{participantKey:participantKey(),skillId,level}});await refresh()}
 return <><div className="ce-career-list">{snapshot.skills.map(s=><div className="ce-career-row" key={s.id}><div><h3>{s.name}</h3><p>{s.category} · {s.description}</p></div><div className="ce-career-level"><span>Nível</span><select aria-label={`Nível de ${s.name}`} value={levels.get(s.id)??0} onChange={e=>void set(s.id,Number(e.target.value))}>{[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></div></div>)}</div><h3 style={{marginTop:20}}>Gap para {role?.title??"papel-alvo"}</h3>{role&&reqs.length?reqs.map(r=>{const skill=snapshot.skills.find(s=>s.id===r.skillId);const have=levels.get(r.skillId)??0;const pct=Math.min(100,Math.round(have/r.requiredLevel*100));return <div className="ce-career-gap" key={r.skillId}><span>{skill?.name??r.skillId}</span><div className="ce-career-track"><div className="ce-career-fill" style={{width:`${pct}%`}}/></div><b>{have}/{r.requiredLevel}</b></div>}):<p className="ce-career-status">Escolha um papel-alvo no Passaporte para calcular gaps a partir do banco.</p>}</>
}

function Paths({snapshot}:{snapshot:CareerSnapshot}){return <div className="ce-career-grid">{snapshot.paths.map(p=><article className="ce-career-card" key={p.id}><h3>{p.title}</h3><p>{p.summary}</p><div className="ce-career-path" style={{marginTop:14}}>{snapshot.pathSteps.filter(s=>s.pathId===p.id).map(s=><div className="ce-career-step" key={s.stepOrder}><strong>{s.stepOrder}. {s.title}</strong><span>{s.description}</span></div>)}</div></article>)}</div>}

function Opportunities({snapshot}:{snapshot:CareerSnapshot}){return <><div className="ce-career-grid is-3">{snapshot.opportunityTypes.map(o=><article className="ce-career-card" key={o.id}><h3>{o.title}</h3><p>{o.description}</p><footer><span className="ce-career-badge">{o.kind}</span>{o.officialSourceRequired?<span className="ce-career-badge">fonte oficial requerida</span>:null}</footer></article>)}</div><p className="ce-career-status">Esta branch modela a família de oportunidades, mas não publica vagas/editais reais sem aquisição atual e fonte verificável.</p></>}

function Applications({snapshot,refresh}:{snapshot:CareerSnapshot;refresh:()=>Promise<CareerSnapshot>}){
 const[form,setForm]=useState({kind:snapshot.opportunityTypes[0]?.kind??"JOB",label:""});const[msg,setMsg]=useState("");
 async function add(e:FormEvent){e.preventDefault();try{await addCareerApplication({data:{participantKey:participantKey(),opportunityKind:form.kind,label:form.label}});setForm(v=>({...v,label:""}));setMsg("Processo adicionado.");await refresh()}catch(e){setMsg((e as Error).message)}}
 async function move(id:string,stage:string){await updateCareerApplication({data:{participantKey:participantKey(),id,stage}});await refresh()}
 return <><form className="ce-career-grid" onSubmit={add}><Field label="Tipo"><select value={form.kind} onChange={e=>setForm(v=>({...v,kind:e.target.value}))}>{snapshot.opportunityTypes.map(o=><option key={o.kind} value={o.kind}>{o.title}</option>)}</select></Field><Field label="Identificação do processo — sem contato pessoal"><input required minLength={3} maxLength={160} value={form.label} onChange={e=>setForm(v=>({...v,label:e.target.value}))} placeholder="Ex.: processo seletivo UTI — hospital X"/></Field><button className="ce-career-btn">Adicionar ao tracker</button></form>{msg?<p className="ce-career-status">{msg}</p>:null}<div className="ce-career-list" style={{marginTop:16}}>{snapshot.applications.length?snapshot.applications.map(a=><div className="ce-career-row" key={a.id}><div><h3>{a.label}</h3><p>{a.opportunityKind}</p></div><select aria-label={`Etapa de ${a.label}`} value={a.stage} onChange={e=>void move(a.id,e.target.value)}>{Object.entries(appStageLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>):<div className="ce-career-empty">Nenhuma candidatura registrada.</div>}</div></>
}

function Credentials({snapshot,refresh}:{snapshot:CareerSnapshot;refresh:()=>Promise<CareerSnapshot>}){
 const states=new Map(snapshot.profileCredentials.map(x=>[x.credentialId,x.state]));async function set(id:string,state:string){await setCareerCredential({data:{participantKey:participantKey(),credentialId:id,state}});await refresh()}
 return <div className="ce-career-list">{snapshot.credentials.map(c=><div className="ce-career-row" key={c.id}><div><h3>{c.title}</h3><p>{c.category} · {c.validityNote}</p></div><select aria-label={`Estado de ${c.title}`} value={states.get(c.id)??"PLANNED"} onChange={e=>void set(c.id,e.target.value)}>{Object.entries(credentialLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>)}</div>
}

function Documents({snapshot}:{snapshot:CareerSnapshot}){
 const role=snapshot.roles.find(x=>x.id===snapshot.profile?.targetRoleId);const skills=snapshot.profileSkills.filter(x=>x.selfLevel>0).sort((a,b)=>b.selfLevel-a.selfLevel).map(x=>snapshot.skills.find(s=>s.id===x.skillId)?.name).filter(Boolean);const creds=snapshot.profileCredentials.filter(x=>x.state==="COMPLETED").map(x=>snapshot.credentials.find(c=>c.id===x.credentialId)?.title).filter(Boolean);
 const preview=[role?`Papel-alvo: ${role.title}`:"Papel-alvo: não definido",snapshot.profile?.goal?`Objetivo: ${snapshot.profile.goal}`:"Objetivo: não definido",skills.length?`Competências: ${skills.join(", ")}`:"Competências: ainda não registradas",creds.length?`Credenciais: ${creds.join(", ")}`:"Credenciais concluídas: nenhuma registrada"].join("\n\n");
 return <><div className="ce-career-grid">{snapshot.documents.map(d=><article className="ce-career-card" key={d.id}><h3>{d.title}</h3><p>{d.description}</p><footer><span className="ce-career-badge">{d.kind}</span></footer></article>)}</div><h3 style={{marginTop:18}}>Projeção do passaporte</h3><div className="ce-career-doc">{preview}</div><p className="ce-career-status">A projeção usa somente dados do passaporte candidato. Nome, contato e dados identificáveis não são coletados nesta branch.</p></>
}

function Market({snapshot}:{snapshot:CareerSnapshot}){return <div className="ce-career-grid">{snapshot.market.map(m=><article className="ce-career-card" key={m.id}><h3>{m.label}</h3><p>{m.metricValue===null?"Nenhum valor promovido. Aguardando fonte atual verificável.":`${m.metricValue} ${m.unit??""}`}</p><footer><span className="ce-career-badge">{m.region}</span><span className="ce-career-badge">{m.status}</span></footer></article>)}</div>}

function Editorial({snapshot}:{snapshot:CareerSnapshot}){return <div className="ce-career-grid">{snapshot.editorial.map(e=><article className="ce-career-card" key={e.id}><h3>{e.title}</h3><p>{e.dek}</p><footer><span className="ce-career-badge">{e.contentType}</span><span className="ce-career-badge">{e.status}</span>{e.linkedObjectRef?<span className="ce-career-badge">{e.linkedObjectType}:{e.linkedObjectRef}</span>:null}</footer></article>)}</div>}

function Roles({snapshot}:{snapshot:CareerSnapshot}){return <div className="ce-career-grid">{snapshot.roles.map(r=><article className="ce-career-card" key={r.id}><h3>{r.title}</h3><p>{r.summary}</p><p style={{marginTop:8}}><b>Caminho formativo:</b> {r.educationPath}</p><footer><span className="ce-career-badge">{r.family}</span></footer></article>)}</div>}

function Reflection({snapshot}:{snapshot:CareerSnapshot}){
 const[answers,setAnswers]=useState<Record<string,number>>({});const scores=useMemo(()=>{const m=new Map<string,number>();for(const q of snapshot.reflection)m.set(q.dimension,(m.get(q.dimension)??0)+(answers[q.id]??0)*q.weight);return [...m.entries()].sort((a,b)=>b[1]-a[1])},[answers,snapshot.reflection]);
 return <><Callout tone="note"><b>Reflexão educativa.</b> Isto não é teste vocacional psicométrico, diagnóstico ou recomendação determinista. Serve para explorar interesses e gerar perguntas para conversa e pesquisa.</Callout><div className="ce-career-list">{snapshot.reflection.map(q=><article className="ce-career-question" key={q.id}><p>{q.prompt}</p><input aria-label={q.prompt} type="range" min="0" max="2" step="1" value={answers[q.id]??0} onChange={e=>setAnswers(v=>({...v,[q.id]:Number(e.target.value)}))}/><small>0 = pouco · 1 = talvez · 2 = muito</small></article>)}</div><h3 style={{marginTop:18}}>Dimensões para explorar</h3>{scores.map(([dim,score])=><div className="ce-career-dimension" key={dim}><span>{dim}</span><b>{score}</b></div>)}</>
}


function Learning({snapshot}:{snapshot:CareerSnapshot}){
 return <div className="ce-career-grid">{snapshot.learningResources.map(item=><article className="ce-career-card" key={item.id}><h3>{item.title}</h3><p>{item.description}</p><footer><span className="ce-career-badge">{item.kind}</span><span className="ce-career-badge">{item.status}</span>{item.sourceRequired?<span className="ce-career-badge">fonte requerida</span>:null}</footer></article>)}</div>
}

function InterviewScenarios({snapshot}:{snapshot:CareerSnapshot}){
 return <div className="ce-career-grid">{snapshot.interviewScenarios.map(item=><article className="ce-career-card" key={item.id}><h3>{item.title}</h3><p>{item.description}</p><footer><span className="ce-career-badge">{item.kind}</span><span className="ce-career-badge">{item.status}</span></footer></article>)}</div>
}

function Network({snapshot}:{snapshot:CareerSnapshot}){
 return <><div className="ce-career-grid">{snapshot.networkCapabilities.map(item=><article className="ce-career-card" key={item.id}><h3>{item.title}</h3><p>{item.description}</p><footer><span className="ce-career-badge">{item.status}</span>{item.requiresIdentity?<span className="ce-career-badge">identidade requerida</span>:null}{item.moderationRequired?<span className="ce-career-badge">moderação requerida</span>:null}</footer></article>)}</div><p className="ce-career-status">Recursos multiusuário permanecem HOLD_HUMAN nesta branch local: o banco modela a capacidade, mas não inventa perfis, mentores ou conexões.</p></>
}

function International({snapshot}:{snapshot:CareerSnapshot}){
 return <div className="ce-career-grid">{snapshot.jurisdictionRequirements.map(item=><article className="ce-career-card" key={item.id}><h3>{item.title}</h3><p>{item.description}</p><footer><span className="ce-career-badge">{item.requirementKind}</span><span className="ce-career-badge">{item.jurisdiction}</span><span className="ce-career-badge">{item.status}</span></footer></article>)}</div>
}

function Worklife({snapshot}:{snapshot:CareerSnapshot}){
 return <div className="ce-career-grid">{snapshot.worklifeCapabilities.map(item=><article className="ce-career-card" key={item.id}><h3>{item.title}</h3><p>{item.description}</p><footer><span className="ce-career-badge">{item.kind}</span><span className="ce-career-badge">{item.status}</span>{item.normativeSourceRequired?<span className="ce-career-badge">fonte normativa requerida</span>:null}</footer></article>)}</div>
}

function YouthActivities({snapshot}:{snapshot:CareerSnapshot}){
 return <><div className="ce-career-grid">{snapshot.youthActivities.map(item=><article className="ce-career-card" key={item.id}><h3>{item.title}</h3><p>{item.description}</p><footer><span className="ce-career-badge">{item.kind}</span><span className="ce-career-badge">{item.status}</span></footer></article>)}</div><p className="ce-career-status">Atividades em HOLD permanecem como contrato/candidato; não são apresentadas como jogo ou quiz homologado antes do conteúdo e das regras serem qualificados.</p></>
}

function YouthHealth({snapshot}:{snapshot:CareerSnapshot}){
 const module=snapshot.modules.find(x=>x.slug==="saude-jovem");
 return <><article className="ce-career-card"><h3>{module?.title??"Saúde para jovens"}</h3><p>{module?.description??"Conteúdo governado por fontes próprias."}</p><footer><span className="ce-career-badge">EDITORIAL</span><span className="ce-career-badge">conteúdo governado separadamente</span></footer></article><p className="ce-career-status">Esta projeção não cria conteúdo clínico novo. Materiais de saúde para jovens deverão consumir bibliotecas, políticas e fontes qualificadas do CKO.</p></>
}

function RoleComparator({snapshot}:{snapshot:CareerSnapshot}){
 const[first,setFirst]=useState(snapshot.roles[0]?.id??"");
 const[second,setSecond]=useState(snapshot.roles[1]?.id??"");
 const a=snapshot.roles.find(x=>x.id===first);const b=snapshot.roles.find(x=>x.id===second);
 const requirement=(roleId:string)=>new Map(snapshot.roleSkills.filter(x=>x.roleId===roleId).map(x=>[x.skillId,x.requiredLevel]));
 const ar=requirement(first),br=requirement(second);
 const skillIds=[...new Set([...ar.keys(),...br.keys()])];
 return <><div className="ce-career-grid"><Field label="Caminho A"><select value={first} onChange={e=>setFirst(e.target.value)}>{snapshot.roles.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></Field><Field label="Caminho B"><select value={second} onChange={e=>setSecond(e.target.value)}>{snapshot.roles.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></Field></div><div className="ce-career-grid" style={{marginTop:12}}><article className="ce-career-card"><h3>{a?.title??"—"}</h3><p>{a?.summary??""}</p><p style={{marginTop:8}}>{a?.educationPath??""}</p></article><article className="ce-career-card"><h3>{b?.title??"—"}</h3><p>{b?.summary??""}</p><p style={{marginTop:8}}>{b?.educationPath??""}</p></article></div><h3 style={{marginTop:18}}>Skills explicitamente vinculadas no banco</h3>{skillIds.length?skillIds.map(id=>{const skill=snapshot.skills.find(x=>x.id===id);return <div className="ce-career-gap" key={id}><span>{skill?.name??id}</span><div className="ce-career-track"><div className="ce-career-fill" style={{width:`${Math.max(ar.get(id)??0,br.get(id)??0)*20}%`}}/></div><b>{ar.get(id)??"—"} / {br.get(id)??"—"}</b></div>}):<p className="ce-career-status">Ainda não há requisitos de skills vinculados para este par.</p>}<p className="ce-career-status">Comparar não significa classificar um caminho como melhor. O banco mostra diferenças declaradas e gaps conhecidos.</p></>
}

function DatabaseModule({snapshot,slug,audience}:{snapshot:CareerSnapshot;slug:string;audience?:"PROFESSIONAL"|"YOUTH"}){
 const module=snapshot.modules.find(x=>x.slug===slug);
 return <article className="ce-career-card"><h3>{module?.title??(audience==="YOUTH"?"Portal do Jovem":"Carreira")}</h3><p>{module?.description??"Módulo candidato alimentado pelo banco."}</p><footer><span className="ce-career-badge">{module?.objectClass??"CANDIDATE"}</span><span className="ce-career-badge">{module?.family??"db-first"}</span></footer></article>
}


