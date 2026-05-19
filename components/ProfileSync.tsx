"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function ProfileSync() {
  useEffect(() => {
    async function sync() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) return;

      const { error } = await supabase.from("profiles").upsert(
        { id: user.id, email: user.email.toLowerCase() },
        { onConflict: "id" }
      );

      if (error) {
        console.error("Profile sync failed:", error.message);
      }
    }
    sync();
  }, []);

  return null;
}
