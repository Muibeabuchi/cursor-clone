import { Outlet, redirect } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { authQueryOptions } from "~/lib/queries/auth";
import { ThemeToggle } from "~/components/theme-toggle";
import { UserButton } from "~/components/user-button";
import { currentUserQueryOptions } from "~/features/auth/hooks/use-current-user";

export const Route = createFileRoute("/(main)/_main-layout")({
  beforeLoad: async ({ context }) => {
    const token = await context.queryClient.ensureQueryData(authQueryOptions());
    if (!token) {
      throw redirect({ to: "/sign-in" });
    }
  },
  async loader({ context }) {
    context.queryClient.ensureQueryData(currentUserQueryOptions);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      {/* <div className="absolute top-1 left-1/2 -translate-x-1/2 z-50">
        <ThemeToggle />
      </div> */}
      <div className="absolute top-1 right-4 z-50">
        <UserButton />
      </div>
      <Outlet />
    </>
  );
}
