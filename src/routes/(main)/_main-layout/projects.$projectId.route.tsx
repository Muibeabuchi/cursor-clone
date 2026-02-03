import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { Id } from "convex/_generated/dataModel";
import { projectQueryOptions } from "~/features/projects/hooks/use-projects";
import { LoadingIndicator } from "~/components/Loader";
import ProjectIdLayout from "~/features/projects/components/project-id-layout";
import { fileQueryOptions } from "~/features/projects/hooks/use-file";

export const Route = createFileRoute(
  "/(main)/_main-layout/projects/$projectId",
)({
  params: {
    parse: ({ projectId }) => {
      return {
        projectId: projectId as Id<"projects">,
      };
    },
  },
  component: RouteComponent,
  async loader({ context, params }) {
    const projectId = params.projectId;

    const [_, project] = await Promise.all([
      context.queryClient.prefetchQuery(
        fileQueryOptions.getInitialProjectFolderContents({ projectId }),
      ),
      context.queryClient.ensureQueryData(
        projectQueryOptions.getById(projectId),
      ),
    ]);
    if (!project) {
      throw notFound();
    }
  },
  pendingComponent: () => <LoadingIndicator />,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  return (
    <ProjectIdLayout projectId={projectId}>
      <Outlet />
    </ProjectIdLayout>
  );
}
