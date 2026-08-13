/**
 * Every feature the guest usage limit applies to, keyed by the same short
 * id used in the route (`/api/usage/:feature`) and stored in
 * `feature_usage.feature`. Mirrored on the frontend (`src/lib/features.ts`)
 * — keep both in sync.
 */
export const FEATURE_LABELS = {
  merge: "Merge PDF",
  split: "Split PDF",
  rotate: "Rotate PDF",
  "extract-pages": "Extract Pages",
  "delete-pages": "Delete Pages",
  protect: "Password Protect",
  watermark: "Watermark",
  "word-to-pdf": "Word to PDF",
  "excel-to-pdf": "Excel to PDF",
  "powerpoint-to-pdf": "PowerPoint to PDF",
  "image-to-pdf": "Image to PDF",
  "pdf-to-image": "PDF to Image",
  "pdf-to-word": "PDF to Word",
  translate: "Translate PDF",
  convert: "Convert PDF",
  compress: "Compress PDF",
  ocr: "OCR",
} as const;

export type FeatureKey = keyof typeof FEATURE_LABELS;

export const FEATURE_KEYS = Object.keys(FEATURE_LABELS) as FeatureKey[];

export function isFeatureKey(value: string): value is FeatureKey {
  return Object.prototype.hasOwnProperty.call(FEATURE_LABELS, value);
}

/** Guests get this many uses of each feature before sign-in is required. */
export const GUEST_FREE_USES = 2;
