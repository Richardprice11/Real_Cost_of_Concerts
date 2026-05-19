import { ConcertsLoader } from "@/components/ConcertsLoader";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";

export default function MyConcertsPage() {
  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="My Concerts"
        subtitle="Every show you have logged, with cost and fun breakdowns."
      />
      <ConcertsLoader mode="list" />
    </PageTransition>
  );
}
