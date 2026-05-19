import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { fetchOxfordConcerts } from "@/lib/ticketmaster";

const getCachedEvents = unstable_cache(
  async (apiKey: string) => fetchOxfordConcerts(apiKey),
  ["ticketmaster-oxford-concerts"],
  { revalidate: 1800 }
);

export async function GET() {
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Ticketmaster API key is not configured. Add TICKETMASTER_API_KEY to .env.local (get a free key at developer.ticketmaster.com).",
        events: [],
      },
      { status: 503 }
    );
  }

  try {
    const events = await getCachedEvents(apiKey);
    return NextResponse.json({ events });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load events";
    return NextResponse.json({ error: message, events: [] }, { status: 502 });
  }
}
