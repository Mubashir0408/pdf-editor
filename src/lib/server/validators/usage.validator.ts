import { z } from "zod";

import { isFeatureKey } from "../features";

export const featureParamSchema = z.object({
  feature: z.string().refine(isFeatureKey, "Unknown feature"),
});

export type FeatureParam = z.infer<typeof featureParamSchema>;
