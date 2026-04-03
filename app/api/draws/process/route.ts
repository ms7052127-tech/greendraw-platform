import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { countMatches, getPrizeTier } from '@/lib/draw-engine';

export async function POST(req: NextRequest) {
  try {
    const { drawId } = await req.json();
    const supabase = await createAdminClient();

    // Get draw details
    const { data: draw } = await supabase.from('draws').select('*').eq('id', drawId).single();
    if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 });

    // Get all active subscribers with 5 scores
    const { data: profiles } = await supabase.from('profiles').select('id').eq('subscription_status', 'active');
    const subscriberIds = profiles?.map(p => p.id) || [];

    if (subscriberIds.length === 0) {
      return NextResponse.json({ message: 'No active subscribers', processed: 0 });
    }

    // Get scores for all subscribers
    const { data: allScores } = await supabase.from('golf_scores').select('user_id, score').in('user_id', subscriberIds);

    // Group by user
    const userScoreMap: Record<string, number[]> = {};
    allScores?.forEach(s => {
      if (!userScoreMap[s.user_id]) userScoreMap[s.user_id] = [];
      userScoreMap[s.user_id].push(s.score);
    });

    // Only include users with exactly 5 scores
    const eligibleUsers = Object.entries(userScoreMap).filter(([, scores]) => scores.length === 5);

    // Count winners per tier
    const tierWinners: Record<string, string[]> = { '5-match': [], '4-match': [], '3-match': [] };

    // Create draw entries
    const entries = eligibleUsers.map(([userId, scores]) => {
      const matches = countMatches(scores, draw.winning_numbers);
      const tier = getPrizeTier(matches);
      if (tier) tierWinners[tier].push(userId);
      return {
        draw_id: drawId,
        user_id: userId,
        numbers_played: scores,
        match_count: matches,
        is_winner: tier !== null,
        prize_tier: tier,
        prize_amount: null, // calculated below
      };
    });

    // Calculate prize amounts per winner
    const jackpotPerWinner = tierWinners['5-match'].length > 0 ? (draw.jackpot_amount + (draw.rolled_over_amount || 0)) / tierWinners['5-match'].length : 0;
    const fourMatchPerWinner = tierWinners['4-match'].length > 0 ? draw.four_match_amount / tierWinners['4-match'].length : 0;
    const threeMatchPerWinner = tierWinners['3-match'].length > 0 ? draw.three_match_amount / tierWinners['3-match'].length : 0;

    const entriesWithPrizes = entries.map(entry => ({
      ...entry,
      prize_amount: entry.prize_tier === '5-match' ? jackpotPerWinner : entry.prize_tier === '4-match' ? fourMatchPerWinner : entry.prize_tier === '3-match' ? threeMatchPerWinner : null,
    }));

    // Upsert entries
    if (entriesWithPrizes.length > 0) {
      await supabase.from('draw_entries').upsert(entriesWithPrizes, { onConflict: 'draw_id,user_id' });
    }

    // Create winner records
    const winnerEntries = entriesWithPrizes.filter(e => e.is_winner && e.prize_amount);
    for (const entry of winnerEntries) {
      // Get the inserted entry id
      const { data: insertedEntry } = await supabase.from('draw_entries').select('id').eq('draw_id', drawId).eq('user_id', entry.user_id).single();
      if (!insertedEntry) continue;

      await supabase.from('winners').upsert({
        draw_id: drawId,
        user_id: entry.user_id,
        entry_id: insertedEntry.id,
        prize_tier: entry.prize_tier,
        prize_amount: entry.prize_amount,
      }, { onConflict: 'draw_id,user_id' });
    }

    return NextResponse.json({
      message: 'Draw processed successfully',
      processed: eligibleUsers.length,
      winners: {
        jackpot: tierWinners['5-match'].length,
        fourMatch: tierWinners['4-match'].length,
        threeMatch: tierWinners['3-match'].length,
      },
    });
  } catch (err: any) {
    console.error('Draw processing error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
