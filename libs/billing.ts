const BILLING_API_BASE = 'https://api.modario.io';

export type BillingEntitlement = {
  plan_key: string | null;
  status: string;
  is_entitled: boolean;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
};

export type BillingMeResponse = {
  entitlement: BillingEntitlement;
};

export type BillingPlan = {
  key: string;
  name: string;
  stripe_price_id: string;
  interval: string;
};

export type BillingPlansResponse = {
  billing_plans: BillingPlan[];
};

export type BillingCheckoutResponse = {
  url: string;
};

const authHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
});

export async function getBillingMe(accessToken: string) {
  const response = await fetch(`${BILLING_API_BASE}/billing/me`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(`Failed to load billing entitlement (${response.status})`);
  }

  return (await response.json()) as BillingMeResponse;
}

export async function getBillingPlans(accessToken: string) {
  const response = await fetch(`${BILLING_API_BASE}/billing/plans`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(`Failed to load billing plans (${response.status})`);
  }

  return (await response.json()) as BillingPlansResponse;
}

export async function createBillingCheckoutSession(accessToken: string, planKey: string) {
  const response = await fetch(`${BILLING_API_BASE}/billing/checkout-session`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ plan_key: planKey }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create checkout session (${response.status})`);
  }

  return (await response.json()) as BillingCheckoutResponse;
}
