import { createClient } from "@/lib/supabase/client";

export async function isRegisteredEmail(email: string): Promise<boolean> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return false;

  const supabase = createClient();
  const { data, error } = await supabase.rpc("is_registered_email", {
    check_email: trimmed,
  });

  if (error) return false;
  return Boolean(data);
}
