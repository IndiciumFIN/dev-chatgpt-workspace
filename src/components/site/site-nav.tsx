import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AppLink } from "@/components/site/app-link";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useChrome } from "@/lib/chrome";
import { ensureRole, type SourceRole } from "@/lib/source.functions";
import type { NavNode } from "@/lib/nav";
import { findByQuery } from "@/lib/nav-query";
import { useStored } from "@/lib/stored";
import type { Dest } from "@/lib/sections";
import { navLabel } from "@/lib/translate";

function current(pathname: string, dest?: Dest) {
  if (!dest) return false;
  if (dest.kind === "home") return pathname === "/";
  if (dest.kind === "tool") return pathname === `/ferramentas/${dest.slug}`;
  if (dest.kind === "page") return pathname === dest.to;
  if (dest.kind === "model") return pathname === `/modelos/${dest.id}`;
  return pathname === `/secao/${dest.slug}`;
}

function ItemLink({ node, className, onClick }: { node: NavNode; className?: string; onClick?: () => void }) {
  const { locale } = useChrome();
  if (!node.dest) return null;
  return (
    <AppLink dest={node.dest} className={className} onClick={onClick}>
      {navLabel(node.id, node.label, locale)}
      {node.live ? <span className="live-pill">{navLabel("No ar", "No ar", locale)}</span> : null}
    </AppLink>
  );
}

export function AccountSlot({ className, onClick }: { className?: string; onClick?: () => void }) {
  const { locale } = useChrome();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const [role, setRole] = useState<SourceRole | null>(null);
  useEffect(() => {
    if (isPending || !user) {
      setRole(null);
      return;
    }
    let live = true;
    ensureRole()
      .then((result) => {
        if (live) setRole(result.role);
      })
      .catch(() => {
        if (live) setRole(null);
      });
    return () => {
      live = false;
    };
  }, [isPending, user?.id]);
  if (isPending || (user && !role)) return <span className="auth-skeleton" aria-hidden="true" />;
  const signedIn = Boolean(user && role);
  const to = role === "admin" ? "/admin" : role === "subscriber" ? "/assinante" : "/login";
  const label =
    role === "admin"
      ? navLabel("admin", "Administrador", locale)
      : role === "subscriber"
        ? navLabel("assinante", "Assinante", locale)
        : navLabel("entrar", "Entrar", locale);
  return (
    <Link to={to} className={`${className ?? ""} ${pathname === to ? "is-current" : ""}`.trim()} onClick={onClick}>
      {signedIn ? label : navLabel("entrar", "Entrar", locale)}
    </Link>
  );
}

function go(navigate: ReturnType<typeof useNavigate>, dest: Dest, query: string) {
  if (dest.kind === "home") void navigate({ to: "/" });
  else if (dest.kind === "tool") void navigate({ to: "/ferramentas/$slug", params: { slug: dest.slug } });
  else if (dest.kind === "page") void navigate({ to: dest.to });
  else if (dest.kind === "model") void navigate({ to: "/modelos/$id", params: { id: dest.id }, hash: dest.hash });
  else void navigate({ to: "/secao/$slug", params: { slug: dest.slug }, hash: dest.hash, search: query ? { q: query } : {} });
}

