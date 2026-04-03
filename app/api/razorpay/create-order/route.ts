import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan, charityId, charityPct } = await req.json();

    const amount = plan === 'yearly' ? 89.99 : 9.99;
    const amountInPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'GBP',
      receipt: `order_${user.id}_${Date.now()}`,
      notes: {
        userId: user.id,
        plan,
        charityId,
        charityPct: charityPct.toString(),
      },
    });

    return NextResponse.json({ orderId: order.id, amount: amountInPaise, currency: 'GBP' });
  } catch (err: any) {
    console.error('Razorpay order error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
