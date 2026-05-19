import { UpcomingEventsContent } from "@/components/UpcomingEventsContent";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";

export default function UpcomingEventsPage() {
  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="Upcoming Events"
        subtitle="Discover concerts near Oxford, MS and add them to your tracker."
      />
      <UpcomingEventsContent />
    </PageTransition>
  );
}
