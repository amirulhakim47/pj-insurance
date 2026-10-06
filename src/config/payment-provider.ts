export type PaymentProvider = 'stripe' | 'senangpay';

export function getPaymentProvider(): PaymentProvider {
  const value = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER?.toLowerCase();
  if (value === 'senangpay') return 'senangpay';
  return 'stripe';
}

export function isStripePayment(): boolean {
  return getPaymentProvider() === 'stripe';
}
