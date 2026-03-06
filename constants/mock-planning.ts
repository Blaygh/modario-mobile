import { STARTER_OUTFITS } from './mock-outfits';

export type PlannedOutfit = {
  date: string;
  outfitId: string;
};

export const PLANNED_OUTFITS: PlannedOutfit[] = [
  { date: '2026-03-07', outfitId: STARTER_OUTFITS[0].id },
  { date: '2026-03-08', outfitId: STARTER_OUTFITS[2].id },
];
