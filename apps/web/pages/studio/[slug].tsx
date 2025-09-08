import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type Project = { slug: string; name: string; prompt: string; createdAt: string };

function getProject(slug: string | string[] | undefined): Project | null {
  if (!slug || typeof window === "undefined") return null;
  const list: Project[] = JSON.parse(
    localStorage.getItem("ai_build_flow_projects") || "[]"
  );
  return list.find((p) => p.slug === slug) || null;
}

function generateHtmlDoc(title: string, prompt: string) {
  const safeTitle = title || "My App";
  const description =
    "Generated instant preview. Replace with real AI code-gen later.";

  const main = `
    <div class="shell">
      <header class="topbar">
        <strong>${safeTitle}</strong>
        <span class="muted">preview</span>
      </header>

      <section class="content">
        <div class="card">
          <h2>Prompt</h2>
          <p>${prompt.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>

        <div class="grid">
          <div class="card">
            <h3>Widget A</h3>
            <p>Shows a KPI or chart.</p>
          </div>
          <div class="card">
            <h3>Widget B</h3>
            <p>Another panel you asked for.</p>
          </div>
          <div class="card">
            <h3>Widget C</h3>
            <p>Extend with AI-generated components.</p>
          </div>
        </div>
      </section>
    </div>
  `;

  const css = `
    :root {
      color-scheme: dark;
      --bg: #0b0c0e;
      --panel: #101114;
      --border: #22242a;
      --text: #e7e7ea;
      --muted: #9aa0a6;
      --accent: #7c3aed;
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; padding: 0; background: var(--bg); color: var(--text); font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, "Helvetica Neue", Arial; }
    .shell { min-height: 100%; display: grid; grid-template-rows: auto 1fr; }
    .topbar { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border); background: var(--panel); position: sticky; top: 0; }
    .muted { color: var(--muted); font-size: 12px; }
    .content { padding: 16px; max-width: 1100px; margin: 0 auto; }
    .card { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
    h1, h2, h3 { margin: 0 0 8px; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); margin-top: 12px; }
    a.button { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; text-decoration: none; color: white; background: var(--accent); }
  `;

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>${safeTitle}</title>
        <meta name="description" content="${description}"/>
        <style>${css}</style>
      </head>
      <body>
        ${main}
      </body>
    </html>
  `;
}

export default function StudioPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  useEffect(() => {
    if (!slug) return;
    const p = getProject(slug);
    setProject(p || null);
    if (p) setMessages([{ role: "user", content: p.prompt }]);
  }, [slug]);

  const doc = useMemo(() => {
    if (!project) return "<html><body>Missing project.</body></html>";
    return generateHtmlDoc(project.name, project.prompt);
  }, [project]);

  if (!project) {
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
        }}
      >
        <header
          style={{
            padding: 10,
            border: "1px solid #1f2024",
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: 800 }}>{project.name}</div>
          <div style={{ opacity: 0.6, fontSize: 12 }}>Studio</div>
        </header>

        <div
          style={{
            display: "grid",
            gap: 8,
            alignContent: "start",
            height: "calc(100vh - 220px)",
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                background: m.role === "user" ? "#121316" : "#101114",
                border: "1px solid #1f2024",
                borderRadius: 10,
                padding: 10,
                whiteSpace: "pre-wrap",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.65,
                  marginBottom: 6,
                  textTransform: "uppercase",
                }}
              >
                {m.role}
              </div>
              {m.content}
            </div>
          ))}
        </div>

        <Composer
          onSend={(text) =>
            setMessages((prev) => [...prev, { role: "user", content: text }])
          }
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

function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [val, setVal] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = val.trim();
    if (!t) return;
    onSend(t);
    setVal("");
  }

  return (
    <form
      onSubmit={submit}
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        width: "min(360px, calc(100vw - 24px))",
        display: "flex",
        gap: 8,
        background: "#0f1013",
        border: "1px solid #1f2024",
        borderRadius: 12,
        padding: 8,
      }}
    >
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Say what to add next…"
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          color: "white",
          padding: "10px 8px",
        }}
      />
      <button
        type="submit"
        style={{
          background: "#7c3aed",
          color: "white",
          border: "none",
          padding: "10px 12px",
          borderRadius: 8,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </form>
  );
}

