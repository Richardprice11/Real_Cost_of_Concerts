"use client";

import { ConcertsLoader } from "@/components/ConcertsLoader";
import { DashboardStats } from "@/components/DashboardStats";
import { DashboardCharts } from "@/components/DashboardCharts";
import { SectionHeading } from "@/components/SectionHeading";
import type { Concert } from "@/lib/database.types";

function DashboardWithData({ concerts }: { concerts: Concert[] }) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <SectionHeading
          title="Your numbers"
          description="Quick stats from every concert you've logged."
        />
        <DashboardStats concerts={concerts} />
      </section>
      <section className="space-y-4">
        <SectionHeading
          title="Charts"
          description="See spending patterns and which shows were the best value."
        />
        <DashboardCharts concerts={concerts} />
      </section>
    </div>
  );
}

export function DashboardContent() {
  return <ConcertsLoader mode="dashboard" render={DashboardWithData} />;
}
