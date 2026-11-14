import { extraSection, extraSections } from "@/lib/institutional-sections";
import { calculators, scales, simulations, specialties } from "@/lib/site-data";
import { slugify } from "@/lib/slug";
import { tools } from "@/lib/tools/catalog";

export type Dest =
  | { kind: "home" }
  | { kind: "section"; slug: string; hash?: string }
  | { kind: "tool"; slug: string }
  | { kind: "page"; to: "/sistema" | "/pacote" | "/login" | "/conta" | "/blog/$slug"; slug?: string }
  | { kind: "model"; id: "biblioteca" | "slides" | "guia" | "laudo"; hash?: string };

export type CatalogItem = {
  id: string;
  title: string;
  text: string;
  dest?: Dest;
  live?: boolean;
};

export type SectionBlock = {
  id: string;
  title: string;
  text?: string;
  items: CatalogItem[];
};

export type Section = {
  slug: string;
  kicker: string;
  title: string;
  lead: string;
  kind: "pages" | "contact" | "enter" | "subscribe";
  blocks: SectionBlock[];
};

function tileItems(
  list: { title: string; text: string; slug?: string }[],
  section: string,
): CatalogItem[] {
  return list.map((item) => {
    const id = slugify(item.title);
    if (item.slug && tools.some((tool) => tool.slug === item.slug)) {
      return { id, title: item.title, text: item.text, live: true, dest: { kind: "tool", slug: item.slug } };
    }
    return { id, title: item.title, text: item.text };
  });
}

