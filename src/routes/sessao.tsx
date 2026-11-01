import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRole } from "@/components/site/areas";
import { authEnabled } from "@/lib/auth/client";

export const Route = createFileRoute("/sessao")({
  component: SessaoPage,
  head: () => ({
    meta: [
      { title: "Abrindo a área · Calculadoras de Enfermagem" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function SessaoPage() {
  const { user, isPending, role } = useRole();
  if (isPending) {
    return (
      <div className="login-screen">
        <p>Separando a sua área…</p>
      </div>
    );
  }
  if (!user || !role) return <Navigate to={authEnabled ? "/login" : "/"} />;
  return <Navigate to={role === "admin" ? "/admin" : "/assinante"} />;
}
