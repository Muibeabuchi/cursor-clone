import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/_main-layout/projects/$projectId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(main)/projects/$projectId"!</div>;
}
