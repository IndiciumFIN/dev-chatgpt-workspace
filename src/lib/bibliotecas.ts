import source from "@/content/bibliotecas-drive-manifest.json";
import localized from "@/content/bibliotecas-labels.pt-BR.json";
export type LibraryAsset = (typeof source.assets)[number];
export type LibraryDefinition = { slug: string; title: string; subtitle: string; short: string; heroFile?: string; category: string; tags: string[] };
/** One registry. Each hub and item page consumes this contract; no duplicate pages. */
export const libraryDefinitions: LibraryDefinition[] = [
 {slug:"anatomia",title:"Biblioteca de Anatomia",short:"Anatomia",subtitle:"Explore os sistemas, regiões e estruturas do corpo humano em um atlas visual orientado ao estudo de enfermagem.",category:"anatomia",heroFile:"anatomy_models_and_educational_charts.png",tags:["Sistemas do corpo","Atlas anatômico","Relações clínicas"]},
 {slug:"seringas-e-agulhas",title:"Biblioteca de Seringas e Agulhas",short:"Seringas e agulhas",subtitle:"Conheça os componentes e formatos de materiais para administração e preparo de medicamentos.",category:"seringas-e-agulhas",heroFile:"syringe_materials_library_cover.png",tags:["Tipos e conexões","Componentes","Materiais"]},
 {slug:"feridas-e-curativos",title:"Biblioteca de Feridas e Curativos",short:"Feridas e curativos",subtitle:"Acervo visual de materiais para avaliação de feridas e coberturas, com organização por objeto.",category:"feridas-e-curativos",heroFile:"curativos_biblioteca_de_materiais_médicos.png",tags:["Coberturas","Feridas","Cuidados"]},
 {slug:"luvas-e-epi",title:"Biblioteca de Luvas e EPI",short:"Luvas e EPI",subtitle:"Galeria de luvas e materiais relacionados à proteção do profissional e do paciente.",category:"luvas-e-epi",heroFile:"medical_glove_library_cover.png",tags:["Luvas","Técnica","Biossegurança"]},
 {slug:"nutricao",title:"Biblioteca de Nutrição",short:"Nutrição",subtitle:"Imagens de suporte nutricional, vias de administração, dispositivos e orientação ao cuidado.",category:"nutricao",heroFile:"nutricao_paciente_assets_individuais/hero_nutricao_paciente.png",tags:["Avaliação","Vias de alimentação","Suporte"]},
 {slug:"processo-de-enfermagem",title:"Biblioteca do Processo de Enfermagem",short:"Processo de Enfermagem",subtitle:"Representações visuais das etapas do processo de enfermagem, documentação e organização da assistência.",category:"processo-de-enfermagem",heroFile:"sae_assets_individuais_hd/00_hero_sae_fluxo.png",tags:["Coleta","Diagnóstico","Planejamento"]},
 {slug:"antissepsia",title:"Biblioteca de Antissepsia",short:"Antissepsia",subtitle:"Imagens de produtos e materiais antissépticos utilizados na prática assistencial.",category:"antissepsia",heroFile:"clinical_antiseptic_supply_collection.png",tags:["Soluções","Materiais","Segurança"]},
 {slug:"dispositivos-medicos",title:"Biblioteca de Dispositivos Médicos",short:"Dispositivos médicos",subtitle:"Conheça equipamentos, tubos, cateteres e instrumentos por meio de um acervo ilustrado.",category:"dispositivos-medicos",heroFile:"medical_monitoring_devices_collection.png",tags:["Equipamentos","Instrumentais","Dispositivos"]},
 {slug:"educacao-e-pesquisa",title:"Biblioteca de Educação e Pesquisa",short:"Educação e pesquisa",subtitle:"Recursos de apoio visual a estudos e materiais educacionais para profissionais de enfermagem.",category:"educacao-e-pesquisa",tags:["Educação","Materiais de estudo"]},
 {slug:"acervo-a-classificar",title:"Acervo em Triagem Editorial",short:"Triagem editorial",subtitle:"Materiais recebidos cuja classificação por tema depende de curadoria humana. Sem publicação clínica autorizada.",category:"acervo-a-classificar",tags:["HOLD_HUMAN","Metadados","Proveniência"]},
];
export const libraryAssets: LibraryAsset[] = source.assets;
export const getLibrary=(slug:string)=>libraryDefinitions.find(x=>x.slug===slug);
export const getAssets=(category:string)=>libraryAssets.filter(x=>x.category===category);
export const getAsset=(category:string,file:string)=>getAssets(category).find(x=>x.original===file);
export const heroOf=(lib:LibraryDefinition)=>getAssets(lib.category).find(a=>a.original===lib.heroFile)??getAssets(lib.category)[0];
export const idOf=(asset:LibraryAsset)=>asset.url.split('/').pop()!.replace(/\.avif$/,'');
export const assetById=(cat:string,id:string)=>getAssets(cat).find(a=>idOf(a)===id);
export function titleOf(asset:LibraryAsset){
 const label = (localized.labels as Record<string,string>)[asset.original] ?? (localized.labels as Record<string,string>)[asset.original.split("/").pop()!];
 if (label) return label;
 const n=asset.original.split('/').pop()!.replace(/\.[^.]+$/,'').replace(/^\d+_/,'').replace(/_/g,' ').replace(/\bwhite\b/gi,'(fundo branco)');
 return n.replace(/\b\w/g,s=>s.toUpperCase());
}
