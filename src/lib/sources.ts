import { z } from "astro/zod";

export const sourceSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
});

export type Source = z.infer<typeof sourceSchema>;
