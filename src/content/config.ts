import { defineCollection, z } from "astro:content";
import { tags } from "../utils/blogTag";

const blogCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string().refine((str) => str.length <= 60, {
        message: "Title must be less than 60 characters long!",
      }),
      description: z.string().refine(
        (desc) => desc.length >= 125 && desc.length <= 160,
        (desc) => ({
          message: `Description must be between 125 and 160 characters long! Currently ${desc.length} characters long.`,
        })
      ),
      heroImageAlt: z.string(),
      heroImage: image().refine((img) => img.width >= 1080, {
        message: "Cover image must be at least 1080 pixels wide!",
      }),
      publishDate: z.string().transform((str) => new Date(str)),
      updateDate: z
        .string()
        .transform((str) => new Date(str))
        .optional(),
      path: z.string(),
      oldPermalink: z.string().optional(),
      tags: z.array(z.string().refine((tag) => tags.includes(tag), {
        message: "Invalid tag! Please choose from the following: " + tags.join(", ")
      })),
    }),
});

export const collections = {
  blog: blogCollection,
};
