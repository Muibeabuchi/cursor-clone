import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { Loader } from "~/components/Loader";
import { Button } from "~/components/ui/button";
import { useSignOut } from "~/hooks/useAuthMethods";
import { authQueryOptions } from "~/lib/queries/auth";

export const Route = createFileRoute("/(main)/")({
  component: Home,
  pendingComponent: () => <Loader />,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.auth.getCurrentUser, {}),
      ),
      // Load multiple queries in parallel if needed
    ]);
  },
});

function Home() {
  const { logOut } = useSignOut();

  const { data: userToken } = useQuery(authQueryOptions());
  return (
    <div className="p-8 space-y-2">
      <h1 className="text-2xl font-black">Boards</h1>
      <Link to="/sign-in">
        <Button className="font-mono">Sign In</Button>
      </Link>
      <Button className="font-mono ml-5" onClick={logOut}>
        Log Out
      </Button>

      {userToken ? (
        <p className="text-green-600">
          This text will only show when the user has a token from the server
        </p>
      ) : (
        <p className="text-red-600">
          This text will only show when the user has no token from the server
        </p>
      )}

      <Authenticated>
        <p className="text-yellow-600">
          This text only shows up when the user is Authenticated
        </p>
      </Authenticated>

      <Unauthenticated>
        <p className="text-indigo-600">
          This text only shows up when the user is UnAuthenticated
        </p>
      </Unauthenticated>
    </div>
  );
}
