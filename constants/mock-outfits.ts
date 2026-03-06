export type OutfitItem = {
  id: string;
  label: string;
  type: 'Top' | 'Bottom' | 'Shoes' | 'Accessory';
};

export type Outfit = {
  id: string;
  title: string;
  occasion: string;
  palette: string[];
  notes: string;
  image: string;
  items: OutfitItem[];
};

export type StyleTasteCard = {
  id: string;
  title: string;
  image: string;
};

export const STARTER_OUTFITS: Outfit[] = [
  {
    id: 'starter-1',
    title: 'Minimal City Layers',
    occasion: 'Casual',
    palette: ['#1F2937', '#E5E7EB', '#9CA3AF'],
    notes: 'Balanced neutrals with a sharp silhouette for daily wear.',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80',
    items: [
      { id: 'i1', label: 'Structured black blazer', type: 'Top' },
      { id: 'i2', label: 'White tee', type: 'Top' },
      { id: 'i3', label: 'Straight charcoal trousers', type: 'Bottom' },
      { id: 'i4', label: 'Chunky loafers', type: 'Shoes' },
    ],
  },
  {
    id: 'starter-2',
    title: 'Soft Weekend Set',
    occasion: 'Work',
    palette: ['#C084FC', '#F3E8FF', '#6B7280'],
    notes: 'Relaxed knit textures that still look polished.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    items: [
      { id: 'i5', label: 'Lilac knit cardigan', type: 'Top' },
      { id: 'i6', label: 'Light grey pleated pants', type: 'Bottom' },
      { id: 'i7', label: 'White sneakers', type: 'Shoes' },
      { id: 'i8', label: 'Silver hoop earrings', type: 'Accessory' },
    ],
  },
  {
    id: 'starter-3',
    title: 'Night Out Contrast',
    occasion: 'Night Out',
    palette: ['#111827', '#BE123C', '#FBBF24'],
    notes: 'A punchy contrast set for evenings and events.',
    image: 'https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=900&q=80',
    items: [
      { id: 'i9', label: 'Black fitted top', type: 'Top' },
      { id: 'i10', label: 'Red satin midi skirt', type: 'Bottom' },
      { id: 'i11', label: 'Black ankle boots', type: 'Shoes' },
      { id: 'i12', label: 'Gold clutch', type: 'Accessory' },
    ],
  },
];

export const STYLE_TASTE_CARDS: StyleTasteCard[] = [
  { id: 'style-1', title: 'Smart Casual', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80' },
  { id: 'style-2', title: 'Streetwear', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80' },
  { id: 'style-3', title: 'Tailored', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80' },
  { id: 'style-4', title: 'Edgy', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80' },
  { id: 'style-5', title: 'Classic', image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=700&q=80' },
  { id: 'style-6', title: 'Trendy', image: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=700&q=80' },
  { id: 'style-7', title: 'Athleisure', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80' },
  { id: 'style-8', title: 'Sporty', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=700&q=80' },
];
