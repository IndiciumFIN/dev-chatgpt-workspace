import { Link } from "@tanstack/react-router";
import { ArticlePage } from "@/components/article/article-page";
import { RelatedContent } from "@/components/site/related-content";
import { imageAlt, useStored } from "@/lib/stored";
import { ArticleFaq, ArticlePortrait, Chronology, Cite, ContextGrid, Keyline, ReferenceList, type ChronologyEvent } from "@/components/article/pieces";

const toc = [
  ["introducao", "Introdução"],
  ["origens", "1. Origens e formação"],
  ["carreira", "2. Carreira profissional"],
  ["associacao", "3. Organização profissional e ativismo"],
  ["linha-do-tempo", "4. Linha do tempo"],
  ["contexto", "5. Por que sua história importa?"],
  ["faq", "6. Perguntas frequentes"],
  ["referencias", "Referências"],
] as const;

const events: ChronologyEvent[] = [
  { year: "1845", kind: "life", title: "Nascimento na região de Boston", text: "Filha de ex-escravizados, cresce em Massachusetts. O dia e o mês do nascimento não são consensuais entre as fontes.", refs: [2] },
  { year: "1878", kind: "life", title: "Ingresso na formação profissional", text: "Admitida no programa de enfermagem do New England Hospital for Women and Children, com cerca de 33 anos.", refs: [2] },
  { year: "1879", kind: "life", title: "Diploma e marco histórico", text: "Conclui o curso e se torna uma pioneira reconhecida da enfermagem afro-americana. Os relatos divergem quanto ao número total de estudantes e concluintes.", refs: [1, 2, 4] },
  { year: "1896", kind: "life", title: "Participação em associação de enfermagem", text: "Ingressa na Nurses Associated Alumnae, precursora da American Nurses Association.", refs: [2] },
  { year: "1908", kind: "life", title: "Articulação da NACGN", text: "Participa da criação de organização dedicada ao reconhecimento e aos direitos de enfermeiras negras diplomadas.", refs: [2, 5] },
  { year: "1909", kind: "life", title: "Primeira conferência nacional", text: "Faz o discurso de boas-vindas na conferência inaugural da NACGN.", refs: [1] },
  { year: "1911–12", kind: "life", title: "Atuação na direção do Howard Orphan Asylum", text: "Assume função de liderança em instituição voltada a crianças negras, em Long Island.", refs: [2] },
  { year: "1920", kind: "life", title: "Participação no sufrágio feminino", text: "Após a 19ª Emenda, figura entre as primeiras mulheres a se registrar para votar em Boston, conforme relatos biográficos.", refs: [2, 4] },
  { year: "1926", kind: "life", title: "Falecimento", text: "Morre em 4 de janeiro, aos 80 anos. Está sepultada no Woodlawn Cemetery, em Everett, Massachusetts.", refs: [2, 6] },
  { year: "1936", kind: "legacy", title: "Criação do Mary Mahoney Award", text: "A NACGN institui uma homenagem a contribuições para relações inter-raciais e igualdade de oportunidades na enfermagem.", refs: [1] },
  { year: "1951", kind: "legacy", title: "Reorganização da representação profissional", text: "A NACGN encerra sua atuação autônoma no contexto de integração com a American Nurses Association, que mantém o prêmio.", refs: [1] },
  { year: "1973", kind: "legacy", title: "Memorial no túmulo", text: "É erguido um monumento em sua homenagem no Woodlawn Cemetery.", refs: [6] },
  { year: "1976", kind: "legacy", title: "ANA Hall of Fame", text: "É incluída, postumamente, no Hall da Fama da American Nurses Association.", refs: [1] },
  { year: "1993", kind: "legacy", title: "National Women's Hall of Fame", text: "Seu nome passa a integrar o Hall da Fama Nacional das Mulheres dos Estados Unidos.", refs: [4] },
];

const references = [
  { author: "AMERICAN NURSES ASSOCIATION.", title: "Hall of Fame inductees, 1976–1982.", href: "https://www.nursingworld.org/ana/about-ana/history/hall-of-fame/1976-1982-inductees/" },
  { author: "SPRING, Kelly A.", title: "Mary Eliza Mahoney. National Women's History Museum, 2017.", href: "https://www.womenshistory.org/education-resources/biographies/mary-mahoney" },
  { author: "UNIVERSITY OF PENNSYLVANIA. School of Nursing.", title: "Nursing, history, and health care: 1870–1899.", href: "https://www.nursing.upenn.edu/nhhc/nursing-through-time/1870-1899/" },
  { author: "NATIONAL WOMEN'S HALL OF FAME.", title: "Mary Mahoney.", href: "https://www.womenofthehall.org/inductee/mary-mahoney/" },
  { author: "UNITED STATES. National Park Service.", title: "African American nurses. 2020.", href: "https://www.nps.gov/fomc/learn/historyculture/african-american-nurses.htm" },
  { author: "AMERICAN ASSOCIATION FOR THE HISTORY OF NURSING.", title: "Mary E. Mahoney.", href: "https://www.aahn.org/mahoney" },
  { author: "JOHNS HOPKINS UNIVERSITY. Sheridan Libraries and Museums.", title: "Mary Eliza Mahoney, photograph c. late 1800s.", href: "https://exhibits.library.jhu.edu/items/show/1601" },
  { author: "MARY ELIZA MAHONEY [fotografia].", title: "Fotógrafo não identificado. Wikimedia Commons.", href: "https://commons.wikimedia.org/wiki/File:Mary_Eliza_Mahoney.jpg" },
];

