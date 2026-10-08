import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FinchAgent } from "@/components/agent/finch-agent";
import { getProfile } from "@/lib/queries/profiles";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Finch" };

// The whole signed-in product is one surface: the Generative UI agent.
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id).catch(() => null);

  return <FinchAgent firstName={profile?.fullName?.split(" ")[0] ?? ""} />;
}
