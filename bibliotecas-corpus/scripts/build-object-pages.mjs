#!/usr/bin/env node
// Gerador determinístico BIB-01. Só grava com --write; nunca modifica o site público.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const read=(p)=>JSON.parse(readFileSync(join(root,p),"utf8"));
const {items}=read("bibliotecas-corpus/manifest/wave-01.image-pages.v1.json");
const sources=read("src/content/bibliotecas-drive-manifest.json").assets;
const labels=read("src/content/bibliotecas-labels.pt-BR.json").labels;
const byImage=new Map(sources.map(a=>[a.url,a]));
const write=process.argv.includes("--write");
const out=process.argv.find(a=>a.startsWith("--out="))?.slice(6)||"bibliotecas-corpus/delivery/review-html";
const outRoot=resolve(root,out);
if(!outRoot.startsWith(resolve(root,"bibliotecas-corpus/delivery/")+ "/"))throw Error("Saída deve permanecer dentro de bibliotecas-corpus/delivery/");
function escapeHtml(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderHtml(item){
 const e=escapeHtml;
 const name=item.editorialTitle||"Imagem sem título editorial";
 const candidate=item.canonicalCandidates.map(x=>`<li><code>${e(x)}</code> — correspondência candidata, não admitida</li>`).join("");
 return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="description" content="Ficha de revisão editorial. Imagem sem homologação clínica e de direitos.">
<title>${e(name)} · Revisão de biblioteca</title>
<style>
:root{color-scheme:light;font:16px/1.55 system-ui,Segoe UI,sans-serif;background:#fafafa;color:#181818}body{margin:0}main{max-width:960px;margin:auto;padding:1.5rem}.flag{border:2px solid #181818;padding:1rem;background:#fff}.bar{border-bottom:1px solid #aaa;padding:1rem 0}a{color:#161616}figure{margin:1.5rem 0;background:white;border:1px solid #bbb;padding:1rem}img{display:block;max-width:100%;height:auto;margin:auto}figcaption{margin-top:.6rem}dl{display:grid;grid-template-columns:minmax(8rem,14rem) 1fr;gap:.5rem;padding:1rem;background:white;border:1px solid #ddd;overflow-wrap:anywhere}dt{font-weight:700}dd{margin:0}h1{line-height:1.2;overflow-wrap:anywhere}code{overflow-wrap:anywhere}footer{margin-top:2rem;font-size:.875rem}
</style>
</head>
<body><main id="conteudo">
<nav class="bar" aria-label="Navegação"><a href="/bibliotecas/${e(item.visualSlug)}/">Voltar à biblioteca</a></nav>
<p class="flag"><strong>HOLD_HUMAN — página de revisão, não homologada.</strong> Imagem ilustrativa; terminologia, direitos e conteúdo clínico ainda dependem de revisão. Não usar para decisões assistenciais.</p>
<h1>${e(name)}</h1>
<p>${item.editorialTitle?"Título editorial existente no acervo, ainda não revisado.":"Título editorial não disponível. Identificação por arquivo não equivale a classificação clínica."}</p>
<figure><img src="${e(item.imageUrl)}" width="${item.width}" height="${item.height}" loading="lazy" alt="Imagem do acervo visual aguardando validação editorial">
<figcaption>Imagem do acervo — ${e(item.visualSlug)}. Fonte e titularidade ainda não verificadas.</figcaption></figure>
<section aria-labelledby="dados"><h2 id="dados">Dados de origem</h2><dl>
<dt>Arquivo de origem</dt><dd>${e(item.sourceOriginal)}</dd>
<dt>Dimensões</dt><dd>${item.width} × ${item.height}</dd>
<dt>SHA-256 do original</dt><dd><code>${e(item.sha256Original)}</code></dd>
<dt>Partição</dt><dd>${item.sourcePart}</dd>
<dt>Revisão do acervo</dt><dd>${e(item.mediaReviewStatus)}</dd>
<dt>Licença e direitos</dt><dd>Não verificados</dd>
<dt>Idioma</dt><dd>Português do Brasil — revisão pendente</dd>
<dt>URL de destino (candidata)</dt><dd><code>${e(item.route)}</code></dd>
</dl></section>
<section aria-labelledby="vinculos"><h2 id="vinculos">Vínculos estruturais candidatos</h2><p>Nenhuma identidade de objeto ou fonte clínica foi promovida.</p><ul>${candidate}</ul></section>
<footer>Origem: <code>src/content/bibliotecas-drive-manifest.json</code> e etiquetas em <code>src/content/bibliotecas-labels.pt-BR.json</code>. Este HTML não integra o build público.</footer>
</main></body></html>
`;
}
const issues=[],routes=new Set();
for(const p of items){
 const a=byImage.get(p.imageUrl);
 if(!a)issues.push("fonte_ausente:"+p.route);
 if(a&&(a.original!==p.sourceOriginal||a.sha256_original!==p.sha256Original||a.width!==p.width||a.height!==p.height))issues.push("divergencia_de_origem:"+p.route);
 const label=labels[p.sourceOriginal]??labels[p.sourceOriginal.split("/").at(-1)]??null;
 if(label!==p.editorialTitle)issues.push("divergencia_de_etiqueta:"+p.route);
 if(routes.has(p.route))issues.push("rota_duplicada:"+p.route);
 routes.add(p.route);
 if(!/^\/bibliotecas\/[a-z0-9-]+\/[a-z0-9-]+\/$/.test(p.route))issues.push("rota_invalida:"+p.route);
 if(!/^([a-f0-9]{64})$/.test(p.sha256Original))issues.push("hash_invalido:"+p.route);
 if(p.publication!=="HOLD_HUMAN"||p.robots!=="noindex,nofollow")issues.push("gate_de_publicacao_invalido:"+p.route);
 if(!existsSync(join(root,"public",p.imageUrl.slice(1))))issues.push("arquivo_avif_ausente:"+p.route);
}
if(items.length!==94)issues.push("quantidade_inesperada:"+items.length);
if(issues.length){console.error(JSON.stringify({ok:false,issues},null,2));process.exit(1)}
let unchanged=0,created=0;
if(write)for(const p of items){
 const target=join(outRoot,"bibliotecas",p.visualSlug,p.imageId,"index.html");
 const content=renderHtml(p);
 if(existsSync(target)){if(readFileSync(target,"utf8")!==content)throw Error("Divergência de HTML; não sobrescreveu: "+target);unchanged++}
 else {mkdirSync(dirname(target),{recursive:true});writeFileSync(target,content,"utf8");created++}
}
const report={ok:true,mode:write?"WRITE_REVIEW_ONLY":"VERIFY_ONLY",pages:items.length,titleLabels:items.filter(p=>p.editorialTitle).length,hold:items.filter(p=>p.publication==="HOLD_HUMAN").length,created,unchanged,output:write?out:"NOT_WRITTEN"};
console.log(JSON.stringify(report,null,2));