export function BiographyView() {
  const { images } = useStored();
  return (
    <ArticlePage
      kind="artigo"
      crumbs={[
        { label: "Início", to: "/" },
        { label: "Pessoas e pioneiros", to: "/secao/$slug", params: { slug: "biblioteca" }, hash: "blog" },
        { label: "Mary Eliza Mahoney" },
      ]}
      eyebrow="História da enfermagem · Pessoas e pioneiros"
      title="Mary Eliza Mahoney"
      lead="A enfermeira pioneira cuja trajetória reuniu formação profissional, cuidado e defesa da igualdade de oportunidades nos Estados Unidos."
      toc={toc.map(([id, label]) => ({ id, label }))}
      related={
        <RelatedContent
          items={[
            { to: "/modelos/$id", params: { id: "guia" }, title: "Guia", text: "O mesmo molde de página longa." },
            { to: "/secao/$slug", params: { slug: "biblioteca" }, title: "Biblioteca", text: "Acervo em que esta biografia está." },
          ]}
        />
      }
      footer={<p className="inst-note">Direitos sobre imagens: a fotografia é documento histórico de autoria não identificada, via Wikimedia Commons. <Link to="/secao/$slug" params={{ slug: "contato" }}>Solicitar revisão de crédito ou remoção</Link>.</p>}
    >
      <section className="inst-sec" id="introducao" aria-labelledby="introducao-h">
        <h2 id="introducao-h">Introdução</h2>
        <div className="inst-split is-fig-esquerda is-portrait-left">
          <ArticlePortrait src="/artigos/mary-eliza-mahoney.jpg" alt={imageAlt(images, "/artigos/mary-eliza-mahoney.jpg", "Retrato histórico de Mary Eliza Mahoney de touca e uniforme de enfermagem.")} title="Figura 1 – Mary Eliza Mahoney" caption="Fotógrafo desconhecido. Créditos: Wikimedia Commons." fallbackHref="https://commons.wikimedia.org/wiki/File:Mary_Eliza_Mahoney.jpg" />
          <div>
            <p>Mary Eliza Mahoney (1845–1926) é reconhecida como a primeira mulher negra a concluir uma formação profissional em enfermagem nos Estados Unidos. Diplomada em 1879 pela escola do <em>New England Hospital for Women and Children</em>, sua trajetória conectou cuidado, formação e defesa de oportunidades para enfermeiras afro-americanas.<Cite n={[1, 2]} /></p>
            <p>Seu percurso articula qualificação profissional, cuidado domiciliar e mobilização coletiva por oportunidades para mulheres negras na enfermagem. A fotografia ao lado é apresentada como documento histórico, com procedência explicitada.</p>
          </div>
        </div>
      </section>
      <section className="inst-sec" id="origens" aria-labelledby="origens-h">
        <h2 id="origens-h"><span className="n">1.</span> Origens e formação</h2>
        <p>Mahoney nasceu em 1845, na região de Boston, Massachusetts, filha de pessoas libertas da escravidão que haviam migrado da Carolina do Norte. Frequentou a Phillips School e trabalhou por muitos anos no New England Hospital for Women and Children, exercendo atividades de apoio e aprendendo aspectos do cuidado antes da admissão na formação formal.<Cite n={[2]} /></p>
        <p>Em 1878, aos cerca de 33 anos, ingressou no programa de enfermagem, com duração de aproximadamente 16 meses. Concluiu o curso em 1879, em um momento em que instituições de ensino e serviços de saúde impunham restrições importantes às mulheres negras.<Cite n={[1, 3]} /></p>
        <Keyline><strong>Contexto importante:</strong> a escola de enfermagem não surgiu em 1878; esse foi o ano de ingresso de Mahoney. O hospital já mantinha formação de enfermagem anteriormente.<Cite n={[3]} /></Keyline>
        <details className="inst-history">
          <summary>Por que algumas datas e números variam entre as fontes?</summary>
          <p>As fontes concordam que Mahoney nasceu em 1845 e se diplomou em 1879, mas não sobre o dia de nascimento nem a quantidade de estudantes da turma. O National Women’s History Museum registra 42 ingressantes e quatro concluintes; o National Women’s Hall of Fame, 18 e quatro; a ANA, três concluintes. Por isso, este texto não apresenta uma quantidade única como definitiva.<Cite n={[1, 2, 4]} /></p>
        </details>
      </section>
      <section className="inst-sec" id="carreira" aria-labelledby="carreira-h">
        <h2 id="carreira-h"><span className="n">2.</span> Carreira profissional</h2>
        <p>Depois de diplomada, Mahoney construiu sua carreira predominantemente como enfermeira particular, atendendo famílias em domicílio. A escolha também refletia as barreiras raciais encontradas por profissionais negras nos serviços de saúde da época.<Cite n={[2]} /></p>
        <p>Em 1896, integrou a <em>Nurses Associated Alumnae of the United States and Canada</em>, antecessora da American Nurses Association. Entre 1911 e 1912, atuou na direção do Howard Orphan Asylum, instituição voltada a crianças negras em Long Island.<Cite n={[2]} /></p>
        <p>Além da prática assistencial, Mahoney defendeu a ampliação do acesso de pessoas negras à educação e ao reconhecimento na enfermagem.<Cite n={[5]} /></p>
      </section>
      <section className="inst-sec" id="associacao" aria-labelledby="associacao-h">
        <h2 id="associacao-h"><span className="n">3.</span> Organização profissional e ativismo</h2>
        <p>Em 1908, Mahoney esteve associada à criação da <em>National Association of Colored Graduate Nurses</em> (NACGN). A organização também é historicamente associada a Martha Minerva Franklin e Adah B. Thoms.<Cite n={[2, 5]} /></p>
        <p>Na primeira conferência da NACGN, em 1909, Mahoney fez o discurso de boas-vindas. Em 1936, a associação instituiu o <em>Mary Mahoney Award</em>, preservado posteriormente pela American Nurses Association.<Cite n={[1]} /></p>
        <p>Mahoney também apoiou o sufrágio feminino. Após a ratificação da 19ª Emenda, em 1920, foi registrada entre as primeiras mulheres de Boston a se inscrever para votar, segundo biografias históricas.<Cite n={[2, 4]} /></p>
      </section>
      <section className="inst-sec" id="linha-do-tempo" aria-labelledby="linha-do-tempo-h">
        <h2 id="linha-do-tempo-h"><span className="n">4.</span> Linha do tempo: vida e legado</h2>
        <p className="ue-section-lead">Da formação profissional às homenagens posteriores, com fontes vinculadas aos principais acontecimentos.</p>
        <Chronology events={events} label="Linha do tempo de Mary Eliza Mahoney" />
      </section>
      <section className="inst-sec" id="contexto" aria-labelledby="contexto-h">
        <h2 id="contexto-h"><span className="n">5.</span> Por que sua história importa?</h2>
        <ContextGrid items={[
          { title: "Profissionalização", text: "Sua formação evidencia os obstáculos enfrentados por mulheres negras para acessar escolas profissionais de enfermagem no século XIX." },
          { title: "Representatividade", text: "A organização coletiva foi um instrumento para reivindicar oportunidades, reconhecimento e participação na profissão." },
          { title: "História da profissão", text: "O estudo permite comparar mudanças na educação em enfermagem e na inserção profissional ao longo do tempo." },
          { title: "Leitura crítica", text: "Biografias históricas também exigem confronto de documentos quando apresentam números ou datas divergentes." },
        ]} />
      </section>
      <section className="inst-sec" id="faq" aria-labelledby="faq-h">
        <h2 id="faq-h"><span className="n">6.</span> Perguntas frequentes</h2>
        <ArticleFaq items={[
          { question: "Por que Mary Eliza Mahoney é considerada pioneira?", answer: <p>Porque concluiu, em 1879, uma formação profissional de enfermagem reconhecida como marco para mulheres negras nos Estados Unidos.<Cite n={[1]} /></p> },
          { question: "Em qual instituição ela se formou?", answer: <p>Na escola de enfermagem do New England Hospital for Women and Children, em Boston, Massachusetts.<Cite n={[2]} /></p> },
          { question: "Qual foi a importância da NACGN?", answer: <p>A associação foi criada para ampliar reconhecimento e oportunidades para enfermeiras negras diplomadas diante de barreiras raciais no exercício da profissão.<Cite n={[5]} /></p> },
        ]} />
      </section>
      <section className="inst-sec inst-refs" id="referencias" aria-labelledby="referencias-h">
        <h2 id="referencias-h">Referências</h2>
        <ReferenceList items={references.map((item) => ({ ...item, access: "10 out. 2026" }))} />
      </section>
    </ArticlePage>
  );
}