import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";

/**
 * React Flow v11 notes:
 *  - default export is the <ReactFlow /> component
 *  - types must be imported as aliases; named Node/Edge/Connection types are not value exports
 */
import type {
  Node as RFNode,
  Edge as RFEdge,
} from "reactflow";

const ReactFlow = dynamic(() => import("reactflow").then(m => m.default), {
  ssr: false,
});
import "reactflow/dist/style.css";

/** Discriminated union for blocks shown on the canvas / PRD */
export type Block =
  | { type: "hero"; title: string }
  | { type: "stats"; items: { label: string; value: number }[] }
  | { type: "table"; columns: string[] };

/** Type guard */
const isBlock = (x: unknown): x is Block =>
  !!x &&
  typeof x === "object" &&
  "type" in (x as any) &&
  ["hero", "stats", "table"].includes((x as any).type);

type ProjectMeta = {
  name: string;
  description?: string;
};

export default function StudioPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };

  const [meta] = useState<ProjectMeta | null>({ name: "Untitled" });
  const [blocks] = useState<Block[]>([
    { type: "hero", title: "Welcome" },
    { type: "stats", items: [{ label: "Signups", value: 42 }] },
  ]);

  /** Safe summary using the discriminant */
  const summary = (b: Block) => {
    switch (b.type) {
      case "stats":
        return `stats — ${b.items.length} items`;
      case "table":
        return `table — ${b.columns.length} cols`;
      case "hero":
      default:
        return b.type;
    }
  };

  if (!slug || meta === null) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Studio</h1>
        <p>Missing slug or meta.</p>
      <main className="p-6">
        <p className="opacity-70">Project not found.</p>
      </main>
    );
  }

  // Demo ReactFlow graph (kept minimal; compiles with v11)
  const nodes: RFNode[] = useMemo(
    () => [
      { id: "meta", position: { x: 100, y: 80 }, data: { label: meta.name }, type: "input" },
      ...blocks.map((b, i) => ({
        id: `b-${i}`,
        position: { x: 100 + i * 180, y: 240 },
        data: { label: summary(b) },
      })),
    ],
    [blocks, meta?.name],
  );
  const edges: RFEdge[] = useMemo(
    () => blocks.map((_, i) => ({ id: `e-${i}`, source: "meta", target: `b-${i}` })),
    [blocks],
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

  return (
    <main style={{ padding: 24 }}>
      <h1>Studio: {slug}</h1>
      <p>{meta?.description ?? "No description yet."}</p>
      <div style={{ height: 480, border: "1px solid #eee", borderRadius: 8, marginTop: 16 }}>
        {/* @ts-expect-error - rendered client-side only */}
        <ReactFlow nodes={nodes} edges={edges} fitView />
      </div>
    </main>
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
