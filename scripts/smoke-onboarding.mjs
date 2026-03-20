import { readFileSync } from 'node:fs';

const provider = readFileSync(new URL('../provider/onboarding-provider.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/_layout.tsx', import.meta.url), 'utf8');
const storage = readFileSync(new URL('../libs/onboarding-storage.ts', import.meta.url), 'utf8');
const bundle = readFileSync(new URL('../libs/onboarding-bundle.ts', import.meta.url), 'utf8');

const checks = [
  ['global onboarding provider computes routing target', provider.includes("type RoutingTarget = 'auth' | 'onboarding' | 'tabs'") && provider.includes("const routingTarget: RoutingTarget = !session ? 'auth' : backendOnboardingComplete ? 'tabs' : 'onboarding'")],
  ['provider hydrates cache but reconciles against backend state', provider.includes('getOnboardingStateCache') && provider.includes('Discarded stale onboarding cache because backend reported incomplete onboarding.')],
  ['root layout gates routing from onboarding provider', layout.includes('useOnboardingSession') && layout.includes("routingTarget === 'onboarding'")],
  ['async storage only keeps onboarding state cache key', !storage.includes('modario-onboarding-completed') && storage.includes('modario-onboarding-state-cache')],
  ['bundle loader performs runtime validation', bundle.includes('parseOnboardingBundle(payload)') && bundle.includes('category: categorizeBundleError')],
];

const failed = checks.filter(([, passed]) => !passed);

for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} - ${label}`);
}

if (failed.length) {
  process.exitCode = 1;
}
