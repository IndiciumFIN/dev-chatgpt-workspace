import { createFileRoute, redirect } from "@tanstack/react-router";
import { redirectSection } from "@/lib/institutional-target";

export const Route = createFileRoute("/institucional/$hub/")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/secao/$slug", params: { slug: redirectSection(params.hub) } });
  },
});
