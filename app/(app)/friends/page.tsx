import { FriendsContent } from "@/components/FriendsContent";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";

export default function FriendsPage() {
  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="Friends"
        subtitle="See what your friends have logged — same cost and fun details as your concerts."
      />
      <FriendsContent />
    </PageTransition>
  );
}
