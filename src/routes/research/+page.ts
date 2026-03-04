import { getResearchPositions, getWritings } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const [positions, writings] = await Promise.all([
    getResearchPositions(),
    getWritings(),
  ]);

  return { positions, writings };
};
