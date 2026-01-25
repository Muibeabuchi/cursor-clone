import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authQueryOptions } from "~/lib/queries/auth";

export const Route = createFileRoute("/(auth)/_auth-layout")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const token = await context.queryClient.ensureQueryData(authQueryOptions());
    if (token) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
