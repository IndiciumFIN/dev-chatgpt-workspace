import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const root = mkdtempSync(join(tmpdir(), 'cde-local-test-'));
try {
  writeFileSync(join(root, 'package.json'), '{"type":"module"}');
  writeFileSync(join(root, 'catalog.ts'), "export const tools = [{slug:'test-one',title:'Instrumento inicial',lead:'Descrição suficiente para teste local'}];");
  let workbench = readFileSync('src/lib/local-workbench-store.ts','utf8');
  workbench = workbench.replace("'@/lib/tools/catalog'", "'./catalog.ts'");
  writeFileSync(join(root, 'local-workbench-store.ts'), workbench);
  let register = readFileSync('src/lib/local-publication-register.ts','utf8');
  register = register.replace("'./local-workbench-store'", "'./local-workbench-store.ts'");
  writeFileSync(join(root, 'local-publication-register.ts'), register);
  const data = new Map();
  const localStorage = { getItem: (key) => data.has(key) ? data.get(key) : null, setItem: (key,value) => data.set(key,value), removeItem: key => data.delete(key) };
  globalThis.window = { localStorage, dispatchEvent: () => {} };
  const { initialWorkbench } = await import(pathToFileURL(join(root, 'local-workbench-store.ts')).href);
  const { readPublicationRegister, saveLocalDraft, publishLocalDraft, readLocalPublished } = await import(pathToFileURL(join(root, 'local-publication-register.ts')).href);
  const base = initialWorkbench();

  // A instalacao nova ja vem PUBLICADA. Decisao do dono (2026-10-22): o backup
  // e local, a ferramenta clinica tem que renderizar sem passo de aprovacao
  // manual. A exigencia antiga ("fresh installations must not publish
  // without approval") foi revogada junto com a mudanca.
  //
  // O que continua valendo — e e o que este teste tranca:
  //   - rascunho e publicado sao slots independentes
  //   - SALVAR um rascunho nao escreve no slot publicado
  //   - publicar e uma ACAO EXPLICITA, com revisao e evento
  //   - conflito de revisao e rejeitado
  //   - um workbench legado nao e promovido a publicado
  assert.equal(readLocalPublished().tools[0].title, base.tools[0].title);
  assert.equal(base.tools[0].published, true, 'a instalacao local precisa nascer com a ferramenta publicada');

  const edited = structuredClone(base); edited.tools[0].title = 'Rascunho modificado'; edited.tools[0].published = false;
  let revision = saveLocalDraft(edited, 0);
  assert.equal(revision.revision, 1);
  assert.equal(revision.draft.tools[0].title, 'Rascunho modificado');
  // SALVAR rascunho nao toca no publicado.
  assert.equal(readLocalPublished().tools[0].title, base.tools[0].title);
  assert.equal(readLocalPublished().tools[0].published, true);
  assert.throws(() => publishLocalDraft(0), /Conflito de revisão/);
  assert.throws(() => saveLocalDraft(edited, 0), /Conflito de revisão/);

  // Publicar e explicito: enquanto nao se publica, o rascunho nao aparece.
  edited.tools[0].published = true;
  revision = saveLocalDraft(edited, 1);
  assert.equal(readLocalPublished().tools[0].title, base.tools[0].title, 'ainda nao publicado: o slot publico nao pode mudar');
  assert.equal(readLocalPublished().tools[0].published, true);
  revision = publishLocalDraft(2);
  assert.equal(revision.revision, 3);
  assert.equal(readLocalPublished().tools[0].title, 'Rascunho modificado');
  assert.equal(readLocalPublished().tools[0].published, true);
  assert.deepEqual(revision.events.map(e => e.action), ['DRAFT_SAVED', 'DRAFT_SAVED', 'PUBLISHED']);

  // Um registro com eventos faltando, fora de ordem ou duplicado nao vale.
  const good = JSON.parse(data.get('cde-backup-public:publication-register:v2'));
  const missingEvent = structuredClone(good); missingEvent.events.pop();
  data.set('cde-backup-public:publication-register:v2', JSON.stringify(missingEvent));
  assert.throws(() => readPublicationRegister(), /Histórico de revisões/);
  const wrongOrder = structuredClone(good); wrongOrder.events[1].previousRevision = 99;
  data.set('cde-backup-public:publication-register:v2', JSON.stringify(wrongOrder));
  assert.throws(() => readPublicationRegister(), /Sequência de eventos/);
  const duplicateEvent = structuredClone(good); duplicateEvent.events[1].id = duplicateEvent.events[0].id;
  data.set('cde-backup-public:publication-register:v2', JSON.stringify(duplicateEvent));
  assert.throws(() => readPublicationRegister(), /duplicados/);
  data.set('cde-backup-public:publication-register:v2', JSON.stringify(good));
  assert.equal(readPublicationRegister().revision, 3);

  // Workbench legado vira rascunho; nunca e promovido a publicado sozinho.
  data.clear(); data.set('cde-backup-public:workbench:v1', JSON.stringify(edited));
  assert.equal(readPublicationRegister().draft.tools[0].title, 'Rascunho modificado');
  assert.equal(readLocalPublished().tools[0].title, base.tools[0].title);
  console.log('PASS runtime: separacao rascunho/publicado, publicacao explicita, log de revisao, migracao legada');
} finally { rmSync(root, {recursive:true, force:true}); }
