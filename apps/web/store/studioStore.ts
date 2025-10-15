import {
  STUDIO_PROJECTS_KEY,
  STUDIO_PROJECT_KEY_PREFIX,
  StudioBlock,
  StudioProjectData,
  StudioProjectMeta,
  defaultBlocks,
  isStudioBlock,
} from "@/lib/studioModel";

const isBrowser = () => typeof window !== "undefined";

const withBrowser = <T>(fn: () => T, fallback: T): T => {
  if (!isBrowser()) return fallback;
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const projectKey = (slug: string) => `${STUDIO_PROJECT_KEY_PREFIX}${slug}`;

export const loadProjects = (): StudioProjectMeta[] =>
  withBrowser(() => {
    const raw = window.localStorage.getItem(STUDIO_PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is StudioProjectMeta =>
          item &&
          typeof item === "object" &&
          typeof item.slug === "string" &&
          typeof item.name === "string" &&
          typeof item.prompt === "string" &&
          typeof item.createdAt === "string"
        )
      : [];
  }, []);

export const saveProjects = (list: StudioProjectMeta[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STUDIO_PROJECTS_KEY, JSON.stringify(list));
};

export const upsertProjectMeta = (meta: StudioProjectMeta) => {
  const existing = loadProjects();
  const filtered = existing.filter((item) => item.slug !== meta.slug);
  saveProjects([meta, ...filtered]);
};

export const getProjectMeta = (slug: string): StudioProjectMeta | null =>
  loadProjects().find((item) => item.slug === slug) ?? null;

export const loadProject = (slug: string): StudioProjectData | null =>
  withBrowser(() => {
    const raw = window.localStorage.getItem(projectKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const blocks: StudioBlock[] = Array.isArray(parsed?.blocks)
      ? parsed.blocks.filter(isStudioBlock)
      : defaultBlocks(parsed?.prompt || "");
    return {
      prompt: typeof parsed?.prompt === "string" ? parsed.prompt : "",
      blocks,
    };
  }, null);

export const saveProject = (slug: string, data: StudioProjectData) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(projectKey(slug), JSON.stringify(data));
};
