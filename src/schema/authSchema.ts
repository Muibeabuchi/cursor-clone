import * as z from "zod";

export const emailSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const emailSignUpSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[0-9]/, "Must contain number"),
    confirmPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[0-9]/, "Must contain number"),
    name: z.string().min(3),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
