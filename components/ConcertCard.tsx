"use client";

import type { Concert } from "@/lib/database.types";
import {
  formatCurrency,
  formatDate,
  getCostPerHour,
  getFunPointsPer100,
  getTopCostCategories,
  getTotalCost,
} from "@/lib/metrics";
import { getFunRatingBadgeClass } from "@/lib/funRating";
import Link from "next/link";
import { Star, MapPin, Calendar, Pencil } from "lucide-react";

type ConcertCardProps = {
  concert: Concert;
  ownerLabel?: string;
  showEdit?: boolean;
};

export function ConcertCard({ concert, ownerLabel, showEdit }: ConcertCardProps) {
  const total = getTotalCost(concert);
  const costPerHour = getCostPerHour(concert);
  const funPoints = getFunPointsPer100(concert);
  const categories = getTopCostCategories(concert);

  return (
    <article className="card border border-base-300/60 bg-base-100 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="card-body gap-3">
        {ownerLabel && (
          <p className="text-xs font-medium uppercase tracking-wide text-secondary">
            {ownerLabel}
          </p>
        )}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="card-title line-clamp-2 text-lg">{concert.concert_name}</h3>
            <p className="text-sm font-medium text-primary">{concert.artist}</p>
          </div>
          <div
            className={`badge badge-lg gap-1 ${getFunRatingBadgeClass(concert.fun_rating)}`}
          >
            <Star className="h-3 w-3 fill-current" aria-hidden />
            {concert.fun_rating}/10
          </div>
        </div>

        <ul className="space-y-1 text-sm text-base-content/80">
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
            <span className="line-clamp-2">
              {concert.venue} · {concert.city}, {concert.state}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
            {formatDate(concert.concert_date)}
          </li>
        </ul>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-base-200/80 p-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide opacity-60">
              Total cost
            </p>
            <p className="text-lg font-semibold">{formatCurrency(total)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide opacity-60">
              Cost / hour
            </p>
            <p className="text-lg font-semibold">
              {costPerHour !== null ? formatCurrency(costPerHour) : "—"}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wide opacity-60">
              Fun Points / $100
            </p>
            <p className="text-lg font-semibold">
              {funPoints !== null ? funPoints.toFixed(2) : "—"}
            </p>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c.label} className="badge badge-outline badge-sm">
                {c.label}: {formatCurrency(c.amount)}
              </span>
            ))}
          </div>
        )}

        {concert.notes && (
          <p className="rounded-lg border border-base-300/80 bg-base-200/50 p-3 text-sm italic text-base-content/80">
            {concert.notes}
          </p>
        )}

        {concert.group_id && (
          <span className="badge badge-outline badge-sm">Group concert</span>
        )}

        {showEdit && (
          <div className="card-actions justify-end">
            <Link
              href={`/concerts/${concert.id}/edit`}
              className="btn btn-ghost btn-sm gap-1"
            >
              <Pencil className="h-4 w-4" aria-hidden />
              Edit
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
