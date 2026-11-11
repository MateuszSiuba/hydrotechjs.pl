import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    // Preserve historical URLs, including the existing Polish filename.
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
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
    gallery: z.array(z.object({ image: z.string(), alt: z.string() })).optional(),
    comparisons: z
      .array(
        z.object({
          title: z.string(),
          format: z.enum(['square', 'portrait']).default('square'),
          before: z.object({ image: z.string(), alt: z.string() }),
          after: z.object({ image: z.string(), alt: z.string() }),
        }),
      )
      .optional(),
    features: z.array(z.string()).optional(),
  }),
});

export const collections = { posts };
