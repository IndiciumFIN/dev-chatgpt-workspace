export const specialties = [
  "Centro Cirúrgico",
  "Dor",
  "Funcionalidade",
  "Geriatria",
  "Gestão",
  "Lesão por Pressão",
  "Neonatologia",
  "Neurologia",
  "Obstetrícia",
  "Pneumologia",
  "Segurança do Paciente",
  "Terapia Intensiva",
  "Urgência/Emergência",
] as const;

export const sideCards: { title: string; text: string; slug?: string; section?: string; hash?: string }[] = [
  {
    title: "Conteúdos Educativos",
    text: "Materiais, artigos, protocolos e recursos para a prática clínica.",
    section: "conteudos",
  },
  {
    title: "Escala de Fugulin (SCP)",
    text: "Classifique a complexidade assistencial do paciente de forma dinâmica e interativa.",
    section: "escalas",
    hash: "fugulin",
  },
  {
    title: "Dimensionamento da Equipe de Enfermagem",
    text: "Simule seu quadro profissional e tenha o diagnóstico situacional.",
    section: "calculadoras",
    hash: "dimensionamento-unidade-de-internacao",
  },
  {
    title: "Calculadora de Gotejamento",
    text: "Realize o cálculo, treine e faça a prova real da velocidade de infusão.",
    slug: "gotejamento",
  },
  {
    title: "Calculadora de Gasometria Arterial",
    text: "Realize os cálculos, leia os conteúdos e pratique com o quiz.",
    section: "calculadoras",
    hash: "gasometria-arterial",
  },
];

export const resourceCards = [
  {
    title: "Formulários de Escalas Assistenciais",
    text: "Acesse os mais de 60 escalas assistenciais em branco para imprimir e usar durante o seu plantão!",
    section: "biblioteca",
    hash: "formularios",
  },
  {
    title: "Biblioteca de Enfermagem",
    text: "Construindo um acervo exclusivo para os profissionais de enfermagem.",
    section: "biblioteca",
    hash: "acervo",
  },
  {
    title: "Blog de Enfermagem",
    text: "Notícias, artigos, atualizações e tendências da profissão.",
    section: "biblioteca",
    hash: "blog",
  },
  {
    title: "Sites de Vagas de Trabalho",
    text: "Principais instituições de saúde de São Paulo e sites de vagas para enfermagem.",
    section: "emprego",
  },
];

export type Tile = { title: string; text: string; icon: "calc" | "book" | "cap"; slug?: string };

export const calculators: Tile[] = [
  { title: "Calcule o Balanço Hídrico", text: "Controle preciso de líquidos.", icon: "calc" },
  { title: "Dimensionamento (Unidade de Internação)", text: "Unidade de Internação.", icon: "calc" },
  { title: "Dimensionamento (Todos os Setores)", text: "UTI, CC, PS, Ambulatório, Hemodiálise, CAPS e mais.", icon: "calc" },
  { title: "Exames Laboratoriais", text: "Calcule os resultados de exames laboratoriais.", icon: "calc" },
  { title: "Gasometria Arterial", text: "Interpretação de gasometria arterial.", icon: "calc" },
  { title: "Calculadora de Gotejamento", text: "Calcule a velocidade de infusão.", icon: "calc", slug: "gotejamento" },
  { title: "Idade Gestacional e DPP", text: "Idade gestacional e data provável do parto.", icon: "calc" },
  { title: "Cálculo de IMC", text: "Índice de massa corporal.", icon: "calc", slug: "imc" },
  { title: "Cálculo de Insulina", text: "Cálculo de doses de insulina.", icon: "calc" },
  { title: "Cálculo de Medicamentos", text: "Doses e diluições de fármacos.", icon: "calc" },
  { title: "Vacinas da Criança", text: "Tabela de vacinas.", icon: "calc" },
  { title: "Notificação Compulsória", text: "Doenças e agravos de notificação.", icon: "calc" },
  { title: "Pressão Arterial Média", text: "PAM a partir da pressão sistólica e diastólica.", icon: "calc" },
  { title: "Superfície Corporal", text: "Estimativa para doses pediátricas.", icon: "calc" },
  { title: "Parkland", text: "Reposição hídrica em queimaduras.", icon: "calc" },
  { title: "Débito Cardíaco", text: "Parâmetros hemodinâmicos básicos.", icon: "calc" },
];

export const simulations: Tile[] = [
  { title: "1º Simulado para Técnicos", text: "50 questões das principais bancas, com cronômetro.", icon: "book" },
  { title: "1º Simulado para Enfermeiros", text: "50 questões com avaliação final de acertos.", icon: "book" },
  { title: "2º Simulado para Enfermeiros", text: "Mais de 50 questões novas de bancas e instituições.", icon: "book" },
  { title: "Segurança do Paciente", text: "50 questões de MS, IBSP, ANVISA e ISMP.", icon: "book" },
  { title: "Notificação Compulsória", text: "50 questões da Portaria GM/MS.", icon: "book" },
  { title: "Simulado sobre Vacinas", text: "30 questões de MS e SBIm.", icon: "book" },
  { title: "Simulado sobre PCR", text: "30 questões de parada cardiorrespiratória.", icon: "book" },
];