const pages: Record<string, Section> = {
  concurso: {
    slug: "concurso",
    kicker: "Guia de estudos",
    title: "Concurso Público de Santos 74/2026",
    lead: "Entrada do guia de estudos para enfermeiro, no mesmo lugar do menu homologado. O material completo do edital não é copiado para este preview.",
    kind: "pages",
    blocks: [
      {
        id: "guia",
        title: "O que este atalho abre",
        text: "No site homologado, o botão verde leva ao guia do concurso. Aqui o fluxo para no mesmo tema, sem reproduzir o caderno de questões.",
        items: [
          { id: "simulados", title: "Simulados do menu", text: "Treino de bancas fica na seção de simulados.", dest: { kind: "section", slug: "simulados" } },
          { id: "biblioteca", title: "Biblioteca de provas", text: "O acervo de provas aparece na biblioteca.", dest: { kind: "section", slug: "biblioteca", hash: "provas" } },
        ],
      },
    ],
  },
  sobre: {
    slug: "sobre",
    kicker: "Institucional",
    title: "Sobre nós",
    lead: "Missão, objetivo e equipe. Cada um abre a própria página.",
    kind: "pages",
    blocks: [],
  },
  conteudos: {
    slug: "conteudos",
    kicker: "Conteúdos",
    title: "Conteúdos de enfermagem",
    lead: "Os grupos do menu Conteúdos. O texto de cada guia longo continua no site homologado; aqui a navegação chega no grupo certo.",
    kind: "pages",
    blocks: [
      {
        id: "nsp",
        title: "Núcleo de Segurança do Paciente",
        text: "Checagem de medicação, medicamentos de alta vigilância e metas internacionais.",
        items: [],
      },
      {
        id: "sus",
        title: "Saúde pública",
        text: "Notificação compulsória, SINAN, princípios do SUS, PNAB, participação da comunidade e HumanizaSUS.",
        items: [],
      },
      {
        id: "leis",
        title: "Legislações",
        text: "Código de ética, processo de enfermagem, Lei 5.905/1973, Lei 8.080/90 e dimensionamento COFEN.",
        items: [
          { id: "dimensionamento", title: "Dimensionamento no catálogo", text: "A calculadora de quadro ainda está catalogada.", dest: { kind: "section", slug: "calculadoras", hash: slugify("Dimensionamento (Unidade de Internação)") } },
        ],
      },
      {
        id: "literatura",
        title: "Literatura",
        text: "NANDA, NIC e NOC, teorias e glossário. A NANDA sugerida nas escalas não fecha diagnóstico.",
        items: [
          { id: "nanda", title: "Índice NANDA destas escalas", text: "Só as sugestões que o template já mostra. Não fecha diagnóstico.", dest: { kind: "section", slug: "nanda" } },
          { id: "glossario", title: "Glossário curto", text: "Termos dos instrumentos que estão no ar.", dest: { kind: "section", slug: "glossario" } },
          { id: "braden", title: "Ver numa escala", text: "A Braden mostra como a sugestão aparece.", dest: { kind: "tool", slug: "braden" }, live: true },
        ],
      },
      {
        id: "urgencia",
        title: "Urgência e emergência",
        text: "5 H, 5 T, time de resposta rápida, suporte avançado de vida e DEA.",
        items: [],
      },
      {
        id: "centro",
        title: "Bloco, clínica e trabalho",
        text: "Instrumentais, checklist cirúrgico, SBAR, exames, bundles, NRs e COPSOQ.",
        items: [],
      },
      {
        id: "materno",
        title: "Obstetrícia e neonatologia",
        text: "Capurro, IHAC e aleitamento. O Apgar já está no template.",
        items: [
          { id: "apgar", title: "Escala de Apgar", text: "Minuto separado dos pontos.", dest: { kind: "tool", slug: "apgar" }, live: true },
        ],
      },
    ],
  },
  emprego: {
    slug: "emprego",
    kicker: "Sites de emprego",
    title: "Sites de vagas de trabalho",
    lead: "O mesmo destino do menu Sites de Emprego: instituições de saúde e quadros de vagas para enfermagem. Este preview não publica vaga nem candidatura.",
    kind: "pages",
    blocks: [
      {
        id: "quadro",
        title: "Como o fluxo segue",
        text: "No site homologado a página reúne links de emprego. Aqui o item do menu não cai mais numa página genérica de pacote.",
        items: [
          { id: "concurso", title: "Concurso Santos", text: "O guia de estudos fica no atalho verde do menu.", dest: { kind: "section", slug: "concurso" } },
          { id: "simulados", title: "Simulados", text: "Treino para provas e concursos.", dest: { kind: "section", slug: "simulados" } },
        ],
      },
    ],
  },
  biblioteca: {
    slug: "biblioteca",
    kicker: "Biblioteca",
    title: "Biblioteca de enfermagem",
    lead: "Formulários, acervo clínico, imagens, PDF, slides e infográfico.",
    kind: "pages",
    blocks: [
      {
        id: "formularios",
        title: "Formulários de escalas",
        text: "Mais de 60 escalas em branco para imprimir no plantão. A impressão do template clínico já cobre Braden, Morse, Apgar, gotejamento e IMC.",
        items: [
          { id: "braden", title: "Imprimir a Braden", text: "Laudo e memória saem na folha.", dest: { kind: "tool", slug: "braden" }, live: true },
        ],
      },
      {
        id: "acervo",
        title: "Acervo",
        text: "Prateleiras clínicas no mesmo molde da biblioteca. A imagem leva legenda. O PDF abre o arquivo que existe.",
        items: [
          { id: "anatomia", title: "Anatomia", text: "Prancha de regiões, não um atlas.", dest: { kind: "model", id: "biblioteca", hash: "anatomia" }, live: true },
          { id: "seringas", title: "Seringas e agulhas", text: "Peças nomeadas do dispositivo.", dest: { kind: "model", id: "biblioteca", hash: "seringas" }, live: true },
          { id: "imagens", title: "Imagens", text: "Figura com legenda.", dest: { kind: "model", id: "biblioteca", hash: "imagens" }, live: true },
          { id: "thumbnails", title: "Thumbnails", text: "Capa 16:9.", dest: { kind: "model", id: "biblioteca", hash: "thumbnails" }, live: true },
          { id: "pdfs", title: "PDFs", text: "Arquivo avulso, sem pacote.", dest: { kind: "model", id: "biblioteca", hash: "pdfs" }, live: true },
          { id: "slides", title: "Slides", text: "Lâmina 16:9.", dest: { kind: "model", id: "biblioteca", hash: "slides" }, live: true },
          { id: "infograficos", title: "Infográficos", text: "Reconhecer, agir e registrar.", dest: { kind: "model", id: "biblioteca", hash: "infograficos" }, live: true },
        ],
      },
      {
        id: "blog",
        title: "Blog de enfermagem",
        text: "História da profissão e pioneiros, no molde do artigo longo.",
        items: [
          {
            id: "mahoney",
            title: "Mary Eliza Mahoney",
            text: "Biografia, fotografia histórica e linha do tempo documentada.",
            dest: { kind: "page", to: "/blog/$slug", slug: "mary-eliza-mahoney" },
            live: true,
          },
        ],
      },
      {
        id: "provas",
        title: "Provas de concurso",
        text: "O acervo de provas é item de biblioteca, separado dos simulados interativos.",
        items: [
          { id: "simulados", title: "Ir para simulados", text: "Questões de treino.", dest: { kind: "section", slug: "simulados" } },
        ],
      },
    ],
  },
  politicas: {
    slug: "politicas",
    kicker: "Institucional",
    title: "Políticas do site",
    lead: "Privacidade, cookies, retenção e LGPD no mesmo destino do rodapé homologado.",
    kind: "pages",
    blocks: [
      {
        id: "privacidade",
        title: "Política de privacidade",
        text: "Nome, idade e leito digitados numa calculadora ficam só naquela tela. Não entram no navegador.",
        items: [],
      },
      {
        id: "cookies",
        title: "Política de cookies",
        text: "O banner separa o necessário da tradução automática e da medição de desempenho. Recusar os opcionais não bloqueia a calculadora. Nada disso envia dado de paciente.",
        items: [],
      },
      {
        id: "retencao",
        title: "Retenção de dados",
        text: "Preferências de fonte, contraste, foco, dislexia, modo escuro, idioma e a escolha de cookies podem ficar no navegador. Desempenho medido fica só na visita. Dado clínico de paciente, não.",
        items: [],
      },
      {
        id: "lgpd",
        title: "LGPD",
        text: "A pessoa escolhe tradução e medição de desempenho à parte. Não há cookie de marketing. O laudo pode ser impresso em A4 ou baixado em DOCX, sem sair do navegador.",
        items: [],
      },
    ],
  },
  termos: {
    slug: "termos",
    kicker: "Institucional",
    title: "Termos e condições de uso",
    lead: "As calculadoras e escalas são consultivas. A conduta fica com a equipe e com o protocolo da instituição.",
    kind: "pages",
    blocks: [
      {
        id: "uso",
        title: "Uso",
        text: "Não use um escore incompleto. Não troque o equipo sem recalcular. Não aplique o IMC adulto em criança.",
        items: [],
      },
    ],
  },
  acessibilidade: {
    slug: "acessibilidade",
    kicker: "Institucional",
    title: "Política de acessibilidade",
    lead: "A barra segue a WCAG 2.1 nível AA no que este preview cobre: idioma da página, foco visível, atalho para o conteúdo, contraste de texto e de borda, teclado e nome acessível.",
    kind: "pages",
    blocks: [
      {
        id: "barra",
        title: "O que a barra faz",
        text: "A− e A+ mudam o tamanho, sem impedir o zoom do navegador até 200%. Contraste é preto e branco. Dislexia usa Lexend e mais espaço entre letras. Escuro reduz o brilho. Atalhos: Alt+1 conteúdo, Alt+2 menu, Alt+3 busca, Alt+4 rodapé, Alt+0 esta lista. Esc fecha o painel e o foco volta ao botão. O idioma fica na URL (?lang=en, es ou fr) e o html lang acompanha.",
        items: [
          { id: "sistema", title: "Sistema visual", text: "Tokens e foco.", dest: { kind: "page", to: "/sistema" } },
        ],
      },
      {
        id: "wcag",
        title: "Padrões WCAG 2.1 aplicados aqui",
        text: "1.3.1 e 4.1.2: botões com nome mesmo quando o rótulo some. 1.4.3 e 1.4.11: texto e borda. 2.1.1: teclado. 2.4.1: pular para o conteúdo. 2.4.7: foco amarelo. 2.4.11, da WCAG 2.2: o banner de cookies não cobre o cálculo. 2.5.5: alvo de 44 px na ferramenta. 3.1.2: a escala permanece em português. 4.1.3: o resultado é anunciado. O eMAG usa esta mesma base.",
        items: [],
      },
      {
        id: "fila",
        title: "O que continua de fora",
        text: "Não há leitor de tela embutido, VLibras, audiodescrição nem filtro de daltonismo. A tradução automática não altera escalas nem calculadoras.",
        items: [],
      },
    ],
  },
  compromisso: {
    slug: "compromisso",
    kicker: "Sustentabilidade digital",
    title: "Nosso compromisso",
    lead: "Acessibilidade digital, sustentabilidade digital e proteção de dados, como no rodapé homologado.",
    kind: "pages",
    blocks: [
      {
        id: "impacto",
        title: "Relatório de impacto",
        text: "Com a medição aceita, a visita mostra LCP, INP e CLS no rodapé e o número não sai do navegador. A meta de referência é LCP até 2,5 s, INP até 200 ms e CLS até 0,1.",
        items: [],
      },
      {
        id: "verde",
        title: "Tecnologia verde",
        text: "Uma página de ferramenta para todas as escalas e calculadoras, em vez de um HTML por instrumento.",
        items: [],
      },
    ],
  },
  mapa: {
    slug: "mapa",
    kicker: "Institucional",
    title: "Mapa do site",
    lead: "Os mesmos destinos do menu e do rodapé. Item no ar abre a ferramenta. Os demais abrem a seção.",
    kind: "pages",
    blocks: [
      {
        id: "secoes",
        title: "Seções",
        items: [
          { id: "inicio", title: "Início", text: "Home.", dest: { kind: "home" } },
          { id: "sobre", title: "Sobre nós", text: "Missão e governança.", dest: { kind: "section", slug: "missao-visao-valores" } },
          { id: "calculadoras", title: "Calculadoras", text: "Catálogo de cálculos.", dest: { kind: "section", slug: "calculadoras" } },
          { id: "escalas", title: "Escalas", text: "Catálogo por especialidade.", dest: { kind: "section", slug: "escalas" } },
          { id: "conteudos", title: "Conteúdos", text: "Grupos do menu.", dest: { kind: "section", slug: "conteudos" } },
          { id: "emprego", title: "Sites de emprego", text: "Vagas.", dest: { kind: "section", slug: "emprego" } },
          { id: "simulados", title: "Simulados", text: "Treino curto nesta visita.", dest: { kind: "section", slug: "simulados", hash: "treino" } },
          { id: "nanda", title: "NANDA", text: "Índice das sugestões já usadas.", dest: { kind: "section", slug: "nanda" } },
          { id: "glossario", title: "Glossário", text: "Termos dos instrumentos no ar.", dest: { kind: "section", slug: "glossario" } },
          { id: "biblioteca", title: "Biblioteca", text: "Formulários e acervo.", dest: { kind: "section", slug: "biblioteca" } },
          { id: "contato", title: "Fale conosco", text: "Contato.", dest: { kind: "section", slug: "contato" } },
          { id: "sistema", title: "Sistema visual", text: "Tokens homologados.", dest: { kind: "page", to: "/sistema" } },
          { id: "pacote", title: "Pacote do template", text: "Inventário técnico do template clínico.", dest: { kind: "page", to: "/pacote" } },
        ],
      },
    ],
  },
  glossario: {
    slug: "glossario",
    kicker: "Conteúdos",
    title: "Glossário clínico",
    lead: "Os termos dos instrumentos que já calculam aqui. Não substitui o glossário longo do site homologado.",
    kind: "pages",
    blocks: [
      {
        id: "termos",
        title: "Termos",
        items: [
          { id: "braden", title: "Braden", text: "Escala de risco de lesão por pressão. Escore de 6 a 23." },
          { id: "morse", title: "Morse", text: "Escala de risco de queda. A partir de 45 pontos, risco alto neste template." },
          { id: "apgar", title: "Apgar", text: "Vitalidade do recém-nascido. O minuto da avaliação fica separado da soma." },
          { id: "gotejamento", title: "Gotejamento", text: "Gotas por minuto a partir do volume, do tempo e do fator do equipo." },
          { id: "macrogotas", title: "Macrogotas", text: "Equipo com fator 20 gotas por mL." },
          { id: "microgotas", title: "Microgotas", text: "Equipo com fator 60 gotas por mL." },
          { id: "imc", title: "IMC", text: "Peso dividido pela altura ao quadrado. A faixa deste template é a do adulto." },
          { id: "nanda", title: "NANDA", text: "Sugestão de diagnóstico de enfermagem. Nas escalas, não fecha a conduta." },
          { id: "laudo", title: "Laudo", text: "Folha desta avaliação. Pode ser impressa em A4 ou baixada em DOCX, sem sair do navegador." },
        ],
      },
    ],
  },
  nanda: {
    slug: "nanda",
    kicker: "Conteúdos",
    title: "Índice NANDA",
    lead: "Somente as sugestões que Braden, Morse e Apgar já mostram na faixa. Nenhuma delas fecha diagnóstico.",
    kind: "pages",
    blocks: [
      {
        id: "lista",
        title: "Sugestões usadas",
        text: "O título é o mesmo texto que aparece na escala. Abra o instrumento para ver em qual faixa ele entra.",
        items: [
          { id: "lesao", title: "Risco de lesão por pressão", text: "Braden, em todas as faixas com risco.", dest: { kind: "tool", slug: "braden" }, live: true },
          { id: "mobilidade", title: "Mobilidade física prejudicada", text: "Braden de risco muito alto e Morse de risco alto.", dest: { kind: "tool", slug: "braden" }, live: true },
          { id: "pele", title: "Integridade da pele prejudicada", text: "Braden de risco alto.", dest: { kind: "tool", slug: "braden" }, live: true },
          { id: "queda", title: "Risco de queda", text: "Morse de risco médio e alto.", dest: { kind: "tool", slug: "morse" }, live: true },
          { id: "gases", title: "Troca de gases prejudicada", text: "Apgar de depressão grave.", dest: { kind: "tool", slug: "apgar" }, live: true },
          { id: "resp", title: "Padrão respiratório ineficaz", text: "Apgar de depressão grave e moderada.", dest: { kind: "tool", slug: "apgar" }, live: true },
        ],
      },
    ],
  },
  contato: {
    slug: "contato",
    kicker: "Fale conosco",
    title: "Contate-nos",
    lead: "O menu Fale Conosco abre esta página. A mensagem não é enviada nem gravada.",
    kind: "contact",
    blocks: [
      {
        id: "canais",
        title: "Outros caminhos do menu",
        items: [
          { id: "sobre", title: "Sobre nós", text: "Institucional.", dest: { kind: "section", slug: "missao-visao-valores" } },
          { id: "politicas", title: "Privacidade", text: "O que fica e o que não fica salvo.", dest: { kind: "section", slug: "politicas" } },
        ],
      },
    ],
  },
  entrar: {
    slug: "entrar",
    kicker: "Conta",
    title: "Entrar",
    lead: "A entrada é uma tela própria. O assinante e o administrador não usam o menu público como área de trabalho.",
    kind: "enter",
    blocks: [
      {
        id: "depois",
        title: "Três telas",
        text: "O público navega sem conta. O assinante abre o que foi publicado. O administrador grava essa fonte.",
        items: [
          { id: "login", title: "Entrar", text: "Tela separada do site.", dest: { kind: "page", to: "/login" } },
          { id: "calc", title: "Seguir sem conta", text: "As ferramentas públicas não pedem entrada.", dest: { kind: "section", slug: "calculadoras" } },
        ],
      },
    ],
  },
  assinatura: {
    slug: "assinatura",
    kicker: "Assinatura",
    title: "Assine já",
    lead: "Pedido sem cobrança. A assinatura só abre a comunidade. As calculadoras públicas continuam livres.",
    kind: "subscribe",
    blocks: [
      {
        id: "incluso",
        title: "O que a assinatura abre",
        text: "O quadro de recados da área do assinante. O administrador ativa o pedido. Não há cartão.",
        items: [
          { id: "gotejamento", title: "Gotejamento", text: "Aberto sem conta.", dest: { kind: "tool", slug: "gotejamento" }, live: true },
          { id: "braden", title: "Braden", text: "Aberto sem conta.", dest: { kind: "tool", slug: "braden" }, live: true },
        ],
      },
    ],
  },
};

