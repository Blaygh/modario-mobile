import { readFileSync } from 'node:fs';

const wardrobeImports = readFileSync(new URL('../libs/wardrobe-imports.ts', import.meta.url), 'utf8');
const processingScreen = readFileSync(new URL('../app/wardrobe/processing.tsx', import.meta.url), 'utf8');
const reviewScreen = readFileSync(new URL('../app/wardrobe/review.tsx', import.meta.url), 'utf8');
const outfitDetail = readFileSync(new URL('../app/outfit/[id].tsx', import.meta.url), 'utf8');
const planPicker = readFileSync(new URL('../app/plan/picker.tsx', import.meta.url), 'utf8');
const plannerDay = readFileSync(new URL('../app/plan/day/[date].tsx', import.meta.url), 'utf8');

const checks = [
  ['wardrobe uploads use signed upload URLs', wardrobeImports.includes('createSignedUploadUrl') && wardrobeImports.includes('uploadToSignedUrl')],
  ['processing screen tracks exact import session ids', processingScreen.includes("useImportSession(sessionId)") && processingScreen.includes("params: { sessionId }")],
  ['review flow sends include/exclude and role overrides', reviewScreen.includes('roleOverride') && reviewScreen.includes('include: boolean')],
  ['candidate outfit detail shows llm suggestions and real save/plan actions', outfitDetail.includes('LLM suggestions') && outfitDetail.includes('Save outfit') && outfitDetail.includes('Plan outfit')],
  ['planning a candidate auto-saves before creating a plan', planPicker.includes("params.sourceMode === 'candidate'") && planPicker.includes('saveCandidateMutation.mutateAsync')],
  ['planned day detail supports slot and note editing plus removal', plannerDay.includes('Move to slot') && plannerDay.includes('Notes') && plannerDay.includes('Remove planned outfit?')],
];

const failed = checks.filter(([, passed]) => !passed);

for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} - ${label}`);
}

if (failed.length) {
  process.exitCode = 1;
}
