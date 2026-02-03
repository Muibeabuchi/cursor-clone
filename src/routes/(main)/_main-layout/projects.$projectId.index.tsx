import { createFileRoute, Outlet } from "@tanstack/react-router";
import { projectQueryOptions } from "~/features/projects/hooks/use-projects";
import { LoadingIndicator } from "~/components/Loader";
import ProjectIdView from "~/features/projects/components/project-id-view";

import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const activeViewSchema = z.object({
  activeView: z.union([z.literal("code"), z.literal("preview")]).catch("code"),
});

export type activeViewType = z.infer<typeof activeViewSchema>["activeView"];

export const Route = createFileRoute(
  "/(main)/_main-layout/projects/$projectId/",
)({
  component: RouteComponent,
  validateSearch: zodValidator(activeViewSchema),
  pendingComponent: () => <LoadingIndicator />,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const { activeView } = Route.useSearch();
  return <ProjectIdView projectId={projectId} activeView={activeView} />;
}