function catalog(slug: string, kicker: string, title: string, lead: string, blocks: SectionBlock[]): Section {
  return { slug, kicker, title, lead, kind: "pages", blocks };
}

export function getSection(slug: string): Section | undefined {
  if (slug === "calculadoras") {
    return catalog(
      "calculadoras",
      "Calculadoras",
      "Calculadoras de enfermagem",
      "O mesmo grupo do menu. Disponível abre o template clínico. Catalogado mostra o instrumento no lugar certo, sem fingir um cálculo.",
      [{ id: "lista", title: "Cálculos", items: tileItems(calculators, "calculadoras") }],
    );
  }
  if (slug === "escalas") {
    return catalog(
      "escalas",
      "Escalas",
      "Escalas para avaliação",
      "Escalas do menu e da home, mais as especialidades do hero. Apgar, Braden e Morse abrem o template.",
      [
        { id: "lista", title: "Instrumentos", items: tileItems(scales, "escalas") },
        {
          id: "especialidades",
          title: "Por especialidade",
          text: "Os chips da home chegam aqui.",
          items: specialties.map((name) => ({
            id: slugify(name),
            title: name,
            text: "Grupo de escalas desta especialidade no site homologado.",
          })),
        },
      ],
    );
  }
  if (slug === "simulados") {
    return catalog(
      "simulados",
      "Simulados",
      "Simulados de enfermagem",
      "Cinco questões e cartões dos instrumentos no ar. A nota fica só nesta visita. Os cadernos longos do menu não são copiados.",
      [
        {
          id: "treino",
          title: "Neste preview",
          items: [
            { id: "abrir", title: "Treino de 5 questões", text: "Cronômetro de 4 minutos. Sem cadastro.", dest: { kind: "section", slug: "simulados", hash: "treino" }, live: true },
            { id: "cartoes", title: "Cartões", text: "Seis fichas para virar na mesma página.", dest: { kind: "section", slug: "simulados", hash: "cartoes" }, live: true },
          ],
        },
        {
          id: "lista",
          title: "Provas longas do menu",
          text: "Os cadernos de 30 e 50 questões continuam no site homologado.",
          items: tileItems(simulations, "simulados"),
        },
      ],
    );
  }
  return pages[slug] ?? extraSection(slug);
}

export function listSections() {
  return [
    "concurso",
    "sobre",
    "calculadoras",
    "escalas",
    "conteudos",
    "emprego",
    "simulados",
    "biblioteca",
    "contato",
    "entrar",
    "assinatura",
    "politicas",
    "termos",
    "acessibilidade",
    "compromisso",
    "mapa",
    "glossario",
    "nanda",
    ...extraSections().map((section) => section.slug),
  ].map((slug) => getSection(slug)!);
}
