export type StudioBlock =
  | { type: "hero"; title: string; subtitle?: string }
  | { type: "stats"; items: { label: string; value: string }[] }
  | { type: "table"; columns: string[]; rows?: string[][] };

export type StudioProjectMeta = {
  slug: string;
  name: string;
  prompt: string;
  createdAt: string;
};

export type StudioProjectData = {
  prompt: string;
  blocks: StudioBlock[];
};

export const STUDIO_PROJECTS_KEY = "ai_build_flow_projects";
export const STUDIO_PROJECT_KEY_PREFIX = "ai_build_flow_project_";

export const isStudioBlock = (x: unknown): x is StudioBlock =>
  !!x &&
  typeof x === "object" &&
  "type" in x &&
  (x as any).type &&
  ["hero", "stats", "table"].includes((x as any).type);

export const defaultBlocks = (prompt: string): StudioBlock[] => [
  { type: "hero", title: prompt || "My first project" },
];

export type StudioCommandResult = {
  type: "ok" | "error";
  apply?: (prev: StudioBlock[]) => StudioBlock[];
  message: string;
};

export function parseCommand(input: string): StudioCommandResult {
  const text = input.trim();
  let m: RegExpMatchArray | null;

  if ((m = text.match(/^add\s+hero\s+(.+)$/i))) {
    const title = m[1].trim();
    return {
      type: "ok",
      message: "Added hero",
      apply: (prev: StudioBlock[]) => [...prev, { type: "hero", title }],
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
      apply: (prev: StudioBlock[]) => [...prev, { type: "stats", items }],
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
      apply: (prev: StudioBlock[]) => [...prev, { type: "table", columns }],
    };
  }

  if ((m = text.match(/^remove\s+(\d+)$/i))) {
    const idx = parseInt(m[1], 10) - 1;
    return {
      type: "ok",
      message: `Removed ${m[1]}`,
      apply: (prev: StudioBlock[]) => {
        if (idx < 0 || idx >= prev.length) return prev;
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      },
    };
  }

  if (/^clear$/i.test(text)) {
    return { type: "ok", message: "Cleared", apply: () => [] };
  }

  return {
    type: "error",
    message: "Sorry, I didn’t understand. Try: add hero Hello",
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderBlocksToHtml(blocks: StudioBlock[]): string {
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
