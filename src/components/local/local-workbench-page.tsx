import { Link } from '@tanstack/react-router';
import { useEffect, useState, type ChangeEvent } from 'react';
import { initialWorkbench, validateWorkbench, exportWorkbench, type LocalToolPublication, type LocalWorkbench } from '@/lib/local-workbench-store';
import { readPublicationRegister, saveLocalDraft, publishLocalDraft, exportPublicationRegister } from '@/lib/local-publication-register';
import { templateContracts, type TemplateKind } from '@/lib/template-contract';
import { templateExamples } from '@/lib/template-examples';
export function LocalWorkbenchPage() {
  const [model, setModel] = useState<LocalWorkbench>(initialWorkbench);
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('Os dados serão lidos deste navegador.');
  useEffect(() => {
    try { const register = readPublicationRegister(); setModel(register.draft); setDirty(false); setRevision(register.revision); setStatus('Rascunho local carregado.'); }
    catch { setStatus('Dados locais inválidos. Nenhum registro foi sobrescrito; faça revisão antes de salvar.'); }
  }, []);
  // The storage event runs in other tabs; never overwrite unsaved edits on notice.
  useEffect(() => {
    function notifyExternalChange(event: StorageEvent) {
      if (event.key !== 'cde-backup-public:publication-register:v2' && event.key !== null) return;
      try {
        const latest = readPublicationRegister();
        if (latest.revision !== revision) {
          setStatus('Outra aba atualizou o registro. Seus dados nesta tela foram preservados; recarregue para reconciliar antes de salvar ou publicar.');
        }
      } catch {
        setStatus('O registro local foi alterado ou está inválido em outra aba. Salvar e publicar permanecem sujeitos à validação.');
      }
    }
    window.addEventListener('storage', notifyExternalChange);
    return () => window.removeEventListener('storage', notifyExternalChange);
  }, [revision]);

  function save() {
    try { const register = saveLocalDraft(model, revision); setModel(register.draft); setDirty(false); setRevision(register.revision); setStatus('Rascunho salvo; publicação inalterada.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Falha ao salvar.'); }
  }
  function publish() {
    try { if (dirty) throw new Error('Salve o rascunho antes de publicar.');
      const register = publishLocalDraft(revision); setRevision(register.revision); setStatus('Publicação local atualizada após validação.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Publicação bloqueada.'); }
  }
  function edit(next: LocalToolPublication) {
    setModel((current) => ({ ...current, tools: current.tools.map((item) => item.slug === next.slug ? next : item) }));
    setDirty(true); setStatus('Há alterações não salvas.');
  }
  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 100_000) throw new Error('Arquivo muito grande.');
      setModel(validateWorkbench(JSON.parse(await file.text()) as unknown));
      setDirty(true); setStatus('Arquivo validado e carregado como rascunho. Clique em Salvar para persistir.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Importação rejeitada.'); }
    event.target.value = '';
  }
  return (
    <main id="conteudo" className="page-wide local-workbench" style={{ margin: '2rem auto', padding: '1rem' }}>
      <p className="eyebrow">Backup público · edição offline de metadados</p>
      <h1>Oficina local</h1>
      <p>Sem login, sem conexão à fonte administrativa remota. Rascunhos ficam neste navegador. Só a ação explícita Publicar altera as projeções locais do público e assinante; outros navegadores não são afetados. Não informe dados de pacientes ou informações confidenciais.</p>
      <nav aria-label="Navegação da oficina"><Link to="/">Site público</Link> · <Link to="/admin">Administração local</Link></nav>
      <p role="status" aria-live="polite">{status} Revisão local: {revision}.</p>
      <div className="area-links">
        <button type="button" onClick={save}>Salvar rascunho local</button>
        <button type="button" onClick={publish} disabled={dirty}>Publicar rascunho salvo (local)</button>
        <button type="button" onClick={exportPublicationRegister}>Exportar registro de eventos</button>
        <button type="button" onClick={() => exportWorkbench(model)}>Exportar JSON</button>
        <label>Importar JSON <input type="file" accept=".json,application/json" onChange={(event) => void importFile(event)} /></label>
      </div>
      <section aria-labelledby="tools-heading"><h2 id="tools-heading">Instrumentos ({model.tools.length})</h2>
        <ul className="admin-list">
          {model.tools.map((item) => <li key={item.slug} className="paper agent-card"><LocalEditor value={item} onChange={edit} /></li>)}
        </ul>
      </section>
      <section><h2>Famílias de templates</h2>
        <ul>
          {templateExamples.map((exemplo) => (
            <li key={exemplo.kind}>
              {exemplo.kind}: {exemplo.frame}, {templateContracts[exemplo.kind as TemplateKind].hero} — {exemplo.url}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function LocalEditor({ value, onChange }: { value: LocalToolPublication; onChange: (next: LocalToolPublication) => void }) {
  return <fieldset><legend>{value.slug}</legend>
    <label>Título <input value={value.title} maxLength={80} onChange={(event) => onChange({ ...value, title: event.target.value })} /></label>
    <label>Descrição <textarea value={value.lead} maxLength={400} onChange={(event) => onChange({ ...value, lead: event.target.value })} /></label>
    <label><input type="checkbox" checked={value.published} onChange={(event) => onChange({ ...value, published: event.target.checked })} /> Publicação desejada (rascunho local)</label>
  </fieldset>;
}
