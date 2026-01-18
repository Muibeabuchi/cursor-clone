import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { Loader } from "~/components/Loader";
import { Button } from "~/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/tanstack-react-start";
import { authStateFn } from "~/lib/clerk";

export const Route = createFileRoute("/")({
  component: Home,
  pendingComponent: () => <Loader />,
  loader: async (ctx) => {
    const auth = await authStateFn();
    const { userId, token } = auth;

    // During SSR only (the only time serverHttpClient exists),
    // set the Clerk auth token to make HTTP queries with.
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }

    return {
      userId,
      token,
    };
  },
});

function Home() {
  const boardsQuery = useSuspenseQuery(convexQuery(api.board.getBoards, {}));

  return (
    <div className="p-8 space-y-2">
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
      <h1 className="text-2xl font-black">Boards</h1>
      {/* <ul className="flex flex-wrap list-disc">
        {boardsQuery.data.map((board) => (
          <li key={board.id} className="ml-4">
            <Link
              to="/boards/$boardId"
              params={{
                boardId: board.id,
              }}
              className="font-bold text-blue-500"
            >
              {board.name}
            </Link>
          </li>
        ))}
      </ul> */}

      <Button>This is a Shadcn UI Button</Button>
      <Button className="font-mono">Plex Mono Button</Button>
    </div>
  );
}
