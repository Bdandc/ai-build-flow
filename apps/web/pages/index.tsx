import { useRouter } from "next/router";
import { useState } from "react";

type Project = {
  slug: string;
  name: string;
  prompt: string;
  createdAt: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60) || "project";
}

export default function Home() {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    setIsSending(true);

    const name = trimmed;
    const slugBase = slugify(name);
    const slug = slugBase + "-" + Math.random().toString(36).slice(2, 7);

    const project: Project = {
      slug,
      name,
      prompt: trimmed,
      createdAt: new Date().toISOString(),
    };

    const key = "ai_build_flow_projects";
    const existing = JSON.parse(localStorage.getItem(key) || "[]") as Project[];
    localStorage.setItem(key, JSON.stringify([project, ...existing]));

    router.push(`/studio/${slug}`);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(1000px 600px at 50% 30%, rgba(120,119,198,0.15), transparent 60%)",
      }}
    >
      <div style={{ width: "min(900px, 92vw)" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 800,
            marginBottom: 16,
          }}
        >
          Build something <span style={{ color: "#f43f5e" }}>simple</span>
        </h1>
        <p style={{ textAlign: "center", opacity: 0.7, marginBottom: 28 }}>
          Describe what you want. We’ll open a studio with a live preview.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#111213",
            border: "1px solid #232428",
            borderRadius: 12,
            padding: 12,
            display: "flex",
            gap: 8,
          }}
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. A simple investing dashboard with a watchlist and market cards"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "white",
              fontSize: 16,
              padding: "10px 12px",
            }}
          />
          <button
            type="submit"
            disabled={isSending || !value.trim()}
            style={{
              background: "#7c3aed",
              color: "white",
              border: "none",
              padding: "10px 14px",
              borderRadius: 8,
              fontWeight: 600,
              opacity: isSending || !value.trim() ? 0.6 : 1,
              cursor: isSending || !value.trim() ? "not-allowed" : "pointer",
            }}
          >
            {isSending ? "Opening…" : "Create"}
          </button>
        </form>

        <RecentProjects />
      </div>
    </main>
  );
}

function RecentProjects() {
  const router = useRouter();
  const projects =
    (typeof window !== "undefined" &&
      JSON.parse(localStorage.getItem("ai_build_flow_projects") || "[]")) ||
    [];

  if (!projects.length) return null;

  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ marginBottom: 12, opacity: 0.8 }}>Recent projects</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {projects.map((p: any) => (
          <button
            key={p.slug}
            onClick={() => router.push(`/studio/${p.slug}`)}
            style={{
              textAlign: "left",
              padding: 14,
              borderRadius: 12,
              background: "#0e0f10",
              border: "1px solid #1f2024",
              color: "white",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
            <div style={{ opacity: 0.6, fontSize: 12 }}>
              {new Date(p.createdAt).toLocaleString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

