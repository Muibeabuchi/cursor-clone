import { useRouter } from "@tanstack/react-router";
import { email } from "better-auth";
import { authClient } from "~/lib/auth-client";

export function useSignOut() {
  const router = useRouter();

  const logOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess() {
          router.navigate({ to: "/sign-in" });
        },
      },
    });
  };
  return { logOut };
}

export function useLogin() {
  const router = useRouter();

  const signIn = ({ email, password }: { email: string; password: string }) =>
    authClient.signIn.email(
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

  return { signIn };
}

export function useSignUp() {
  const router = useRouter();
  const signUp = ({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }) =>
    authClient.signUp.email(
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
  const signInWithGithub = () =>
    authClient.signIn.social(
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
