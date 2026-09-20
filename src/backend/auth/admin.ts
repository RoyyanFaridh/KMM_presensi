import { redirect } from "next/navigation";

import { createClient } from "../supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("admin_profiles")
    .select("id, nama, desa")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  return {
    user,
    profile,
  };
}