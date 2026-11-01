import { useStored } from "@/lib/stored";
import { lorem } from "@/lib/lorem";

export function LibraryShelves() {
  const { shelves } = useStored();
  const listed = shelves.filter((shelf) => "items" in shelf && shelf.items.length > 0);
  return (
    <>
      {listed.map((shelf) => (
        <section key={shelf.id} className="inst-sec" id={shelf.id}>
          <h2>{shelf.title}</h2>
          <p>{shelf.lead}</p>
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
                    <b>{item.title}</b>
                    {item.text ? <span>{item.text}</span> : null}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {shelf.kind === "pdfs" ? (
            <ul className="lib-files">
              {shelf.items.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>
                    <b>PDF</b>
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </>
  );
}

const sampleShelves = [
  { id: "prancha", title: "Prancha", kind: "plate" },
  { id: "dispositivo", title: "Dispositivo", kind: "device" },
  { id: "imagem", title: "Imagem", kind: "image" },
  { id: "capa", title: "Capa", kind: "thumb" },
  { id: "arquivo", title: "Arquivo", kind: "file" },
  { id: "lamina", title: "Lâmina", kind: "slide" },
  { id: "sintese", title: "Painel", kind: "info" },
] as const;

export function LibrarySpecimen() {
  return (
    <>
      {sampleShelves.map((shelf) => (
        <section key={shelf.id} className="inst-sec" id={shelf.id}>
          <h2>{shelf.title}</h2>
          <p>{lorem("Texto de amostra desta prateleira visual, sem ficha publicada.")}</p>
          {shelf.kind === "plate" ? <SamplePlate /> : null}
          {shelf.kind === "device" ? <SampleDevice /> : null}
          {shelf.kind === "image" ? (
            <ul className="lib-figures">
              <li>
                <img src="/brand/livro.webp" alt="" />
                <span>{lorem("Legenda da figura de amostra")}</span>
              </li>
            </ul>
          ) : null}
          {shelf.kind === "thumb" ? (
            <ul className="lib-thumbs">
              <li>
                <span className="lib-thumb" aria-hidden="true" />
                <b>{lorem("Capa")}</b>
                <span>{lorem("Linha de apoio")}</span>
              </li>
            </ul>
          ) : null}
          {shelf.kind === "file" ? (
            <ul className="lib-files">
              <li>
                <span><b>PDF</b><span>{lorem("Nome do arquivo")}</span></span>
              </li>
            </ul>
          ) : null}
          {shelf.kind === "slide" ? (
            <div className="lib-slide">
              <p className="tpl-kicker">{lorem("Lâmina")}</p>
              <h3>{lorem("Uma ideia por tela")}</h3>
            </div>
          ) : null}
          {shelf.kind === "info" ? (
            <div className="lib-info">
              <ol>
                <li><b>{lorem("Um")}</b><span>{lorem("Primeiro bloco da amostra")}</span></li>
                <li><b>{lorem("Dois")}</b><span>{lorem("Segundo bloco da amostra")}</span></li>
                <li><b>{lorem("Três")}</b><span>{lorem("Terceiro bloco da amostra")}</span></li>
              </ol>
            </div>
          ) : null}
        </section>
      ))}
    </>
  );
}

function SamplePlate() {
  const regions = [lorem("Região um"), lorem("Região dois"), lorem("Região três"), lorem("Região quatro")];
  return (
    <figure className="lib-plate">
      <svg viewBox="0 0 160 280" role="img" aria-label={lorem("Silhueta de amostra com quatro regiões")}>
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
        <ol>{regions.map((region, index) => <li key={region}><b>{index + 1}</b> {region}</li>)}</ol>
      </figcaption>
    </figure>
  );
}

function SampleDevice() {
  const parts = [lorem("Peça um"), lorem("Peça dois"), lorem("Peça três"), lorem("Peça quatro")];
  return (
    <figure className="lib-device">
      <svg viewBox="0 0 520 120" role="img" aria-label={lorem("Dispositivo de amostra")}>
        <rect x="16" y="46" width="28" height="28" rx="4" />
        <rect x="44" y="54" width="70" height="12" />
        <rect x="118" y="36" width="230" height="48" rx="8" />
        <rect x="348" y="48" width="36" height="24" rx="4" />
        <rect x="384" y="56" width="110" height="8" />
        <polygon points="494,52 518,60 494,68" />
      </svg>
      <figcaption>
        <ul>{parts.map((part) => <li key={part}><b>{part}</b></li>)}</ul>
      </figcaption>
    </figure>
  );
}
