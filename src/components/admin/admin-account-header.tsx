import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Bell, Check, LogIn, LogOut, Settings2, X } from 'lucide-react';
import { authEnabled, signOut } from '@/lib/auth/client';
import { hasGateSessionMarker } from '@/lib/auth/gate-session-marker';
import { useCurrentUserState } from '@/lib/auth/use-current-user';
import pmoQueue from '../../../registers/pmo/queue.v1.json';
import '@/styles/admin-account-header.css';

type Menu = 'alerts' | 'settings' | 'profile' | null;
const subscribeToNothing = () => () => false;
const notOnServer = () => false;
const unresolved = pmoQueue.items.filter(item => item.status !== 'DONE');
export function AdminAccountHeader({
  compact, onCompactChange, onShowPmo,
}: {
  compact:boolean;
  onCompactChange:(value:boolean)=>void;
  onShowPmo:()=>void;
}) {
  const { user, isPending }=useCurrentUserState();
  const gateSession=useSyncExternalStore(subscribeToNothing,hasGateSessionMarker,notOnServer);
  const [menu,setMenu]=useState<Menu>(null);
  const [signingOut,setSigningOut]=useState(false);
  const [error,setError]=useState('');
  const ref=useRef<HTMLElement>(null);
  const isRealSession=Boolean(authEnabled && user && !user.isDevFallback);
  const canSignOut=isRealSession && !gateSession;
  const displayName=isRealSession?(user?.displayName||user?.primaryEmail||'Minha conta'):'Área administrativa';
  const initials=(isRealSession?displayName:'A').trim().slice(0,1).toLocaleUpperCase('pt-BR');
  useEffect(()=>{
    if(!menu)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenu(null);};
    const onPointer=(event:PointerEvent)=>{if(ref.current && !ref.current.contains(event.target as Node))setMenu(null);};
    window.addEventListener('keydown',onKey);
    window.addEventListener('pointerdown',onPointer);
    return ()=>{window.removeEventListener('keydown',onKey);window.removeEventListener('pointerdown',onPointer);};
  },[menu]);
  const open=(name:Exclude<Menu,null>)=>{setMenu(old=>old===name?null:name);setError('');};
  async function exit(){
    if(!canSignOut||signingOut)return;
    setSigningOut(true);setError('');
    try{await signOut('/login');}
    catch{setError('Não foi possível encerrar a sessão. Tente novamente.');setSigningOut(false);}
  }
  return <header className="ce-account-bar" ref={ref} aria-label="Cabeçalho da administração">
    <div className="ce-account-brand">
      <span className="ce-account-brand-mark" aria-hidden="true">CE</span>
      <span><strong>Administração</strong><small>Painel de gestão</small></span>
    </div>
    <div className="ce-account-controls">
      <div className="ce-account-control">
        <button className="ce-account-icon" type="button" aria-label={'Notificações'+(unresolved.length?' ('+unresolved.length+')':'')} aria-expanded={menu==='alerts'} aria-controls="ce-account-alerts" onClick={()=>open('alerts')}>
          <Bell size={19} aria-hidden="true"/>{unresolved.length>0&&<span className="ce-account-alert-dot" aria-hidden="true"/>}
        </button>
        {menu==='alerts'&&<div className="ce-account-popover" id="ce-account-alerts" role="region" aria-label="Notificações">
          <div className="ce-account-popover-head"><strong>Notificações</strong><button type="button" aria-label="Fechar notificações" onClick={()=>setMenu(null)}><X size={17}/></button></div>
          <p>{unresolved.length?unresolved.length+' ordens do PMO ainda não concluídas.':'Nenhuma ordem pendente no registro consultado.'}</p>
          <small>Informações do PMO versionado; não são avisos em tempo real.</small>
          <button type="button" className="ce-account-action" onClick={()=>{setMenu(null);onShowPmo();}}>Consultar PMO</button>
        </div>}
      </div>
      <div className="ce-account-control">
        <button className="ce-account-icon" type="button" aria-label="Configurações" aria-expanded={menu==='settings'} aria-controls="ce-account-settings" onClick={()=>open('settings')}><Settings2 size={19} aria-hidden="true"/></button>
        {menu==='settings'&&<div className="ce-account-popover" id="ce-account-settings" role="region" aria-label="Configurações">
          <div className="ce-account-popover-head"><strong>Configurações</strong><button type="button" aria-label="Fechar configurações" onClick={()=>setMenu(null)}><X size={17}/></button></div>
          <label className="ce-account-toggle"><input type="checkbox" checked={compact} onChange={e=>onCompactChange(e.target.checked)} /><span><strong>Visualização compacta</strong><small>Reduz os espaços dos painéis nesta sessão.</small></span></label>
        </div>}
      </div>
      <div className="ce-account-control">
        <button type="button" className="ce-account-avatar-button" aria-label="Meu perfil" aria-expanded={menu==='profile'} aria-controls="ce-account-profile" onClick={()=>open('profile')}>
          {isRealSession && user?.profileImageUrl?<img src={user.profileImageUrl} alt="" referrerPolicy="no-referrer" />:<span className="ce-account-avatar-fallback" aria-hidden="true">{initials}</span>}
          <span className="ce-account-user-label">{isPending?'Carregando…':displayName}</span>
        </button>
        {menu==='profile'&&<div className="ce-account-popover" id="ce-account-profile" role="region" aria-label="Meu perfil">
          <div className="ce-account-popover-head"><strong>Meu perfil</strong><button type="button" aria-label="Fechar perfil" onClick={()=>setMenu(null)}><X size={17}/></button></div>
          <p>{isPending?'Carregando perfil…':displayName}</p>
          {isRealSession&&user?.primaryEmail&&<small>{user.primaryEmail}</small>}
          {!isRealSession&&<small>O acesso por conta não está ativo nesta sessão.</small>}
          {isRealSession&&<span className="ce-account-auth-ok"><Check size={14}/> Conta conectada</span>}
        </div>}
      </div>
      {canSignOut?<button className="ce-account-icon ce-account-logout" type="button" aria-label="Sair" title="Sair da conta" disabled={signingOut} onClick={()=>void exit()}><LogOut size={19} aria-hidden="true"/></button>:
        authEnabled&&!isPending&&!user?<Link to="/login" className="ce-account-icon ce-account-logout" aria-label="Entrar" title="Entrar"><LogIn size={19} aria-hidden="true"/></Link>:
        <button className="ce-account-icon ce-account-logout" type="button" disabled aria-label="Sair indisponível" title="Sair estará disponível quando houver uma sessão autenticada"><LogOut size={19} aria-hidden="true"/></button>}
      {error&&<span className="ce-account-error" role="alert">{error}</span>}
    </div>
  </header>;
}
