/** Per-person ticket share: (ticket_cost + ticket_fees) / attendee count */
export function getPerPersonTicketCost(
  ticketCost: number,
  ticketFees: number,
  attendeeCount: number
): number {
  if (attendeeCount < 1) return 0;
  return (ticketCost + ticketFees) / attendeeCount;
}
