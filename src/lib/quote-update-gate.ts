/**
 * Coalesces PUT /quote calls: an identical payload already in flight (or last applied) is skipped,
 * and only the newest request's response may be applied to the UI.
 */
export interface QuoteUpdateGate {
  /** Returns a ticket, or null when this payload is already in flight / applied. */
  begin(payloadKey: string): number | null;
  isCurrent(ticket: number): boolean;
  settle(ticket: number, succeeded: boolean): void;
  reset(): void;
}

export function createQuoteUpdateGate(): QuoteUpdateGate {
  let latestTicket = 0;
  let latestKey: string | null = null;

  return {
    begin(payloadKey) {
      if (payloadKey === latestKey) return null;
      latestTicket += 1;
      latestKey = payloadKey;
      return latestTicket;
    },
    isCurrent(ticket) {
      return ticket === latestTicket;
    },
    settle(ticket, succeeded) {
      if (!succeeded && ticket === latestTicket) latestKey = null;
    },
    reset() {
      latestTicket += 1;
      latestKey = null;
    },
  };
}
