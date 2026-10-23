import type { ReactNode } from "react";

export function Callout({ tone = "info", children }: { tone?: "info" | "warn" | "note"; children: ReactNode }) {
  if (tone === "note") return <div className="keyline">{children}</div>;
  return (
    <div className={`inst-callout is-${tone}`}>
      <span aria-hidden="true">{tone === "warn" ? "!" : "i"}</span>
      <div>{children}</div>
    </div>
  );
}
