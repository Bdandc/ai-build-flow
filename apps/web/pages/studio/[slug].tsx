import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";

// Block model
export type Block =
  | { type: "hero"; title: string; subtitle?: string }
  | { type: "stats"; items: { label: string; value: string }[] }
  | { type: "table"; columns: string[]; rows?: string[][] };

const isBlock = (x: any): x is Block => {
  return (
    x &&
    typeof x === "object" &&
    "type" in x &&
    (x.type === "hero" || x.type === "stats" || x.type === "table")
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
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(projectKey(slug));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const blocks = Array.isArray(parsed?.blocks)
      ? (parsed.blocks.filter(isBlock) as Block[])
      : [];
    return { prompt: parsed.prompt, blocks };
  } catch {
    return null;
  }
}

function saveProject(
  slug: string,
  data: { prompt: string; blocks: Block[] }
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(projectKey(slug), JSON.stringify(data));
}

const defaultBlocks = (prompt: string): Block[] => [
  { type: "hero", title: prompt || "My first project" },
];

function getProjectMeta(slug: string | string[] | undefined): ProjectMeta | null {
  if (!slug || typeof window === "undefined") return null;
  const list: ProjectMeta[] = JSON.parse(
    localStorage.getItem("ai_build_flow_projects") || "[]"
  );
  return list.find((p) => p.slug === slug) || null;
}

