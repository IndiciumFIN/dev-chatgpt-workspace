import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/institucional/$hub")({
  component: () => <Outlet />,
});
