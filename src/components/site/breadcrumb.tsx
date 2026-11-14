import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import type { ReactNode } from "react";

export type Crumb = {
  label: ReactNode;
  to?: "/" | "/assinante" | "/modelos" | "/blog/$slug" | "/pacote" | "/sistema" | "/secao/$slug" | "/institucional" | "/institucional/$hub";
  params?: { slug?: string; hub?: string };
  hash?: string;
  /**
   * Link externo ao roteador. Para consumidores que nao tem rota registrada
   * (a biblioteca usa `href` porque seus hubs sao caminhos planos).
   * Quando ausente, o comportamento e o de sempre — o markup nao muda.
   */
  href?: string;
};

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="inst-crumbs no-print" aria-label="Trilha de navegação">
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <a href={item.href}>{item.label}</a>
            ) : item.to === "/secao/$slug" ? (
              <Link to="/secao/$slug" params={{ slug: item.params?.slug ?? "" }} hash={item.hash}>{item.label}</Link>
            ) : item.to === "/institucional/$hub" ? (
              <Link to="/institucional/$hub" params={{ hub: item.params?.hub ?? "" }}>{item.label}</Link>
            ) : item.to ? (
              <Link to={item.to}>{index === 0 && item.to === "/" ? <Home size={14} aria-hidden="true" /> : null}{item.label}</Link>
            ) : (
              <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
