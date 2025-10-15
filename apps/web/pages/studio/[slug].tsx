import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';

// Block model
export type Block =
  | { type: 'hero'; title: string; subtitle?: string }
  | { type: 'stats'; items: { label: string; value: string }[] }
  | { type: 'table'; columns: string[]; rows?: string[][] };

const isBlock = (x: any): x is Block => {
  return (
    x &&
    typeof x === 'object' &&
    'type' in x &&
    (x.type === 'hero' || x.type === 'stats' || x.type === 'table')
  );
};

type ProjectMeta = {
  slug: string;
  name: string;
  prompt: string;
  createdAt: string;
};

// ---- persistence helpers ----
const projectKey = (slug: string) => `ai_build_flow_project_${slug}`;

function loadProject(slug: string): { prompt: string; blocks: Block[] } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(projectKey(slug));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const blocks = Array.isArray(parsed?.blocks) ? (parsed.blocks.filter(isBlock) as Block[]) : [];
    return { prompt: parsed.prompt, blocks };
  } catch {
    return null;
  }
}

function saveProject(slug: string, data: { prompt: string; blocks: Block[] }): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(projectKey(slug), JSON.stringify(data));
}

const defaultBlocks = (prompt: string): Block[] => [
  { type: 'hero', title: prompt || 'My first project' },
];

function getProjectMeta(slug: string | string[] | undefined): ProjectMeta | null {
  if (!slug || typeof window === 'undefined') return null;
  const list: ProjectMeta[] = JSON.parse(localStorage.getItem('ai_build_flow_projects') || '[]');
  return list.find((p) => p.slug === slug) || null;
}

// ---- command parser ----
export function parseCommand(input: string): {
  type: 'ok' | 'error';
  apply?: (prev: Block[]) => Block[];
  message: string;
} {
  const text = input.trim();
  let m: RegExpMatchArray | null;

  if ((m = text.match(/^add\s+hero\s+(.+)$/i))) {
    const title = m[1].trim();
    return {
      type: 'ok',
      message: 'Added hero',
      apply: (prev: Block[]) => [...prev, { type: 'hero', title }],
    };
  }

  if ((m = text.match(/^add\s+stats\s+(.+)$/i))) {
    const items = m[1]
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((seg) => {
        const [label, value] = seg.split(':').map((s) => s.trim());
        return { label: label || '', value: value || '' };
      });
    return {
      type: 'ok',
      message: 'Added stats',
      apply: (prev: Block[]) => [...prev, { type: 'stats', items }],
    };
  }

  if ((m = text.match(/^add\s+table\s+columns:\s*(.+)$/i))) {
    const columns = m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      type: 'ok',
      message: 'Added table',
      apply: (prev: Block[]) => [...prev, { type: 'table', columns }],
    };
  }

  if ((m = text.match(/^remove\s+(\d+)$/i))) {
    const idx = parseInt(m[1], 10) - 1;
    return {
      type: 'ok',
      message: `Removed ${m[1]}`,
      apply: (prev: Block[]) => {
        if (idx < 0 || idx >= prev.length) return prev;
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      },
    };
  }

  if (/^clear$/i.test(text)) {
    return { type: 'ok', message: 'Cleared', apply: () => [] as Block[] };
  }

  return {
    type: 'error',
    message: 'Sorry, I didn’t understand. Try: add hero Hello',
  };
}

