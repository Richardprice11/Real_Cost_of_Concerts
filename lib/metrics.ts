import type { Concert } from "@/lib/database.types";

export const COST_FIELDS = [
  { key: "ticket_cost" as const, label: "Tickets" },
  { key: "ticket_fees" as const, label: "Ticket fees" },
  { key: "parking_cost" as const, label: "Parking" },
  { key: "food_drink_cost" as const, label: "Food & drink" },
  { key: "merchandise_cost" as const, label: "Merchandise" },
  { key: "lodging_cost" as const, label: "Lodging" },
  { key: "travel_cost" as const, label: "Travel / gas" },
  { key: "other_cost" as const, label: "Other" },
];

export function getTotalCost(concert: Pick<Concert, (typeof COST_FIELDS)[number]["key"]>): number {
  return COST_FIELDS.reduce((sum, { key }) => sum + Number(concert[key] ?? 0), 0);
}

export function getCostPerHour(concert: Concert): number | null {
  const total = getTotalCost(concert);
  const hours = Number(concert.hours_at_event);
  if (!hours || hours <= 0) return null;
  return total / hours;
}

export function getFunPointsPer100(concert: Concert): number | null {
  const total = getTotalCost(concert);
  if (!total || total <= 0) return null;
  return (concert.fun_rating / total) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getTopCostCategories(concert: Concert, limit = 3): { label: string; amount: number }[] {
  return COST_FIELDS.map(({ key, label }) => ({
    label,
    amount: Number(concert[key] ?? 0),
  }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function aggregateCategorySpending(concerts: Concert[]): { name: string; total: number }[] {
  return COST_FIELDS.map(({ key, label }) => ({
    name: label,
    total: concerts.reduce((sum, c) => sum + Number(c[key] ?? 0), 0),
  })).filter((c) => c.total > 0);
}

export function getDashboardSummary(concerts: Concert[]) {
  if (concerts.length === 0) {
    return null;
  }

  const withMetrics = concerts.map((c) => ({
    concert: c,
    total: getTotalCost(c),
    costPerHour: getCostPerHour(c),
    funPoints: getFunPointsPer100(c),
  }));

  const totalSpent = withMetrics.reduce((s, m) => s + m.total, 0);
  const avgCost = totalSpent / concerts.length;
  const avgFun =
    concerts.reduce((s, c) => s + c.fun_rating, 0) / concerts.length;

  const costPerHourValues = withMetrics
    .map((m) => m.costPerHour)
    .filter((v): v is number => v !== null);
  const avgCostPerHour =
    costPerHourValues.length > 0
      ? costPerHourValues.reduce((s, v) => s + v, 0) / costPerHourValues.length
      : null;

  const withFunPoints = withMetrics.filter((m) => m.funPoints !== null);
  const bestValue =
    withFunPoints.length > 0
      ? withFunPoints.reduce((best, m) =>
          (m.funPoints ?? 0) > (best.funPoints ?? 0) ? m : best
        )
      : null;

  const mostExpensive = withMetrics.reduce((best, m) =>
    m.total > best.total ? m : best
  );

  const highestFun = withMetrics.reduce((best, m) =>
    m.concert.fun_rating > best.concert.fun_rating ? m : best
  );

  return {
    totalConcerts: concerts.length,
    totalSpent,
    avgCost,
    avgFun,
    avgCostPerHour,
    bestValue,
    mostExpensive,
    highestFun,
    withMetrics,
  };
}
