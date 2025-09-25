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
      className="grid min-h-screen place-items-center bg-[radial-gradient(1000px_600px_at_50%_30%,rgba(120,119,198,0.15),transparent_60%)]"
    >
      <div className="w-[min(900px,92vw)]">
        <h1
          className="mb-4 text-center text-[clamp(28px,5vw,48px)] font-extrabold"
        >
          Build something <span className="text-rose-500">simple</span>
        </h1>
        <p className="mb-7 text-center opacity-70">
          Describe what you want. We’ll open a studio with a live preview.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 rounded-xl border border-[#232428] bg-[#111213] p-3"
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. A simple investing dashboard with a watchlist and market cards"
            className="flex-1 border-0 bg-transparent px-3 py-[10px] text-base text-white outline-none"
          />
          <button
            type="submit"
            disabled={isSending || !value.trim()}
            className={`rounded-lg border-0 bg-violet-600 px-[14px] py-[10px] font-semibold text-white ${
              isSending || !value.trim() ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
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
    <div className="mt-7">
      <h3 className="mb-3 opacity-80">Recent projects</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {projects.map((p: any) => (
          <button
            key={p.slug}
            onClick={() => router.push(`/studio/${p.slug}`)}
            className="cursor-pointer rounded-xl border border-[#1f2024] bg-[#0e0f10] p-[14px] text-left text-white"
          >
            <div className="mb-1 font-bold">{p.name}</div>
            <div className="text-xs opacity-60">
              {new Date(p.createdAt).toLocaleString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

