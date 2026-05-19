"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Concert } from "@/lib/database.types";
import { aggregateCategorySpending, formatCurrency } from "@/lib/metrics";
import { getChartData } from "@/components/DashboardStats";

type DashboardChartsProps = {
  concerts: Concert[];
};

const CHART_COLORS = {
  primary: "oklch(var(--p))",
  secondary: "oklch(var(--s))",
  accent: "oklch(var(--a))",
};

export function DashboardCharts({ concerts }: DashboardChartsProps) {
  const categoryData = aggregateCategorySpending(concerts);
  const concertData = getChartData(concerts);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard title="Spending by cost category">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={categoryData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="total" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Total cost by concert">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={concertData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(v: number) => formatCurrency(v)}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullName ?? ""
              }
            />
            <Bar dataKey="total" fill={CHART_COLORS.secondary} radius={[6, 6, 0, 0]} name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Fun rating by concert">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={concertData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={70} />
            <YAxis domain={[0, 10]} ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} />
            <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""} />
            <Bar dataKey="fun" fill={CHART_COLORS.accent} radius={[6, 6, 0, 0]} name="Fun (1–10)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Fun Points per $100 by concert">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={concertData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={70} />
            <YAxis />
            <Tooltip
              formatter={(v: number) => v.toFixed(2)}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
            />
            <Legend />
            <Bar
              dataKey="funPoints"
              fill={CHART_COLORS.primary}
              radius={[6, 6, 0, 0]}
              name="Fun Points per $100"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card border border-base-300/50 bg-base-100 shadow-md">
      <div className="card-body">
        <h3 className="card-title text-base">{title}</h3>
        <p className="text-xs text-base-content/60">Hover bars for details.</p>
        <div className="mt-2 w-full min-w-[280px] overflow-x-auto">{children}</div>
      </div>
    </section>
  );
}
