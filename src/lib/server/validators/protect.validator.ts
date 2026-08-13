import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

export const protectBodySchema = z
  .object({
    fileId: storedFileIdSchema,
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm the password"),
    allowPrinting: z.boolean().default(true),
    allowCopying: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProtectBody = z.infer<typeof protectBodySchema>;
