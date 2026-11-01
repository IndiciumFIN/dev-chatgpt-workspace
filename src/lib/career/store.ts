/**
 * Store client-side para o bloco Currículo.
 *
 * Persiste em localStorage sob chaves versionadas. Mesmo padrão do bloco
 * Pesquisa (`src/lib/research/store.ts`). Os tipos são compatíveis com o
 * schema `curriculum.schema.json`.
 */

import { useEffect, useState, useCallback } from "react";
import type { Curriculum } from "./types";

const STORAGE_KEY = "ce-career/curricula.v1" as const;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`ce-career: falha ao ler ${key}`, e);
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("ce-career:change", { detail: { key } }));
  } catch (e) {
    console.warn(`ce-career: falha ao escrever ${key}`, e);
  }
}

/** Hook reativo para a coleção de currículos. */
export function useCurricula() {
  const [items, setItems] = useState<Curriculum[]>(() => readJSON<Curriculum[]>(STORAGE_KEY, []));

  useEffect(() => {
    const onChange = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.key === STORAGE_KEY) {
        setItems(readJSON<Curriculum[]>(STORAGE_KEY, []));
      }
    };
    window.addEventListener("ce-career:change", onChange);
    window.addEventListener("storage", onChange as EventListener);
    return () => {
      window.removeEventListener("ce-career:change", onChange);
      window.removeEventListener("storage", onChange as EventListener);
    };
  }, []);

  const upsert = useCallback((cv: Curriculum) => {
    const current = readJSON<Curriculum[]>(STORAGE_KEY, []);
    const idx = current.findIndex((c) => c.canonical_id === cv.canonical_id);
    const next =
      idx >= 0
        ? current.map((c) => (c.canonical_id === cv.canonical_id ? cv : c))
        : [...current, cv];
    writeJSON(STORAGE_KEY, next);
    setItems(next);
  }, []);

  const remove = useCallback((canonicalId: string) => {
    const current = readJSON<Curriculum[]>(STORAGE_KEY, []);
    const next = current.filter((c) => c.canonical_id !== canonicalId);
    writeJSON(STORAGE_KEY, next);
    setItems(next);
  }, []);

  const clearAll = useCallback(() => {
    writeJSON(STORAGE_KEY, []);
    setItems([]);
  }, []);

  return { items, upsert, remove, clearAll };
}

// ============================================================
// Export / Import
// ============================================================

export interface CareerBackup {
  version: "1.0";
  exportedAt: string;
  curricula: Curriculum[];
}

export function exportAll(): CareerBackup {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    curricula: readJSON<Curriculum[]>(STORAGE_KEY, []),
  };
}

export function importAll(backup: CareerBackup): number {
  if (backup.version !== "1.0") {
    throw new Error(`Versão de backup não suportada: ${backup.version}`);
  }
  const current = readJSON<Curriculum[]>(STORAGE_KEY, []);
  const merge = <T extends { canonical_id: string }>(a: T[], b: T[]): T[] => {
    const map = new Map<string, T>();
    [...a, ...b].forEach((item) => map.set(item.canonical_id, item));
    return Array.from(map.values());
  };
  const next = merge(current, backup.curricula || []);
  writeJSON(STORAGE_KEY, next);
  return next.length;
}
