/**
 * Store client-side para o bloco Educacional.
 *
 * Persiste em localStorage sob chaves versionadas. Mesmo padrão dos blocos
 * Pesquisa (`src/lib/research/store.ts`) e Currículo (`src/lib/career/store.ts`).
 * Tipos compatíveis com `assessment_item.schema.json` e `flashcard.schema.json`.
 */

import { useEffect, useState, useCallback } from "react";
import type { AssessmentItem, Flashcard, QuizDeck, Simulado } from "./types";
import { publishedCards, publishedItems, publishedSimulado } from "./published";

const STORAGE_KEYS = {
  items: "ce-education/items.v1",
  flashcards: "ce-education/flashcards.v1",
  decks: "ce-education/decks.v1",
  simulados: "ce-education/simulados.v1",
  /** Histórico de sessões (resultados) */
  history: "ce-education/history.v1",
} as const;

// ============================================================
// Low-level
// ============================================================

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`ce-education: falha ao ler ${key}`, e);
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("ce-education:change", { detail: { key } }));
  } catch (e) {
    console.warn(`ce-education: falha ao escrever ${key}`, e);
  }
}

// ============================================================
// Hook genérico
// ============================================================

function ensurePublished(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(STORAGE_KEYS.items) == null) {
    writeJSON(STORAGE_KEYS.items, publishedItems);
    writeJSON(STORAGE_KEYS.flashcards, publishedCards);
    writeJSON(STORAGE_KEYS.simulados, [publishedSimulado]);
  }
}

function useCollection<T extends { canonical_id: string }>(key: string) {
  const [items, setItems] = useState<T[]>(() => {
    ensurePublished();
    return readJSON<T[]>(key, []);
  });

  useEffect(() => {
    const onChange = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.key === key) {
        setItems(readJSON<T[]>(key, []));
      }
    };
    window.addEventListener("ce-education:change", onChange);
    window.addEventListener("storage", onChange as EventListener);
    return () => {
      window.removeEventListener("ce-education:change", onChange);
      window.removeEventListener("storage", onChange as EventListener);
    };
  }, [key]);

  const upsert = useCallback(
    (item: T) => {
      const current = readJSON<T[]>(key, []);
      const idx = current.findIndex((i) => i.canonical_id === item.canonical_id);
      const next = idx >= 0 ? current.map((i) => (i.canonical_id === item.canonical_id ? item : i)) : [...current, item];
      writeJSON(key, next);
      setItems(next);
    },
    [key],
  );

  const remove = useCallback(
    (canonicalId: string) => {
      const current = readJSON<T[]>(key, []);
      const next = current.filter((i) => i.canonical_id !== canonicalId);
      writeJSON(key, next);
      setItems(next);
    },
    [key],
  );

  const clearAll = useCallback(() => {
    writeJSON(key, []);
    setItems([]);
  }, [key]);

  return { items, upsert, remove, clearAll };
}

// ============================================================
// Hooks específicos
// ============================================================

export function useAssessmentItems() {
  return useCollection<AssessmentItem>(STORAGE_KEYS.items);
}

export function useFlashcards() {
  return useCollection<Flashcard>(STORAGE_KEYS.flashcards);
}

export function useQuizDecks() {
  return useCollection<QuizDeck>(STORAGE_KEYS.decks);
}

export function useSimulados() {
  return useCollection<Simulado>(STORAGE_KEYS.simulados);
}

// ============================================================
// Histórico de sessões (resultados)
// ============================================================

export interface SessionHistoryEntry {
  sessionId: string;
  deckId: string;
  deckTitle: string;
  date: string;            // ISO date
  score: number;
  total: number;
  correct: number;
  wrong: number;
  blank: number;
  passed: boolean;
  timeSpentSeconds: number;
}

export function useSessionHistory() {
  const [history, setHistory] = useState<SessionHistoryEntry[]>(() => readJSON<SessionHistoryEntry[]>(STORAGE_KEYS.history, []));

  useEffect(() => {
    const onChange = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.key === STORAGE_KEYS.history) {
        setHistory(readJSON<SessionHistoryEntry[]>(STORAGE_KEYS.history, []));
      }
    };
    window.addEventListener("ce-education:change", onChange);
    window.addEventListener("storage", onChange as EventListener);
    return () => {
      window.removeEventListener("ce-education:change", onChange);
      window.removeEventListener("storage", onChange as EventListener);
    };
  }, []);

  const addEntry = useCallback((entry: SessionHistoryEntry) => {
    const current = readJSON<SessionHistoryEntry[]>(STORAGE_KEYS.history, []);
    const next = [entry, ...current].slice(0, 200); // mantém últimos 200
    writeJSON(STORAGE_KEYS.history, next);
    setHistory(next);
  }, []);

  const clearHistory = useCallback(() => {
    writeJSON(STORAGE_KEYS.history, []);
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}

// ============================================================
// Export / Import
// ============================================================

export interface EducationBackup {
  version: "1.0";
  exportedAt: string;
  items: AssessmentItem[];
  flashcards: Flashcard[];
  decks: QuizDeck[];
  simulados: Simulado[];
  history: SessionHistoryEntry[];
}

export function exportAll(): EducationBackup {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    items: readJSON<AssessmentItem[]>(STORAGE_KEYS.items, []),
    flashcards: readJSON<Flashcard[]>(STORAGE_KEYS.flashcards, []),
    decks: readJSON<QuizDeck[]>(STORAGE_KEYS.decks, []),
    simulados: readJSON<Simulado[]>(STORAGE_KEYS.simulados, []),
    history: readJSON<SessionHistoryEntry[]>(STORAGE_KEYS.history, []),
  };
}

export function importAll(backup: EducationBackup): {
  items: number;
  flashcards: number;
  decks: number;
  simulados: number;
  history: number;
} {
  if (backup.version !== "1.0") {
    throw new Error(`Versão de backup não suportada: ${backup.version}`);
  }
  const merge = <T extends { canonical_id: string } | { sessionId: string }>(a: T[], b: T[]): T[] => {
    const map = new Map<string, T>();
    [...a, ...b].forEach((item) => {
      const key = (item as any).canonical_id || (item as any).sessionId;
      map.set(key, item);
    });
    return Array.from(map.values());
  };

  const currentItems = readJSON<AssessmentItem[]>(STORAGE_KEYS.items, []);
  const currentFlash = readJSON<Flashcard[]>(STORAGE_KEYS.flashcards, []);
  const currentDecks = readJSON<QuizDeck[]>(STORAGE_KEYS.decks, []);
  const currentSimul = readJSON<Simulado[]>(STORAGE_KEYS.simulados, []);
  const currentHistory = readJSON<SessionHistoryEntry[]>(STORAGE_KEYS.history, []);

  const nextItems = merge(currentItems, backup.items || []);
  const nextFlash = merge(currentFlash, backup.flashcards || []);
  const nextDecks = merge(currentDecks, backup.decks || []);
  const nextSimul = merge(currentSimul, backup.simulados || []);
  const nextHistory = merge(currentHistory, backup.history || []);

  writeJSON(STORAGE_KEYS.items, nextItems);
  writeJSON(STORAGE_KEYS.flashcards, nextFlash);
  writeJSON(STORAGE_KEYS.decks, nextDecks);
  writeJSON(STORAGE_KEYS.simulados, nextSimul);
  writeJSON(STORAGE_KEYS.history, nextHistory);

  return {
    items: nextItems.length,
    flashcards: nextFlash.length,
    decks: nextDecks.length,
    simulados: nextSimul.length,
    history: nextHistory.length,
  };
}
