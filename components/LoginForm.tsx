"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { FormField } from "@/components/FormField";
import { AlertBanner } from "@/components/AlertBanner";

export function LoginForm() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      const msg =
        "Account created! Check your email to confirm, or log in if confirmation is turned off.";
      setMessage(msg);
      toast.success("Account created!", {
        description: "Check your email if confirmation is required.",
      });
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    toast.success("Welcome back!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <motion.div
      className="card w-full max-w-md border border-base-300/50 bg-base-100 shadow-xl"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="card-body">
        <h2 className="card-title text-2xl">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="text-sm text-base-content/70">
          {mode === "login"
            ? "Log in to track what your concerts really cost."
            : "Sign up free and start logging your shows."}
        </p>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <FormField
            label="Email"
            id="email"
            type="email"
            required
            inputProps={{
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "you@example.com",
              autoComplete: "email",
            }}
          />
          <FormField
            label="Password"
            id="password"
            type="password"
            required
            helperText="At least 6 characters"
            inputProps={{
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: "••••••••",
              autoComplete: mode === "login" ? "current-password" : "new-password",
              minLength: 6,
            }}
          />

          {error && <AlertBanner type="error" message={error} />}
          {message && <AlertBanner type="success" message={message} />}

          <button
            type="submit"
            className="btn btn-primary w-full transition-transform hover:scale-[1.01]"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                {mode === "login" ? "Logging in…" : "Signing up…"}
              </>
            ) : mode === "login" ? (
              "Log in"
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="link link-primary"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setMessage(null);
            }}
          >
            {mode === "login" ? "Create an account" : "Log in instead"}
          </button>
        </p>
      </div>
    </motion.div>
  );
}
