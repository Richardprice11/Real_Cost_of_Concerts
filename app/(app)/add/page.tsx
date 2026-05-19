import { AddConcertForm } from "@/components/AddConcertForm";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";

export default function AddConcertPage() {
  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="Add Concert"
        subtitle="Log a show you attended — costs and fun rating included."
      />
      <AddConcertForm />
    </PageTransition>
  );
}
