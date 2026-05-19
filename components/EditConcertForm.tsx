"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Music, DollarSign, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FormField } from "@/components/FormField";
import { AlertBanner } from "@/components/AlertBanner";
import { COST_FIELDS, formatCurrency, getTotalCost } from "@/lib/metrics";
import { getFunRatingLabel } from "@/lib/funRating";
import type { Concert } from "@/lib/database.types";

type EditConcertFormProps = {
  concertId: string;
};

const costKeys = COST_FIELDS.map((c) => c.key);

export function EditConcertForm({ concertId }: EditConcertFormProps) {
  const router = useRouter();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("concerts")
        .select("*")
        .eq("id", concertId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError || !data) {
        setError("Concert not found or you cannot edit it.");
        setLoading(false);
        return;
      }

      const c = data as Concert;
      setConcert(c);
      setForm({
        concert_name: c.concert_name,
        artist: c.artist,
        venue: c.venue,
        city: c.city,
        state: c.state,
        concert_date: c.concert_date,
        distance_from_home: String(c.distance_from_home),
        hours_at_event: String(c.hours_at_event),
        notes: c.notes ?? "",
        fun_rating: c.fun_rating,
        ...Object.fromEntries(costKeys.map((k) => [k, String(c[k])])),
      });
      setLoading(false);
    }
    load();
  }, [concertId]);

  const liveTotal = useMemo(() => {
    if (!concert) return 0;
    const partial = Object.fromEntries(
      costKeys.map((key) => [key, Number(form[key]) || 0])
    ) as Parameters<typeof getTotalCost>[0];
    return getTotalCost(partial);
  }, [form, concert]);

  function updateField(key: string, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!concert) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    const sharedPayload = {
      concert_name: String(form.concert_name).trim(),
      artist: String(form.artist).trim(),
      venue: String(form.venue).trim(),
      city: String(form.city).trim(),
      state: String(form.state).trim(),
      concert_date: String(form.concert_date),
      distance_from_home: Number(form.distance_from_home) || 0,
      hours_at_event: Number(form.hours_at_event) || 0,
      fun_rating: Number(form.fun_rating),
      notes: String(form.notes).trim(),
    };

    const personalPayload = Object.fromEntries(
      costKeys.map((key) => [key, Number(form[key]) || 0])
    );

    if (concert.group_id) {
      const { data: sharedResult, error: sharedError } = await supabase.rpc(
        "update_group_concert_shared",
        {
          p_group_id: concert.group_id,
          shared_data: sharedPayload,
        }
      );
      if (sharedError) {
        setError(sharedError.message);
        setSaving(false);
        return;
      }
      const parsed = sharedResult as { success?: boolean; error?: string };
      if (!parsed?.success) {
        setError(parsed?.error ?? "Could not update shared concert details.");
        setSaving(false);
        return;
      }
    } else {
      const { error: soloSharedError } = await supabase
        .from("concerts")
        .update({ ...sharedPayload, notes: sharedPayload.notes || null })
        .eq("id", concert.id)
        .eq("user_id", user.id);
      if (soloSharedError) {
        setError(soloSharedError.message);
        setSaving(false);
        return;
      }
    }

    const { error: personalError } = await supabase
      .from("concerts")
      .update(personalPayload)
      .eq("id", concert.id)
      .eq("user_id", user.id);

    setSaving(false);
    if (personalError) {
      setError(personalError.message);
      return;
    }

    toast.success("Concert updated!");
    router.push("/concerts");
    router.refresh();
  }

  if (loading) {
    return <div className="skeleton h-96 w-full rounded-2xl bg-base-300" />;
  }

  if (!concert) {
    return <AlertBanner type="error" message={error ?? "Concert not found."} />;
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {error && <AlertBanner type="error" message={error} />}
      {concert.group_id && (
        <div role="alert" className="alert alert-info text-sm">
          <span>
            Group concert: details and fun rating update for everyone. Cost fields below
            are only yours.
          </span>
        </div>
      )}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-center">
        <p className="text-sm text-base-content/70">Your total cost</p>
        <p className="text-2xl font-bold text-primary">{formatCurrency(liveTotal)}</p>
      </div>

      <section className="card border border-base-300/50 bg-base-100 shadow-md">
        <div className="card-body space-y-4">
          <h2 className="card-title gap-2">
            <Music className="h-5 w-5 text-primary" aria-hidden />
            Concert details
          </h2>
          <FormField
            label="Concert name"
            id="concert_name"
            required
            inputProps={{
              value: String(form.concert_name),
              onChange: (e) => updateField("concert_name", e.target.value),
            }}
          />
          <FormField
            label="Artist / band"
            id="artist"
            required
            inputProps={{
              value: String(form.artist),
              onChange: (e) => updateField("artist", e.target.value),
            }}
          />
          <FormField
            label="Venue"
            id="venue"
            required
            inputProps={{
              value: String(form.venue),
              onChange: (e) => updateField("venue", e.target.value),
            }}
          />
          <FormField
            label="City"
            id="city"
            required
            inputProps={{
              value: String(form.city),
              onChange: (e) => updateField("city", e.target.value),
            }}
          />
          <FormField
            label="State"
            id="state"
            required
            inputProps={{
              value: String(form.state),
              onChange: (e) => updateField("state", e.target.value),
            }}
          />
          <FormField
            label="Concert date"
            id="concert_date"
            type="date"
            required
            inputProps={{
              value: String(form.concert_date),
              onChange: (e) => updateField("concert_date", e.target.value),
            }}
          />
          <FormField
            label="Distance (miles)"
            id="distance"
            type="number"
            inputProps={{
              value: String(form.distance_from_home),
              onChange: (e) => updateField("distance_from_home", e.target.value),
              min: 0,
              step: "0.1",
            }}
          />
          <FormField
            label="Hours at event"
            id="hours"
            type="number"
            inputProps={{
              value: String(form.hours_at_event),
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
              value: String(form.notes),
              onChange: (e) => updateField("notes", e.target.value),
              rows: 3,
            }}
          />
        </div>
      </section>

      <section className="card border border-base-300/50 bg-base-100 shadow-md">
        <div className="card-body space-y-4">
          <h2 className="card-title gap-2">
            <DollarSign className="h-5 w-5 text-primary" aria-hidden />
            Your costs
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {COST_FIELDS.map(({ key, label }) => (
              <label key={key} className="form-control w-full">
                <span className="label-text mb-1 text-sm font-medium">{label}</span>
                <label className="input input-bordered input-sm flex items-center gap-1">
                  <span className="opacity-50">$</span>
                  <input
                    type="number"
                    className="grow"
                    value={String(form[key])}
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
            Fun rating
          </h2>
          <input
            type="range"
            min={1}
            max={10}
            value={Number(form.fun_rating)}
            onChange={(e) => updateField("fun_rating", Number(e.target.value))}
            className="range range-primary w-full"
          />
          <p className="text-center text-sm font-semibold text-primary">
            {form.fun_rating}/10 · {getFunRatingLabel(Number(form.fun_rating))}
          </p>
        </div>
      </section>

      <div className="flex gap-3">
        <button type="button" className="btn btn-ghost flex-1" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
