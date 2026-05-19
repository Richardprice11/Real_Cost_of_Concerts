"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  ListMusic,
  LogOut,
  PlusCircle,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeSelector } from "@/components/ThemeSelector";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upcoming", label: "Upcoming", icon: CalendarDays },
  { href: "/add", label: "Add", icon: PlusCircle },
  { href: "/concerts", label: "Concerts", icon: ListMusic },
  { href: "/friends", label: "Friends", icon: Users },
];

type AppShellProps = {
  userEmail: string;
  children: React.ReactNode;
};

export function AppShell({ userEmail, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-base-200">
      <header className="navbar sticky top-0 z-30 border-b border-base-300 bg-base-100/95 shadow-sm backdrop-blur">
        <div className="flex-1 flex-col items-start gap-0 px-2 sm:flex-row sm:items-center">
          <span className="text-lg font-bold text-primary sm:text-xl">
            Concert Cost Tracker
          </span>
          <p className="hidden text-xs text-base-content/60 sm:ml-3 sm:block sm:text-sm">
            See what shows really cost — and which were worth it.
          </p>
        </div>
        <div className="flex-none gap-2 px-2">
          <ThemeSelector compact className="max-w-[8rem]" />
          <span className="hidden max-w-[12rem] truncate text-sm opacity-70 lg:inline">
            {userEmail}
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      {/* Desktop tabs */}
      <nav className="mx-auto mt-4 hidden w-full max-w-4xl justify-center px-4 md:flex">
        <div className="tabs tabs-boxed w-full bg-base-100 shadow-sm">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`tab flex-1 gap-2 transition-colors ${pathname === href ? "tab-active" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label === "Add"
                ? "Add Concert"
                : label === "Concerts"
                  ? "My Concerts"
                  : label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-nav-safe md:py-8 md:pb-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-base-300 bg-base-100/95 backdrop-blur md:hidden"
        aria-label="Main navigation"
      >
        <div className="flex justify-around px-2 py-2">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            const displayLabel =
              label === "Add"
                ? "Add"
                : label === "Concerts"
                  ? "Concerts"
                  : label === "Upcoming"
                    ? "Events"
                    : label;
            return (
              <Link
                key={href}
                href={href}
                aria-label={displayLabel}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-xs transition-all ${
                  active
                    ? "bg-primary/15 font-semibold text-primary"
                    : "text-base-content/60 hover:bg-base-200"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "scale-110" : ""}`} aria-hidden />
                <span className="truncate">{displayLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
