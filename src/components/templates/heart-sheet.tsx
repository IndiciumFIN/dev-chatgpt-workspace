import { ArticlePage } from "@/components/article/article-page";
import { RelatedContent } from "@/components/site/related-content";

const structures = [
  ["heart-atrium-right", "Átrio direito", "Recebe sangue venoso sistêmico."],
  ["heart-atrium-left", "Átrio esquerdo", "Recebe sangue proveniente dos pulmões."],
  ["heart-ventricle-right", "Ventrículo direito", "Impulsiona sangue para o circuito pulmonar."],
  ["heart-ventricle-left", "Ventrículo esquerdo", "Impulsiona sangue para a circulação sistêmica."],
  ["heart-tricuspid", "Valva tricúspide", "Entre átrio e ventrículo direitos."],
  ["heart-mitral", "Valva mitral", "Entre átrio e ventrículo esquerdos."],
  ["heart-aorta", "Aorta", "Artéria principal da circulação sistêmica."],
  ["heart-pulmonary", "Artéria pulmonar", "Conduz sangue aos pulmões."],
] as const;

const facts = [
  ["Localização", "Mediastino"],
  ["Função", "Bombear sangue"],
  ["Camadas", "Endocárdio, miocárdio e epicárdio"],
  ["Câmaras", "2 átrios e 2 ventrículos"],
  ["Valvas", "Tricúspide, pulmonar, mitral e aórtica"],
  ["Grandes vasos", "Aorta, veias cavas e vasos pulmonares"],
];

const clinical = [
  ["clinical-heart-failure", "Insuficiência cardíaca"],
  ["clinical-mi", "Infarto do miocárdio"],
  ["clinical-murmur", "Sopros valvares"],
  ["clinical-arrhythmia", "Arritmias"],
] as const;

export function HeartSheet() {
  return (
    <ArticlePage
      kind="biblioteca"
      crumbs={[{ label: "Início", to: "/" }, { label: "Biblioteca", to: "/secao/$slug", params: { slug: "biblioteca" } }, { label: "Coração humano" }]}
      eyebrow="Ficha · Sistema cardiovascular"
      title="Coração humano"
      lead="Órgão muscular central do sistema cardiovascular, responsável pelo bombeamento do sangue para a circulação pulmonar e sistêmica."
      toc={[
        { id: "resumo", label: "Resumo" },
        { id: "estruturas", label: "Estruturas" },
        { id: "vascularizacao", label: "Vascularização" },
        { id: "inervacao", label: "Inervação" },
        { id: "clinicas", label: "Relações clínicas" },
        { id: "fontes", label: "Fontes" },
      ]}
      related={
        <RelatedContent
          items={[{ to: "/secao/$slug", params: { slug: "biblioteca" }, title: "Biblioteca", text: "Volta às prateleiras. Esta página é a ficha, não o hub." }]}
        />
      }
    >
      <section className="inst-sec" id="resumo">
        <h2>Resumo anatômico</h2>
        <figure className="inst-fig has-frame">
          <img src="/bibliotecas/anatomia/object-hero-heart.avif" alt="Ilustração do coração humano, vista de conjunto." />
          <figcaption>Vista de conjunto. A ficha nomeia as estruturas abaixo.</figcaption>
        </figure>
        <p>O coração humano é um órgão muscular oco, situado no mediastino, entre os pulmões. Sua organização inclui quatro câmaras: dois átrios e dois ventrículos.</p>
        <p>As quatro principais valvas cardíacas orientam o fluxo sanguíneo: tricúspide, pulmonar, mitral e aórtica.</p>
        <ul className="guide-cards">
          {facts.map(([name, text]) => (
            <li key={name}><b>{name}</b><span>{text}</span></li>
          ))}
        </ul>
      </section>
      <section className="inst-sec" id="estruturas">
        <h2>Estruturas principais</h2>
        <ul className="lib-figures">
          {structures.map(([file, title, text]) => (
            <li key={file}>
              <img src={`/bibliotecas/anatomia/${file}.avif`} alt={`Ilustração: ${title}. ${text}`} />
              <span><b>{title}</b> {text}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="inst-sec" id="vascularizacao">
        <h2>Vascularização</h2>
        <p>As artérias coronárias irrigam o miocárdio. A drenagem venosa retorna principalmente pelo seio coronário. A descrição detalhada depende da revisão do conteúdo científico.</p>
      </section>
      <section className="inst-sec" id="inervacao">
        <h2>Inervação</h2>
        <p>A regulação cardíaca envolve o sistema nervoso autônomo e o sistema de condução. Relações clínicas detalhadas exigem referências verificadas.</p>
      </section>
      <section className="inst-sec" id="clinicas">
        <h2>Relações clínicas</h2>
        <ul className="lib-figures">
          {clinical.map(([file, title]) => (
            <li key={file}>
              <img src={`/bibliotecas/anatomia/${file}.avif`} alt={`Ilustração de estudo: ${title}.`} />
              <span>{title}</span>
            </li>
          ))}
        </ul>
        <p className="tpl-note">Tópicos de estudo: não são orientação diagnóstica ou terapêutica.</p>
      </section>
      <section className="inst-sec" id="fontes">
        <h2>Referências e proveniência</h2>
        <p>Imagem principal e miniaturas: prancha recuperada do acervo de anatomia. Referências bibliográficas clínicas ainda não foram fornecidas para homologação.</p>
      </section>
    </ArticlePage>
  );
}