export const scales: Tile[] = [
  { title: "Aldrete e Kroulik", text: "Avaliação do paciente em SRPA.", icon: "cap" },
  { title: "APACHE II", text: "Gravidade do paciente em estado grave.", icon: "cap" },
  { title: "Apgar", text: "Avaliação de recém-nascidos.", icon: "cap", slug: "apgar" },
  { title: "ASA", text: "Estado físico pré-operatório.", icon: "cap" },
  { title: "Ballard", text: "Maturidade do recém-nascido.", icon: "cap" },
  { title: "Barthel", text: "Grau de dependência funcional.", icon: "cap" },
  { title: "Braden", text: "Risco de lesão por pressão.", icon: "cap", slug: "braden" },
  { title: "Bishop", text: "Maturidade do colo uterino.", icon: "cap" },
  { title: "Fugulin", text: "Complexidade assistencial.", icon: "cap" },
  { title: "Glasgow", text: "Nível de consciência.", icon: "cap" },
  { title: "Morse", text: "Risco de quedas.", icon: "cap", slug: "morse" },
  { title: "NEWS", text: "Alerta precoce de deterioração.", icon: "cap" },
  { title: "Norton", text: "Risco de lesão por pressão.", icon: "cap" },
  { title: "Ramsay", text: "Nível de sedação.", icon: "cap" },
];

export const phases = [
  { id: "F5", name: "Design system", status: "Publicado", detail: "Tokens institucionais, shell e home." },
  { id: "T1", name: "Template clínico", status: "Publicado", detail: "Uma página para escala e calculadora, com os mesmos recursos." },
  { id: "F6", name: "Acessibilidade Heparina", status: "Publicado", detail: "Dislexia, atalhos de teclado e modo escuro na barra." },
  { id: "F7", name: "i18n", status: "Publicado", detail: "Idioma na URL. Interface no dicionário. Textos institucionais via MyMemory, com consentimento." },
  { id: "F8", name: "SEO", status: "Publicado", detail: "Canonical, hreflang e JSON-LD por calculadora." },
  { id: "F9", name: "LGPD", status: "Publicado", detail: "Cookies necessários, tradução e desempenho separados. Paciente não é gravado." },
  { id: "F10", name: "Documentos", status: "Publicado", detail: "Folha A4 e DOCX gerado no navegador." },
  { id: "F11", name: "Performance", status: "Publicado", detail: "LCP, INP e CLS só com consentimento de medição." },
  { id: "F12", name: "Contrato", status: "Publicado", detail: "Cada ferramenta tem texto, entrada e referência. Há robots.txt e sitemap." },
  { id: "F15", name: "Institucional", status: "Publicado", detail: "Sobre, políticas, mapa, contato e compromisso no mesmo menu." },
  { id: "F16", name: "Conteúdo", status: "Publicado", detail: "Glossário e índice NANDA só do que as escalas já sugerem." },
  { id: "F17", name: "Estudo", status: "Publicado", detail: "Cinco questões e cartões nesta visita. Sem nota salva." },
  { id: "F13", name: "Conta", status: "Publicado", detail: "Entrada, assinante e administrador em telas separadas. A fonte publicada governa o que abre." },
  { id: "F14", name: "Assinatura", status: "Publicado", detail: "Pedido sem cartão. O administrador ativa. As calculadoras públicas não dependem disso." },
  { id: "F18", name: "Comunidade", status: "Publicado", detail: "Quadro de recados para assinatura ativa. O administrador pode ocultar." },
] as const;

export const held = [
  { id: "F19–F34", name: "Outros produtos", detail: "Aplicativo, extensão, API e anatomia 3D são outro sistema. Este site continua no mesmo stack." },
] as const;

export const tokens = [
  { name: "Navy", hex: "#1A3E74", role: "Marca, barra, rodapé, títulos" },
  { name: "Navy mid", hex: "#1E4D8C", role: "Meio do gradiente institucional" },
  { name: "Navy deep", hex: "#163269", role: "Fim do gradiente" },
  { name: "Sky", hex: "#4A90E2", role: "Brilho e acento clínico" },
  { name: "Ink", hex: "#0F2440", role: "Títulos de card" },
  { name: "Slate", hex: "#475569", role: "Texto de apoio" },
  { name: "Muted", hex: "#64748B", role: "Legendas" },
  { name: "Canvas", hex: "#F9FAFB", role: "Fundo da página" },
] as const;

export const rejected = [
  { name: "Sky 500", hex: "#0EA5E9", role: "Primária inventada no F4" },
  { name: "Indigo", hex: "#6366F1", role: "Acento inventado no F4" },
  { name: "Gradiente hero", hex: "#E0F2FE", role: "Fundo pastel que não existe no site" },
] as const;
