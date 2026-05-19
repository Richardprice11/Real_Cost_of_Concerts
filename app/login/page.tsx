import { Music } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { ThemeSelector } from "@/components/ThemeSelector";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary/20 via-base-200 to-secondary/20">
      <div
        className="animate-blob pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl"
        aria-hidden
      />
      <div
        className="animate-blob-delayed pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-secondary/25 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary p-3 text-primary-content shadow-lg">
              <Music className="h-8 w-8" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Concert Cost Tracker</h1>
              <p className="text-sm text-base-content/70 sm:text-base">
                Know what shows really cost — and which were worth every penny.
              </p>
            </div>
          </div>
          <ThemeSelector className="shrink-0" />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center pb-12">
          <LoginForm />
        </main>
      </div>
    </div>
  );
}
