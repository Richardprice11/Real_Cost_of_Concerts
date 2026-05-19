"use client";

import { useEffect, useRef, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import { UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Concert } from "@/lib/database.types";
import { ConcertCard } from "@/components/ConcertCard";
import { EmptyState } from "@/components/EmptyState";
import { AlertBanner } from "@/components/AlertBanner";
import { SectionHeading } from "@/components/SectionHeading";
import { SkeletonGrid } from "@/components/SkeletonCard";

type FriendProfile = {
  id: string;
  email: string;
};

type ConcertWithOwner = Concert & { ownerEmail: string };

type TogetherConcert = {
  concert: Concert;
  friendEmail: string;
  friendId: string;
};

export function FriendsContent() {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [concerts, setConcerts] = useState<ConcertWithOwner[]>([]);
  const [together, setTogether] = useState<TogetherConcert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      autoAnimate(listRef.current);
    }
  }, [concerts, friends, loading]);

  async function loadFriendsData() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to view friends.");
      setLoading(false);
      return;
    }

    const { data: friendshipRows, error: friendsError } = await supabase
      .from("friendships")
      .select("friend_id")
      .eq("user_id", user.id);

    if (friendsError) {
      setError(
        friendsError.message ||
          "We couldn't load your friends. Please refresh and try again."
      );
      setLoading(false);
      return;
    }

    const friendIds = (friendshipRows ?? []).map((r) => r.friend_id);

    if (friendIds.length === 0) {
      setFriends([]);
      setConcerts([]);
      setTogether([]);
      setLoading(false);
      return;
    }

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", friendIds);

    if (profilesError) {
      setError("We couldn't load friend profiles. Please refresh and try again.");
      setLoading(false);
      return;
    }

    const profileList = (profiles ?? []) as FriendProfile[];
    setFriends(profileList);

    const emailById = new Map(profileList.map((p) => [p.id, p.email]));

    const { data: friendConcerts, error: concertsError } = await supabase
      .from("concerts")
      .select("*")
      .in("user_id", friendIds)
      .order("concert_date", { ascending: false });

    if (concertsError) {
      setError("We couldn't load friends' concerts. Please refresh and try again.");
      setLoading(false);
      return;
    }

    setConcerts(
      ((friendConcerts ?? []) as Concert[]).map((c) => ({
        ...c,
        ownerEmail: emailById.get(c.user_id) ?? "Friend",
      }))
    );

    const { data: myGroupRows } = await supabase
      .from("concerts")
      .select("*")
      .eq("user_id", user.id)
      .not("group_id", "is", null);

    const myGroupConcerts = (myGroupRows ?? []) as Concert[];
    const groupIds = [
      ...new Set(myGroupConcerts.map((c) => c.group_id).filter(Boolean)),
    ] as string[];

    const togetherItems: TogetherConcert[] = [];
    if (groupIds.length > 0) {
      const { data: groupConcerts } = await supabase
        .from("concerts")
        .select("*")
        .in("group_id", groupIds);

      const byGroup = new Map<string, Concert[]>();
      for (const row of (groupConcerts ?? []) as Concert[]) {
        if (!row.group_id) continue;
        const list = byGroup.get(row.group_id) ?? [];
        list.push(row);
        byGroup.set(row.group_id, list);
      }

      const seen = new Set<string>();
      for (const mine of myGroupConcerts) {
        if (!mine.group_id) continue;
        const members = byGroup.get(mine.group_id) ?? [];
        for (const friend of profileList) {
          const key = `${mine.group_id}:${friend.id}`;
          if (seen.has(key)) continue;
          if (members.some((m) => m.user_id === friend.id)) {
            seen.add(key);
            togetherItems.push({
              concert: mine,
              friendEmail: friend.email,
              friendId: friend.id,
            });
          }
        }
      }
    }

    togetherItems.sort(
      (a, b) =>
        new Date(b.concert.concert_date).getTime() -
        new Date(a.concert.concert_date).getTime()
    );
    setTogether(togetherItems);
    setLoading(false);
  }

  useEffect(() => {
    loadFriendsData();
  }, []);

  async function handleAddFriend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setAdding(true);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("add_friend_by_email", {
      friend_email: trimmed,
    });

    setAdding(false);

    if (rpcError) {
      toast.error(rpcError.message || "Could not add friend. Please try again.");
      return;
    }

    const result = data as { success?: boolean; error?: string };
    if (!result?.success) {
      toast.error(result?.error ?? "Could not add friend.");
      return;
    }

    toast.success("Friend added!");
    setEmail("");
    setLoading(true);
    setError(null);
    await loadFriendsData();
  }

  async function handleRemoveFriend(friendId: string) {
    setRemovingId(friendId);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRemovingId(null);
      return;
    }

    await supabase
      .from("friendships")
      .delete()
      .eq("user_id", user.id)
      .eq("friend_id", friendId);

    await supabase
      .from("friendships")
      .delete()
      .eq("user_id", friendId)
      .eq("friend_id", user.id);

    toast.success("Friend removed.");
    setRemovingId(null);
    setLoading(true);
    setError(null);
    await loadFriendsData();
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="skeleton h-24 rounded-2xl bg-base-300" />
        <SkeletonGrid count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="card border border-base-300/60 bg-base-100 shadow-sm">
        <div className="card-body gap-4">
          <SectionHeading title="Add a friend" />
          <p className="text-sm text-base-content/70">
            Enter their account email. They need to sign up and log in at least once
            before you can connect.
          </p>
          <form onSubmit={handleAddFriend} className="flex flex-col gap-3 sm:flex-row">
            <label className="form-control flex-1">
              <span className="label-text">Friend&apos;s email</span>
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={adding}
              />
            </label>
            <button
              type="submit"
              className="btn btn-primary sm:self-end"
              disabled={adding}
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              {adding ? "Adding…" : "Add friend"}
            </button>
          </form>
        </div>
      </section>

      {error && <AlertBanner type="error" message={error} />}

      {friends.length > 0 && (
        <section>
          <SectionHeading title="Your friends" />
          <ul className="mt-3 flex flex-wrap gap-2">
            {friends.map((friend) => (
              <li key={friend.id}>
                <span className="badge badge-lg gap-2 pr-1">
                  {friend.email}
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-circle"
                    aria-label={`Remove ${friend.email}`}
                    disabled={removingId === friend.id}
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    <UserMinus className="h-3 w-3" aria-hidden />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {together.length > 0 && (
        <section>
          <SectionHeading
            title="Concerts you attended together"
            description="Shows you logged with friends as attendees."
          />
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {together.map((item) => (
              <ConcertCard
                key={`${item.concert.id}-${item.friendId}`}
                concert={item.concert}
                ownerLabel={`With ${item.friendEmail}`}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeading title="Friends' concerts" />
        {friends.length === 0 ? (
          <EmptyState
            title="No friends yet"
            message="Add a friend by email to see their logged concerts here — same details as yours."
          />
        ) : concerts.length === 0 ? (
          <EmptyState
            title="No concerts from friends yet"
            message="When your friends log shows, they will show up here with the same cost and fun breakdowns."
          />
        ) : (
          <div ref={listRef} className="mt-4 grid gap-6 md:grid-cols-2">
            {concerts.map((concert) => (
              <ConcertCard
                key={concert.id}
                concert={concert}
                ownerLabel={concert.ownerEmail}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
