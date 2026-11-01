import { Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ensureRole, type SourceRole } from "@/lib/source.functions";

const subscribe = () => () => {};

export function useRole() {
  const { user, isPending } = useCurrentUserState();
  const [role, setRole] = useState<SourceRole | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setRole(null);
      return;
    }
    let live = true;
    ensureRole()
      .then((result) => {
        if (live) setRole(result.role);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [isPending, user?.id]);
  return { user, isPending: isPending || Boolean(user && !role && !failed), role, failed };
}

export function AreaGuard({ allow, children }: { allow: "admin" | "member"; children: ReactNode }) {
  const { user, isPending, role } = useRole();
  if (!authEnabled) return <>{children}</>;
  if (isPending) {
    return (
      <div className="login-screen">
        <p>Abrindo a sua área…</p>
      </div>
    );
  }
  if (!user || !role) return <Navigate to="/login" />;
  if (allow === "admin" && role !== "admin") return <Navigate to="/assinante" />;
  return <>{children}</>;
}

export function AreaFrame({
  role,
  children,
}: {
  role: "admin" | "assinante";
  children: ReactNode;
}) {
  const gateSession = useSyncExternalStore(subscribe, hasGateSessionMarker, () => false);
  const [signingOut, setSigningOut] = useState(false);
  return (
    <div className="area-app">
      <header className="area-bar">
        <Link to={role === "admin" ? "/admin" : "/assinante"} className="area-brand">
          {role === "admin" ? "Administração" : "Área do assinante"}
        </Link>
        <span className={`badge ${role === "admin" ? "badge-warn" : "badge-info"}`}>
          {role === "admin" ? "Controle da fonte" : "Consome a fonte publicada"}
        </span>
        <nav className="area-links">
          {role === "admin" ? <Link to="/assinante">Ver como assinante</Link> : <Link to="/assinante" hash="comunidade">Comunidade</Link>}
          <Link to="/">Site público</Link>
        </nav>
        {authEnabled && !gateSession ? (
          <button
            className="btn-ghost btn-sm"
            type="button"
            disabled={signingOut}
            onClick={() => {
              setSigningOut(true);
              void signOut()
                .then(() => window.location.assign("/"))
                .catch(() => setSigningOut(false));
            }}
          >
            {signingOut ? "Saindo…" : "Sair"}
          </button>
        ) : null}
      </header>
      <main id="conteudo" className="area-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
