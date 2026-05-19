"use client";

import { useEffect, useState } from "react";
import type { UpcomingEvent } from "@/lib/ticketmaster";
import { UpcomingEventCard } from "@/components/UpcomingEventCard";
import { AlertBanner } from "@/components/AlertBanner";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonGrid } from "@/components/SkeletonCard";

export function UpcomingEventsContent() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/events/upcoming");
      const json = (await res.json()) as { events?: UpcomingEvent[]; error?: string };
      if (json.error) setError(json.error);
      setEvents(json.events ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <SkeletonGrid count={4} />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-base-content/70">
        Concerts within 50 miles of Oxford, MS (38655) · next 30 days · cached for 30
        minutes
      </p>
      {error && <AlertBanner type="error" message={error} />}
      {!error && events.length === 0 ? (
        <EmptyState
          title="No upcoming concerts found"
          message="Try again later, or check that your Ticketmaster API key is set in .env.local."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <UpcomingEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
