export type LibraryShelf =
  | { id: string; title: string; lead: string; kind: "plate" }
  | { id: string; title: string; lead: string; kind: "device" }
  | { id: string; title: string; lead: string; kind: "images"; items: { src: string; alt: string; caption: string }[] }
  | { id: string; title: string; lead: string; kind: "thumbs"; items: { title: string; text: string; href: string }[] }
  | { id: string; title: string; lead: string; kind: "pdfs"; items: { title: string; text: string; href: string }[] }
  | { id: string; title: string; lead: string; kind: "slides" }
  | { id: string; title: string; lead: string; kind: "info" };

export const libraryShelves: LibraryShelf[] = [
  {
    id: "anatomia",
    title: "Anatomia",
    kind: "plate",
    lead: "Prancha de índice. Localiza a região. Não é atlas e não fecha diagnóstico.",
  },
  {
    id: "seringas",
    title: "Seringas e agulhas",
    kind: "device",
    lead: "Peças nomeadas do dispositivo. Calibre e volume vêm do protocolo da instituição.",
  },
  {
    id: "imagens",
    title: "Imagens",
    kind: "images",
    lead: "Figura com legenda. A imagem não substitui o texto.",
    items: [
      { src: "/brand/enfermeira.webp", alt: "Ilustração institucional de uma enfermeira", caption: "Marca" },
      { src: "/brand/livro.webp", alt: "Ilustração de um livro aberto", caption: "Acervo" },
      { src: "/brand/chapeu.webp", alt: "Ilustração de um capuz de formatura", caption: "História" },
    ],
  },
  {
    id: "thumbnails",
    title: "Thumbnails",
    kind: "thumbs",
    lead: "Capa 16:9 para abrir um material. O título fica fora da imagem.",
    items: [
      { title: "Guia de sepse", text: "Página longa", href: "/modelos/guia" },
      { title: "Slides", text: "Dez lâminas", href: "/modelos/slides" },
      { title: "Laudo", text: "Folha da escala", href: "/modelos/laudo" },
    ],
  },
  {
    id: "pdfs",
    title: "PDFs",
    kind: "pdfs",
    lead: "O arquivo abre à parte. Não há um pacote para baixar de uma vez.",
    items: [
      { title: "Sepse na emergência", text: "PDF do guia", href: "/artigos/sepse-na-emergencia.pdf" },
    ],
  },
  {
    id: "slides",
    title: "Slides",
    kind: "slides",
    lead: "A lâmina é 16:9 e usa o mesmo marinha da capa.",
  },
  {
    id: "infograficos",
    title: "Infográficos",
    kind: "info",
    lead: "Reconhecer, agir e registrar. O número não prescreve.",
  },
];
