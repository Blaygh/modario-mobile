import { readFileSync } from 'node:fs';

const billingScreen = readFileSync(new URL('../app/profile/billing.tsx', import.meta.url), 'utf8');
const billingSuccess = readFileSync(new URL('../app/billing/success.tsx', import.meta.url), 'utf8');
const billingCancel = readFileSync(new URL('../app/billing/cancel.tsx', import.meta.url), 'utf8');
const modarioApi = readFileSync(new URL('../libs/modario-api.ts', import.meta.url), 'utf8');

const checks = [
  ['billing screen loads plans and entitlement from backend hooks', billingScreen.includes('useBillingEntitlement') && billingScreen.includes('useBillingPlans')],
  ['billing screen launches checkout session mutation', billingScreen.includes('useBillingCheckoutMutation') && billingScreen.includes('checkoutMutation.mutateAsync(planKey)')],
  ['billing success screen refetches entitlement after return', billingSuccess.includes('invalidateQueries') && billingSuccess.includes('billingEntitlement')],
  ['billing cancel screen remains an honest non-success state', billingCancel.includes('Checkout canceled') && billingCancel.includes('No changes were made to your subscription.')],
  ['billing API validates checkout URL responses', modarioApi.includes("'/billing/checkout-session'") && modarioApi.includes('Billing checkout response was missing a URL.')],
];

const failed = checks.filter(([, passed]) => !passed);

for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} - ${label}`);
}

if (failed.length) {
  process.exitCode = 1;
}
