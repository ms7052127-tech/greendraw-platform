import { GolfScore, PRIZE_DISTRIBUTION, PRIZE_POOL_PERCENTAGE, PRICING } from '@/types';

/**
 * Generate 5 random winning numbers (1-45, unique)
 */
export function generateRandomNumbers(): number[] {
  const numbers: number[] = [];
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers.sort((a, b) => a - b);
}

/**
 * Generate 5 numbers algorithmically based on score frequency
 * Uses least-frequent scores to give more people a chance
 */
export function generateAlgorithmicNumbers(allScores: number[]): number[] {
  if (allScores.length === 0) return generateRandomNumbers();

  // Count frequency of each score
  const freq: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) freq[i] = 0;
  allScores.forEach(s => { if (freq[s] !== undefined) freq[s]++; });

  // Sort by frequency (ascending = least frequent first)
  const sorted = Object.entries(freq)
    .sort(([, a], [, b]) => a - b)
    .map(([score]) => parseInt(score));

  // Pick 5 from least frequent, with some randomness
  const candidates = sorted.slice(0, 15);
  const numbers: number[] = [];
  while (numbers.length < 5 && candidates.length > 0) {
    const idx = Math.floor(Math.random() * Math.min(candidates.length, 10));
    const n = candidates.splice(idx, 1)[0];
    numbers.push(n);
  }

  // Fill remaining if needed
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }

  return numbers.sort((a, b) => a - b);
}

/**
 * Count how many of a user's numbers match the winning numbers
 */
export function countMatches(userNumbers: number[], winningNumbers: number[]): number {
  return userNumbers.filter(n => winningNumbers.includes(n)).length;
}

/**
 * Determine prize tier from match count
 */
export function getPrizeTier(matchCount: number): '5-match' | '4-match' | '3-match' | null {
  if (matchCount === 5) return '5-match';
  if (matchCount === 4) return '4-match';
  if (matchCount === 3) return '3-match';
  return null;
}

/**
 * Calculate prize pool from subscriber count
 */
export function calculatePrizePool(subscriberCount: number, planBreakdown: { monthly: number; yearly: number } = { monthly: 0, yearly: 0 }) {
  const monthlyRevenue = planBreakdown.monthly * PRICING.monthly;
  const yearlyRevenue = planBreakdown.yearly * (PRICING.yearly / 12);
  const totalRevenue = monthlyRevenue + yearlyRevenue || subscriberCount * PRICING.monthly;

  const total = totalRevenue * PRIZE_POOL_PERCENTAGE;
  return {
    total: parseFloat(total.toFixed(2)),
    jackpot: parseFloat((total * PRIZE_DISTRIBUTION.jackpot).toFixed(2)),
    fourMatch: parseFloat((total * PRIZE_DISTRIBUTION.fourMatch).toFixed(2)),
    threeMatch: parseFloat((total * PRIZE_DISTRIBUTION.threeMatch).toFixed(2)),
  };
}

/**
 * Get a user's 5 numbers from their latest scores
 */
export function getUserNumbersFromScores(scores: GolfScore[]): number[] {
  return scores.slice(0, 5).map(s => s.score);
}

/**
 * Format draw month/year
 */
export function formatDrawPeriod(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
