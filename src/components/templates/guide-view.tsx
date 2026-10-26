import { ArticlePage } from "@/components/article/article-page";
import { ReferenceList } from "@/components/article/pieces";
import { Callout } from "@/components/site/callout";
import { RelatedContent } from "@/components/site/related-content";

export function GuideView() {
  return (
    <ArticlePage
      kind="guia"
      crumbs={[
        { label: "Início", to: "/" },
        { label: "Templates", to: "/modelos" },
        { label: "Sepse" },
      ]}
      eyebrow="Urgência clínica · Protocolo educacional"
      title="Sepse na emergência: reconhecimento, primeiras horas e reavaliação"
      lead="Conteúdo aprofundado para organizar o raciocínio de enfermagem sem reduzir sepse a um checklist rígido de 60 minutos."
      pdfHref="/artigos/sepse-na-emergencia.pdf"
      actions={[{ href: "#s3", label: "Conduta inicial" }, { href: "#s2", label: "Reconhecimento" }, { href: "#s1", label: "Definição" }, { href: "#referencias", label: "Evidências" }]}
      toc={[{ id: "s0", label: "Introdução" }, { id: "s1", label: "1. O que é sepse" }, { id: "s2", label: "2. Reconhecimento e triagem" }, { id: "s3", label: "3. Primeiros minutos" }, { id: "referencias", label: "Evidências" }]}
      related={
        <RelatedContent
          items={[
            { to: "/ferramentas/$slug", params: { slug: "gotejamento" }, title: "Gotejamento", text: "Velocidade de infusão no mesmo site." },
            { to: "/blog/mary-eliza-mahoney", title: "Mary Eliza Mahoney", text: "Biografia no mesmo molde de artigo." },
          ]}
        />
      }
    >
      <section className="inst-sec" id="s0" aria-labelledby="s0-h">
        <h2 id="s0-h">Introdução</h2>
        <p className="ue-section-lead">Sepse é uma emergência tempo-dependente, mas o cuidado atual não cabe em uma lista rígida de tarefas encerrada em 60 minutos. O objetivo desta página é organizar o raciocínio de enfermagem em torno de <strong>reconhecimento precoce, tratamento oportuno, ressuscitação hemodinâmica e reavaliação contínua</strong>.</p>
        <div className="inst-split is-fig-esquerda">
          <figure className="inst-fig has-frame">
            <img src="/artigos/sepse-reconhecimento.svg" alt="Paciente em atendimento de emergência com cinco marcadores numerados ligados a sinais de deterioração sistêmica." />
            <figcaption>Reconhecimento de deterioração: a ilustração organiza cinco áreas de observação. Os números são explicados ao lado; a imagem não substitui avaliação clínica.</figcaption>
          </figure>
          <div className="ue-visual-panel">
            <h3>O que observar primeiro</h3>
            <ol className="ue-legend">
              <li><span className="ue-num">1</span><span><strong>Consciência:</strong> alteração aguda do sensório ou queda do nível de resposta.</span></li>
              <li><span className="ue-num">2</span><span><strong>Respiração:</strong> taquipneia, esforço, hipoxemia ou aumento da necessidade de oxigênio.</span></li>
              <li><span className="ue-num">3</span><span><strong>Circulação:</strong> hipotensão, tendência de queda da pressão ou necessidade crescente de suporte.</span></li>
              <li><span className="ue-num">4</span><span><strong>Perfusão:</strong> enchimento capilar prolongado, pele fria ou moteada.</span></li>
              <li><span className="ue-num">5</span><span><strong>Diurese:</strong> redução importante pode sinalizar disfunção orgânica.</span></li>
            </ol>
          </div>
        </div>
        <Callout><strong>Escopo:</strong> conteúdo educacional. Antimicrobianos, fluidos, vasopressores, exames e procedimentos dependem de avaliação clínica, prescrição e protocolo institucional.</Callout>
        <p className="ue-source-line">Base principal: <a href="#referencias">SSC 2026</a> · <a href="#referencias">Sepsis-3</a>.</p>
      </section>
      <section className="inst-sec" id="s1" aria-labelledby="s1-h">
        <h2 id="s1-h"><span className="n">1.</span> O que é sepse</h2>
        <p>A definição Sepsis-3 descreve sepse como <strong>disfunção orgânica ameaçadora à vida causada por uma resposta desregulada do hospedeiro à infecção</strong>. Febre, leucocitose ou taquicardia isoladas não definem sepse; ausência de febre não exclui um quadro grave.</p>
        <ul className="inst-cards cols-3 is-compact">
          <li className="inst-card"><h3>Infecção</h3><p>Suspeita ou confirmação de infecção sem evidência de disfunção orgânica aguda atribuível ao processo.</p></li>
          <li className="inst-card"><h3>Sepse</h3><p>Infecção associada a disfunção orgânica ameaçadora à vida; exige avaliação e tratamento urgentes.</p></li>
          <li className="inst-card"><h3>Choque séptico</h3><p>Subgrupo de maior gravidade, com necessidade de suporte hemodinâmico.</p></li>
        </ul>
        <div className="ue-critical"><strong>Não espere a definição completa de choque séptico para começar a tratar um paciente instável.</strong> A classificação ajuda a comunicar gravidade; a ressuscitação começa quando a avaliação clínica indica emergência.</div>
      </section>
      <section className="inst-sec" id="s2" aria-labelledby="s2-h">
        <h2 id="s2-h"><span className="n">2.</span> Reconhecimento e triagem</h2>
        <p>O reconhecimento começa antes do diagnóstico definitivo. Na emergência, combine <strong>suspeita de infecção, tendência clínica e sinais de disfunção orgânica</strong>. Uma mudança em relação ao basal pode ser mais informativa do que um valor isolado.</p>
        <div className="ue-scoregrid">
          <article className="ue-score is-preferred"><span className="ue-role">Triagem hospitalar</span><h3>NEWS / NEWS2</h3><p>Integra vários sinais fisiológicos e é citado pela SSC 2026 como opção de rastreio.</p></article>
          <article className="ue-score"><span className="ue-role">Triagem hospitalar</span><h3>MEWS ou SIRS</h3><p>Também podem ser utilizados conforme o protocolo institucional.</p></article>
          <article className="ue-score"><span className="ue-role">Risco, não exclusão</span><h3>qSOFA</h3><p>Sinaliza maior risco, mas não deve ser usado sozinho para descartar sepse.</p></article>
        </div>
        <Callout tone="warn"><strong>Armadilha:</strong> aguardar qSOFA igual ou maior que 2 para acionar avaliação pode atrasar o cuidado.</Callout>
      </section>
      <section className="inst-sec" id="s3" aria-labelledby="s3-h">
        <h2 id="s3-h"><span className="n">3.</span> Primeiros minutos</h2>
        <p>Sepse e choque séptico são emergências. O fluxo prático deve evitar uma fila artificial de tarefas. Enquanto um profissional coleta dados, outros podem estabilizar o ABCDE, preparar acesso e a terapia já indicada.</p>
        <ol className="inst-flow">
          <li>Suspeita e deterioração</li>
          <li>ABCDE e monitorização</li>
          <li>Estratificar gravidade</li>
          <li>Culturas, lactato e tratamento indicado</li>
          <li>Reavaliar resposta e fonte</li>
        </ol>
        <div className="ue-pathways">
          <article className="ue-path is-critical"><strong>Choque séptico possível, provável ou definido</strong><p>Antimicrobiano imediatamente, idealmente em até 1 hora do reconhecimento. A ressuscitação hemodinâmica começa sem atraso.</p></article>
          <article className="ue-path is-ok"><strong>Sepse provável sem choque</strong><p>Antimicrobiano imediatamente, idealmente em até 1 hora do reconhecimento.</p></article>
        </div>
      </section>
      <section className="inst-sec inst-refs" id="referencias" aria-labelledby="ref-h">
        <h2 id="ref-h">Evidências</h2>
        <ReferenceList items={[
          "Surviving Sepsis Campaign 2026. Diretriz citada pelo pacote de sepse como base de rastreio e tempo de antimicrobiano.",
          "Sepsis-3. Definição de sepse como disfunção orgânica ameaçadora à vida causada por resposta desregulada à infecção.",
        ]} />
      </section>
    </ArticlePage>
  );
}
