import { Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ensureRole, type SourceRole } from "@/lib/source.functions";
import { evaluateAreaAccess } from "@/components/site/area-access-policy";

const subscribe = () => () => {};

export function useRole() {
  const { user, isPending } = useCurrentUserState();
  // A response belongs to exactly one principal; never reuse an old admin
  // role while a different person's session is being resolved.
  const [resolvedRole, setResolvedRole] = useState<{ userId: string; role: SourceRole } | null>(null);
  const [failedFor, setFailedFor] = useState<string | null>(null);
  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setResolvedRole(null);
      setFailedFor(null);
      return;
    }
    const userId = user.id;
    let live = true;
    ensureRole()
      .then((result) => {
        if (live) {
          setResolvedRole({ userId, role: result.role });
          setFailedFor(null);
        }
      })
      .catch(() => {
        if (live) setFailedFor(userId);
      });
    return () => {
      live = false;
    };
  }, [isPending, user?.id]);
  const role = resolvedRole && user && resolvedRole.userId === user.id ? resolvedRole.role : null;
  const failed = Boolean(user && failedFor === user.id);
  return { user, isPending: isPending || Boolean(user && !role && !failed), role, failed };
}

export function AreaGuard({ allow, children }: { allow: "admin" | "member"; children: ReactNode }) {
  const { user, isPending, role } = useRole();
  // Auth-disabled environments are NOT automatically privileged. The role
  // still comes from ensureRole() behind server-side authMiddleware, including
  // the explicitly isolated PGlite CI admin fixture.
  const outcome = evaluateAreaAccess({ allow, userId: user?.id ?? null, role, isPending });
  if (outcome === "loading") {
    return (
      <div className="login-screen">
        <p>Abrindo a sua área…</p>
      </div>
    );
  }
  if (outcome === "login") return <Navigate to="/login" />;
  if (outcome === "member") return <Navigate to="/assinante" />;
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
