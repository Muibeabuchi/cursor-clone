import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { email } from "better-auth";
import { authClient } from "~/lib/auth-client";
import { authQueryOptions } from "~/lib/queries/auth";

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess() {
          queryClient.removeQueries({
            queryKey: authQueryOptions().queryKey,
          });
          router.invalidate();
          router.navigate({ to: "/sign-in" });
        },
      },
    });
  };
  return { logOut };
}

export function useSignIn() {
  const router = useRouter();

  const signIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    return await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess() {
          router.navigate({ to: "/" });
        },
      },
    );
  };
  return { signIn };
}

export function useSignUp() {
  const router = useRouter();
  const signUp = async ({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }) =>
    await authClient.signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onSuccess() {
          router.navigate({ to: "/" });
        },
      },
    );

  return { signUp };
}

export function useGithubAuth() {
  const router = useRouter();
  const signInWithGithub = async () =>
    await authClient.signIn.social(
      {
        provider: "github",
      },
      {
        onSuccess() {
          router.navigate({ to: "/" });
        },
      },
    );

  return { signInWithGithub };
}
