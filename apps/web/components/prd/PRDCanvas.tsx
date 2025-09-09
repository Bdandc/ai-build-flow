"use client";
import dynamic from "next/dynamic";
import { useMemo, useCallback } from "react";
import { usePRD } from "@/store/prdStore";
import type {
  Node as RFNode,
  Edge as RFEdge,
  Connection as RFConnection,
} from "reactflow";
import "reactflow/dist/style.css";

const ReactFlow = dynamic(() => import("reactflow").then(m => m.default), {
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
