// import { NextRequest, NextResponse } from 'next/server';
// import { createAdminClient } from '@/lib/supabase/server';

// export async function POST(req: NextRequest) {
//   try {
//     const supabase = await createAdminClient();
//     const { plan, charityId, charityPct, userId } = await req.json();

//     // Activate subscription directly
//     const endDate = new Date();
//     if (plan === 'yearly') {
//       endDate.setFullYear(endDate.getFullYear() + 1);
//     } else {
//       endDate.setMonth(endDate.getMonth() + 1);
//     }

//     await supabase.from('profiles').update({
//       subscription_status: 'active',
//       subscription_plan: plan,
//       subscription_start_date: new Date().toISOString(),
//       subscription_end_date: endDate.toISOString(),
//       charity_id: charityId,
//       charity_contribution_percentage: charityPct,
//     }).eq('id', userId);

//     // Add charity contribution
//     const price = plan === 'yearly' ? 89.99 : 9.99;
//     const amount = price * charityPct / 100;
//     await supabase.from('charity_contributions').insert({
//       user_id: userId,
//       charity_id: charityId,
//       amount,
//       contribution_month: new Date().getMonth() + 1,
//       contribution_year: new Date().getFullYear(),
//     });

//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     console.error('Verify error:', err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }



import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS completely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { plan, charityId, charityPct, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID missing' }, { status: 400 });
    }

    const endDate = new Date();
    if (plan === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const { error: updateError } = await supabaseAdmin.from('profiles').update({
      subscription_status: 'active',
      subscription_plan: plan,
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: endDate.toISOString(),
      charity_id: charityId,
      charity_contribution_percentage: charityPct,
    }).eq('id', userId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Add charity contribution
    if (charityId) {
      const price = plan === 'yearly' ? 89.99 : 9.99;
      const amount = price * charityPct / 100;
      await supabaseAdmin.from('charity_contributions').insert({
        user_id: userId,
        charity_id: charityId,
        amount,
        contribution_month: new Date().getMonth() + 1,
        contribution_year: new Date().getFullYear(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
