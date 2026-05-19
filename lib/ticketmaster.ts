/** Oxford, MS 38655 */
export const OXFORD_LAT = 34.3665;
export const OXFORD_LNG = -89.5192;
export const SEARCH_RADIUS_MILES = 50;
export const SEARCH_DAYS = 30;

export type UpcomingEvent = {
  id: string;
  name: string;
  artist: string;
  venue: string;
  city: string;
  state: string;
  date: string;
  time: string | null;
  imageUrl: string | null;
  url: string | null;
};

type TicketmasterEvent = {
  id: string;
  name: string;
  url?: string;
  dates?: { start?: { localDate?: string; localTime?: string } };
  images?: { url: string; width: number }[];
  _embedded?: {
    venues?: { name?: string; city?: { name?: string }; state?: { stateCode?: string } }[];
    attractions?: { name?: string }[];
  };
  classifications?: { segment?: { name?: string } }[];
};

export function mapTicketmasterEvents(events: TicketmasterEvent[]): UpcomingEvent[] {
  return events
    .filter((e) => {
      const segment = e.classifications?.[0]?.segment?.name?.toLowerCase();
      return !segment || segment === "music";
    })
    .map((e) => {
      const venue = e._embedded?.venues?.[0];
      const attraction = e._embedded?.attractions?.[0];
      const images = [...(e.images ?? [])].sort((a, b) => b.width - a.width);

      return {
        id: e.id,
        name: e.name,
        artist: attraction?.name ?? e.name,
        venue: venue?.name ?? "Venue TBA",
        city: venue?.city?.name ?? "",
        state: venue?.state?.stateCode ?? "",
        date: e.dates?.start?.localDate ?? "",
        time: e.dates?.start?.localTime ?? null,
        imageUrl: images[0]?.url ?? null,
        url: e.url ?? null,
      };
    })
    .filter((e) => e.date);
}

export async function fetchOxfordConcerts(apiKey: string): Promise<UpcomingEvent[]> {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + SEARCH_DAYS);

  const params = new URLSearchParams({
    apikey: apiKey,
    latlong: `${OXFORD_LAT},${OXFORD_LNG}`,
    radius: String(SEARCH_RADIUS_MILES),
    unit: "miles",
    segmentName: "Music",
    classificationName: "music",
    sort: "date,asc",
    size: "50",
    startDateTime: start.toISOString().replace(/\.\d{3}Z$/, "Z"),
    endDateTime: end.toISOString().replace(/\.\d{3}Z$/, "Z"),
  });

  const res = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events.json?${params}`,
    { next: { revalidate: 1800 } }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ticketmaster API error (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as { _embedded?: { events?: TicketmasterEvent[] } };
  return mapTicketmasterEvents(json._embedded?.events ?? []);
}
