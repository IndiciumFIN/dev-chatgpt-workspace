import { Breadcrumb } from "@/components/site/breadcrumb";

const total = 10;

function Foot({ n }: { n: number }) {
  return (
    <footer className="slide-foot">
      <span className="slide-brand">
        <img src="/brand/logo.webp" alt="" />
        Calculadoras de Enfermagem
      </span>
      <span className="slide-index">{String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
    </footer>
  );
}

export function SlideDeck() {
  return (
    <article className="page-wide">
      <Breadcrumb items={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: "Slides" }]} />
      <h1 className="page-title">Modelo de slides</h1>
      <p className="lede">Dez lâminas 16:9. Capa, sumário, seção, paleta, comparação, números, tabela, aviso e fecho. Imprimir gera uma lâmina por página.</p>
      <ol className="deck">
        <li className="slide is-cover" aria-label="Lâmina 1 de 10, capa">
          <div className="slide-cover">
            <div>
              <p className="slide-kicker">Design system · modelo</p>
              <h2>Calculadoras de Enfermagem</h2>
              <p>A mesma marca da página, da ferramenta e do laudo. Uma ideia por lâmina.</p>
            </div>
            <ol className="slide-cover-list">
              <li><b>01</b> Capa e sumário</li>
              <li><b>02</b> Seção e tokens</li>
              <li><b>03</b> Comparação e números</li>
              <li><b>04</b> Tabela, aviso e fecho</li>
            </ol>
          </div>
          <Foot n={1} />
        </li>

        <li className="slide" aria-label="Lâmina 2 de 10, como usar">
          <div className="slide-body is-rail">
            <div className="slide-rail">
              <p className="slide-kicker">Uso</p>
              <h2>Quatro regras da lâmina</h2>
            </div>
            <ol className="slide-rules">
              <li><b>01</b><span>Uma ideia. O título não repete o corpo.</span></li>
              <li><b>02</b><span>Texto curto. Quem apresenta fala o resto.</span></li>
              <li><b>03</b><span>Sem dado de paciente.</span></li>
              <li><b>04</b><span>Cor nunca é o único sinal.</span></li>
            </ol>
          </div>
          <Foot n={2} />
        </li>

        <li className="slide" aria-label="Lâmina 3 de 10, sumário">
          <p className="slide-kicker">Sumário</p>
          <h2>O conjunto</h2>
          <ol className="slide-agenda">
            <li><b>01</b><span>Capa</span><small>Abre o assunto</small></li>
            <li><b>02</b><span>Regras</span><small>Como preencher</small></li>
            <li><b>03</b><span>Seção</span><small>Muda o bloco</small></li>
            <li><b>04</b><span>Tokens</span><small>Cor permitida</small></li>
            <li><b>05</b><span>Comparar</span><small>Tela e laudo</small></li>
            <li><b>06</b><span>Fecho</span><small>Uma ação</small></li>
          </ol>
          <Foot n={3} />
        </li>

        <li className="slide is-section" aria-label="Lâmina 4 de 10, seção">
          <p className="slide-section-no">04</p>
          <div>
            <p className="slide-kicker">Seção</p>
            <h2>Tokens</h2>
            <p>Esta lâmina só anuncia o bloco. O conteúdo começa na seguinte.</p>
          </div>
          <Foot n={4} />
        </li>

        <li className="slide" aria-label="Lâmina 5 de 10, paleta">
          <p className="slide-kicker">Cor</p>
          <h2>Paleta fechada</h2>
          <ul className="slide-palette">
            <li><i className="swatch-navy" /><b>Marinha</b><small>#1A3E74</small><span>Capa, título, barra</span></li>
            <li><i className="swatch-mid" /><b>Meio</b><small>#1E4D8C</small><span>Gradiente</span></li>
            <li><i className="swatch-sky" /><b>Céu</b><small>#4A90E2</small><span>Acento</span></li>
            <li><i className="swatch-ink" /><b>Tinta</b><small>#0F2440</small><span>Texto</span></li>
          </ul>
          <Foot n={5} />
        </li>

        <li className="slide" aria-label="Lâmina 6 de 10, comparação">
          <p className="slide-kicker">Comparar</p>
          <h2>Tela e laudo</h2>
          <div className="slide-split">
            <section className="is-ink">
              <p className="slide-kicker">Na tela</p>
              <h3>Cálculo</h3>
              <ul>
                <li>Paciente só na escala</li>
                <li>Entrada, resultado e memória</li>
                <li>Sem NANDA</li>
              </ul>
            </section>
            <section>
              <p className="slide-kicker">No laudo</p>
              <h3>Folha A4</h3>
              <ul>
                <li>Impressão e DOCX</li>
                <li>NANDA só na escala</li>
                <li>Observação só na escala</li>
              </ul>
            </section>
          </div>
          <Foot n={6} />
        </li>

        <li className="slide" aria-label="Lâmina 7 de 10, números">
          <p className="slide-kicker">Números</p>
          <h2>Três marcas</h2>
          <ul className="slide-metrics">
            <li><b>44</b><small>px</small><span>Alvo mínimo na ferramenta</span></li>
            <li><b>AA</b><small>WCAG</small><span>Texto e borda no 2.1</span></li>
            <li><b>0</b><small>escore</small><span>Nada antes de calcular</span></li>
          </ul>
          <Foot n={7} />
        </li>

        <li className="slide" aria-label="Lâmina 8 de 10, tabela">
          <p className="slide-kicker">Tabela</p>
          <h2>Peça e uso</h2>
          <table>
            <thead><tr><th>Peça</th><th>Entra</th><th>Não entra</th></tr></thead>
            <tbody>
              <tr><td>Capa</td><td>Marca e assunto</td><td>Lista longa</td></tr>
              <tr><td>Seção</td><td>Número e título</td><td>Tabela</td></tr>
              <tr><td>Fecho</td><td>Uma ação</td><td>Tema novo</td></tr>
            </tbody>
          </table>
          <Foot n={8} />
        </li>

        <li className="slide" aria-label="Lâmina 9 de 10, aviso">
          <div className="slide-quote">
            <p className="slide-kicker">Aviso</p>
            <h2>O número apoia. Não prescreve.</h2>
            <p>Não diagnostica e não dispensa o protocolo da instituição.</p>
          </div>
          <Foot n={9} />
        </li>

        <li className="slide is-end" aria-label="Lâmina 10 de 10, fecho">
          <div className="slide-cover">
            <div>
              <p className="slide-kicker">Fecho</p>
              <h2>Leve o mesmo token.</h2>
              <p>Não crie paleta nova na próxima página.</p>
            </div>
            <p className="slide-action">Um próximo passo, escrito numa linha.</p>
          </div>
          <Foot n={10} />
        </li>
      </ol>
    </article>
  );
}
