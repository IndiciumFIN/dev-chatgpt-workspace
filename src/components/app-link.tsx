import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { Dest } from "@/lib/sections";

export function AppLink({
  dest,
  className,
  children,
  onClick,
  ariaLabel,
}: {
  dest: Dest;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  if (dest.kind === "home") {
    return (
      <Link to="/" className={className} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  if (dest.kind === "tool") {
    return (
      <Link to="/ferramentas/$slug" params={{ slug: dest.slug }} className={className} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  if (dest.kind === "page") {
    return (
      <Link to={dest.to} className={className} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  if (dest.kind === "model") {
    return (
      <Link to="/modelos/$id" params={{ id: dest.id }} hash={dest.hash} className={className} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <Link
      to="/secao/$slug"
      params={{ slug: dest.slug }}
      hash={dest.hash}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
