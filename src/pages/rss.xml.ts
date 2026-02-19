import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }) => data.status === 'published');
  const sortedPosts = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'HydroTech J&S - Blog hydrauliczny',
    description: 'Porady hydrauliczne, realizacje projektów i odpowiedzi na pytania. Ogrzewanie podłogowe, kotłownie, instalacje wodne. Witnica i okolice.',
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.seo_description || post.data.description,
      link: `/posts/${post.id.replace('.md', '')}/`,
      categories: [post.data.category, ...(post.data.tags || [])],
    })),
    customData: '<language>pl</language>',
  });
}