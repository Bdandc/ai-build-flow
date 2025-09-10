"use client";
import dynamic from "next/dynamic";
import { useMemo, useCallback } from "react";
import { usePRD } from "@/store/prdStore";
// NOTE: React Flow types differ across minor versions and were failing the build on Vercel
// ("Module 'reactflow' has no exported member 'Node'"). To unblock CI quickly, we avoid
// importing type-only exports and use minimal `any` typings. We can tighten this later.
import "reactflow/dist/style.css";

// React Flow's main component is the default export.
const ReactFlow = dynamic(() => import("reactflow").then((m) => m.default), { ssr: false });
// Import MiniMap and Controls from their sub-packages (v11 layout).
const MiniMap  = dynamic(() => import("@reactflow/minimap").then((m) => m.MiniMap),   { ssr: false });
const Controls = dynamic(() => import("@reactflow/controls").then((m) => m.Controls), { ssr: false });

export default function PRDCanvas() {
  const { blocks, edges, addEdge, select, updateBlock } = usePRD();

  const nodes: any[] = useMemo(
    () =>
      blocks.map(b => ({
        id: b.id,
        position: { x: b.x, y: b.y },
        data: { label: b.title },
      })),
    [blocks],
  );

  const rfEdges: any[] = useMemo(
    () => edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
    [edges],
  );

  const onConnect = useCallback(
    (c: any) => {
      if (c.source && c.target) addEdge({ source: c.source, target: c.target });
    },
    [addEdge],
  );

  const onNodeDragStop = useCallback(
    (_e: any, n: any) => {
      updateBlock(n.id, { x: n.position.x, y: n.position.y });
    },
    [updateBlock],
  );

  return (
    <div className="h-full border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={rfEdges}
        onConnect={onConnect}
        onNodeClick={(_e, n) => select(n.id)}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
