import { useRouter } from 'next/router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

type Project = {
  slug: string;
  name: string;
  prompt: string;
  createdAt: string;
};

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 60) || 'project'
  );
}

export default function Home() {
  const [value, setValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    setIsSending(true);

    const name = trimmed;
    const slugBase = slugify(name);
    const slug = slugBase + '-' + Math.random().toString(36).slice(2, 7);

    const project: Project = {
      slug,
      name,
      prompt: trimmed,
      createdAt: new Date().toISOString(),
    };

    const key = 'ai_build_flow_projects';
    const existing = JSON.parse(localStorage.getItem(key) || '[]') as Project[];
    localStorage.setItem(key, JSON.stringify([project, ...existing]));

    router.push(`/studio/${slug}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_600px_at_50%_30%,rgba(120,119,198,0.18),transparent_65%)]" />
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-20 text-foreground">
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center rounded-full border border-border/60 bg-card/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Launch faster
          </span>
          <h1 className="text-balance text-4xl font-bold leading-tight sm:text-5xl">
            Build something <span className="text-primary">simple</span> in minutes
          </h1>
          <p className="text-balance text-base text-muted-foreground sm:text-lg">
            Describe what you want. We’ll open a studio with a live preview so you can iterate
            instantly.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-glow backdrop-blur sm:flex-row"
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. A simple investing dashboard with a watchlist and market cards"
            className="flex-1 rounded-xl border border-transparent bg-background/30 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground shadow-inner focus:border-border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Button
            type="submit"
            disabled={isSending || !value.trim()}
            className="h-12 shrink-0 rounded-xl px-6 text-base font-semibold shadow-lg sm:h-auto"
          >
            {isSending ? 'Opening…' : 'Create'}
          </Button>
        </form>

        <RecentProjects />
      </div>
    </main>
  );
}

function RecentProjects() {
  const router = useRouter();
  const projects =
    (typeof window !== 'undefined' &&
      JSON.parse(localStorage.getItem('ai_build_flow_projects') || '[]')) ||
    [];

  if (!projects.length) return null;

  return (
    <section className="w-full space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Recent projects
        </h3>
        <span className="text-xs text-muted-foreground">Click to reopen</span>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p: Project) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => router.push(`/studio/${p.slug}`)}
            className="group flex h-full flex-col rounded-xl border border-border/60 bg-card/70 p-4 text-left text-foreground transition hover:border-border hover:bg-card/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-base font-semibold group-hover:text-primary">
                {p.name}
              </span>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {new Date(p.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2 space-y-2 text-muted-foreground">
              <p className="line-clamp-2 text-sm">{p.prompt}</p>
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
                Last opened {new Date(p.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.prompt}</p>
            <span className="mt-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
              Last opened {new Date(p.createdAt).toLocaleTimeString()}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
