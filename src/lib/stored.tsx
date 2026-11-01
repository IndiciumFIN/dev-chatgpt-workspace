import { createContext, useContext, type ReactNode } from "react";
import { bindMenu } from "@/lib/menu-bind";
import type { NavNode } from "@/lib/nav";
import type { HomeCopy, FooterCopy } from "@/lib/library-copy";
import type { LibraryShelf } from "@/lib/library-shelves";

export type StoredAgent = {
  id: string;
  name: string;
  status: string;
  owns: string;
  mission: string;
  basis: string[];
  rules: string[];
  checklist: string[];
};

export type StoredLabel = { locale: string; groupId: string; key: string; text: string };

export type StoredCard = {
  listId: string;
  title: string;
  text: string;
  icon: "calc" | "book" | "cap" | null;
  slug: string | null;
  file: string | null;
  section: string | null;
  hash: string | null;
};

export type StoredPhase = { id: string; name: string; status: string | null; detail: string };
export type StoredToken = { name: string; hex: string; role: string; rejected: boolean };

export type StoredFamily = { id: string; name: string; text: string };
export type StoredNorm = { id: string; name: string; domain: string; right: string; priority: string };
export type StoredTemplate = { id: string; type: string; name: string; category: string; description: string };
export type StoredModule = { type: string; title: string; lines: { path: string; text: string }[] };
export type StoredSpecimen = { id: string; title: string; lead: string; source: string; modules: StoredModule[] };
export type StoredPage = { slug: string; title: string; lead: string; items: string[] };

export type StoredImage = { path: string; locale: string; alt: string; status: string };

export type StoredStudyQuestion = { id: string; prompt: string; options: string[]; answer: number };
export type StoredStudyCard = { id: string; front: string; back: string };

export type StoredSite = {
  nav: NavNode[];
  accountNav: NavNode[];
  agents: StoredAgent[];
  shelves: LibraryShelf[];
  labels: StoredLabel[];
  catalog: StoredCard[];
  specialties: string[];
  phases: StoredPhase[];
  held: StoredPhase[];
  tokens: StoredToken[];
  rejected: StoredToken[];
  families: StoredFamily[];
  templates: StoredTemplate[];
  normas: StoredNorm[];
  packSha: string;
  specimens: StoredSpecimen[];
  pages: StoredPage[];
  images: StoredImage[];
  study: { questions: StoredStudyQuestion[]; cards: StoredStudyCard[] };
};

const StoredContext = createContext<StoredSite | null>(null);

export function StoredProvider({ value, children }: { value: StoredSite; children: ReactNode }) {
  bindMenu(value.labels);
  return <StoredContext.Provider value={value}>{children}</StoredContext.Provider>;
}

export function useStored() {
  const value = useContext(StoredContext);
  if (!value) throw new Error("A tela não recebeu o banco.");
  return value;
}

export function unflatten(rows: { key: string; text: string }[]) {
  const root: Record<string, unknown> = {};
  for (const row of rows) {
    const parts = row.key.split(".");
    let cursor: Record<string, unknown> | unknown[] = root;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const part = parts[index];
      const next = parts[index + 1];
      const slot = /^\d+$/.test(part) ? Number(part) - 1 : part;
      const current = cursor as Record<string | number, unknown>;
      if (current[slot] == null) current[slot] = /^\d+$/.test(next) ? [] : {};
      cursor = current[slot] as Record<string, unknown> | unknown[];
    }
    const last = parts[parts.length - 1];
    const slot = /^\d+$/.test(last) ? Number(last) - 1 : last;
    (cursor as Record<string | number, unknown>)[slot] = row.text;
  }
  return root;
}

export function storedHome(labels: StoredLabel[], locale: string): HomeCopy {
  const code = locale === "pt-BR" ? "pt" : locale.slice(0, 2);
  const rows = labels.filter((row) => row.groupId === "home" && row.locale === code);
  const fallback = labels.filter((row) => row.groupId === "home" && row.locale === "pt");
  return unflatten(rows.length ? rows : fallback) as HomeCopy;
}

export function storedFooter(labels: StoredLabel[], locale: string): FooterCopy {
  const code = /^[a-z]{2}$/.test(locale) ? locale : locale === "pt-BR" ? "pt" : locale.slice(0, 2);
  const rows = labels.filter((row) => row.groupId === "footer" && row.locale === code);
  const fallback = labels.filter((row) => row.groupId === "footer" && row.locale === "pt");
  return unflatten(rows.length ? rows : fallback) as FooterCopy;
}

export function imageAlt(images: StoredImage[], path: string, locale: string, fallback: string) {
  const published = images.filter((row) => row.path === path && row.status === "publicado" && row.alt.trim() !== "");
  return published.find((row) => row.locale === locale)?.alt || published.find((row) => row.locale === "pt-BR")?.alt || fallback;
}

export function cardsOf(catalog: StoredCard[], listId: string) {
  return catalog.filter((row) => row.listId === listId);
}
