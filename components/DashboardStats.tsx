import type { Concert } from "@/lib/database.types";
import {
  formatCurrency,
  formatNumber,
  getDashboardSummary,
  getFunPointsPer100,
  getTotalCost,
} from "@/lib/metrics";
import {
  Calendar,
  Clock,
  DollarSign,
  Music,
  Star,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type DashboardStatsProps = {
  concerts: Concert[];
};

const STAT_ICONS: Record<string, LucideIcon> = {
  "Total concerts": Music,
  "Total spent": DollarSign,
  "Avg cost / concert": DollarSign,
  "Avg fun rating": Star,
  "Avg cost / hour": Clock,
  "Best value": Trophy,
  "Most expensive": TrendingUp,
  "Highest fun": Star,
};

export function DashboardStats({ concerts }: DashboardStatsProps) {
  const summary = getDashboardSummary(concerts);
  if (!summary) return null;

  const bestLabel = summary.bestValue
    ? `${summary.bestValue.concert.concert_name} (${formatNumber(summary.bestValue.funPoints ?? 0)} pts/$100)`
    : "—";

  const stats = [
    { title: "Total concerts", value: String(summary.totalConcerts), small: false },
    { title: "Total spent", value: formatCurrency(summary.totalSpent), small: false },
    { title: "Avg cost / concert", value: formatCurrency(summary.avgCost), small: false },
    { title: "Avg fun rating", value: formatNumber(summary.avgFun, 1), small: false },
    {
      title: "Avg cost / hour",
      value:
        summary.avgCostPerHour !== null
          ? formatCurrency(summary.avgCostPerHour)
          : "—",
      small: false,
    },
    { title: "Best value", value: bestLabel, small: true },
    {
      title: "Most expensive",
      value: `${summary.mostExpensive.concert.concert_name} (${formatCurrency(summary.mostExpensive.total)})`,
      small: true,
    },
    {
      title: "Highest fun",
      value: `${summary.highestFun.concert.concert_name} (${summary.highestFun.concert.fun_rating}/10)`,
      small: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}

function StatCard({
  title,
  value,
  small,
}: {
  title: string;
  value: string;
  small?: boolean;
}) {
  const Icon = STAT_ICONS[title] ?? Calendar;
  return (
    <div className="stat rounded-2xl border border-base-300/50 bg-base-100 shadow-md transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="stat-title text-xs uppercase tracking-wide">{title}</div>
      </div>
      <div
        className={`stat-value line-clamp-2 ${small ? "text-base leading-snug" : "text-2xl"}`}
      >
        {value}
      </div>
    </div>
  );
}

export function getChartData(concerts: Concert[]) {
  return concerts.map((c) => ({
    name: c.concert_name.length > 18 ? `${c.concert_name.slice(0, 16)}…` : c.concert_name,
    fullName: c.concert_name,
    total: getTotalCost(c),
    fun: c.fun_rating,
    funPoints: getFunPointsPer100(c) ?? 0,
  }));
}
