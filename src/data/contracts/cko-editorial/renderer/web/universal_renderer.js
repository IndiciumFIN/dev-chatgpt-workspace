/** @typedef {{block_id:string, type:string, semantic_role?:string}} CKOBlock
 * @typedef {{text?:string, resource_id?:string, caption?:string}} CKOResource
 * @typedef {{block_plan:CKOBlock[]}} CKOProjection
 * @typedef {{renderProjection:(request:CKOProjection,resolved?:Record<string,CKOResource>)=>string}} CKOAPI
 */
(function(global){
  /** @param {unknown} value */
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => {
    /** @type {Record<string,string>} */
    const entities = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' };
    return entities[ch] ?? ch;
  });
  /** @param {CKOBlock} block @param {Record<string,CKOResource>} resolved */
  function renderBlock(block, resolved){
    const role = esc(block.semantic_role);
    const source = resolved?.[block.block_id] || {};
    switch(block.type){
      case 'title': return `<h1 data-role="${role}">${esc(source.text || '[canonical title]')}</h1>`;
      case 'lead': return `<p class="lead" data-role="${role}">${esc(source.text || '[resolved claim projection]')}</p>`;
      case 'claim': return `<section class="claim" data-role="${role}">${esc(source.text || '[resolved claim]')}</section>`;
      case 'figure': return `<figure data-role="${role}"><div class="asset-placeholder">${esc(source.resource_id || '[registry resource]')}</div><figcaption>${esc(source.caption || '[resolved caption + rights attribution]')}</figcaption></figure>`;
      case 'references': return `<section class="references" data-role="${role}"><h2>Referências</h2><div>${esc(source.text || '[resolved evidence list]')}</div></section>`;
      case 'action_bar': return `<nav class="actionbar" aria-label="Ações de conteúdo"><button type="button">Salvar</button><button type="button">Imprimir</button><button type="button">Compartilhar</button></nav>`;
      default: return `<section data-type="${esc(block.type)}" data-role="${role}">${esc(source.text || `[${block.type}: resolved projection]`)}</section>`;
    }
  }
  /** @param {CKOProjection} request @param {Record<string,CKOResource>} [resolved] */
  function renderProjection(request, resolved={}){
    if(!request || !Array.isArray(request.block_plan)) throw new Error('Invalid projection request');
    return request.block_plan.map(b => renderBlock(b,resolved)).join('\n');
  }
  global.CKOUniversalRenderer = {renderProjection};
})(/** @type {Window & {CKOUniversalRenderer?:CKOAPI}} */ (window));
