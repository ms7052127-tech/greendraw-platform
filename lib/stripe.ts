import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
  yearly: process.env.STRIPE_YEARLY_PRICE_ID!,
};

export async function createOrRetrieveCustomer(email: string, userId: string, existingCustomerId?: string | null) {
  if (existingCustomerId) {
    return existingCustomerId;
  }
  const customer = await stripe.customers.create({
    email,
    metadata: { supabaseUserId: userId },
  });
  return customer.id;
}
