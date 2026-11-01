/**
 * O Figma Make (N292OApPH7HFI4XyvOQGXV) não entra no código.
 * Cada arquivo de lá aponta para um contrato que já existe.
 * "nao-promover" significa: não criar componente, ícone nem tema rival.
 */
export const figmaFile = "N292OApPH7HFI4XyvOQGXV";

export const figmaVerdict = ["usar-contrato", "conteudo", "nao-promover"] as const;

export type FigmaVerdict = (typeof figmaVerdict)[number];

export const figmaBindings = [
  { arquivo: "src/templates/TemplateEscala.tsx", veredito: "usar-contrato", contrato: "ferramenta", molde: "escala", nota: "O exemplo é Aldrete. O rádio cabe no molde. O domínio do critério pode agrupar, sem página nova." },
  { arquivo: "src/templates/TemplateCalculadora.tsx", veredito: "usar-contrato", contrato: "ferramenta", molde: "calculadora", nota: "O exemplo é APACHE II e mostra NANDA na tela. Isso não se copia. NANDA continua só no laudo da escala." },
  { arquivo: "src/templates/TemplateChecklist.tsx", veredito: "usar-contrato", contrato: "formulario", nota: "O checklist preenchível que já existe. Não grava." },
  { arquivo: "src/templates/TemplateBiblioteca.tsx", veredito: "usar-contrato", contrato: "biblioteca", nota: "Página longa com módulos. Anatomia, seringa, imagem, PDF, slide e infográfico já são seções dessa página." },
  { arquivo: "src/templates/TemplateAcervo.tsx", veredito: "usar-contrato", contrato: "biblioteca", nota: "Acervo é seção da biblioteca, não outro template." },
  { arquivo: "src/templates/TemplateMaterial.tsx", veredito: "usar-contrato", contrato: "biblioteca", nota: "PDF e thumbnail usam a lista de material que já está na biblioteca." },
  { arquivo: "src/templates/TemplateInfografico.tsx", veredito: "usar-contrato", contrato: "biblioteca", nota: "Seção Infográficos. A peça TPL-009 cobre o cartão." },
  { arquivo: "src/templates/TemplateEditorial.tsx", veredito: "usar-contrato", contrato: "editorial", nota: "Quadro da peça. Não abre hero próprio." },
  { arquivo: "src/templates/TemplateCasoClinico.tsx", veredito: "usar-contrato", contrato: "editorial", nota: "É o tipo clinical-case, TPL-005." },
  { arquivo: "src/templates/TemplateOGCards.tsx", veredito: "usar-contrato", contrato: "editorial", nota: "TPL-019 e a imagem public/og.jpg. Não criar outro card de compartilhamento." },
  { arquivo: "src/templates/GuiaMedicamento.tsx", veredito: "usar-contrato", contrato: "guia", nota: "Página longa. O índice é o de Nesta página." },
  { arquivo: "src/templates/TemplateCKO.tsx", veredito: "usar-contrato", contrato: "artigo", nota: "Institucional usa o frame do artigo." },
  { arquivo: "src/templates/TemplateCategoria.tsx", veredito: "usar-contrato", contrato: "secao", nota: "Grade de cartões da seção." },
  { arquivo: "src/templates/TemplateQuiz.tsx", veredito: "usar-contrato", contrato: "secao", nota: "Simulado já é seção. Não vira ferramenta clínica." },
  { arquivo: "src/templates/SimuladorDecisao.tsx", veredito: "usar-contrato", contrato: "secao", nota: "Mesma seção de simulados, ou a ferramenta se o resultado for um escore com faixa." },
  { arquivo: "src/templates/CentroPerformance.tsx", veredito: "usar-contrato", contrato: "area", nota: "Número de visita fica na área logada. Não entra no menu público." },
  { arquivo: "src/templates/SidebarLayout.tsx", veredito: "nao-promover", contrato: "sumario", nota: "É filtro de catálogo à esquerda, mais uma segunda barra e um segundo rodapé. O índice da página longa continua à direita." },
  { arquivo: "src/templates/Logo.tsx", veredito: "nao-promover", contrato: "casca", nota: "A marca é /brand/logo.webp. Não há segundo logo." },
  { arquivo: "src/templates/TemplateGraficos.tsx", veredito: "nao-promover", contrato: "resultado", nota: "Gráfico de biblioteca está fora. A faixa e a barra do escore já mostram o resultado." },
  { arquivo: "src/templates/TemplateGrafo.tsx", veredito: "nao-promover", contrato: "resultado", nota: "Mesmo caso. Não entrar Chart.js nem canvas paralelo." },
  { arquivo: "src/templates/ui.tsx", veredito: "nao-promover", contrato: "casca", nota: "Terceiro kit de botão, cartão e campo. O site já tem os seus." },
  { arquivo: "src/app/components/ui/*", veredito: "nao-promover", contrato: "casca", nota: "Kit shadcn com tema padrão. Concorre com trilha, menu, tooltip, toaster e índice." },
  { arquivo: "default_shadcn_theme.css", veredito: "nao-promover", contrato: "tokens", nota: "A paleta fechada é marinha #1A3E74, céu #4A90E2, Nunito Sans e Inter." },
  { arquivo: "src/imports/pasted_text/*-calculator.html", veredito: "conteudo", contrato: "ferramenta", nota: "Página antiga de uma escala ou calculadora. Entra no catálogo, no molde certo, quando a fonte estiver conferida. Não vira template." },
  { arquivo: "src/imports/pasted_text/missao-visao-valores.html", veredito: "conteudo", contrato: "artigo", nota: "Página institucional que já usa o frame longo." },
  { arquivo: "src/imports/pasted_text/nursing-library-page.html", veredito: "conteudo", contrato: "biblioteca", nota: "Conteúdo da biblioteca, não uma casca nova." },
  { arquivo: "src/imports/deepseek_html_*.html", veredito: "nao-promover", contrato: "nenhum", nota: "Rascunho HTML. Não é fonte e não é componente." },
] as const;
