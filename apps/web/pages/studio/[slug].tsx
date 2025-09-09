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
  );
}
