import { DashboardContent } from "@/components/DashboardContent";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";

export default function DashboardPage() {
  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Your concert spending and fun-at-a-glance."
      />
      <DashboardContent />
    </PageTransition>
  );
}
