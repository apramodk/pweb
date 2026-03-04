import { getSoftwareProjects } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const projects = await getSoftwareProjects();
  return { projects };
};
