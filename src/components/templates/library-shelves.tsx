import { Link } from "@tanstack/react-router";
import { libraryShelves } from "@/lib/library-shelves";

export function LibraryShelves() {
  return (
    <>
      {libraryShelves.map((shelf) => (
        <section key={shelf.id} className="inst-sec" id={shelf.id}>
          <h2>{shelf.title}</h2>
          <p>{shelf.lead}</p>
          {shelf.kind === "plate" ? <AnatomyPlate /> : null}
          {shelf.kind === "device" ? <SyringePlate /> : null}
          {shelf.kind === "images" ? (
            <ul className="lib-figures">
              {shelf.items.map((item) => (
                <li key={item.src}>
                  <img src={item.src} alt={item.alt} />
                  <span>{item.caption}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {shelf.kind === "thumbs" ? (
            <ul className="lib-thumbs">
              {shelf.items.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>
                    <span className="lib-thumb" aria-hidden="true" />
                    <b>{item.title}</b>
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {shelf.kind === "pdfs" ? (
            <ul className="lib-files">
              {shelf.items.map((item) => (
                <li key={item.href}>
                  <a href={item.href} target="_blank" rel="noopener">
                    <b>PDF</b>
                    <span>{item.title}</span>
                    <small>{item.text}</small>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {shelf.kind === "slides" ? (
            <div className="lib-slide">
              <p className="tpl-kicker">Lâmina</p>
              <h3>Uma ideia por tela</h3>
              <Link to="/modelos/$id" params={{ id: "slides" }}>Abrir o modelo de slides</Link>
            </div>
          ) : null}
          {shelf.kind === "info" ? <Infographic /> : null}
        </section>
      ))}
    </>
  );
}

function AnatomyPlate() {
  const regions = ["Cabeça e pescoço", "Tórax", "Abdome", "Membros"];
  return (
    <figure className="lib-plate">
      <svg viewBox="0 0 160 280" role="img" aria-label="Silhueta com quatro regiões: cabeça e pescoço, tórax, abdome e membros">
        <ellipse cx="80" cy="28" rx="18" ry="22" />
        <rect x="70" y="48" width="20" height="16" rx="6" />
        <rect x="48" y="66" width="64" height="70" rx="16" />
        <rect x="52" y="140" width="56" height="48" rx="14" />
        <rect x="28" y="72" width="18" height="78" rx="9" />
        <rect x="114" y="72" width="18" height="78" rx="9" />
        <rect x="58" y="190" width="16" height="70" rx="8" />
        <rect x="86" y="190" width="16" height="70" rx="8" />
      </svg>
      <figcaption>
        <ol>
          {regions.map((region, index) => <li key={region}><b>{index + 1}</b> {region}</li>)}
        </ol>
        <p>Modelo de prancha. A legenda nomeia a região. O desenho não mede e não diagnostica.</p>
      </figcaption>
    </figure>
  );
}

function SyringePlate() {
  const parts = [
    ["Êmbolo", "Empurra o volume"],
    ["Corpo", "Onde o volume é lido"],
    ["Escala", "Marcas em mL"],
    ["Conector", "Encaixa a agulha"],
    ["Agulha", "Cânula"],
    ["Bisel", "Abertura da ponta"],
  ];
  return (
    <figure className="lib-device">
      <svg viewBox="0 0 520 120" role="img" aria-label="Seringa com êmbolo, corpo, escala, conector, agulha e bisel">
        <rect x="16" y="46" width="28" height="28" rx="4" />
        <rect x="44" y="54" width="70" height="12" />
        <rect x="118" y="36" width="230" height="48" rx="8" />
        <path d="M150 36 v48 M190 36 v48 M230 36 v48 M270 36 v48 M310 36 v48" />
        <rect x="348" y="48" width="36" height="24" rx="4" />
        <rect x="384" y="56" width="110" height="8" />
        <polygon points="494,52 518,60 494,68" />
      </svg>
      <figcaption>
        <ul>
          {parts.map(([name, text]) => <li key={name}><b>{name}</b> {text}</li>)}
        </ul>
      </figcaption>
    </figure>
  );
}

function Infographic() {
  return (
    <div className="lib-info">
      <ol>
        <li><b>Reconhecer</b><span>Frequência, saturação e pressão fora do habitual.</span></li>
        <li><b>Agir</b><span>Chamar a equipe e iniciar o que o protocolo local manda.</span></li>
        <li><b>Registrar</b><span>Hora, valor e resposta. Sem dado de paciente neste modelo.</span></li>
      </ol>
      <p>Não prescreve e não dispensa o protocolo da instituição.</p>
    </div>
  );
}
