import { NextResponse } from 'next/server';
import { SENANGPAY_CONFIG, generateSenangPayHash } from '@/lib/senangpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { detail, amount, orderId, name, email, phone } = body;

    if (!detail || !amount || !orderId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Ensure amount is formatted correctly (2 decimal places)
    const formattedAmount = parseFloat(amount).toFixed(2);
    
    const hash = generateSenangPayHash(detail, formattedAmount, orderId);

    return NextResponse.json({
      url: SENANGPAY_CONFIG.url,
      merchantId: SENANGPAY_CONFIG.merchantId,
      detail,
      amount: formattedAmount,
      orderId,
      hash,
      name,
      email,
      phone,
    });
  } catch (error) {
    console.error('Error generating payment parameters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

