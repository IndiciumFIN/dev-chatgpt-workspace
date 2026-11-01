/**
 * Store client-side para o Fórum.
 * Mesmo padrão dos outros blocos.
 */
import { useEffect, useState, useCallback } from "react";
import type { ForumThread, ForumReply } from "./forum-types";
import { generateId } from "./forum-types";

const STORAGE_KEY = "ce-editorial/forum.v1";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`ce-editorial: falha ao ler ${key}`, e);
    return fallback;
  }
}
function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("ce-editorial:change", { detail: { key } }));
  } catch (e) {
    console.warn(`ce-editorial: falha ao escrever ${key}`, e);
  }
}

export function useForumThreads() {
  const [items, setItems] = useState<ForumThread[]>(() => {
    const stored = readJSON<ForumThread[]>(STORAGE_KEY, []);
    // Se vazio, inicializa com seed
    if (stored.length === 0) {
      writeJSON(STORAGE_KEY, []);
      return [];
    }
    return stored;
  });

  useEffect(() => {
    const onChange = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.key === STORAGE_KEY) {
        setItems(readJSON<ForumThread[]>(STORAGE_KEY, []));
      }
    };
    window.addEventListener("ce-editorial:change", onChange);
    window.addEventListener("storage", onChange as EventListener);
    return () => {
      window.removeEventListener("ce-editorial:change", onChange);
      window.removeEventListener("storage", onChange as EventListener);
    };
  }, []);

  const upsert = useCallback((thread: ForumThread) => {
    const current = readJSON<ForumThread[]>(STORAGE_KEY, []);
    const idx = current.findIndex((t) => t.canonical_id === thread.canonical_id);
    const next = idx >= 0 ? current.map((t) => t.canonical_id === thread.canonical_id ? thread : t) : [...current, thread];
    writeJSON(STORAGE_KEY, next);
    setItems(next);
  }, []);

  const remove = useCallback((canonicalId: string) => {
    const next = readJSON<ForumThread[]>(STORAGE_KEY, []).filter((t) => t.canonical_id !== canonicalId);
    writeJSON(STORAGE_KEY, next);
    setItems(next);
  }, []);

  const addReply = useCallback((threadId: string, reply: ForumReply) => {
    const current = readJSON<ForumThread[]>(STORAGE_KEY, []);
    const next = current.map((t) => {
      if (t.canonical_id !== threadId) return t;
      return { ...t, replies: [...t.replies, reply], updated_at: new Date().toISOString().slice(0, 10) };
    });
    writeJSON(STORAGE_KEY, next);
    setItems(next);
  }, []);

  const incrementViews = useCallback((threadId: string) => {
    const current = readJSON<ForumThread[]>(STORAGE_KEY, []);
    const next = current.map((t) => t.canonical_id === threadId ? { ...t, views_count: (t.views_count || 0) + 1 } : t);
    writeJSON(STORAGE_KEY, next);
    setItems(next);
  }, []);

  const likeThread = useCallback((threadId: string) => {
    const current = readJSON<ForumThread[]>(STORAGE_KEY, []);
    const next = current.map((t) => t.canonical_id === threadId ? { ...t, likes_count: (t.likes_count || 0) + 1 } : t);
    writeJSON(STORAGE_KEY, next);
    setItems(next);
  }, []);

  const likeReply = useCallback((threadId: string, replyId: string) => {
    const current = readJSON<ForumThread[]>(STORAGE_KEY, []);
    const next = current.map((t) => {
      if (t.canonical_id !== threadId) return t;
      return {
        ...t,
        replies: t.replies.map((r) => r.id === replyId ? { ...r, likes_count: (r.likes_count || 0) + 1 } : r),
      };
    });
    writeJSON(STORAGE_KEY, next);
    setItems(next);
  }, []);

  return { items, upsert, remove, addReply, incrementViews, likeThread, likeReply };
}

export interface ForumBackup {
  version: "1.0";
  exportedAt: string;
  threads: ForumThread[];
}
export function exportAll(): ForumBackup {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    threads: readJSON<ForumThread[]>(STORAGE_KEY, []),
  };
}
export function importAll(backup: ForumBackup): number {
  if (backup.version !== "1.0") throw new Error(`Versão não suportada: ${backup.version}`);
  const current = readJSON<ForumThread[]>(STORAGE_KEY, []);
  const map = new Map<string, ForumThread>();
  [...current, ...backup.threads].forEach((t) => map.set(t.canonical_id, t));
  const next = Array.from(map.values());
  writeJSON(STORAGE_KEY, next);
  return next.length;
}

export function generateReplyId(): string {
  return generateId("FR");
}
