import { createQuoteUpdateGate } from '@/lib/quote-update-gate';

describe('createQuoteUpdateGate', () => {
  it('skips a request identical to the one in flight or last applied', () => {
    const gate = createQuoteUpdateGate();
    const first = gate.begin('payload-a');
    expect(first).not.toBeNull();
    expect(gate.begin('payload-a')).toBeNull();
    gate.settle(first!, true);
    expect(gate.begin('payload-a')).toBeNull();
  });

  it('only treats the newest request as current', () => {
    const gate = createQuoteUpdateGate();
    const older = gate.begin('payload-a')!;
    const newer = gate.begin('payload-b')!;
    expect(gate.isCurrent(older)).toBe(false);
    expect(gate.isCurrent(newer)).toBe(true);
  });

  it('allows retrying the same payload after a failure', () => {
    const gate = createQuoteUpdateGate();
    const ticket = gate.begin('payload-a')!;
    gate.settle(ticket, false);
    expect(gate.begin('payload-a')).not.toBeNull();
  });

  it('a stale failure does not unlock the newer payload', () => {
    const gate = createQuoteUpdateGate();
    const older = gate.begin('payload-a')!;
    gate.begin('payload-b');
    gate.settle(older, false);
    expect(gate.begin('payload-b')).toBeNull();
  });

  it('reset allows the same payload again for a fresh quotation', () => {
    const gate = createQuoteUpdateGate();
    const ticket = gate.begin('payload-a')!;
    gate.settle(ticket, true);
    gate.reset();
    expect(gate.begin('payload-a')).not.toBeNull();
  });
});
