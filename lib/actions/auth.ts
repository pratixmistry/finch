"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  loginFormSchema,
  requestPasswordResetSchema,
  signupFormSchema,
  updatePasswordFormSchema,
  type LoginFormValues,
  type RequestPasswordResetValues,
  type SignupFormValues,
  type UpdatePasswordFormValues,
} from "@/lib/validations/auth";

export type ActionResult = { error: string } | { success: true };

async function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl;
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function login(values: LoginFormValues): Promise<ActionResult> {
  const parsed = loginFormSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid form submission" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  redirect("/overview");
}

export async function signup(values: SignupFormValues): Promise<ActionResult> {
  const parsed = signupFormSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid form submission" };

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/overview`,
    },
  });
  if (error) return { error: error.message };

  redirect("/login?message=check-your-email");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  values: RequestPasswordResetValues
): Promise<ActionResult> {
  const parsed = requestPasswordResetSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid form submission" };

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/update-password&type=recovery`,
  });
  if (error) return { error: error.message };

  return { success: true };
}

export async function updatePassword(
  values: UpdatePasswordFormValues
): Promise<ActionResult> {
  const parsed = updatePasswordFormSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid form submission" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  redirect("/overview");
}
