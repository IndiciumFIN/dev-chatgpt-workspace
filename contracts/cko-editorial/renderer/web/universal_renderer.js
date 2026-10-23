(function(global){
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
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
  function renderProjection(request, resolved={}){
    if(!request || !Array.isArray(request.block_plan)) throw new Error('Invalid projection request');
    return request.block_plan.map(b => renderBlock(b,resolved)).join('\n');
  }
  global.CKOUniversalRenderer = {renderProjection};
})(window);
