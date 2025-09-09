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
      <main style={{ padding: 24 }}>
        <p style={{ opacity: 0.7 }}>Project not found.</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "minmax(260px, 380px) 1fr",
      }}
    >
      <section
        style={{
          borderRight: "1px solid #1f2024",
          background: "#0e0f10",
          padding: 12,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            padding: 10,
            border: "1px solid #1f2024",
            borderRadius: 10,
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 800 }}>{meta?.name || "Project"}</div>
            <div style={{ opacity: 0.6, fontSize: 12 }}>Studio</div>
          </div>
          <button
            onClick={() => setBlocks(defaultBlocks(prompt))}
            style={{
              background: "transparent",
              border: "none",
              color: "#f87171",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Reset
          </button>
        </header>

        <ul
          style={{
            flex: 1,
            overflowY: "auto",
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: 6,
          }}
        >
          {blocks.map((b: Block, i: number) => (
            <li
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#121316",
                border: "1px solid #1f2024",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 14,
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {i + 1}. {summarizeBlock(b)}
              </span>
              <button
                onClick={() =>
                  setBlocks((prev: Block[]) =>
                    prev.filter((_, idx) => idx !== i)
                  )
                }
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9aa0a6",
                  cursor: "pointer",
                  marginLeft: 8,
                }}
                aria-label={`remove ${i + 1}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        {feedback && (
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            {feedback}
          </div>
        )}

        <Composer
          onSend={handleCommand}
          disabled={isBusy}
          placeholder='Tell me what to add (e.g. "add stats Revenue: $1.2M; Users: 42k")'
        />
      </section>

      <section style={{ background: "#0b0c0e", padding: 12 }}>
        <div
          style={{
            border: "1px solid #1f2024",
            borderRadius: 12,
            overflow: "hidden",
            height: "calc(100vh - 24px)",
            background: "black",
          }}
        >
          <iframe
            title="preview"
            style={{ width: "100%", height: "100%", border: "none" }}
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
    <form
      onSubmit={submit}
      style={{ display: "flex", gap: 8, marginTop: 8 }}
    >
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: "1px solid #1f2024",
          background: "#0f1013",
          color: "white",
          borderRadius: 8,
          padding: "10px 12px",
          outline: "none",
        }}
      />
      <button
          type="submit"
          disabled={disabled || !val.trim()}
          style={{
            background: "#7c3aed",
            color: "white",
            border: "none",
            padding: "10px 12px",
            borderRadius: 8,
            fontWeight: 700,
            cursor: disabled || !val.trim() ? "not-allowed" : "pointer",
            opacity: disabled || !val.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
    </form>
  );
}

