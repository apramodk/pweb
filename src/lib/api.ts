/**
 * Strapi API client for build-time data fetching.
 * At build time, SvelteKit calls these to pull CMS content and bake it into static HTML.
 */

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN || '';

interface StrapiResponse<T> {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}

interface StrapiSingleResponse<T> {
  data: T;
}

async function strapiGet<T>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  const url = new URL(`/api/${endpoint}`, STRAPI_URL);
  // Always fetch all entries
  url.searchParams.set('pagination[pageSize]', '100');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {},
  });

  if (!res.ok) {
    throw new Error(`Strapi GET ${endpoint} failed: ${res.status} ${res.statusText}`);
  }

  const json: StrapiResponse<T> = await res.json();
  return json.data;
}

async function strapiGetOne<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`/api/${endpoint}`, STRAPI_URL);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {},
  });

  if (!res.ok) {
    throw new Error(`Strapi GET ${endpoint} failed: ${res.status} ${res.statusText}`);
  }

  const json: StrapiSingleResponse<T> = await res.json();
  return json.data;
}

// ── Types ──────────────────────────────────────────────────────────────

export interface Skill {
  id: number;
  documentId: string;
  name: string;
  sort_order: number;
}

export interface Experience {
  id: number;
  documentId: string;
  job_title: string;
  organization: string;
  team: string | null;
  start_date: string;
  end_date: string | null;
  location: string;
  description: string;
  color: string;
  sort_order: number;
}

export interface Education {
  id: number;
  documentId: string;
  degree: string;
  institution: string;
  graduation_date: string;
  location: string;
  color: string;
  sort_order: number;
}

export interface SoftwareProject {
  id: number;
  documentId: string;
  title: string;
  description: string;
  detail: string;
  tech: string[];
  github_url: string;
  sort_order: number;
}

export interface ResearchPosition {
  id: number;
  documentId: string;
  lab_name: string;
  institution: string;
  role: string;
  period: string;
  location: string;
  description: string;
  topics: string[];
  sort_order: number;
}

export interface CodeBlock {
  id: string;
  label: string;
  language: string;
  code: string;
}

export interface HciProject {
  id: number;
  documentId: string;
  title: string;
  short_description: string;
  content: string;
  youtube_urls: string[];
  local_videos: string[];
  image_indices: number[];
  code_blocks: CodeBlock[];
  sort_order: number;
}

export interface Writing {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  abstract: string;
  content: string;
  authors: string[];
  published_date: string;
  tags: string[];
  sort_order: number;
}

// ── Fetchers ───────────────────────────────────────────────────────────

export function getSkills() {
  return strapiGet<Skill>('skills', { 'sort[0]': 'sort_order:asc' });
}

export function getExperiences() {
  return strapiGet<Experience>('experiences', { 'sort[0]': 'sort_order:asc' });
}

export function getEducations() {
  return strapiGet<Education>('educations', { 'sort[0]': 'sort_order:asc' });
}

export function getSoftwareProjects() {
  return strapiGet<SoftwareProject>('software-projects', { 'sort[0]': 'sort_order:asc' });
}

export function getResearchPositions() {
  return strapiGet<ResearchPosition>('research-positions', { 'sort[0]': 'sort_order:asc' });
}

export function getHciProjects() {
  return strapiGet<HciProject>('hci-projects', { 'sort[0]': 'sort_order:asc' });
}

export function getWritings() {
  return strapiGet<Writing>('writings', {
    'sort[0]': 'published_date:desc',
    'filters[publishedAt][$notNull]': 'true',
  });
}

export function getWritingBySlug(slug: string) {
  return strapiGet<Writing>('writings', {
    'filters[slug][$eq]': slug,
    'filters[publishedAt][$notNull]': 'true',
  }).then((items) => items[0] ?? null);
}

export function getAllWritingSlugs() {
  return strapiGet<Writing>('writings', {
    'fields[0]': 'slug',
    'filters[publishedAt][$notNull]': 'true',
  }).then((items) => items.map((w) => w.slug));
}
