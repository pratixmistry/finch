"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getProfile, updateProfile } from "@/lib/queries/profiles";
import type { ProfileFormValues } from "@/lib/validations/profile";

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const supabase = createClient();
      const userId = await requireUserId();
      return getProfile(supabase, userId);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProfileFormValues) => {
      const userId = await requireUserId();
      return updateProfile(createClient(), userId, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}
