import { getHciProjects } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const projects = await getHciProjects();
  return { projects };
};
