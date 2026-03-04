import { getWritingBySlug, getAllWritingSlugs } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const writing = await getWritingBySlug(params.slug);
  if (!writing) throw error(404, 'Writing not found');
  return { writing };
};

export const entries = async () => {
  const slugs = await getAllWritingSlugs();
  return slugs.map((slug) => ({ slug }));
};
