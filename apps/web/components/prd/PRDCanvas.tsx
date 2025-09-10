"use client";
import dynamic from "next/dynamic";
import { useMemo, useCallback } from "react";
import { usePRD } from "@/store/prdStore";
// Types come from the top-level "reactflow" in v11:
import type { Node as RFNode, Edge as RFEdge, Connection as RFConnection } from "reactflow";
import "reactflow/dist/style.css";

// React Flow's main component is the default export.
const ReactFlow = dynamic(() => import("reactflow").then((m) => m.default), { ssr: false });
// MiniMap & Controls are published as sub-packages in v11.
const MiniMap  = dynamic(() => import("@reactflow/minimap").then((m) => m.MiniMap),   { ssr: false });
const Controls = dynamic(() => import("@reactflow/controls").then((m) => m.Controls), { ssr: false });

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
