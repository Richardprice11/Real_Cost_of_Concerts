export function getFunRatingLabel(rating: number): string {
  if (rating <= 2) return "Rough night";
  if (rating <= 4) return "Not great";
  if (rating <= 6) return "It was okay";
  if (rating <= 8) return "Pretty fun";
  return "Best time ever!";
}

export function getFunRatingBadgeClass(rating: number): string {
  if (rating <= 4) return "badge-neutral";
  if (rating <= 6) return "badge-warning";
  if (rating <= 8) return "badge-info";
  return "badge-success";
}