// ---- command parser ----
export function parseCommand(
  input: string
): {
  type: "ok" | "error";
  apply?: (prev: Block[]) => Block[];
  message: string;
} {
  const text = input.trim();
  let m: RegExpMatchArray | null;

  if ((m = text.match(/^add\s+hero\s+(.+)$/i))) {
    const title = m[1].trim();
    return {
      type: "ok",
      message: "Added hero",
      apply: (prev: Block[]) => [...prev, { type: "hero", title }],
    };
  }

  if ((m = text.match(/^add\s+stats\s+(.+)$/i))) {
    const items = m[1]
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((seg) => {
        const [label, value] = seg.split(":").map((s) => s.trim());
        return { label: label || "", value: value || "" };
      });
    return {
      type: "ok",
      message: "Added stats",
      apply: (prev: Block[]) => [...prev, { type: "stats", items }],
    };
  }

  if ((m = text.match(/^add\s+table\s+columns:\s*(.+)$/i))) {
    const columns = m[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      type: "ok",
      message: "Added table",
      apply: (prev: Block[]) => [...prev, { type: "table", columns }],
    };
  }

  if ((m = text.match(/^remove\s+(\d+)$/i))) {
    const idx = parseInt(m[1], 10) - 1;
    return {
      type: "ok",
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
    return { type: "ok", message: "Cleared", apply: () => [] as Block[] };
  }

  return {
    type: "error",
    message: "Sorry, I didn’t understand. Try: add hero Hello",
  };
}

// ---- renderer ----
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
            if (b.type === "hero") {
              return `<section class="hero"><h1>${escapeHtml(
                b.title
              )}</h1>${b.subtitle ? `<p>${escapeHtml(b.subtitle)}</p>` : ""}</section>`;
            }
            if (b.type === "stats") {
              return `<section class="stats">${b.items
                .map(
                  (it) =>
                    `<div class="stat"><div class="label">${escapeHtml(
                      it.label
                    )}</div><div class="value">${escapeHtml(it.value)}</div></div>`
                )
                .join("")}</section>`;
            }
            if (b.type === "table") {
              const header = b.columns
                .map((c) => `<th>${escapeHtml(c)}</th>`)
                .join("");
              const rows = (b.rows || [])
                .map(
                  (r) =>
                    `<tr>${r
                      .map((c) => `<td>${escapeHtml(c)}</td>`)
                      .join("")}</tr>`
                )
                .join("");
              return `<section class="table"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></section>`;
            }
            return "";
          })
          .join("");

  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>${body}</body></html>`;
}

// ---- UI ----
export default function StudioPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [meta, setMeta] = React.useState<ProjectMeta | null>(null);
  const [prompt, setPrompt] = React.useState<string>("");
  const [blocks, setBlocks] = React.useState<Block[]>(() => {
    const key = `ai_build_flow_project_${slug ?? ""}`;
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const loaded = Array.isArray(parsed?.blocks)
        ? parsed.blocks.filter(isBlock)
        : [];
      return loaded as Block[];
    } catch {
      return [];
    }
  });
  const [feedback, setFeedback] = React.useState<string>("");
  const [isBusy, setIsBusy] = React.useState(false);

  // initial load
  useEffect(() => {
    if (!slug || typeof slug !== "string") return;
    const metaProj = getProjectMeta(slug);
    setMeta(metaProj);

    const stored = loadProject(slug);
    if (stored) {
      setPrompt(stored.prompt || "My first project");
      setBlocks(stored.blocks);
      return;
    }

    const initialPrompt =
      (router.query.prompt as string) || metaProj?.prompt || "My first project";
    setPrompt(initialPrompt);
    const initBlocks = defaultBlocks(initialPrompt);
    setBlocks(initBlocks);
    saveProject(slug, { prompt: initialPrompt, blocks: initBlocks });
  }, [slug, router.query.prompt]);

  // persist on change
  useEffect(() => {
    if (!slug || typeof slug !== "string") return;
    if (!prompt) return;
    saveProject(slug, { prompt, blocks });
  }, [slug, prompt, blocks]);

  const doc = useMemo(() => renderBlocksToHtml(blocks), [blocks]);

  function handleCommand(text: string) {
    if (isBusy) return;
    setIsBusy(true);
    const result = parseCommand(text);
    if (result.type === "ok" && result.apply) {
      setBlocks((prev: Block[]) => {
        const next = result.apply!(prev);
        return next;
      });
    }
    setFeedback(result.message);
    setTimeout(() => setFeedback(""), 2000);
    setIsBusy(false);
  }

  const summarizeBlock = (b: Block): string => {
    switch (b.type) {
      case "hero":
        return b.title ? `hero — ${b.title}` : "hero";
      case "stats":
        return `stats — ${b.items?.length ?? 0} items`;
      case "table":
        return `table — ${b.columns?.length ?? 0} cols`;
      default: {
        const _exhaustive: never = b;
        return "block";
      }
    }
  };

  if (!slug || (meta === null && !prompt)) {
    return (
      <main className="p-6">
        <p className="opacity-70">Project not found.</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen grid-cols-[minmax(260px,380px)_1fr]">
      <section className="flex flex-col border-r border-[#1f2024] bg-[#0e0f10] p-3">
        <header className="mb-[10px] flex items-center justify-between rounded-[10px] border border-[#1f2024] p-[10px]">
          <div>
            <div className="font-extrabold">{meta?.name || "Project"}</div>
            <div className="text-xs opacity-60">Studio</div>
          </div>
          <button
            onClick={() => setBlocks(defaultBlocks(prompt))}
            className="cursor-pointer border-0 bg-transparent text-xs text-rose-400"
          >
            Reset
          </button>
        </header>

        <ul className="grid m-0 flex-1 list-none gap-1.5 overflow-y-auto p-0">
          {blocks.map((b: Block, i: number) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-[#1f2024] bg-[#121316] px-[10px] py-2 text-sm"
            >
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {i + 1}. {summarizeBlock(b)}
              </span>
              <button
                onClick={() =>
                  setBlocks((prev: Block[]) =>
                    prev.filter((_, idx) => idx !== i)
                  )
                }
                className="ml-2 cursor-pointer border-0 bg-transparent text-[#9aa0a6]"
                aria-label={`remove ${i + 1}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        {feedback && (
          <div className="mt-2 text-xs opacity-70">
            {feedback}
          </div>
        )}

        <Composer
          onSend={handleCommand}
          disabled={isBusy}
          placeholder='Tell me what to add (e.g. "add stats Revenue: $1.2M; Users: 42k")'
        />
      </section>
      <section className="bg-[#0b0c0e] p-3">
        <div className="h-[calc(100vh-24px)] overflow-hidden rounded-xl border border-[#1f2024] bg-black">
          <iframe
            title="preview"
            className="h-full w-full border-0"
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
  const [val, setVal] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = val.trim();
    if (!t || disabled) return;
    onSend(t);
    setVal("");
  }

  return (
    <form onSubmit={submit} className="mt-2 flex gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-[#1f2024] bg-[#0f1013] px-3 py-[10px] text-white outline-none"
      />
      <button
        type="submit"
        disabled={disabled || !val.trim()}
        className={`rounded-lg border-0 bg-violet-600 px-3 py-[10px] font-bold text-white ${
          disabled || !val.trim() ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
        >
          Send
      </button>
    </form>
  );
}

