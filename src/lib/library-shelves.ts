export type LibraryShelf =
  | { id: string; title: string; lead: string; kind: "plate" | "device" | "slides" | "info" }
  | { id: string; title: string; lead: string; kind: "images"; items: { src: string; alt: string; caption: string }[] }
  | { id: string; title: string; lead: string; kind: "thumbs" | "pdfs"; items: { title: string; text: string; href: string }[] };
