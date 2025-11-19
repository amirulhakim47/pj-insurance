import { NextResponse } from 'next/server';
import { verifySenangPayHash } from '@/lib/senangpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { status_id, order_id, transaction_id, msg, hash } = body;

    if (!status_id || !order_id || !hash) {
      return NextResponse.json(
        { isValid: false, error: 'Missing parameters' },
        { status: 400 }
      );
    }

    const isValid = verifySenangPayHash(status_id, order_id, transaction_id || '', msg || '', hash);

    return NextResponse.json({ isValid });
  } catch (error) {
    console.error('Hash verification error:', error);
    return NextResponse.json(
      { isValid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

