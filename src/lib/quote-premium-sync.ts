export async function syncQuotePremiumForPayment(
  contractNumber: string,
  premiumDueRounded: number,
  options: { demo?: boolean } = {},
): Promise<void> {
  const res = await fetch('/api/quote/premium', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contract_number: contractNumber,
      premium_due_rounded: premiumDueRounded.toFixed(2),
      source: options.demo ? 'demo' : 'live',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Could not prepare quotation for payment' }));
    throw new Error(err.message || 'Could not prepare quotation for payment');
  }
}
