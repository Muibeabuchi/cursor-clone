import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Link } from "@tanstack/react-router";
import { FaGithub } from "react-icons/fa";
import {
  useGithubAuth,
  useSignIn,
} from "~/features/auth/hooks/use-auth-methods";
import { useForm } from "@tanstack/react-form";
import React from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signInWithGithub } = useGithubAuth();
  const { signIn } = useSignIn();

  const loginForm = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value: { email, password } }) => {
      console.log({ email, password });
      const { data, error } = await signIn({ email, password });

      if (error) {
        console.log(error);
      }

      console.log(data);
    },
  });
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your GitHub</CardDescription>
        </CardHeader>
        <CardContent>
          <React.Fragment>
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button">
                  <FaGithub />
                  Login with GitHub
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  loginForm.handleSubmit();
                }}
              >
                <loginForm.Field
                  name="email"
                  children={(field) => (
                    <>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="joe@example.com"
                        required
                        onChange={(e) => field.handleChange(e.target.value)}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                      />
                    </>
                  )}
                />

                <loginForm.Field
                  name="password"
                  children={(field) => (
                    <>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        type="password"
                        placeholder="********"
                        required
                        onChange={(e) => field.handleChange(e.target.value)}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                      />
                    </>
                  )}
                />

                <Field className="mt-4">
                  <Button type="submit">Login</Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <Link to="/sign-up">Sign up</Link>
                  </FieldDescription>
                </Field>
              </form>
            </FieldGroup>
          </React.Fragment>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
