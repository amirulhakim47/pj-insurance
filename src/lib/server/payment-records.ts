import fs from 'node:fs/promises';
import path from 'node:path';
import { assertSafeContractNumber } from './contract-number';
import { getDataDir } from './data-dir';

const PAYMENTS_DIR = path.join(getDataDir(), 'payments');

export interface PendingPaymentOrder {
  orderId: string;
  contractNumber: string;
  amount: string;
  createdAt: string;
}

export interface VerifiedPaymentOrder extends PendingPaymentOrder {
  verifiedAt: string;
  transactionId: string;
  submissionConsumed: boolean;
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(PAYMENTS_DIR, { recursive: true });
}

function orderPath(orderId: string): string {
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(orderId)) {
    throw new Error('Invalid order id');
  }
  const base = path.resolve(PAYMENTS_DIR);
  const resolved = path.resolve(base, `${orderId}.json`);
  if (!resolved.startsWith(`${base}${path.sep}`)) {
    throw new Error('Invalid order id');
  }
  return resolved;
}

export async function savePendingPaymentOrder(
  order: PendingPaymentOrder,
): Promise<void> {
  await ensureDir();
  const record: VerifiedPaymentOrder = {
    ...order,
    contractNumber: assertSafeContractNumber(order.contractNumber),
    verifiedAt: '',
    transactionId: '',
    submissionConsumed: false,
  };
  await fs.writeFile(orderPath(order.orderId), JSON.stringify(record, null, 2), 'utf-8');
}

export async function getPaymentOrder(orderId: string): Promise<VerifiedPaymentOrder | null> {
  try {
    const raw = await fs.readFile(orderPath(orderId), 'utf-8');
    return JSON.parse(raw) as VerifiedPaymentOrder;
  } catch {
    return null;
  }
}

export async function markPaymentVerified(
  orderId: string,
  transactionId: string,
): Promise<VerifiedPaymentOrder | null> {
  const existing = await getPaymentOrder(orderId);
  if (!existing) return null;

  const updated: VerifiedPaymentOrder = {
    ...existing,
    verifiedAt: new Date().toISOString(),
    transactionId: transactionId || existing.transactionId,
  };
  await fs.writeFile(orderPath(orderId), JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export async function assertVerifiedPaymentForSubmission(
  orderId: string,
  contractNumber: string,
  paymentAmount: string,
): Promise<void> {
  const safeContract = assertSafeContractNumber(contractNumber);
  const order = await getPaymentOrder(orderId);

  if (!order?.verifiedAt) {
    throw new PaymentVerificationError('Payment has not been verified');
  }
  if (order.submissionConsumed) {
    throw new PaymentVerificationError('Payment already used for submission');
  }
  if (order.contractNumber !== safeContract) {
    throw new PaymentVerificationError('Payment does not match contract');
  }
  const verifiedAmount = Number.parseFloat(order.amount).toFixed(2);
  const submittedAmount = Number.parseFloat(paymentAmount).toFixed(2);
  if (verifiedAmount !== submittedAmount) {
    throw new PaymentVerificationError('Payment amount does not match verified order');
  }
}

export async function consumeVerifiedPayment(orderId: string): Promise<void> {
  const order = await getPaymentOrder(orderId);
  if (!order) return;
  const updated: VerifiedPaymentOrder = { ...order, submissionConsumed: true };
  await fs.writeFile(orderPath(orderId), JSON.stringify(updated, null, 2), 'utf-8');
}

export class PaymentVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentVerificationError';
  }
}
