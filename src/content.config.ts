import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    lastmod: z.coerce.date().optional(),
    category: z.enum(['realizacje', 'porady', 'pytania']).optional(),
    status: z.enum(['published', 'draft']).default('published'),
    description: z.string(),
    seo_description: z.string().optional(),
    featured_image: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    gallery: z.array(z.object({
      image: z.string(),
      alt: z.string(),
    })).optional(),
    features: z.array(z.string()).optional(),
  }),
});

export const collections = { posts };
