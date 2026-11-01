const words = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor"];

export function lorem(source: string) {
  const count = Math.min(28, Math.max(2, source.trim().split(/\s+/).filter(Boolean).length));
  return Array.from({ length: count }, (_, index) => words[index % words.length]).join(" ");
}

export function loremData(value: unknown): unknown {
  if (typeof value === "string") return value.trim() ? lorem(value) : value;
  if (Array.isArray(value)) return value.map((item) => loremData(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, loremData(item)]));
  }
  return value;
}
