import { Outlet, redirect } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { authQueryOptions } from "~/lib/queries/auth";

export const Route = createFileRoute("/(main)/_main-layout")({
  beforeLoad: async ({ context }) => {
    const token = await context.queryClient.ensureQueryData(authQueryOptions());
    if (!token) {
      throw redirect({ to: "/sign-in" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
