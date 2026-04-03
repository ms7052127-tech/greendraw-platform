import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = await createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.supabaseUserId;
        const plan = session.metadata?.plan;
        const subscriptionId = session.subscription as string;
        if (!userId) break;

        const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const periodStart = new Date(subscription.current_period_start * 1000).toISOString();

        await supabase.from('profiles').update({
          subscription_status: 'active',
          subscription_plan: plan,
          stripe_subscription_id: subscriptionId,
          subscription_start_date: periodStart,
          subscription_end_date: periodEnd,
        }).eq('id', userId);

        // Charity contribution record
        const { data: profile } = await supabase.from('profiles').select('charity_id, charity_contribution_percentage').eq('id', userId).single();
        if (profile?.charity_id) {
          const price = plan === 'yearly' ? 89.99 : 9.99;
          const amount = price * (profile.charity_contribution_percentage || 10) / 100;
          await supabase.from('charity_contributions').insert({
            user_id: userId, charity_id: profile.charity_id, amount,
            contribution_month: new Date().getMonth() + 1,
            contribution_year: new Date().getFullYear(),
          });
          await supabase.rpc('increment_charity_total', { charity_id: profile.charity_id, amount });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription: any = event.data.object;
        const { data: profile } = await supabase.from('profiles').select('id').eq('stripe_subscription_id', subscription.id).single();
        if (!profile) break;
        const status = subscription.status === 'active' ? 'active' : subscription.status === 'canceled' ? 'cancelled' : 'lapsed';
        await supabase.from('profiles').update({
          subscription_status: status,
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq('id', profile.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription: any = event.data.object;
        const { data: profile } = await supabase.from('profiles').select('id').eq('stripe_subscription_id', subscription.id).single();
        if (!profile) break;
        await supabase.from('profiles').update({ subscription_status: 'cancelled' }).eq('id', profile.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice: any = event.data.object;
        const subscriptionId = invoice.subscription as string;
        const { data: profile } = await supabase.from('profiles').select('id').eq('stripe_subscription_id', subscriptionId).single();
        if (!profile) break;
        await supabase.from('profiles').update({ subscription_status: 'lapsed' }).eq('id', profile.id);
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  return NextResponse.json({ received: true });
}
