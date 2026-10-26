import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/conta")({
  component: () => <Navigate to="/sessao" />,
});
