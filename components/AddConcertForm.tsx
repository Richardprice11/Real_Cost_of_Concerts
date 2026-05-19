"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Music, DollarSign, Sparkles, Users, Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FormField } from "@/components/FormField";
import { AlertBanner } from "@/components/AlertBanner";
import { COST_FIELDS, formatCurrency, getTotalCost } from "@/lib/metrics";
import { getFunRatingLabel } from "@/lib/funRating";
import { getPerPersonTicketCost } from "@/lib/concertSplit";
import { isRegisteredEmail } from "@/lib/lookupUserEmail";
import type { ConcertInsert } from "@/lib/database.types";

const emptyCosts = Object.fromEntries(
  COST_FIELDS.map(({ key }) => [key, "0"])
) as Record<(typeof COST_FIELDS)[number]["key"], string>;

const initialForm = {
  concert_name: "",
  artist: "",
  venue: "",
  city: "",
  state: "",
  concert_date: "",
  distance_from_home: "",
  hours_at_event: "",
  notes: "",
  fun_rating: 7,
  ...emptyCosts,
};

const MAX_ATTENDEES = 10;

function AddConcertFormInner() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [attendeeEmails, setAttendeeEmails] = useState<string[]>([""]);
  const [emailErrors, setEmailErrors] = useState<Record<number, string>>({});
  const [myEmail, setMyEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prefill = {
      concert_name: searchParams.get("concert_name") ?? "",
      artist: searchParams.get("artist") ?? "",
      venue: searchParams.get("venue") ?? "",
      city: searchParams.get("city") ?? "",
      state: searchParams.get("state") ?? "",
      concert_date: searchParams.get("concert_date") ?? "",
    };
    if (Object.values(prefill).some(Boolean)) {
      setForm((prev) => ({ ...prev, ...prefill }));
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setMyEmail(user.email.toLowerCase());
        setAttendeeEmails((prev) => {
          const next = [...prev];
          next[0] = user.email!.toLowerCase();
          return next;
        });
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    setAttendeeEmails((prev) => {
      const next = [...prev];
      while (next.length < attendeeCount) next.push("");
      while (next.length > attendeeCount) next.pop();
      if (next[0] !== myEmail && myEmail) next[0] = myEmail;
      return next;
    });
  }, [attendeeCount, myEmail]);

  const liveTotal = useMemo(() => {
    const partial = Object.fromEntries(
      COST_FIELDS.map(({ key }) => [key, Number(form[key]) || 0])
    ) as Parameters<typeof getTotalCost>[0];
    return getTotalCost(partial);
  }, [form]);

  const perPersonTicket = useMemo(
    () =>
      getPerPersonTicketCost(
        Number(form.ticket_cost) || 0,
        Number(form.ticket_fees) || 0,
        attendeeCount
      ),
    [form.ticket_cost, form.ticket_fees, attendeeCount]
  );

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setCount(next: number) {
    const clamped = Math.min(MAX_ATTENDEES, Math.max(1, next));
    setAttendeeCount(clamped);
  }

  function updateAttendeeEmail(index: number, value: string) {
    if (index === 0) return;
    setAttendeeEmails((prev) => {
      const next = [...prev];
      next[index] = value.toLowerCase();
      return next;
    });
    setEmailErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }

  async function validateAttendeeEmail(index: number, email: string) {
    if (!email.trim()) {
      setEmailErrors((prev) => ({ ...prev, [index]: "Email is required." }));
      return false;
    }
    const dup = attendeeEmails.filter(
      (e, i) => i !== index && e.trim().toLowerCase() === email.trim().toLowerCase()
    );
    if (dup.length > 0) {
      setEmailErrors((prev) => ({ ...prev, [index]: "Duplicate email." }));
      return false;
    }
    const ok = await isRegisteredEmail(email);
    if (!ok) {
      setEmailErrors((prev) => ({
        ...prev,
        [index]: "No account found. They must sign up first.",
      }));
      return false;
    }
    setEmailErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    return true;
  }

  async function validateAllEmails(): Promise<boolean> {
    let ok = true;
    for (let i = 0; i < attendeeEmails.length; i++) {
      const valid = await validateAttendeeEmail(i, attendeeEmails[i]);
      if (!valid) ok = false;
    }
    return ok;
  }

  function buildConcertJson() {
    return {
      concert_name: form.concert_name.trim(),
      artist: form.artist.trim(),
      venue: form.venue.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      concert_date: form.concert_date,
      distance_from_home: Number(form.distance_from_home) || 0,
      hours_at_event: Number(form.hours_at_event) || 0,
      ticket_cost: Number(form.ticket_cost) || 0,
      ticket_fees: Number(form.ticket_fees) || 0,
      parking_cost: Number(form.parking_cost) || 0,
      food_drink_cost: Number(form.food_drink_cost) || 0,
      merchandise_cost: Number(form.merchandise_cost) || 0,
      lodging_cost: Number(form.lodging_cost) || 0,
      travel_cost: Number(form.travel_cost) || 0,
      other_cost: Number(form.other_cost) || 0,
      fun_rating: form.fun_rating,
      notes: form.notes.trim() || "",
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You need to be logged in to save a concert.");
      setLoading(false);
      return;
    }

    const emailsValid = await validateAllEmails();
    if (!emailsValid) {
      setError("Fix attendee emails before saving.");
      setLoading(false);
      return;
    }

    const normalizedEmails = attendeeEmails.map((e) => e.trim().toLowerCase());

    if (attendeeCount === 1) {
      const payload: ConcertInsert = {
        user_id: user.id,
        ...buildConcertJson(),
        notes: form.notes.trim() || null,
        attendee_count: 1,
      };

      const { error: insertError } = await supabase.from("concerts").insert([payload]);
      setLoading(false);
      if (insertError) {
        setError(insertError.message || "Couldn't save your concert.");
        return;
      }
    } else {
      const { data, error: rpcError } = await supabase.rpc("create_concert_with_attendees", {
        concert_data: buildConcertJson(),
        attendee_emails: normalizedEmails,
      });
      setLoading(false);
      if (rpcError) {
        setError(rpcError.message || "Couldn't save your concert.");
        return;
      }
      const result = data as { success?: boolean; error?: string };
      if (!result?.success) {
        setError(result?.error ?? "Couldn't save your concert.");
        return;
      }
    }

    setForm({ ...initialForm, fun_rating: 7 });
    setAttendeeCount(1);
    setAttendeeEmails([myEmail]);
    setEmailErrors({});
    toast.success(
      attendeeCount > 1 ? "Concert saved for all attendees!" : "Concert saved!",
      {
        description:
          attendeeCount > 1
            ? "Each person sees their share on their dashboard. Friends were added automatically."
            : "Check your dashboard or add another show.",
      }
    );
  }

  return (
    <>
      <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-base-300 bg-base-200/95 px-4 py-3 backdrop-blur md:top-[4.5rem]">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-sm text-base-content/70">Running total (your costs)</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(liveTotal)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-base-content/70">Your ticket share</p>
            <p className="text-2xl font-bold text-secondary">
              {formatCurrency(perPersonTicket)}
            </p>
            <p className="text-xs text-base-content/60">
              (tickets + fees) ÷ {attendeeCount} attendee{attendeeCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {error && <AlertBanner type="error" message={error} />}

        <section className="card border border-base-300/50 bg-base-100 shadow-md">
          <div className="card-body space-y-4">
            <h2 className="card-title gap-2">
              <Users className="h-5 w-5 text-primary" aria-hidden />
              Who attended?
            </h2>
            <p className="text-sm text-base-content/70">
              Ticket cost and fees are split equally. Food and other costs stay on your
              record only. All emails must be registered users (max {MAX_ATTENDEES}).
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Attendees</span>
              <button
                type="button"
                className="btn btn-circle btn-sm btn-outline"
                aria-label="Decrease attendees"
                disabled={attendeeCount <= 1}
                onClick={() => setCount(attendeeCount - 1)}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[2ch] text-center text-lg font-semibold">
                {attendeeCount}
              </span>
              <button
                type="button"
                className="btn btn-circle btn-sm btn-outline"
                aria-label="Increase attendees"
                disabled={attendeeCount >= MAX_ATTENDEES}
                onClick={() => setCount(attendeeCount + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {attendeeEmails.map((email, index) => (
                <label key={index} className="form-control w-full">
                  <span className="label-text">
                    Attendee {index + 1}
                    {index === 0 ? " (you)" : ""}
                  </span>
                  <input
                    type="email"
                    className={`input input-bordered w-full ${emailErrors[index] ? "input-error" : ""}`}
                    value={email}
                    readOnly={index === 0}
                    required
                    placeholder="friend@example.com"
                    onChange={(e) => updateAttendeeEmail(index, e.target.value)}
                    onBlur={() => validateAttendeeEmail(index, email)}
                  />
                  {emailErrors[index] && (
                    <span className="label-text-alt text-error">{emailErrors[index]}</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="card border border-base-300/50 bg-base-100 shadow-md">
          <div className="card-body space-y-4">
            <h2 className="card-title gap-2">
              <Music className="h-5 w-5 text-primary" aria-hidden />
              Concert details
            </h2>
            <p className="text-sm text-base-content/70">Tell us about the show you saw.</p>
            <div className="space-y-4">
              <FormField
                label="Concert name"
                id="concert_name"
                required
                inputProps={{
                  value: form.concert_name,
                  onChange: (e) => updateField("concert_name", e.target.value),
                  placeholder: "Summer Nights Tour",
                }}
              />
              <FormField
                label="Artist / band"
                id="artist"
                required
                inputProps={{
                  value: form.artist,
                  onChange: (e) => updateField("artist", e.target.value),
                }}
              />
              <FormField
                label="Venue"
                id="venue"
                required
                inputProps={{
                  value: form.venue,
                  onChange: (e) => updateField("venue", e.target.value),
                }}
              />
              <FormField
                label="City"
                id="city"
                required
                inputProps={{
                  value: form.city,
                  onChange: (e) => updateField("city", e.target.value),
                }}
              />
              <FormField
                label="State"
                id="state"
                required
                inputProps={{
                  value: form.state,
                  onChange: (e) => updateField("state", e.target.value),
                  placeholder: "MS",
                }}
              />
              <FormField
                label="Concert date"
                id="concert_date"
                type="date"
                required
                inputProps={{
                  value: form.concert_date,
                  onChange: (e) => updateField("concert_date", e.target.value),
                }}
              />
              <FormField
                label="Distance (miles)"
                id="distance"
                type="number"
                helperText="How far from home was the venue?"
                inputProps={{
                  value: form.distance_from_home,
                  onChange: (e) => updateField("distance_from_home", e.target.value),
                  min: 0,
                  step: "0.1",
                }}
              />
              <FormField
                label="Hours at event"
                id="hours"
                type="number"
                helperText="Approximate time at the venue (doors to exit)."
                inputProps={{
                  value: form.hours_at_event,
                  onChange: (e) => updateField("hours_at_event", e.target.value),
                  min: 0,
                  step: "0.5",
                }}
              />
              <FormField
                label="Notes"
                id="notes"
                multiline
                inputProps={{
                  value: form.notes,
                  onChange: (e) => updateField("notes", e.target.value),
                  rows: 3,
                  placeholder: "Optional memories, setlist highlights…",
                }}
              />
            </div>
          </div>
        </section>

        <section className="card border border-base-300/50 bg-base-100 shadow-md">
          <div className="card-body space-y-4">
            <h2 className="card-title gap-2">
              <DollarSign className="h-5 w-5 text-primary" aria-hidden />
              Costs
            </h2>
            <p className="text-sm text-base-content/70">
              Enter group ticket totals; they split per attendee. Food and other costs are
              yours only.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {COST_FIELDS.map(({ key, label }) => (
                <label key={key} className="form-control w-full">
                  <span className="label-text mb-1 text-sm font-medium">{label}</span>
                  <label className="input input-bordered input-sm flex items-center gap-1">
                    <span className="opacity-50">$</span>
                    <input
                      id={key}
                      type="number"
                      className="grow"
                      value={form[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                      min={0}
                      step="0.01"
                    />
                  </label>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="card border border-base-300/50 bg-base-100 shadow-md">
          <div className="card-body space-y-4">
            <h2 className="card-title gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden />
              How fun was it?
            </h2>
            <p className="text-sm text-base-content/70">
              One group rating shared with all attendees.
            </p>
            <div>
              <input
                id="fun_rating"
                type="range"
                min={1}
                max={10}
                step={1}
                value={form.fun_rating}
                onChange={(e) => updateField("fun_rating", Number(e.target.value))}
                className="range range-primary w-full"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs opacity-70">
                <span>1 — Terrible Time</span>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                  {form.fun_rating}/10 · {getFunRatingLabel(form.fun_rating)}
                </span>
                <span>10 — Best Time Ever</span>
              </div>
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full transition-transform hover:scale-[1.01] active:scale-[0.99]"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Saving…
            </>
          ) : (
            "Save concert"
          )}
        </button>
      </form>
    </>
  );
}

export function AddConcertForm() {
  return (
    <Suspense
      fallback={<div className="skeleton h-96 w-full rounded-2xl bg-base-300" />}
    >
      <AddConcertFormInner />
    </Suspense>
  );
}
