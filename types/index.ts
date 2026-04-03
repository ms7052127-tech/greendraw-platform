// export type UserRole = 'subscriber' | 'admin';
// export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed';
// export type SubscriptionPlan = 'monthly' | 'yearly';
// export type DrawStatus = 'pending' | 'simulated' | 'published';
// export type DrawType = 'random' | 'algorithmic';
// export type PrizeTier = '5-match' | '4-match' | '3-match';
// export type VerificationStatus = 'pending' | 'approved' | 'rejected';
// export type PaymentStatus = 'pending' | 'paid';

// export interface Profile {
//   id: string;
//   email: string;
//   full_name: string | null;
//   avatar_url: string | null;
//   role: UserRole;
//   subscription_status: SubscriptionStatus;
//   subscription_plan: SubscriptionPlan | null;
//   subscription_start_date: string | null;
//   subscription_end_date: string | null;
//   stripe_customer_id: string | null;
//   stripe_subscription_id: string | null;
//   charity_id: string | null;
//   charity_contribution_percentage: number;
//   created_at: string;
//   updated_at: string;
//   charity?: Charity;
// }

// export interface Charity {
//   id: string;
//   name: string;
//   description: string | null;
//   image_url: string | null;
//   website_url: string | null;
//   is_featured: boolean;
//   is_active: boolean;
//   total_raised: number;
//   upcoming_events: CharityEvent[];
//   created_at: string;
//   updated_at: string;
// }

// export interface CharityEvent {
//   title: string;
//   date: string;
//   description: string;
//   location?: string;
// }

// export interface GolfScore {
//   id: string;
//   user_id: string;
//   score: number;
//   played_at: string;
//   created_at: string;
// }

// export interface Draw {
//   id: string;
//   draw_month: number;
//   draw_year: number;
//   status: DrawStatus;
//   draw_type: DrawType;
//   winning_numbers: number[];
//   total_prize_pool: number;
//   jackpot_amount: number;
//   four_match_amount: number;
//   three_match_amount: number;
//   jackpot_rolled_over: boolean;
//   rolled_over_amount: number;
//   published_at: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface DrawEntry {
//   id: string;
//   draw_id: string;
//   user_id: string;
//   numbers_played: number[];
//   match_count: number;
//   is_winner: boolean;
//   prize_tier: PrizeTier | null;
//   prize_amount: number | null;
//   created_at: string;
// }

// export interface Winner {
//   id: string;
//   draw_id: string;
//   user_id: string;
//   entry_id: string;
//   prize_tier: PrizeTier;
//   prize_amount: number;
//   verification_status: VerificationStatus;
//   proof_url: string | null;
//   payment_status: PaymentStatus;
//   admin_notes: string | null;
//   submitted_at: string | null;
//   reviewed_at: string | null;
//   paid_at: string | null;
//   created_at: string;
//   profile?: Profile;
//   draw?: Draw;
// }

// export interface CharityContribution {
//   id: string;
//   user_id: string;
//   charity_id: string;
//   amount: number;
//   contribution_month: number | null;
//   contribution_year: number | null;
//   created_at: string;
// }

// // Pricing
// export const PRICING = {
//   monthly: 9.99,
//   yearly: 89.99,
//   yearlyMonthly: 7.5,
// } as const;

// export const PRIZE_POOL_PERCENTAGE = 0.5; // 50% of subscription
// export const CHARITY_MIN_PERCENTAGE = 10;

// export const PRIZE_DISTRIBUTION = {
//   jackpot: 0.40,
//   fourMatch: 0.35,
//   threeMatch: 0.25,
// } as const;



export type UserRole = 'subscriber' | 'admin';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed';
export type SubscriptionPlan = 'monthly' | 'yearly';
export type DrawStatus = 'pending' | 'simulated' | 'published';
export type DrawType = 'random' | 'algorithmic';
export type PrizeTier = '5-match' | '4-match' | '3-match';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'paid';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlan | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  razorpay_customer_id?: string | null;
  charity_id: string | null;
  charity_contribution_percentage: number;
  created_at: string;
  updated_at: string;
  charity?: Charity;
}

export interface Charity {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  total_raised: number;
  upcoming_events: CharityEvent[];
  created_at: string;
  updated_at: string;
}

export interface CharityEvent {
  title: string;
  date: string;
  description: string;
  location?: string;
}

export interface GolfScore {
  id: string;
  user_id: string;
  score: number;
  played_at: string;
  created_at: string;
}

export interface Draw {
  id: string;
  draw_month: number;
  draw_year: number;
  status: DrawStatus;
  draw_type: DrawType;
  winning_numbers: number[];
  total_prize_pool: number;
  jackpot_amount: number;
  four_match_amount: number;
  three_match_amount: number;
  jackpot_rolled_over: boolean;
  rolled_over_amount: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  numbers_played: number[];
  match_count: number;
  is_winner: boolean;
  prize_tier: PrizeTier | null;
  prize_amount: number | null;
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  entry_id: string;
  prize_tier: PrizeTier;
  prize_amount: number;
  verification_status: VerificationStatus;
  proof_url: string | null;
  payment_status: PaymentStatus;
  admin_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  paid_at: string | null;
  created_at: string;
  profile?: Profile;
  draw?: Draw;
}

export interface CharityContribution {
  id: string;
  user_id: string;
  charity_id: string;
  amount: number;
  contribution_month: number | null;
  contribution_year: number | null;
  created_at: string;
}

export const PRICING = {
  monthly: 9.99,
  yearly: 89.99,
  yearlyMonthly: 7.5,
} as const;

export const PRIZE_POOL_PERCENTAGE = 0.5;
export const CHARITY_MIN_PERCENTAGE = 10;

export const PRIZE_DISTRIBUTION = {
  jackpot: 0.40,
  fourMatch: 0.35,
  threeMatch: 0.25,
} as const;
