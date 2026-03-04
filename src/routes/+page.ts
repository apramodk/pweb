import { getSkills, getExperiences, getEducations } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const [skills, experiences, educations] = await Promise.all([
    getSkills(),
    getExperiences(),
    getEducations(),
  ]);

  return { skills, experiences, educations };
};
