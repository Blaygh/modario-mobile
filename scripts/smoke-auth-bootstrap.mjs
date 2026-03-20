import { readFileSync } from 'node:fs';

const authProvider = readFileSync(new URL('../provider/auth-provider.tsx', import.meta.url), 'utf8');
const rootLayout = readFileSync(new URL('../app/_layout.tsx', import.meta.url), 'utf8');

const checks = [
  ['auth provider clears onboarding cache on account changes', authProvider.includes('clearOnboardingStateCache') && authProvider.includes('previousUserIdRef')],
  ['auth provider clears React Query cache on sign out', authProvider.includes('queryClient.clear()') && authProvider.includes('signOut = async')],
  ['root layout shows explicit bootstrap error UI', rootLayout.includes('AppBootError') && rootLayout.includes('We couldn’t verify your onboarding state.')],
  ['root layout waits for routing readiness before redirecting', rootLayout.includes('isRoutingReady') && rootLayout.includes('if (!isRoutingReady)')],
];

const failed = checks.filter(([, passed]) => !passed);

for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} - ${label}`);
}

if (failed.length) {
  process.exitCode = 1;
}
