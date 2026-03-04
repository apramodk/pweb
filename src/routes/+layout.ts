import {
  getSkills,
  getExperiences,
  getSoftwareProjects,
  getResearchPositions,
  getHciProjects,
  getWritings,
} from '$lib/api';
import type { LayoutLoad } from './$types';

export const prerender = true;

interface SearchItem {
  title: string;
  subtitle: string;
  category: string;
  href: string;
}

export const load: LayoutLoad = async () => {
  const [skills, experiences, softwareProjects, researchPositions, hciProjects, writings] =
    await Promise.all([
      getSkills(),
      getExperiences(),
      getSoftwareProjects(),
      getResearchPositions(),
      getHciProjects(),
      getWritings(),
    ]);

  const searchItems: SearchItem[] = [
    // Static pages
    { title: 'Home', subtitle: 'Main page', category: 'Pages', href: '/' },
    { title: 'HCI & Embedded Systems', subtitle: 'Capacitive touch, IoT, IMU drone controller', category: 'Pages', href: '/HCI' },
    { title: 'Software Projects', subtitle: 'AI tools, macOS apps, browser extensions', category: 'Pages', href: '/software' },
    { title: 'Research', subtitle: 'Neuromorphic computing, robotics, HCI', category: 'Pages', href: '/research' },
    // Experience
    ...experiences.map((e) => ({
      title: `${e.organization} — ${e.job_title}`,
      subtitle: e.description || '',
      category: 'Experience',
      href: '/',
    })),
    // Software projects
    ...softwareProjects.map((p) => ({
      title: p.title,
      subtitle: `${p.description.slice(0, 80)}... · ${(p.tech || []).join(', ')}`,
      category: 'Projects',
      href: '/software',
    })),
    // HCI projects
    ...hciProjects.map((p) => ({
      title: p.title,
      subtitle: p.short_description || '',
      category: 'HCI',
      href: '/HCI',
    })),
    // Research positions
    ...researchPositions.map((r) => ({
      title: r.lab_name,
      subtitle: `${r.role} · ${(r.topics || []).join(', ')}`,
      category: 'Research',
      href: '/research',
    })),
    // Writings
    ...writings.map((w) => ({
      title: w.title,
      subtitle: w.abstract?.slice(0, 80) || '',
      category: 'Writing',
      href: `/research/${w.slug}`,
    })),
    // Skills (grouped)
    ...(skills.length > 0
      ? [
          {
            title: skills.map((s) => s.name).join(', '),
            subtitle: 'Technologies and skills',
            category: 'Skills',
            href: '/',
          },
        ]
      : []),
  ];

  return { searchItems };
};
