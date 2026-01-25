import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Id } from "convex/_generated/dataModel";
import { projectQueryOptions } from "~/features/projects/hooks/use-projects";
import { LoadingIndicator } from "~/components/Loader";
import ProjectIdLayout from "~/features/projects/components/project-id-layout";

export const Route = createFileRoute(
  "/(main)/_main-layout/projects/$projectId/",
)({
  component: RouteComponent,
  // async loader({ context, params }) {
  //   const projectId = params.projectId;
  //   const project = await context.queryClient.ensureQueryData(
  //     projectQueryOptions.getOne(projectId),
  //   );
  //   return project;
  // },
  pendingComponent: () => <LoadingIndicator />,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  return <p>Index component in the {projectId} page</p>;
}
