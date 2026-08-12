import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata: Metadata = { title: "Set new password — Finch" };

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
