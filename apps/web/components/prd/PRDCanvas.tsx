"use client";
import dynamic from "next/dynamic";
import { useMemo, useCallback } from "react";
import { usePRD } from "@/store/prdStore";
// ==== Local minimal typings to avoid CI flakiness with React Flow TS exports ====
// We only need a tiny subset for compile-time safety. These mirror React Flow's shape well
// enough for our current usage and can be replaced with library types later.
type RFNode = {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data?: any;
};
type RFEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: any;
};
type RFConnection = {
  source?: string;
  target?: string;
};
import "reactflow/dist/style.css";

// Ensure ReactFlow component is dynamically loaded from the default export.
const ReactFlow = dynamic(() => import("reactflow").then((m) => m.ReactFlow), {
  ssr: false,
});
const MiniMap = dynamic(() => import("reactflow").then(m => m.MiniMap), {
  ssr: false,
});
const Controls = dynamic(() => import("reactflow").then(m => m.Controls), {
  ssr: false,
});

export default function PRDCanvas() {
  const { blocks, edges, addEdge, select, updateBlock } = usePRD();

  const nodes: RFNode[] = useMemo(
    () =>
      blocks.map(b => ({
        id: b.id,
        position: { x: b.x, y: b.y },
        data: { label: b.title },
      })),
    [blocks],
  );

  const rfEdges: RFEdge[] = useMemo(
    () => edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
    [edges],
  );

  const onConnect = useCallback(
    (c: RFConnection) => {
      if (c.source && c.target) addEdge({ source: c.source, target: c.target });
    },
    [addEdge],
  );

  const onNodeDragStop = useCallback(
    (_e: any, n: RFNode) => {
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
