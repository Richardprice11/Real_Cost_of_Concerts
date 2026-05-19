"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ExternalLink, MapPin, PlusCircle } from "lucide-react";
import type { UpcomingEvent } from "@/lib/ticketmaster";
import { formatDate } from "@/lib/metrics";

type UpcomingEventCardProps = {
  event: UpcomingEvent;
};

function buildAddHref(event: UpcomingEvent): string {
  const params = new URLSearchParams({
    concert_name: event.name,
    artist: event.artist,
    venue: event.venue,
    city: event.city,
    state: event.state,
    concert_date: event.date,
  });
  return `/add?${params.toString()}`;
}

function formatEventDateTime(date: string, time: string | null): string {
  const formatted = formatDate(date);
  if (!time) return formatted;
  const [h, m] = time.split(":");
  const hour = Number(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${formatted} · ${h12}:${m} ${ampm}`;
}

export function UpcomingEventCard({ event }: UpcomingEventCardProps) {
  return (
    <article className="card border border-base-300/60 bg-base-100 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {event.imageUrl && (
        <figure className="relative h-40 w-full overflow-hidden">
          <Image
            src={event.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </figure>
      )}
      <div className="card-body gap-3">
        <div>
          <h3 className="card-title line-clamp-2 text-lg">{event.name}</h3>
          <p className="text-sm font-medium text-primary">{event.artist}</p>
        </div>
        <ul className="space-y-1 text-sm text-base-content/80">
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
            <span className="line-clamp-2">
              {event.venue}
              {event.city ? ` · ${event.city}, ${event.state}` : ""}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
            {formatEventDateTime(event.date, event.time)}
          </li>
        </ul>
        <div className="card-actions mt-1 flex-wrap justify-end gap-2">
          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm gap-1"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Tickets
            </a>
          )}
          <Link href={buildAddHref(event)} className="btn btn-primary btn-sm gap-1">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Add to tracker
          </Link>
        </div>
      </div>
    </article>
  );
}
