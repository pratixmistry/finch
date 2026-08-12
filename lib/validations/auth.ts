import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Enter a valid email" });
const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72, { message: "Password is too long" });

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Enter your password" }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const signupFormSchema = z
  .object({
    fullName: z.string().trim().min(1, { message: "Enter your name" }).max(120),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export type RequestPasswordResetValues = z.infer<typeof requestPasswordResetSchema>;

export const updatePasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordFormSchema>;
