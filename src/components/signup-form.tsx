import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Link } from "@tanstack/react-router";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { emailSignUpSchema } from "~/schema/authSchema";
import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { useGithubAuth, useLogin, useSignUp } from "~/hooks/useAuthMethods";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // const { signIn } = useLogin();
  const { signUp } = useSignUp();
  const { signInWithGithub } = useGithubAuth();
  const signUpForm = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: emailSignUpSchema,
    },
    onSubmit: async ({ value }) => {
      signUp({
        email: value.email,
        password: value.password,
        name: value.name,
      });
    },
  });

  // useEffect(() => {
  //   console.log(signUpForm.state.errors);
  // }, [signUpForm.state.errors]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              signUpForm.handleSubmit();
            }}
            className="p-6 md:p-8"
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to create your account
                </p>
              </div>

              <signUpForm.Field
                name="name"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                    />
                    {!field.state.meta.isValid &&
                      field.state.meta.errors.map((item) => (
                        <FieldDescription
                          key={item?.message}
                          className="text-red-500 "
                        >
                          {item?.message}
                        </FieldDescription>
                      ))}
                    {/* <FieldDescription>
                      We&apos;ll use this to contact you. We will not share your
                      email with anyone else.
                    </FieldDescription> */}
                  </Field>
                )}
              />

              <signUpForm.Field
                name="email"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                    />
                    {!field.state.meta.isValid &&
                      field.state.meta.errors.map((item) => (
                        <FieldDescription
                          key={item?.message}
                          className="text-red-500 "
                        >
                          {item?.message}
                        </FieldDescription>
                      ))}

                    {field.state.meta.isValid && (
                      <FieldDescription>
                        We&apos;ll use this to contact you. We will not share
                        your email with anyone else.
                      </FieldDescription>
                    )}
                  </Field>
                )}
              />
              {/* <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
              </Field> */}
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <signUpForm.Field
                    name="password"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input
                          id="password"
                          type="password"
                          required
                          onChange={(e) => field.handleChange(e.target.value)}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                        />
                        {!field.state.meta.isValid &&
                          field.state.meta.errors.map((item) => (
                            <FieldDescription
                              key={item?.message}
                              className="text-red-500 text-xs"
                            >
                              {item?.message}
                            </FieldDescription>
                          ))}

                        {field.state.meta.isValid && (
                          <FieldDescription>
                            Must be at least 8 characters long.
                          </FieldDescription>
                        )}
                      </Field>
                    )}
                  />

                  <signUpForm.Field
                    name="confirmPassword"
                    children={(field) => {
                      // console.log(field.state.meta.errors);
                      return (
                        <Field>
                          <FieldLabel htmlFor="confirm-password">
                            Confirm Password
                          </FieldLabel>
                          <Input
                            id="confirm-password"
                            type="password"
                            required
                            onChange={(e) => field.handleChange(e.target.value)}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                          />
                          {!field.state.meta.isValid &&
                            field.state.meta.errors.map((item) => (
                              <FieldDescription
                                key={item?.message}
                                className="text-red-500 text-xs"
                              >
                                {item?.message}
                              </FieldDescription>
                            ))}
                          {field.state.meta.isValid && (
                            <FieldDescription>
                              Must match the password.
                            </FieldDescription>
                          )}
                        </Field>
                      );
                    }}
                  />
                </Field>
              </Field>
              <Field>
                <Button type="submit">Create Account</Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-cols-2 gap-4">
                <Button variant="outline" type="button">
                  <FaGoogle />
                  <span className="sr-only">Sign up with Google</span>
                </Button>
                <Button variant="outline" type="button">
                  <FaGithub />
                  <span className="sr-only">Sign up with GitHub</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account? <Link to="/sign-in">Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/ai-image.avif"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
