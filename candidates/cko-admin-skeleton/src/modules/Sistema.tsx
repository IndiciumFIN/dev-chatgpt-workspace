import { useRef, useState } from 'react';
import { ConfirmDialog, DisabledAction, KeyValue, Panel, Tag, useToast } from '../ds/ui.tsx';
import { verifyChain, type AuditEntry } from '../lib/hash-chain.ts';
import { BACKUP_KEY_PATTERN, clearAllKeys, corruptKeys, exportAllKeys, logAudit, setKey, storageMode } from '../lib/local-db.ts';

export function Settings() {
  const toast = useToast(); const file = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState(false); const [typed, setTyped] = useState(''); const [msg, setMsg] = useState('');
  const locked: [string, string, string][] = [
    ['VITE_AUTH_ENABLED', 'false', 'Religar autenticação é decisão explícita de produto e governança.'],
    ['DB_ENABLED', 'false', 'Banco desligado por política do backup público.'],
    ['md_gate', 'fechado', 'Nada vai a RELEASED até a abertura formal do gate.'],
  ];
  const backup = () => { const blob = new Blob([JSON.stringify({ versao: 1, geradoEm: new Date().toISOString(), dados: exportAllKeys() }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cko-admin-backup-local.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); void logAudit('BACKUP', 'settings', 'Backup exportado.'); };
  async function restore(f: File) {
    try {
      if (f.size > 2_000_000) throw new Error('Arquivo excede 2 MB.');
      const parsed = JSON.parse(await f.text()) as { versao?: number; dados?: Record<string, unknown> };
      if (parsed.versao !== 1 || !parsed.dados || typeof parsed.dados !== 'object') throw new Error('Formato de backup inválido.');
      const bad = Object.keys(parsed.dados).filter(k => !BACKUP_KEY_PATTERN.test(k));
      if (bad.length) throw new Error(`Chaves não permitidas: ${bad.join(', ')}.`);
      const audit = parsed.dados.audit;
      if (audit !== undefined) { if (!Array.isArray(audit)) throw new Error('Trilha inválida.'); const v = await verifyChain(audit as AuditEntry[]); if (!v.ok) throw new Error(`Trilha do backup não confere (elo ${v.brokenAt}).`); }
      for (const [k, v] of Object.entries(parsed.dados)) if (v !== null) setKey(k, v);
      void logAudit('RESTAURAR', 'settings', 'Backup importado e validado.'); setMsg(''); toast('Backup restaurado.');
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Importação rejeitada.'); }
    if (file.current) file.current.value = '';
  }
  return <div className="grid">
    <Panel title="Flags travadas por política" subtitle="Não podem ser alteradas por esta tela.">
      <dl className="kv">{locked.map(([k, v, why]) => <div key={k} style={{ display: 'contents' }}><dt><code>{k}</code></dt><dd><Tag tone="warn">{v}</Tag> <span style={{ fontSize: '.8rem' }}>{why}</span></dd></div>)}</dl></Panel>
    <Panel title="Armazenamento" subtitle="Somente neste navegador. Não guarde PHI, credenciais ou tokens.">
      <KeyValue items={[['Modo', storageMode()], ['Chaves ilegíveis', corruptKeys.size ? [...corruptKeys].join(', ') : 'nenhuma'], ['Rede', 'nenhuma chamada externa neste console']]} /></Panel>
    <Panel title="Backup e restauração" subtitle="Exporta/importa os dados locais. A importação valida chaves, tamanho e a trilha encadeada antes de gravar.">
      <div className="row"><button type="button" className="btn" onClick={backup}>Exportar backup (JSON)</button><label className="btn" style={{ cursor: 'pointer' }}>Importar backup<input ref={file} type="file" accept="application/json" className="sr" onChange={e => { const f = e.target.files?.[0]; if (f) void restore(f); }} /></label></div>
      {msg && <div className="errsum" role="alert" style={{ marginTop: 8 }}>{msg}</div>}</Panel>
    <Panel title="Zona de risco"><button type="button" className="btn danger" onClick={() => { setTyped(''); setConfirm(true); }}>Apagar todos os dados locais</button><p className="note">Remove coleções, grafo, trilha e projeções deste navegador. Exporte o backup antes.</p></Panel>
    {confirm && <ConfirmDialog title="Apagar todos os dados locais?" confirmLabel="Apagar tudo" danger onCancel={() => setConfirm(false)} onConfirm={() => { if (typed === 'APAGAR') { clearAllKeys(); setConfirm(false); toast('Dados locais apagados.'); } }}>
      <div className="field"><label htmlFor="del-t">Digite APAGAR para confirmar</label><input id="del-t" value={typed} onChange={e => setTyped(e.target.value)} /></div></ConfirmDialog>}
  </div>;
}

export function Profile() {
  return <div className="grid g2" style={{ alignItems: 'start' }}>
    <Panel title="Sem identidade neste ambiente" subtitle="Autenticação e banco estão desligados por política; não há usuário, equipe ou papel para exibir.">
      <p>As preferências pessoais ficarão separadas das configurações sistêmicas de Governança e Publicação quando houver identidade e autorização no servidor.</p>
      <p className="note">Toda mutação futura deve ser revalidada pelo backend; esconder botões ou usar localStorage nunca é autorização.</p></Panel>
    <Panel title="Sessão"><DisabledAction label="Sair" reason="Indisponível: não existe sessão para encerrar." /></Panel>
  </div>;
}
