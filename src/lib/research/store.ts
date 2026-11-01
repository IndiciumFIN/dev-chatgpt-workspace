/**
 * Store client-side para o bloco Pesquisador Científico.
 *
 * Persiste em localStorage sob chaves versionadas. Em produção, o backend CKO
 * governado pode subir esses dados sem reshape — os tipos já são compatíveis
 * com `source.schema.json`, `reference.schema.json` e `research_method.schema.json`.
 */

import { useEffect, useState, useCallback } from "react";
import type { Reference, ResearchMethod, Source } from "./types";

const STORAGE_KEYS = {
  sources: "ce-research/sources.v1",
  references: "ce-research/references.v1",
  research: "ce-research/methods.v1",
} as const;

// ============================================================
// Leituras/escritas low-level (sem hook)
// ============================================================

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`ce-research: falha ao ler ${key}`, e);
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Avisa outros hooks de outras abas
    window.dispatchEvent(new CustomEvent("ce-research:change", { detail: { key } }));
  } catch (e) {
    console.warn(`ce-research: falha ao escrever ${key}`, e);
  }
}

// ============================================================
// Hooks
// ============================================================

/** Hook reativo para uma coleção no localStorage. */
function useCollection<T extends { id: string }>(key: string) {
  const [items, setItems] = useState<T[]>(() => readJSON<T[]>(key, []));

  useEffect(() => {
    const onChange = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.key === key) {
        setItems(readJSON<T[]>(key, []));
      }
    };
    window.addEventListener("ce-research:change", onChange);
    window.addEventListener("storage", onChange as EventListener);
    return () => {
      window.removeEventListener("ce-research:change", onChange);
      window.removeEventListener("storage", onChange as EventListener);
    };
  }, [key]);

  const upsert = useCallback(
    (item: T) => {
      const current = readJSON<T[]>(key, []);
      const idx = current.findIndex((i) => i.id === item.id);
      const next = idx >= 0 ? current.map((i) => (i.id === item.id ? item : i)) : [...current, item];
      writeJSON(key, next);
      setItems(next);
    },
    [key],
  );

  const remove = useCallback(
    (id: string) => {
      const current = readJSON<T[]>(key, []);
      const next = current.filter((i) => i.id !== id);
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

export function useSources() {
  return useCollection<Source>(STORAGE_KEYS.sources);
}

export function useReferences() {
  return useCollection<Reference>(STORAGE_KEYS.references);
}

export function useResearchMethods() {
  return useCollection<ResearchMethod>(STORAGE_KEYS.research);
}

// ============================================================
// Export / Import (JSON)
// ============================================================

export interface ResearchBackup {
  version: "1.0";
  exportedAt: string;
  sources: Source[];
  references: Reference[];
  methods: ResearchMethod[];
}

export function exportAll(): ResearchBackup {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    sources: readJSON<Source[]>(STORAGE_KEYS.sources, []),
    references: readJSON<Reference[]>(STORAGE_KEYS.references, []),
    methods: readJSON<ResearchMethod[]>(STORAGE_KEYS.research, []),
  };
}

export function importAll(backup: ResearchBackup): {
  sources: number;
  references: number;
  methods: number;
} {
  if (backup.version !== "1.0") {
    throw new Error(`Versão de backup não suportada: ${backup.version}`);
  }
  const current = {
    sources: readJSON<Source[]>(STORAGE_KEYS.sources, []),
    references: readJSON<Reference[]>(STORAGE_KEYS.references, []),
    methods: readJSON<ResearchMethod[]>(STORAGE_KEYS.research, []),
  };

  // Merge por id (não duplica)
  const merge = <T extends { id: string }>(a: T[], b: T[]): T[] => {
    const map = new Map<string, T>();
    [...a, ...b].forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  };

  const nextSources = merge(current.sources, backup.sources || []);
  const nextReferences = merge(current.references, backup.references || []);
  const nextMethods = merge(current.methods, backup.methods || []);

  writeJSON(STORAGE_KEYS.sources, nextSources);
  writeJSON(STORAGE_KEYS.references, nextReferences);
  writeJSON(STORAGE_KEYS.research, nextMethods);

  return {
    sources: nextSources.length,
    references: nextReferences.length,
    methods: nextMethods.length,
  };
}
