import { defineCollection, z } from "astro:content";

const validTags = z.enum([
  "hardware",
  "linux",
  "coding",
  "webdev",
  "ai",
  "technology",
])

const blogCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string().refine(str => str.length <= 60, {
        message: "Title must be less than 60 characters long!",
      }),
      description: z.string().refine(
        (desc) => desc.length >= 125 && desc.length <= 160,
        (desc) => ({
          message: `Description must be between 125 and 160 characters long! Currently ${desc.length} characters long.`,
        })
      ),
      heroImageAlt: z.string().optional(),
      heroImage: image().refine((img) => img.width >= 1080, {
        message: "Cover image must be at least 1080 pixels wide!",
      }),
      publishDate: z.date().transform((dte: Date) => dte.toISOString()),
      updateDate: z.date().transform((dte: Date) => dte.toISOString()).optional(),
      path: z.string(),
      oldPermalink: z.string().optional(),
      tags: z.array(validTags).optional(),
    }),
});

export const collections = {
  blog: blogCollection,
};