// ---- renderer ----
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderBlocksToHtml(blocks: Block[]): string {
  const css = `
    :root {
      color-scheme: dark;
      --bg: #0b0c0e;
      --panel: #101114;
      --border: #22242a;
      --text: #e7e7ea;
      --muted: #9aa0a6;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font: 16px/1.5 system-ui, sans-serif;
      padding: 20px;
    }
    h1, h2, h3, p { margin: 0 0 12px; }
    .hero { text-align: center; padding: 60px 20px; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 12px; }
    .hero p { color: var(--muted); }
    .stats { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); margin: 20px 0; }
    .stat { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 12px; }
    .stat .label { font-size: 12px; color: var(--muted); }
    .stat .value { font-size: 20px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid var(--border); padding: 8px; text-align: left; }
    th { background: var(--panel); }
    .empty { text-align: center; opacity: 0.7; padding: 40px; }
  `;

  const body =
    blocks.length === 0
      ? '<div class="empty">No blocks yet. Try add hero Welcome in the chat.</div>'
      : blocks
          .map((b) => {
            if (b.type === 'hero') {
              return `<section class="hero"><h1>${escapeHtml(
                b.title,
              )}</h1>${b.subtitle ? `<p>${escapeHtml(b.subtitle)}</p>` : ''}</section>`;
            }
            if (b.type === 'stats') {
              return `<section class="stats">${b.items
                .map(
                  (it) =>
                    `<div class="stat"><div class="label">${escapeHtml(
                      it.label,
                    )}</div><div class="value">${escapeHtml(it.value)}</div></div>`,
                )
                .join('')}</section>`;
            }
            if (b.type === 'table') {
              const header = b.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join('');
              const rows = (b.rows || [])
                .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
                .join('');
              return `<section class="table"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></section>`;
            }
            return '';
          })
          .join('');

  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>${body}</body></html>`;
}

// ---- UI ----
export default function StudioPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [meta, setMeta] = React.useState<ProjectMeta | null>(null);
  const [prompt, setPrompt] = React.useState<string>('');
  const [blocks, setBlocks] = React.useState<Block[]>(() => {
    const key = `ai_build_flow_project_${slug ?? ''}`;
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const loaded = Array.isArray(parsed?.blocks) ? parsed.blocks.filter(isBlock) : [];
      return loaded as Block[];
    } catch {
      return [];
    }
  });
  const [feedback, setFeedback] = React.useState<string>('');
  const [isBusy, setIsBusy] = React.useState(false);

  // initial load
  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;
    const metaProj = getProjectMeta(slug);
    setMeta(metaProj);

    const stored = loadProject(slug);
    if (stored) {
      setPrompt(stored.prompt || 'My first project');
      setBlocks(stored.blocks);
      return;
    }

    const initialPrompt = (router.query.prompt as string) || metaProj?.prompt || 'My first project';
    setPrompt(initialPrompt);
    const initBlocks = defaultBlocks(initialPrompt);
    setBlocks(initBlocks);
    saveProject(slug, { prompt: initialPrompt, blocks: initBlocks });
  }, [slug, router.query.prompt]);

  // persist on change
  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;
    if (!prompt) return;
    saveProject(slug, { prompt, blocks });
  }, [slug, prompt, blocks]);

  const doc = useMemo(() => renderBlocksToHtml(blocks), [blocks]);

  function handleCommand(text: string) {
    if (isBusy) return;
    setIsBusy(true);
    const result = parseCommand(text);
    if (result.type === 'ok' && result.apply) {
      setBlocks((prev: Block[]) => {
        const next = result.apply!(prev);
        return next;
      });
    }
    setFeedback(result.message);
    setTimeout(() => setFeedback(''), 2000);
    setIsBusy(false);
  }

  const summarizeBlock = (b: Block): string => {
    switch (b.type) {
      case 'hero':
        return b.title ? `hero — ${b.title}` : 'hero';
      case 'stats':
        return `stats — ${b.items?.length ?? 0} items`;
      case 'table':
        return `table — ${b.columns?.length ?? 0} cols`;
      default: {
        const _exhaustive: never = b;
        return 'block';
      }
    }
  };

  if (!slug || (meta === null && !prompt)) {
    return (
      <main className="min-h-screen bg-background px-6 py-24 text-center text-muted-foreground">
        <p className="text-sm">Project not found.</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(260px,360px)_1fr]">
      <section className="flex flex-col gap-4 border-border/60 bg-card/30 px-6 py-6 backdrop-blur lg:border-r">
        <header className="flex items-center justify-between rounded-lg border border-border/60 bg-card/80 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-muted-foreground">Studio</div>
            <div className="text-lg font-bold text-foreground">{meta?.name || 'Project'}</div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!blocks.length}
            onClick={() => setBlocks(defaultBlocks(prompt))}
            className="h-8 px-3 text-xs font-medium"
          >
            Reset
          </Button>
        </header>

        <ul className="flex-1 space-y-2 overflow-y-auto rounded-lg border border-border/60 bg-card/50 p-3">
          {blocks.map((b: Block, i: number) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm"
            >
              <span className="truncate text-muted-foreground">
                {i + 1}. {summarizeBlock(b)}
              </span>
              <button
                type="button"
                onClick={() => setBlocks((prev: Block[]) => prev.filter((_, idx) => idx !== i))}
                className="rounded-full p-1 text-muted-foreground transition hover:bg-accent/60 hover:text-foreground"
                aria-label={`remove ${i + 1}`}
              >
                ×
              </button>
            </li>
          ))}
          {!blocks.length && (
            <li className="rounded-md border border-dashed border-border/60 bg-background/60 px-3 py-6 text-center text-sm text-muted-foreground">
              No blocks yet — try adding one with the composer below.
            </li>
          )}
        </ul>

        {feedback && <div className="text-xs text-primary">{feedback}</div>}

        <Composer
          onSend={handleCommand}
          disabled={isBusy}
          placeholder='Tell me what to add (e.g. "add stats Revenue: $1.2M; Users: 42k")'
        />
      </section>

      <section className="bg-background px-4 py-6">
        <div className="mx-auto h-[calc(100vh-64px)] max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
          <iframe
            title="preview"
            className="h-full w-full rounded-[calc(var(--radius)-4px)] border-0"
            srcDoc={doc}
          />
        </div>
      </section>
    </main>
  );
}

function Composer({
  onSend,
  disabled,
  placeholder,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder: string;
}) {
  const [val, setVal] = React.useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = val.trim();
    if (!t || disabled) return;
    onSend(t);
    setVal('');
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/80 p-2 shadow-inner">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Button
          type="submit"
          disabled={disabled || !val.trim()}
          className="shrink-0 px-4 text-sm font-semibold"
        >
          Send
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Commands: <span className="font-medium text-foreground">add hero Welcome</span>,{' '}
        <span className="font-medium text-foreground">add stats Label: 10</span>,{' '}
        <span className="font-medium text-foreground">clear</span>
      </p>
    </form>
  );
}