export function SiteNav({ onNavigate }: { onNavigate?: () => void }) {
  const { locale, t } = useChrome();
  const { nav, accountNav } = useStored();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const items = [...nav, ...accountNav].filter((node) => node.id !== "entrar" && node.id !== "assinatura");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(null);
        setSearchOpen(false);
      }
    }
    function onPointer(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".nav-drop, .search-pop, .search-toggle")) {
        setOpen(null);
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  useEffect(() => {
    function openSearch() {
      setSearchOpen(true);
      setOpen(null);
    }
    window.addEventListener("cde-open-search", openSearch);
    return () => window.removeEventListener("cde-open-search", openSearch);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    document.querySelector<HTMLInputElement>("#busca-menu input")?.focus();
  }, [searchOpen]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const dest = findByQuery(query, [...nav, ...accountNav]);
    setSearchOpen(false);
    setOpen(null);
    onNavigate?.();
    if (!dest) {
      void navigate({ to: "/secao/$slug", params: { slug: "calculadoras" }, search: { q: query } });
      return;
    }
    go(navigate, dest, query);
  }

  function toneClass(node: NavNode) {
    if (node.tone === "guide") return "nav-guide";
    if (node.tone === "enter") return "btn-entrar";
    if (node.tone === "subscribe") return "btn-assine";
    return "";
  }

  return (
    <>
      <button
        className="search-toggle"
        type="button"
        aria-expanded={searchOpen}
        aria-controls="busca-menu"
        aria-label={t("search")}
        onClick={() => {
          setSearchOpen((value) => !value);
          setOpen(null);
        }}
      >
        <Search size={16} aria-hidden="true" />
      </button>
      <nav id="menu-principal" className="desktop-nav" aria-label="Principal">
        {items.map((node) =>
          node.id === "entrar" ? (
            <AccountSlot key="entrar" className="btn-entrar" />
          ) : node.groups ? (
            <div key={node.id} className="nav-drop">
              <button
                type="button"
                className={toneClass(node)}
                aria-expanded={open === node.id}
                aria-controls={`menu-${node.id}`}
                onClick={() => setOpen((value) => (value === node.id ? null : node.id))}
              >
                {navLabel(node.id, node.label, locale)}
                <ChevronDown size={14} aria-hidden="true" />
              </button>
              {open === node.id ? (
                <div id={`menu-${node.id}`} className="nav-panel">
                  {node.groups.map((group) => (
                    <div key={group.label ?? "itens"}>
                      {group.label ? <p className="nav-group">{navLabel(group.label, group.label, locale)}</p> : null}
                      {group.items.map((item) => (
                        <ItemLink key={item.id} node={item} onClick={() => setOpen(null)} />
                      ))}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <ItemLink
              key={node.id}
              node={node}
              className={`${toneClass(node)} ${current(pathname, node.dest) ? "is-current" : ""}`.trim()}
            />
          ),
        )}
      </nav>
      {searchOpen ? (
        <form id="busca-menu" className="search-pop" role="search" onSubmit={onSearch}>
          <Search size={16} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("search")}
          />
        </form>
      ) : null}
    </>
  );
}

export function MobileNav({ menuLabel, onNavigate }: { menuLabel: string; onNavigate?: () => void }) {
  const { locale, t } = useChrome();
  const { nav, accountNav } = useStored();
  const navigate = useNavigate();
  const [group, setGroup] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const items = [...nav, ...accountNav];

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const dest = findByQuery(query, items);
    onNavigate?.();
    if (!dest) {
      void navigate({ to: "/secao/$slug", params: { slug: "calculadoras" }, search: { q: query } });
      return;
    }
    go(navigate, dest, query);
  }

  return (
    <div className="off-canvas-body">
      <form className="off-search" role="search" onSubmit={onSearch}>
        <Search size={16} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search")} aria-label={t("search")} />
      </form>
      <p className="off-kicker">{menuLabel}</p>
      {items.map((node) => (
        <div key={node.id}>
          {node.id === "entrar" ? (
            <AccountSlot className="off-link" onClick={onNavigate} />
          ) : node.groups ? (
            <>
              <button
                type="button"
                className="off-parent"
                aria-expanded={group === node.id}
                onClick={() => setGroup((value) => (value === node.id ? null : node.id))}
              >
                {navLabel(node.id, node.label, locale)}
                <ChevronDown size={16} aria-hidden="true" />
              </button>
              {group === node.id
                ? node.groups.map((block) => (
                    <div key={block.label ?? node.id}>
                      {block.label ? <p className="off-group">{navLabel(block.label, block.label, locale)}</p> : null}
                      {block.items.map((item) => (
                        <ItemLink key={item.id} node={item} className="off-sub" onClick={onNavigate} />
                      ))}
                    </div>
                  ))
                : null}
            </>
          ) : (
            <ItemLink node={node} className="off-link" onClick={onNavigate} />
          )}
        </div>
      ))}
    </div>
  );
}
