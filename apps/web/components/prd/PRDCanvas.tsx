"use client";
import dynamic from "next/dynamic";
import { useMemo, useCallback } from "react";
import { usePRD } from "@/store/prdStore";
// Types come from the top-level "reactflow" in v11:
import type {
  Node as RFNode,
  Edge as RFEdge,
  Connection as RFConnection,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

// React Flow's main component is the default export.
const ReactFlow = dynamic(() => import("reactflow").then((m) => m.default), { ssr: false });
// MiniMap & Controls are published as sub-packages in v11.
const MiniMap  = dynamic(() => import("@reactflow/minimap").then((m) => m.MiniMap),   { ssr: false });
const Controls = dynamic(() => import("@reactflow/controls").then((m) => m.Controls), { ssr: false });
const FeatureNode = dynamic(() => import("@/components/prd/FeatureNode"), { ssr: false });

export default function PRDCanvas() {
  const { blocks, edges, addEdge, select, updateBlock, selectedId } = usePRD();

  const nodes: RFNode[] = useMemo(
    () =>
      blocks.map(b => ({
        id: b.id,
        type: b.kind,
        position: { x: b.x, y: b.y },
        data: { block: b },
        selected: selectedId === b.id,
      })),
    [blocks, selectedId],
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

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      feature: FeatureNode,
      page: FeatureNode,
      flow: FeatureNode,
      api: FeatureNode,
      task: FeatureNode,
    }),
    [FeatureNode],
  );

  return (
    <div className="h-full border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onNodeClick={(_e, n) => select(n.id)}
        onPaneClick={() => select(undefined)}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
