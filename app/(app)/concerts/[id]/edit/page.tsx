import { EditConcertForm } from "@/components/EditConcertForm";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";

type EditConcertPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditConcertPage({ params }: EditConcertPageProps) {
  const { id } = await params;
  return (
    <PageTransition className="space-y-6">
      <PageHeader title="Edit concert" subtitle="Update this show's details and your costs." />
      <EditConcertForm concertId={id} />
    </PageTransition>
  );
}
