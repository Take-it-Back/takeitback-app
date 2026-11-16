import { notFound } from "next/navigation";
import type { createClient } from "@/lib/supabase/server";

export type AdminRole = "owner" | "admin" | "support" | "marketing" | "readonly";
type Sb = Awaited<ReturnType<typeof createClient>>;

/** The signed-in person's admin role (admin_roles, or is_admin as owner). Not an admin: 404. */
export async function requireAdminRole(supabase: Sb, allowed?: AdminRole[]): Promise<{ role: AdminRole; email: string | null }> {
  const { data } = await supabase.rpc("admin_whoami");
  const who = data as { role: AdminRole | null; email: string | null } | null;
  if (!who?.role || (allowed && !allowed.includes(who.role))) notFound();
  return { role: who.role, email: who.email };
}

export const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner", admin: "Admin", support: "Support", marketing: "Marketing", readonly: "Read only",
};
