import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { ProfileSync } from "@/components/ProfileSync";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell userEmail={user.email ?? "Logged in"}>
      <ProfileSync />
      {children}
    </AppShell>
  );
}
