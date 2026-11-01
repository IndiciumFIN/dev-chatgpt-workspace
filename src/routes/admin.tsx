import { createFileRoute } from "@tanstack/react-router";
import { AdminDesk } from "@/components/admin/shell";
import { AreaFrame, AreaGuard } from "@/components/site/areas";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Administração · Calculadoras de Enfermagem" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminPage() {
  return (
    <AreaGuard allow="admin">
      <AreaFrame role="admin">
        <AdminDesk />
      </AreaFrame>
    </AreaGuard>
  );
}
