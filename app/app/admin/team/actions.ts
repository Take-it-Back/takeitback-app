"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TeamState = { ok?: string; error?: string };
const clean = (m: string) => m.replace(/^.*?ERROR:\s*/, "");

export async function setRole(_: TeamState, f: FormData): Promise<TeamState> {
  const supabase = await createClient();
  const email = String(f.get("email") ?? "").trim();
  const role = String(f.get("role") ?? "");
  if (!email) return { error: "Enter their email." };
  const { error } = await supabase.rpc("admin_team_set", { p_email: email, p_role: role, p_reason: String(f.get("reason") ?? "") || null });
  if (error) return { error: error.code === "42501" ? "Only an owner can change the team." : clean(error.message) };
  revalidatePath("/app/admin/team");
  return { ok: `${email} is now ${role === "readonly" ? "read only" : role}. They confirm a 6-digit code from an authenticator app the first time they open the admin.` };
}

export async function removeMember(f: FormData) {
  const supabase = await createClient();
  await supabase.rpc("admin_team_remove", { p_user: String(f.get("user") ?? ""), p_reason: null });
  revalidatePath("/app/admin/team");
}
