import { convexQuery } from "@convex-dev/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Loader } from "~/components/Loader";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
  pendingComponent: () => <Loader />,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.auth.getCurrentUser, {})
      ),
      // Load multiple queries in parallel if needed
    ]);
  },
});

function Home() {
  return (
    <div className="p-8 space-y-2">
      <h1 className="text-2xl font-black">Boards</h1>
      <Button>This is a Shadcn UI Button</Button>
      <Button className="font-mono">Plex Mono Button</Button>
    </div>
  );
}
