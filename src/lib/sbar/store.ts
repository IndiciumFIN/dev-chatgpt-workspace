/**
 * Store client-side para o bloco SBAR.
 * Mesmo padrão dos outros blocos (research, career, education).
 */
import { useEffect, useState, useCallback } from "react";
import type { SbarHandoff } from "./types";

const STORAGE_KEY = "ce-sbar/handoffs.v1";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`ce-sbar: falha ao ler ${key}`, e);
    return fallback;
  }
}
function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("ce-sbar:change", { detail: { key } }));
  } catch (e) {
    console.warn(`ce-sbar: falha ao escrever ${key}`, e);
  }
}

export function useHandoffs() {
  const [items, setItems] = useState<SbarHandoff[]>(() => readJSON<SbarHandoff[]>(STORAGE_KEY, []));
  useEffect(() => {
    const onChange = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.key === STORAGE_KEY) setItems(readJSON<SbarHandoff[]>(STORAGE_KEY, []));
    };
    window.addEventListener("ce-sbar:change", onChange);
    window.addEventListener("storage", onChange as EventListener);
    return () => {
      window.removeEventListener("ce-sbar:change", onChange);
      window.removeEventListener("storage", onChange as EventListener);
    };
  }, []);
  const upsert = useCallback((h: SbarHandoff) => {
    const current = readJSON<SbarHandoff[]>(STORAGE_KEY, []);
    const idx = current.findIndex((x) => x.canonical_id === h.canonical_id);
    const next = idx >= 0 ? current.map((x) => x.canonical_id === h.canonical_id ? h : x) : [...current, h];
    writeJSON(STORAGE_KEY, next);
    setItems(next);
  }, []);
  const remove = useCallback((id: string) => {
    const next = readJSON<SbarHandoff[]>(STORAGE_KEY, []).filter((x) => x.canonical_id !== id);
    writeJSON(STORAGE_KEY, next);
    setItems(next);
  }, []);
  return { items, upsert, remove };
}

export interface SbarBackup {
  version: "1.0";
  exportedAt: string;
  handoffs: SbarHandoff[];
}
export function exportAll(): SbarBackup {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    handoffs: readJSON<SbarHandoff[]>(STORAGE_KEY, []),
  };
}
export function importAll(backup: SbarBackup): number {
  if (backup.version !== "1.0") throw new Error(`Versão não suportada: ${backup.version}`);
  const current = readJSON<SbarHandoff[]>(STORAGE_KEY, []);
  const map = new Map<string, SbarHandoff>();
  [...current, ...backup.handoffs].forEach((h) => map.set(h.canonical_id, h));
  const next = Array.from(map.values());
  writeJSON(STORAGE_KEY, next);
  return next.length;
}
