import { z } from "zod";

import { isFeatureKey } from "../constants/features";

export const featureParamSchema = z.object({
  feature: z.string().refine(isFeatureKey, "Unknown feature"),
});

export type FeatureParam = z.infer<typeof featureParamSchema>;
