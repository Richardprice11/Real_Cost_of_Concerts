"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import autoAnimate from "@formkit/auto-animate";
import { createClient } from "@/lib/supabase/client";
import type { Concert } from "@/lib/database.types";
import { ConcertCard } from "@/components/ConcertCard";
import { EmptyState } from "@/components/EmptyState";
import { AlertBanner } from "@/components/AlertBanner";
import { SkeletonGrid, SkeletonStats } from "@/components/SkeletonCard";

type ConcertsLoaderProps =
  | { mode: "list" }
  | {
      mode: "dashboard";
      render: React.ComponentType<{ concerts: Concert[] }>;
    };

export function ConcertsLoader(props: ConcertsLoaderProps) {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      autoAnimate(listRef.current);
    }
  }, [concerts, loading]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to view concerts.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("concerts")
        .select("*")
        .eq("user_id", user.id)
        .order("concert_date", { ascending: false });

      if (fetchError) {
        setError(
          fetchError.message ||
            "We couldn't load your concerts. Please refresh and try again."
        );
      } else {
        setConcerts((data ?? []) as Concert[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    if (props.mode === "dashboard") {
      return (
        <div className="space-y-8">
          <SkeletonStats />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="skeleton h-[280px] rounded-2xl bg-base-300" />
            <div className="skeleton h-[280px] rounded-2xl bg-base-300" />
          </div>
        </div>
      );
    }
    return <SkeletonGrid count={4} />;
  }

  if (error) {
    return <AlertBanner type="error" message={error} />;
  }

  if (concerts.length === 0) {
    const emptyCopy =
      props.mode === "dashboard"
        ? {
            title: "Your dashboard is waiting",
            message:
              "Add your first concert to unlock stats, charts, and fun-per-dollar insights.",
          }
        : {};
    return (
      <EmptyState
        title={emptyCopy.title}
        message={emptyCopy.message}
        action={
          <Link href="/add" className="btn btn-primary">
            Add your first concert
          </Link>
        }
      />
    );
  }

  if (props.mode === "dashboard") {
    const Render = props.render;
    return <Render concerts={concerts} />;
  }

  return (
    <div ref={listRef} className="grid gap-6 md:grid-cols-2">
      {concerts.map((concert) => (
        <ConcertCard key={concert.id} concert={concert} showEdit />
      ))}
    </div>
  );
}
